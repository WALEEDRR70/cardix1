import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type PlanRow = {
  id: string;
  code: string;
  name_en: string;
  interval: string;
  price_cents: number;
  currency: string;
  paypal_plan_id: string | null;
};

type ProductRow = {
  id: string;
  code: string;
  name_en: string;
  price_cents: number;
  currency: string;
};

/** Creates (or recreates) a PayPal billing plan for a Cardixn plan row. */
export const syncPlanToPaypal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planId: string }) => d)
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/billing.server");
    await assertAdmin(context as any);
    const { ensurePlanLinked } = await import("@/lib/paypal.server");
    const { supabase } = context as any;

    const { data: plan } = await supabase
      .from("billing_plans")
      .select("id, code, name_en, interval, price_cents, currency, paypal_plan_id")
      .eq("id", data.planId)
      .maybeSingle();
    if (!plan) throw new Error("Plan not found");

    const paypalPlanId = await ensurePlanLinked(plan as PlanRow, true);
    return { paypalPlanId };
  });

/** Links every active plan that has no PayPal plan yet. */
export const syncAllPlansToPaypal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("@/lib/billing.server");
    await assertAdmin(context as any);
    const { ensurePlanLinked } = await import("@/lib/paypal.server");
    const { supabase } = context as any;

    const { data: plans } = await supabase
      .from("billing_plans")
      .select("id, code, name_en, interval, price_cents, currency, paypal_plan_id")
      .eq("is_active", true);

    let linked = 0;
    for (const plan of (plans ?? []) as PlanRow[]) {
      if (plan.paypal_plan_id) continue;
      await ensurePlanLinked(plan);
      linked += 1;
    }
    return { linked, total: (plans ?? []).length };
  });

/** Starts a PayPal subscription checkout, returns the approval URL. */
export const startSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planId: string; origin: string; companyId?: string | null }) => d)
  .handler(async ({ data, context }) => {
    const { paypalFetch, approveLink, ensurePlanLinked } = await import("@/lib/paypal.server");
    const { supabase, userId } = context as any;

    const { data: plan } = await supabase
      .from("billing_plans")
      .select("id, code, name_en, interval, price_cents, currency, paypal_plan_id")
      .eq("id", data.planId)
      .eq("is_active", true)
      .maybeSingle();
    if (!plan) throw new Error("Plan not found");
    const p = plan as PlanRow;
    // Self-heal: link the plan to PayPal on first purchase if an admin never did.
    const paypalPlanId = await ensurePlanLinked(p);

    const sub = await paypalFetch<{ id: string; links: Array<{ rel: string; href: string }> }>(
      "/v1/billing/subscriptions",
      {
        method: "POST",
        body: {
          plan_id: paypalPlanId,
          custom_id: userId,
          application_context: {
            brand_name: "Cardixn",
            user_action: "SUBSCRIBE_NOW",
            return_url: `${data.origin}/billing/return?type=subscription`,
            cancel_url: `${data.origin}/billing/return?type=cancel`,
          },
        },
      },
    );

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin as any).from("billing_orders").insert({
      user_id: userId,
      kind: "subscription",
      plan_id: p.id,
      paypal_subscription_id: sub.id,
      amount_cents: p.price_cents,
      currency: p.currency,
      status: "created",
    });

    return { approveUrl: approveLink(sub.links), subscriptionId: sub.id };
  });


/** Starts a one-time PayPal order for a purchasable template. */
export const startProductCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { productId: string; origin: string }) => d)
  .handler(async ({ data, context }) => {
    const { paypalFetch, approveLink, money } = await import("@/lib/paypal.server");
    const { supabase, userId } = context as any;

    const { data: product } = await supabase
      .from("billing_products")
      .select("id, code, name_en, price_cents, currency")
      .eq("id", data.productId)
      .eq("is_active", true)
      .maybeSingle();
    if (!product) throw new Error("Product not found");
    const pr = product as ProductRow;

    const order = await paypalFetch<{ id: string; links: Array<{ rel: string; href: string }> }>(
      "/v2/checkout/orders",
      {
        method: "POST",
        body: {
          intent: "CAPTURE",
          purchase_units: [
            { custom_id: `${userId}:${pr.id}`, description: pr.name_en, amount: money(pr.price_cents, pr.currency) },
          ],
          application_context: {
            brand_name: "Cardixn",
            user_action: "PAY_NOW",
            return_url: `${data.origin}/billing/return?type=order`,
            cancel_url: `${data.origin}/billing/return?type=cancel`,
          },
        },
      },
    );

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await (supabaseAdmin as any).from("billing_orders").insert({
      user_id: userId,
      kind: "template",
      product_id: pr.id,
      paypal_order_id: order.id,
      amount_cents: pr.price_cents,
      currency: pr.currency,
      status: "created",
    });

    return { approveUrl: approveLink(order.links), orderId: order.id };
  });

/** Finalizes the flow after PayPal redirects the buyer back. */
export const finalizeCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId?: string; subscriptionId?: string }) => d)
  .handler(async ({ data, context }) => {
    const { paypalFetch } = await import("@/lib/paypal.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const { userId } = context as any;

    if (data.orderId) {
      const captured = await paypalFetch<{ status: string }>(`/v2/checkout/orders/${data.orderId}/capture`, {
        method: "POST",
        body: {},
      });
      await admin
        .from("billing_orders")
        .update({ status: captured.status === "COMPLETED" ? "paid" : captured.status.toLowerCase(), raw: captured })
        .eq("paypal_order_id", data.orderId)
        .eq("user_id", userId);
      return { kind: "order" as const, status: captured.status };
    }

    if (data.subscriptionId) {
      const { syncSubscriptionState } = await import("@/lib/paypal.server");
      const res = await syncSubscriptionState(data.subscriptionId);
      return { kind: "subscription" as const, status: res.status };
    }

    throw new Error("Nothing to finalize");
  });

/** Current user's active subscription (if any) plus their one-time purchases. */
export const getMyBilling = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data: subs } = await supabase
      .from("billing_subscriptions")
      .select("id, status, current_period_end, paypal_subscription_id, plan_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const rows = (subs ?? []) as Array<{ plan_id: string | null; status: string }>;
    const planIds = [...new Set(rows.map((r) => r.plan_id).filter(Boolean))] as string[];
    let plans: any[] = [];
    if (planIds.length) {
      const { data } = await supabase
        .from("billing_plans")
        .select("id, code, name_en, name_ar, interval, price_cents, currency, audience")
        .in("id", planIds);
      plans = data ?? [];
    }

    const merged = rows.map((r: any) => ({ ...r, plan: plans.find((p) => p.id === r.plan_id) ?? null }));
    const active = merged.find((s: any) => s.status === "active" || s.status === "approval_pending") ?? null;
    return { subscriptions: merged, active, isPro: !!merged.find((s: any) => s.status === "active") };
  });

/** Cancels the caller's PayPal subscription. */
export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { subscriptionId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    const { data: row } = await supabase
      .from("billing_subscriptions")
      .select("paypal_subscription_id")
      .eq("user_id", userId)
      .eq("paypal_subscription_id", data.subscriptionId)
      .maybeSingle();
    if (!row) throw new Error("Subscription not found");

    const { paypalFetch, syncSubscriptionState } = await import("@/lib/paypal.server");
    await paypalFetch(`/v1/billing/subscriptions/${data.subscriptionId}/cancel`, {
      method: "POST",
      body: { reason: "Cancelled by the customer from Cardixn" },
    });
    const res = await syncSubscriptionState(data.subscriptionId);
    return { status: res.status };
  });

