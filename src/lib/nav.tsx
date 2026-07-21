import { Link as TSLink, useNavigate as useTSNavigate, useParams, type LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from "@/i18n/config";

/**
 * Paths that stay UN-localized (no /:lang prefix).
 * Public card share links, API, sitemaps, auth callback.
 */
const UNLOCALIZED_PREFIXES = ["/c/", "/api/", "/sitemap", "/robots"];

function isLocalized(to: string): boolean {
  if (!to.startsWith("/")) return false;
  if (to === "/") return true;
  if (to.startsWith("/$lang")) return false; // already explicit
  return !UNLOCALIZED_PREFIXES.some((p) => to.startsWith(p));
}

function transform(to: string, lang: Locale): { to: string; injectLang: boolean } {
  if (!isLocalized(to)) return { to, injectLang: false };
  if (to === "/") return { to: "/$lang/", injectLang: true };
  return { to: `/$lang${to}`, injectLang: true };
}

function currentLocale(paramsLang: string | undefined): Locale {
  return isSupportedLocale(paramsLang) ? paramsLang : DEFAULT_LOCALE;
}

/**
 * Locale-aware <Link>. Auto-prefixes `/:lang` to internal paths and injects
 * the active locale into `params`. Falls back to the tanstack link for
 * unlocalized paths (/c/*, /api/*, external, etc.).
 */
export const Link = forwardRef<HTMLAnchorElement, any>(function Link(props, ref) {
  const { to, params, ...rest } = props as LinkProps & { to?: string; params?: Record<string, unknown> };
  const routeParams = useParams({ strict: false }) as { lang?: string };
  const lang = currentLocale(routeParams?.lang);
  if (typeof to === "string") {
    const { to: nextTo, injectLang } = transform(to, lang);
    const nextParams = injectLang ? { ...(params ?? {}), lang } : params;
    return <TSLink ref={ref} to={nextTo as any} params={nextParams as any} {...(rest as any)} />;
  }
  return <TSLink ref={ref} to={to as any} params={params as any} {...(rest as any)} />;
});

/**
 * Locale-aware useNavigate. Rewrites string `to` targets to include the locale prefix.
 */
export function useNavigate() {
  const nav = useTSNavigate();
  const routeParams = useParams({ strict: false }) as { lang?: string };
  const lang = currentLocale(routeParams?.lang);
  return (opts: any) => {
    if (opts && typeof opts.to === "string") {
      const { to: nextTo, injectLang } = transform(opts.to, lang);
      return nav({
        ...opts,
        to: nextTo,
        params: injectLang ? { ...(opts.params ?? {}), lang } : opts.params,
      });
    }
    return nav(opts);
  };
}
