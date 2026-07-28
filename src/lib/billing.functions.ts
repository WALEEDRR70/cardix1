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

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

/** Creates (or recreates) a PayPal billing plan for a Cardixn plan row. */
export const syncPlanToPaypal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { planId: string }) => d)
  .handler(async ({ data, context }) => {
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
      const sub = await paypalFetch<{ status: string; plan_id: string; billing_info?: { next_billing_time?: string } }>(
        `/v1/billing/subscriptions/${data.subscriptionId}`,
      );
      const { data: order } = await admin
        .from("billing_orders")
        .select("plan_id")
        .eq("paypal_subscription_id", data.subscriptionId)
        .maybeSingle();

      await admin
        .from("billing_orders")
        .update({ status: sub.status === "ACTIVE" ? "paid" : sub.status.toLowerCase(), raw: sub })
        .eq("paypal_subscription_id", data.subscriptionId);

      await admin.from("billing_subscriptions").upsert(
        {
          user_id: userId,
          plan_id: order?.plan_id ?? null,
          paypal_subscription_id: data.subscriptionId,
          status: sub.status.toLowerCase(),
          current_period_end: sub.billing_info?.next_billing_time ?? null,
        },
        { onConflict: "paypal_subscription_id" },
      );
      return { kind: "subscription" as const, status: sub.status };
    }

    throw new Error("Nothing to finalize");
  });
