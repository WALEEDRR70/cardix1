import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@/lib/nav";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { LocaleSwitcher } from "@/components/LangToggle";
import { InstallAppButton } from "@/components/InstallAppButton";
import { SubscriptionCard } from "@/components/billing/SubscriptionCard";

import { LogOut, Moon, Sun, User, Sparkles, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/$lang/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Cardixn" },
      { name: "description", content: "Manage your Cardixn account, language, theme, and preferences." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  return (
    <MobileShell topBar={<PageHeader title={t.settings} />}>
      <div className="mx-auto max-w-2xl space-y-5 px-5 lg:px-8">
        {/* Profile card */}
        <div className="glass flex items-center gap-3 rounded-3xl p-5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-semibold text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
            {(user.email ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.email}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t.account}</p>
          </div>
          <User className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Theme */}
        <Section title={t.theme}>
          <div className="grid grid-cols-2 gap-2 p-2">
            <ThemeChip active={theme === "dark"} onClick={() => setTheme("dark")} icon={<Moon className="h-4 w-4" />} label={t.dark} />
            <ThemeChip active={theme === "light"} onClick={() => setTheme("light")} icon={<Sun className="h-4 w-4" />} label={t.light} />
          </div>
        </Section>

        <SubscriptionCard ar={typeof document !== "undefined" && document.documentElement.lang === "ar"} />

        {/* Language */}
        <Section title={t.language}>
          <div className="flex items-center justify-between px-4 py-3.5">
            <p className="text-sm text-muted-foreground">{t.language}</p>
            <LocaleSwitcher />
          </div>
        </Section>

        {/* Links */}
        <Section>
          <Row icon={<Sparkles className="h-4 w-4" />} label={t.brand} sub="v1.0" />
        </Section>

        <InstallAppButton />


        <button
          onClick={signOut}
          className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> {t.signOut}
        </button>
      </div>
    </MobileShell>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section>
      {title && <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>}
      <div className="glass overflow-hidden rounded-3xl">{children}</div>
    </section>
  );
}

function ThemeChip({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium transition " +
        (active ? "bg-secondary text-foreground ring-1 ring-accent" : "text-muted-foreground hover:bg-secondary")
      }
    >
      {icon} {label}
    </button>
  );
}

function Row({ icon, label, sub }: { icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
    </div>
  );
}
