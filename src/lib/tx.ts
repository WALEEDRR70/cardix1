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
