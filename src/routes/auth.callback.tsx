import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: AuthCallback,
});

function readLocale(): string {
  try {
    const saved = localStorage.getItem("cardix_lang");
    if (isSupportedLocale(saved)) return saved;
  } catch {}
  return DEFAULT_LOCALE;
}

async function consumeTokensFromUrl() {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  const params = new URLSearchParams(hash || window.location.search.slice(1));
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (access_token && refresh_token) {
    try {
      await supabase.auth.setSession({ access_token, refresh_token });
    } catch {}
  }
}

function AuthCallback() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await consumeTokensFromUrl();
      // Give the Supabase client time to persist the session from the URL.
      for (let i = 0; i < 25 && !cancelled; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          window.location.replace(`/${readLocale()}/dashboard`);
          return;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      if (!cancelled) window.location.replace(`/${readLocale()}/auth`);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
