import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Cardix" },
      { name: "description", content: "Sign in to Cardix to create and manage your premium digital business cards." },
      { property: "og:title", content: "Sign in — Cardix" },
      { property: "og:description", content: "Sign in to Cardix to create and manage your premium digital business cards." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard" });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/dashboard" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error(result.error.message); return; }
    if (result.redirected) return;
    nav({ to: "/dashboard" });
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "var(--gradient-mesh)" }} />

      <header className="safe-top relative z-10 flex items-center justify-between px-5 pb-2">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>C</span>
          <span className="text-base font-semibold tracking-tight">{t.brand}</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <LangToggle compact />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          {mode === "signin" ? t.signIn : t.signUp}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin" ? t.welcomeBack : t.startCraft}
        </p>

        <button
          onClick={google}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium transition hover:shadow-soft"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.9 6.9 0 0 1 5.47 12c0-.73.13-1.44.36-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          {t.continueWithGoogle}
        </button>

        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" />{t.or}<span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{t.email}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block px-1 text-xs font-medium text-muted-foreground">{t.password}</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-input bg-card px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button
            disabled={loading}
            className="mt-3 w-full rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-60"
            style={{ background: "var(--gradient-gold)" }}
          >
            {loading ? "…" : mode === "signin" ? t.signIn : t.signUp}
          </button>
        </form>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground">
          {mode === "signin" ? `→ ${t.signUp}` : `→ ${t.signIn}`}
        </button>
      </main>
    </div>
  );
}
