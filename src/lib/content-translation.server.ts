import { createHash } from "node:crypto";
import { LOCALE_META, type Locale } from "@/i18n/config";
import type { TranslatedFields } from "@/lib/content-translation";

export function hashSource(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 32);
}

const SYSTEM = (langName: string, locale: string) =>
  `You are a professional localizer for Cardixn, a premium digital business-card platform.
Translate the JSON string values into ${langName} (${locale}).
Rules:
- Keep every JSON key exactly as given, and keep arrays as arrays of strings.
- Translate marketing, bios, service descriptions and job titles naturally and idiomatically — not literally.
- Never translate: personal names, brand names, company legal names, URLs, emails, phone numbers,
  currency codes, or technical tokens (QR, NFC, CSV, SEO, AI).
- Numbers, prices and times keep their digits; only translate the surrounding words.
- Keep the length close to the source so it fits business-card layouts.
- If a value should stay unchanged, return it as-is.
Reply with JSON only.`;

type Msg = { role: "system" | "user"; content: string };

async function callOpenAI(key: string, messages: Msg[]): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "{}";
}

async function callGateway(key: string, messages: Msg[]): Promise<string> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages,
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted.");
  if (!res.ok) throw new Error(`AI error [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "{}";
}

/**
 * Translate a flat map of strings/string-arrays into `locale`.
 * Prefers the project's own OpenAI key; falls back to the built-in gateway.
 */
export async function translateFields(
  source: TranslatedFields,
  locale: Locale,
): Promise<TranslatedFields> {
  if (!Object.keys(source).length) return {};
  const langName = LOCALE_META[locale]?.englishName ?? locale;
  const messages: Msg[] = [
    { role: "system", content: SYSTEM(langName, locale) },
    { role: "user", content: JSON.stringify(source) },
  ];

  const openaiKey = process.env.OPENAI_API_KEY;
  let raw = "";
  if (openaiKey) {
    try {
      raw = await callOpenAI(openaiKey, messages);
    } catch (err) {
      console.error("OpenAI translation failed, falling back to gateway:", err);
    }
  }
  if (!raw) {
    const gatewayKey = process.env.LOVABLE_API_KEY;
    if (!gatewayKey) throw new Error("No translation provider configured");
    raw = await callGateway(gatewayKey, messages);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim());
  } catch {
    return {};
  }

  const out: TranslatedFields = {};
  for (const [k, v] of Object.entries(source)) {
    const got = parsed[k];
    if (Array.isArray(v)) {
      out[k] = Array.isArray(got) ? got.map(String).filter(Boolean) : v;
    } else {
      out[k] = typeof got === "string" && got.trim() ? got : v;
    }
  }
  return out;
}
