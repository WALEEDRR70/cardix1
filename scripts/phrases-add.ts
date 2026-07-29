/**
 * Adds missing English source strings to src/i18n/phrases.ts, translating them
 * into every supported locale. Run with: bun scripts/phrases-add.ts key1 key2 ...
 * (or pipe a JSON array of strings on stdin).
 */
import { PHRASES } from "../src/i18n/phrases";

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

const openaiKey = process.env.OPENAI_API_KEY;
const key = openaiKey ?? process.env.LOVABLE_API_KEY;
if (!key) throw new Error("Missing OPENAI_API_KEY / LOVABLE_API_KEY");
const ENDPOINT = openaiKey
  ? "https://api.openai.com/v1/chat/completions"
  : "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = openaiKey ? "gpt-4o-mini" : "google/gemini-3.6-flash";

const argKeys = process.argv.slice(2);
const keys = argKeys.length ? argKeys : (JSON.parse(await Bun.stdin.text()) as string[]);

async function translate(locale: string, missing: string[], attempt = 0): Promise<Record<string, string>> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            `Translate the UI strings of Cardixn (digital business card SaaS) from English into ${NAMES[locale]}. ` +
            `Reply with a JSON object mapping each English source string to its translation. ` +
            `Keep brand and technical tokens (Cardixn, Gmail, Outlook, HTML, QR, NFC, vCard, .vcf, PNG) untouched. ` +
            `Keep labels short, like real product UI.`,
        },
        { role: "user", content: JSON.stringify(Object.fromEntries(missing.map((k) => [k, k]))) },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      return translate(locale, missing, attempt + 1);
    }
    throw new Error(`${locale}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return JSON.parse(json.choices[0].message.content) as Record<string, string>;
}

const next: Record<string, Record<string, string>> = JSON.parse(JSON.stringify(PHRASES));

await Promise.all(
  LOCALES.map(async (locale) => {
    const missing = keys.filter((k) => !next[locale]?.[k]);
    if (!missing.length) return;
    const out = await translate(locale, missing);
    next[locale] = { ...next[locale] };
    for (const k of missing) if (typeof out[k] === "string" && out[k].trim()) next[locale][k] = out[k];
    console.log(`${locale}: +${missing.length}`);
  }),
);

const body = Object.entries(next)
  .map(([locale, map]) => {
    const inner = Object.entries(map)
      .map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
      .join("\n");
    return `  ${JSON.stringify(locale)}: {\n${inner}\n  },`;
  })
  .join("\n");

await Bun.write(
  "src/i18n/phrases.ts",
  `// AUTO-GENERATED inline UI phrases, keyed by the English source string.\n` +
    `// Used by tx()/txPick()/txDict()/txErr() in src/lib/tx.ts for strings that live inside components.\n\n` +
    `export const PHRASES: Record<string, Record<string, string>> = {\n${body}\n};\n`,
);
console.log("phrases.ts updated");
