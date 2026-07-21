import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_META, type Locale } from "@/i18n/config";

/**
 * Build hreflang alternate links for a canonical path template.
 * @param pathAfterLocale path without leading locale, e.g. "/features" or ""
 */
export function buildHreflangLinks(pathAfterLocale: string) {
  const clean = pathAfterLocale.startsWith("/") ? pathAfterLocale : `/${pathAfterLocale}`;
  const suffix = clean === "/" ? "" : clean;
  const links = SUPPORTED_LOCALES.map((loc) => ({
    rel: "alternate" as const,
    hreflang: loc,
    href: `${SITE_ORIGIN}/${loc}${suffix}`,
  }));
  links.push({
    rel: "alternate" as const,
    hreflang: "x-default",
    href: `${SITE_ORIGIN}/${DEFAULT_LOCALE}${suffix}`,
  });
  return links;
}

export function buildCanonical(locale: Locale, pathAfterLocale: string) {
  const clean = pathAfterLocale.startsWith("/") ? pathAfterLocale : `/${pathAfterLocale}`;
  const suffix = clean === "/" ? "" : clean;
  return `${SITE_ORIGIN}/${locale}${suffix}`;
}

export function ogLocaleAlternates(current: Locale) {
  return SUPPORTED_LOCALES
    .filter((l) => l !== current)
    .map((l) => ({ property: "og:locale:alternate" as const, content: LOCALE_META[l].ogLocale }));
}
