// Thin PayPal REST helper (BYOK: the project owner's own PayPal Business app).
// No env switch is required: we detect sandbox vs live from the credentials.
const SANDBOX = "https://api-m.sandbox.paypal.com";
const LIVE = "https://api-m.paypal.com";

let resolved: { base: string; token: string; expires: number } | null = null;

async function requestToken(base: string, id: string, secret: string) {
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const body = await res.text();
  if (!res.ok) return { ok: false as const, body, status: res.status };
  const json = JSON.parse(body);
  return { ok: true as const, token: json.access_token as string, expiresIn: (json.expires_in as number) ?? 3000 };
}

async function auth() {
  if (resolved && resolved.expires > Date.now()) return resolved;
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials are not configured");

  const order = resolved ? [resolved.base, resolved.base === LIVE ? SANDBOX : LIVE] : [LIVE, SANDBOX];
  let lastError = "";
  for (const base of order) {
    const r = await requestToken(base, id, secret);
    if (r.ok) {
      resolved = { base, token: r.token, expires: Date.now() + (r.expiresIn - 60) * 1000 };
      return resolved;
    }
    lastError = `[${r.status}] ${r.body}`;
  }
  throw new Error(`PayPal auth failed: ${lastError}`);
}

export async function paypalToken() {
  return (await auth()).token;
}

export async function paypalFetch<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { base, token } = await auth();
  const res = await fetch(`${base}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`PayPal request failed [${res.status}] ${path}: ${text}`);
    throw new Error(`PayPal request failed [${res.status}]: ${text}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export function approveLink(links: Array<{ rel: string; href: string }> | undefined) {
  return links?.find((l) => l.rel === "approve" || l.rel === "payer-action")?.href ?? null;
}

export function money(cents: number, currency: string) {
  return { currency_code: currency, value: (cents / 100).toFixed(2) };
}

export type PlanForPaypal = {
  id: string;
  name_en: string;
  interval: string;
  price_cents: number;
  currency: string;
  paypal_plan_id: string | null;
};

/**
 * Returns the PayPal billing-plan id for a Cardixn plan, creating the PayPal
 * product + plan on the fly the first time and persisting the id.
 */
export async function ensurePlanLinked(plan: PlanForPaypal, force = false): Promise<string> {
  if (plan.paypal_plan_id && !force) return plan.paypal_plan_id;

  const product = await paypalFetch<{ id: string }>("/v1/catalogs/products", {
    method: "POST",
    body: { name: `Cardixn ${plan.name_en}`, type: "SERVICE", category: "SOFTWARE" },
  });

  const created = await paypalFetch<{ id: string }>("/v1/billing/plans", {
    method: "POST",
    body: {
      product_id: product.id,
      name: `Cardixn ${plan.name_en} (${plan.interval})`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: plan.interval === "year" ? "YEAR" : "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { currency_code: plan.currency, value: (plan.price_cents / 100).toFixed(2) },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 2,
      },
    },
  });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await (supabaseAdmin as any).from("billing_plans").update({ paypal_plan_id: created.id }).eq("id", plan.id);
  return created.id;
}

/** Pulls a subscription from PayPal and mirrors its state into the database. */
export async function syncSubscriptionState(subscriptionId: string) {
  const sub = await paypalFetch<{
    id: string;
    status: string;
    plan_id: string;
    custom_id?: string;
    billing_info?: { next_billing_time?: string };
  }>(`/v1/billing/subscriptions/${subscriptionId}`);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as any;

  const { data: order } = await admin
    .from("billing_orders")
    .select("plan_id, user_id")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle();

  const userId = order?.user_id ?? sub.custom_id ?? null;
  let planId: string | null = order?.plan_id ?? null;
  if (!planId && sub.plan_id) {
    const { data: plan } = await admin.from("billing_plans").select("id").eq("paypal_plan_id", sub.plan_id).maybeSingle();
    planId = plan?.id ?? null;
  }

  const status = sub.status.toLowerCase();
  await admin
    .from("billing_orders")
    .update({ status: status === "active" ? "paid" : status, raw: sub })
    .eq("paypal_subscription_id", subscriptionId);

  if (userId) {
    await admin.from("billing_subscriptions").upsert(
      {
        user_id: userId,
        plan_id: planId,
        paypal_subscription_id: subscriptionId,
        status,
        current_period_end: sub.billing_info?.next_billing_time ?? null,
      },
      { onConflict: "paypal_subscription_id" },
    );
  }

  return { status: sub.status, userId, planId };
}
