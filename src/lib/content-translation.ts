// Shared (client-safe) contract for AI translation of user-generated content.

export type TranslatableEntity = "card" | "company" | "service";

/** Text fields we translate for each entity type. */
export const TRANSLATABLE_FIELDS: Record<TranslatableEntity, readonly string[]> = {
  card: ["title", "company", "bio", "address", "working_hours", "department"],
  company: ["tagline", "description", "industry", "address"],
  service: ["name", "summary", "description", "price", "duration", "features"],
};

export type TranslatedFields = Record<string, string | string[]>;

/** Overlay translated values on top of the original row, keeping empty ones intact. */
export function applyTranslation<T extends Record<string, unknown>>(
  source: T,
  translated: TranslatedFields | null | undefined,
): T {
  if (!translated) return source;
  const out: Record<string, unknown> = { ...source };
  for (const [k, v] of Object.entries(translated)) {
    if (typeof v === "string" && v.trim()) out[k] = v;
    else if (Array.isArray(v) && v.length) out[k] = v;
  }
  return out as T;
}
