import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";

function NotFoundComponent() {
  return (
    <I18nProvider>
      <NotFoundInner />
    </I18nProvider>
  );
}
function NotFoundInner() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">{t.brand}</p>
        <h1 className="mt-2 text-7xl font-semibold tracking-tight">404</h1>
        <p className="mt-3 text-muted-foreground">{t.pageNotFound}</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          {t.goHome}
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <I18nProvider>
      <ErrorInner router={router} reset={reset} />
    </I18nProvider>
  );
}
function ErrorInner({ router, reset }: { router: ReturnType<typeof useRouter>; reset: () => void }) {
  const { t } = useI18n();
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">{t.somethingWrong}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.tryAgainDesc}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
          >{t.tryAgain}</button>
          <a href="/" className="rounded-full border border-input px-5 py-2 text-sm">{t.goHome}</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { title: "Cardixn — Premium digital business cards" },
      { name: "description", content: "Cardixn is a premium SaaS for digital business cards. Design, share via QR / NFC / link, scan paper cards with AI, and track analytics." },
      { name: "author", content: "Cardixn" },
      { property: "og:title", content: "Cardixn — Premium digital business cards" },
      { property: "og:description", content: "Cardixn is a premium SaaS for digital business cards. Design, share via QR / NFC / link, scan paper cards with AI, and track analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#7c34ff" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "twitter:title", content: "Cardixn — Premium digital business cards" },
      { name: "twitter:description", content: "Cardixn is a premium SaaS for digital business cards. Design, share via QR / NFC / link, scan paper cards with AI, and track analytics." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/049009a8-923c-4e49-80ba-2fbfd6bf6cd4/id-preview-f786d2ea--558b49a1-03ea-4b3e-a37c-70942b2a7156.lovable.app-1784658404778.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/049009a8-923c-4e49-80ba-2fbfd6bf6cd4/id-preview-f786d2ea--558b49a1-03ea-4b3e-a37c-70942b2a7156.lovable.app-1784658404778.png" },
    ],
    scripts: [
      { src: "https://www.googletagmanager.com/gtag/js?id=G-C4GT9PDMPK", async: true },
      { children: "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-C4GT9PDMPK');" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: logoAsset.url },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", sizes: "192x192", href: "/icon-192.png" },
      { rel: "apple-touch-icon", sizes: "512x512", href: "/icon-512.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const applyPreferredLang = async (userId: string) => {
      try {
        const { data } = await supabase.from("profiles").select("preferred_lang").eq("id", userId).maybeSingle();
        const pref = data?.preferred_lang;
        if (!pref) return;
        const { SUPPORTED_LOCALES } = await import("@/i18n/config");
        if (!(SUPPORTED_LOCALES as readonly string[]).includes(pref)) return;
        try { localStorage.setItem("cardix_lang", pref); } catch {}
        const path = window.location.pathname;
        const m = path.match(/^\/([a-zA-Z-]+)(\/|$)/);
        const current = m?.[1];
        if (current && (SUPPORTED_LOCALES as readonly string[]).includes(current) && current !== pref) {
          const next = path.replace(/^\/[a-zA-Z-]+/, `/${pref}`);
          window.history.replaceState(null, "", next + window.location.search + window.location.hash);
          router.invalidate();
        }
      } catch {}
    };
    // On mount, if already signed in, honor stored preference.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) applyPreferredLang(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
      if (event === "SIGNED_IN" && session?.user?.id) applyPreferredLang(session.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);


  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <Outlet />
          <Toaster position="top-center" theme="dark" richColors />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
