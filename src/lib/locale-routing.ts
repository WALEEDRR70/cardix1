import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from "@/i18n/config";

const UNLOCALIZED_PREFIXES = [
  "/auth/callback",
  "/c/",
  "/company/",
  "/api/",
  "/sitemap",
  "/robots",
] as const;

export function getPreferredLocale(fallback: Locale = DEFAULT_LOCALE): Locale {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem("cardix_lang");
    if (isSupportedLocale(saved)) return saved;
  } catch {
    // Ignore storage errors.
  }
  return fallback;
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return isSupportedLocale(first) ? first : null;
}

export function isUnlocalizedPath(pathname: string): boolean {
  return UNLOCALIZED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export function stripLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (!locale) return pathname || "/";
  const stripped = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "") || "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

export function localizedPath(path: string, locale?: Locale): string {
  if (!path.startsWith("/")) return path;
  if (path.startsWith("/$lang")) return path.replace("/$lang", `/${locale ?? getPreferredLocale()}`);
  if (isUnlocalizedPath(path)) return path;

  const explicitLocale = getLocaleFromPath(path);
  if (explicitLocale) return path;

  const lang = locale ?? getPreferredLocale();
  if (path === "/") return `/${lang}`;
  return `/${lang}${path}`;
}

export function readLocaleFromUrl(search: string, fallback?: Locale): Locale {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const lang = params.get("lang");
  if (isSupportedLocale(lang)) return lang;
  const next = params.get("next");
  if (next) {
    const fromNext = getLocaleFromPath(next);
    if (fromNext) return fromNext;
  }
  return getPreferredLocale(fallback);
}

export function safeNextPath(value: string | null | undefined, locale?: Locale): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return localizedPath("/dashboard", locale);
  if (value.startsWith("/api/") || value.startsWith("/auth/callback")) return localizedPath("/dashboard", locale);
  return value;
}