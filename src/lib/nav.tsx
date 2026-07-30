import { Link as TSLink, useNavigate as useTSNavigate, useParams, type LinkProps } from "@tanstack/react-router";
import { forwardRef } from "react";
import { isSupportedLocale, type Locale } from "@/i18n/config";
import { getLocaleFromPath, getPreferredLocale, isUnlocalizedPath, stripLocalePrefix } from "@/lib/locale-routing";

function isLocalized(to: string): boolean {
  if (!to.startsWith("/")) return false;
  if (to.startsWith("/$lang")) return true;
  return !isUnlocalizedPath(to);
}

function transform(to: string, lang: Locale): { to: string; injectLang: boolean; lang: Locale } {
  if (!isLocalized(to)) return { to, injectLang: false, lang };
  if (to.startsWith("/$lang")) return { to, injectLang: true, lang };
  const explicitLocale = getLocaleFromPath(to);
  if (explicitLocale) {
    const stripped = stripLocalePrefix(to);
    return {
      to: stripped === "/" ? "/$lang/" : `/$lang${stripped}`,
      injectLang: true,
      lang: explicitLocale,
    };
  }
  if (to === "/") return { to: "/$lang/", injectLang: true, lang };
  return { to: `/$lang${to}`, injectLang: true, lang };
}

function currentLocale(paramsLang: string | undefined): Locale {
  return isSupportedLocale(paramsLang) ? paramsLang : getPreferredLocale();
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
    const { to: nextTo, injectLang, lang: nextLang } = transform(to, lang);
    const nextParams = injectLang
      ? { ...((params ?? {}) as Record<string, unknown>), lang: nextLang }
      : params;
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
      const { to: nextTo, injectLang, lang: nextLang } = transform(opts.to, lang);
      return nav({
        ...opts,
        to: nextTo,
        params: injectLang ? { ...(opts.params ?? {}), lang: nextLang } : opts.params,
      });
    }
    return nav(opts);
  };
}
