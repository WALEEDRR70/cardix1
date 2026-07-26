import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LOCALE, detectBrowserLocale, isSupportedLocale } from "@/i18n/config";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    let locale = DEFAULT_LOCALE;
    if (typeof window !== "undefined") {
      // OAuth can land back on "/" with tokens in the hash — never strip them.
      const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
      if (raw.includes("access_token=")) {
        window.location.replace(`/auth/callback${window.location.search}${window.location.hash}`);
        return;
      }
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
