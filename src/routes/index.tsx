import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LOCALE, detectBrowserLocale, isSupportedLocale } from "@/i18n/config";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    let locale = DEFAULT_LOCALE;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cardix_lang");
        if (isSupportedLocale(saved)) locale = saved;
        else locale = detectBrowserLocale();
      } catch {
        locale = detectBrowserLocale();
      }
    }
    throw redirect({ to: "/$lang/", params: { lang: locale }, replace: true });
  },
  component: () => null,
});
