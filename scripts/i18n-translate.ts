/**
 * Offline translation generator.
 * Reads a JSON map of English strings and produces one JSON file per locale
 * using the Lovable AI gateway. Run with: bun scripts/i18n-translate.ts <input.json> <outDir>
 */
const LOCALES = [
  "ar", "fr", "de", "es", "it", "pt", "ru", "tr", "nl",
  "pl", "zh", "zh-TW", "ja", "ko", "hi", "id", "ms", "th", "vi",
] as const;

const NAMES: Record<string, string> = {
  ar: "Arabic", fr: "French", de: "German", es: "Spanish", it: "Italian",
  pt: "Portuguese", ru: "Russian", tr: "Turkish", nl: "Dutch", pl: "Polish",
  zh: "Simplified Chinese", "zh-TW": "Traditional Chinese", ja: "Japanese",
  ko: "Korean", hi: "Hindi", id: "Indonesian", ms: "Malay", th: "Thai", vi: "Vietnamese",
};

const key = process.env.LOVABLE_API_KEY;
if (!key) throw new Error("Missing LOVABLE_API_KEY");

const [inputPath, outDir] = process.argv.slice(2);
if (!inputPath || !outDir) throw new Error("usage: bun scripts/i18n-translate.ts <input.json> <outDir>");

const source: Record<string, string> = JSON.parse(await Bun.file(inputPath).text());
const entries = Object.entries(source);

async function translateChunk(locale: string, chunk: [string, string][], attempt = 0): Promise<Record<string, string>> {
  const payload = Object.fromEntries(chunk);
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            `You are a professional software localizer for a premium SaaS digital business card product called Cardixn. ` +
            `Translate the JSON string values from English into ${NAMES[locale]}. Rules: keep JSON keys unchanged; ` +
            `keep the product name "Cardixn", brand names, URLs, and technical tokens like QR, NFC, CSV, AI, SEO, QR untouched; ` +
            `preserve placeholders such as {n}, %s, and any leading/trailing punctuation; keep UI labels short and natural; ` +
            `use the formal but friendly register typical of modern SaaS products. Reply with JSON only.`,
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      return translateChunk(locale, chunk, attempt + 1);
    }
    throw new Error(`${locale}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    if (attempt < 3) return translateChunk(locale, chunk, attempt + 1);
    throw new Error(`${locale}: unparsable response`);
  }
}

const CHUNK = 60;
await Bun.write(`${outDir}/.keep`, "");

await Promise.all(
  LOCALES.map(async (locale) => {
    const out: Record<string, string> = {};
    for (let i = 0; i < entries.length; i += CHUNK) {
      const chunk = entries.slice(i, i + CHUNK);
      const part = await translateChunk(locale, chunk);
      for (const [k, v] of chunk) out[k] = typeof part[k] === "string" && part[k].trim() ? part[k] : v;
    }
    await Bun.write(`${outDir}/${locale}.json`, JSON.stringify(out, null, 2));
    console.log("done", locale, Object.keys(out).length);
  }),
);
