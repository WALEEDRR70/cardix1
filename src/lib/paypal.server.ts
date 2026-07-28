// Thin PayPal REST helper (BYOK: the project owner's own PayPal Business app).
export function paypalBase() {
  return (process.env.PAYPAL_ENV ?? "sandbox") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function paypalToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials are not configured");
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`PayPal auth failed [${res.status}]: ${body}`);
  return JSON.parse(body).access_token as string;
}

export async function paypalFetch<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = await paypalToken();
  const res = await fetch(`${paypalBase()}${path}`, {
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
