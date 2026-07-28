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
