import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Layers, Plus, ScanLine, BookmarkCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export function MobileShell({
  children,
  topBar,
  hideNav = false,
}: {
  children: ReactNode;
  topBar?: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col bg-background">
      {topBar}
      <main className={"flex-1 " + (hideNav ? "" : "pb-nav")}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}

function BottomNav() {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/dashboard", icon: Home, label: t.home },
    { to: "/vault", icon: BookmarkCheck, label: t.vault },
    { to: "/scan", icon: ScanLine, label: t.scanShort },
    { to: "/settings", icon: Layers, label: t.settingsShort },
  ] as const;

  return (
    <>
      <Link
        to="/cards/new"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+3.75rem)] left-1/2 z-30 -translate-x-1/2 grid h-16 w-16 place-items-center rounded-full text-accent-foreground shadow-luxe transition active:scale-95"
        style={{ background: "var(--gradient-gold)" }}
        aria-label={t.newCard}
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </Link>

      <nav className="glass-strong fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[520px] safe-bottom pt-2">
        <div className="grid grid-cols-5 items-center px-3">
          {items.slice(0, 2).map((i) => (
            <TabLink key={i.to} to={i.to} icon={<i.icon className="h-5 w-5" />} label={i.label} active={path === i.to} />
          ))}
          <span aria-hidden />
          {items.slice(2).map((i) => (
            <TabLink key={i.to} to={i.to} icon={<i.icon className="h-5 w-5" />} label={i.label} active={path === i.to} />
          ))}
        </div>
      </nav>
    </>
  );
}

function TabLink({ to, icon, label, active }: { to: string; icon: ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={
        "flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition " +
        (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
      }
    >
      <span className={"grid h-8 w-8 place-items-center rounded-xl transition " + (active ? "bg-secondary" : "")}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
  back,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  back?: string;
}) {
  return (
    <header className="safe-top px-5 pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {back && (
            <Link
              to={back}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
              aria-label="Back"
            >
              <span className="text-lg leading-none rtl:hidden">‹</span>
              <span className="hidden text-lg leading-none rtl:inline">›</span>
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}

export function BottomSheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong relative mx-auto w-full max-w-[520px] rounded-t-3xl border-t border-border safe-bottom pt-3 shadow-luxe animate-in slide-in-from-bottom duration-300"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        {title && <h3 className="px-5 pb-2 text-base font-semibold">{title}</h3>}
        <div className="px-5 pt-2">{children}</div>
      </div>
    </div>
  );
}
