import { PHRASES } from "@/i18n/phrases";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

// Locale of the render currently in progress. Set synchronously by I18nProvider
// (and by the locale switcher) so plain, non-hook call sites can translate too.
let current: string = DEFAULT_LOCALE;

export function setTxLocale(locale: Locale | string) {
  current = locale;
}

export function txLocale() {
  return current;
}

/**
 * Translate an inline English UI string.
 * Falls back to the English source when a locale has no entry.
 */
export function tx(en: string, locale?: string): string {
  const l = locale ?? current;
  return PHRASES[l]?.[en] ?? en;
}

/** Pick a hand-written Arabic string for Arabic, otherwise translate the English one. */
export function txPick(en: string, ar: string, locale?: string): string {
  const l = locale ?? current;
  return l === "ar" ? ar : tx(en, l);
}

/**
 * Localize a whole copy object. Arabic uses the hand-written variant; every
 * other locale gets each English string translated through the phrase table.
 */
export function txDict<T>(en: T, ar?: T, locale?: string): T {
  const l = locale ?? current;
  if (l === "ar" && ar !== undefined) return ar;
  if (l === "en") return en;
  return walk(en, l) as T;
}

function walk(v: unknown, l: string): unknown {
  if (typeof v === "string") return tx(v, l);
  if (Array.isArray(v)) return v.map((x) => walk(x, l));
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = walk(val, l);
    return out;
  }
  return v;
}
