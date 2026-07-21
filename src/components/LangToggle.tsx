import { useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { SUPPORTED_LOCALES, LOCALE_META, DEFAULT_LOCALE, isSupportedLocale, type Locale } from "@/i18n/config";
import { Globe, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";


/**
 * Compact language toggle (kept for back-compat).
 * On click cycles: en → ar → en. Use <LocaleSwitcher /> for the full picker.
 */
export function LangToggle({ compact = false }: { compact?: boolean }) {
  const params = useParams({ strict: false }) as { lang?: string };
  const current: Locale = isSupportedLocale(params?.lang) ? params.lang : DEFAULT_LOCALE;
  const switchTo = useSwitchLocale();
  const next: Locale = current === "en" ? "ar" : "en";
  return (
    <button
      onClick={() => switchTo(next)}
      aria-label="Change language"
      className={
        compact
          ? "grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground"
          : "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      }
    >
      {current === "en" ? "ع" : "EN"}
    </button>
  );
}

/**
 * Premium 20-language picker.
 * Navigates to the same path under the chosen locale.
 */
export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const params = useParams({ strict: false }) as { lang?: string };
  const current: Locale = isSupportedLocale(params?.lang) ? params.lang : DEFAULT_LOCALE;
  const switchTo = useSwitchLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className={
          compact
            ? "grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            : "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        }
      >
        <Globe className="h-4 w-4" />
        {!compact && <span>{LOCALE_META[current].nativeName}</span>}
      </button>
      {open && (
        <div className="absolute end-0 top-full z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-2xl backdrop-blur-xl">
          {SUPPORTED_LOCALES.map((loc) => {
            const active = loc === current;
            return (
              <button
                key={loc}
                onClick={() => { setOpen(false); switchTo(loc); }}
                className={
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition " +
                  (active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                }
                dir={loc === "ar" ? "rtl" : "ltr"}
              >
                <span className="text-lg leading-none">{LOCALE_META[loc].flag}</span>
                <span className="flex-1 truncate">{LOCALE_META[loc].nativeName}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{loc}</span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Returns a function that navigates to the current path under a new locale.
 * If the current URL has no locale segment, navigates to /:next.
 */
export function useSwitchLocale() {
  const nav = useNavigate();
  const params = useParams({ strict: false }) as { lang?: string };
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (next: Locale) => {
    try { localStorage.setItem("cardix_lang", next); } catch {}
    // Persist to profile (fire and forget) so it follows the user across devices.
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      supabase.from("profiles").update({ preferred_lang: next }).eq("id", uid).then(() => {});
    });
    const currentLang = isSupportedLocale(params?.lang) ? params.lang : null;
    let target: string;
    if (currentLang) {
      target = pathname.replace(new RegExp(`^/${currentLang}(?=/|$)`), `/${next}`);
    } else if (pathname === "/") {
      target = `/${next}`;
    } else {
      target = `/${next}${pathname}`;
    }
    nav({ to: target, replace: false });
  };
}

