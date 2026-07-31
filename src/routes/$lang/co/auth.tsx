import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@/lib/nav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInWithFirebaseGoogle } from "@/lib/firebase-auth";
import { useI18n } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";
import { localizedPath, safeNextPath } from "@/lib/locale-routing";
import { tx, txErr } from "@/lib/tx";
import { Building2, Users, Palette, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/$lang/co/auth")({
  head: () => ({
    meta: [
      { title: "Business sign in — Cardixn for Companies" },
      {
        name: "description",
        content:
          "Sign in to your Cardixn company workspace: corporate branding, employee cards, templates, permissions and analytics.",
      },
      { property: "og:title", content: "Business sign in — Cardixn for Companies" },
      {
        property: "og:description",
        content: "A dedicated enterprise workspace for your company's digital business cards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BusinessAuthPage,
});

/** Company-only entry point. Fully separate from the personal /auth screen. */
function BusinessAuthPage() {
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function nextPath() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("next");
    if (!raw) return localizedPath("/co", lang);
    const safe = safeNextPath(raw, lang);
    return safe.includes("/co") ? safe : localizedPath("/co", lang);
  }

  /** The business surface always lands the user in the company context. */
  async function markCompanyContext() {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (uid) await supabase.from("profiles").update({ account_type: "company" }).eq("id", uid);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: nextPath() });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?lang=${lang}&next=${encodeURIComponent(
              localizedPath("/co", lang),
            )}`,
          },
        });
        if (error) throw error;
        toast.success(t.checkEmail);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await markCompanyContext();
        nav({ to: nextPath() });
      }
    } catch (err) {
      toast.error(txErr(err, t.somethingWrong));
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    try {
      setLoading(true);
      await signInWithFirebaseGoogle();
      await markCompanyContext();
      nav({ to: nextPath() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.somethingWrong;
      if (!/popup-closed-by-user|cancelled-popup-request/.test(msg)) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const perks = [
    { icon: Palette, label: tx("Corporate branding and locked templates") },
    { icon: Users, label: tx("Employee cards and permissions") },
    { icon: BarChart3, label: tx("Company-wide analytics") },
  ];

  return (
    <div className="relative min-h-[100dvh] bg-background lg:grid lg:grid-cols-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ backgroundImage: "var(--gradient-mesh)" }}
      />

      {/* Enterprise side panel */}
      <aside className="relative z-10 hidden flex-col justify-between border-e border-border/50 bg-card/30 p-12 backdrop-blur-xl lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="" className="h-9 w-9 object-contain" />
          <span className="text-base font-semibold tracking-tight">{t.brand}</span>
          <span className="ms-2 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {tx("Business")}
          </span>
        </Link>

        <div>
          <h2 className="text-3xl font-semibold tracking-tight">{tx("Cardixn for Companies")}</h2>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {tx("A workspace fully separated from your personal account, built for teams and corporate identity.")}
          </p>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary">
                  <p.icon className="h-4 w-4" />
                </span>
                {p.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} {t.brand}</p>
      </aside>

      {/* Form */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col px-6">
        <header className="safe-top flex items-center justify-between pb-2 lg:pt-6">
          <Link to="/" className="flex items-center gap-2 lg:invisible">
            <img src={logoAsset.url} alt="" className="h-9 w-9 object-contain" />
            <span className="text-base font-semibold tracking-tight">{t.brand}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <LocaleSwitcher compact />
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center pb-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> {tx("Company account")}
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {mode === "signin" ? tx("Sign in to your company") : tx("Create a company account")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tx("This entrance is for company workspaces only. Personal cards stay in a separate account.")}
          </p>

          <button
            onClick={google}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium transition hover:shadow-soft disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.9 6.9 0 0 1 5.47 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            {t.continueWithGoogle}
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />{t.or}<span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{tx("Work email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{t.password}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              disabled={loading}
              className="mt-3 w-full rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--gradient-gold)" }}
            >
              {loading ? "…" : mode === "signin" ? tx("Sign in to your company") : tx("Create a company account")}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {`${lang === "ar" ? "←" : "→"} ${mode === "signin" ? tx("Create a company account") : tx("Sign in to your company")}`}
          </button>

          <Link
            to="/auth"
            className="mt-4 text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {tx("Looking for your personal account? Sign in here")}
          </Link>
        </main>
      </div>
    </div>
  );
}
