import { useRouterState } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import { Home, Layers, Plus, ScanLine, BookmarkCheck, Building2, LayoutTemplate, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";
import { getReadableText } from "@/lib/contrast";
import { stripLocalePrefix } from "@/lib/locale-routing";
import { wsDict } from "@/i18n/workspace";


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
    <div className="relative min-h-[100dvh] bg-background lg:flex">
      {!hideNav && <DesktopSidebar />}

      <div className={"relative flex min-h-[100dvh] w-full flex-col " + (hideNav ? "" : "lg:pl-64")}>
        {/* Ambient background for desktop */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden opacity-60 lg:block" style={{ backgroundImage: "var(--gradient-mesh)" }} />

        <div className="mx-auto w-full max-w-[440px] lg:max-w-[1200px]">
          {topBar}
        </div>
        <main className={"flex-1 " + (hideNav ? "" : "pb-nav lg:pb-16")}>
          <div className="mx-auto w-full max-w-[440px] lg:max-w-[1200px]">
            {children}
          </div>
        </main>

        {!hideNav && <MobileBottomNav />}
      </div>
    </div>
  );
}

/* -------------------- Desktop sidebar -------------------- */
function DesktopSidebar() {
  const { t, lang } = useI18n();
  const path = useRouterState({ select: (s) => stripLocalePrefix(s.location.pathname) });

  const items = [
    { to: "/dashboard", icon: Home, label: t.home },
    { to: "/vault", icon: BookmarkCheck, label: t.vault },
    { to: "/scan", icon: ScanLine, label: t.scanCard },
    { to: "/templates", icon: LayoutTemplate, label: lang === "ar" ? "معرض القوالب" : "Templates" },
    { to: "/tools", icon: Wrench, label: lang === "ar" ? "الأدوات" : "Tools" },
    { to: "/settings", icon: Layers, label: t.settings },
  ] as const;


  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl lg:flex">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-6 pt-6">
        <img src={logoAsset.url} alt="" className="h-9 w-9 object-contain" />
        <span className="text-base font-semibold tracking-tight">{t.brand}</span>
      </Link>

      <Link
        to="/cards/new"
        className="mx-4 mt-8 inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow transition active:scale-[0.98]"
        style={{ background: "var(--gradient-gold)" }}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} /> {t.newCard}
      </Link>

      <nav className="mt-8 flex-1 space-y-1 px-3">
        {items.map((i) => {
          const active = i.to === "/dashboard" ? path === i.to : path.startsWith(i.to);
          return (
            <Link
              key={i.to}
              to={i.to}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                (active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground")
              }
            >
              <span className={"grid h-8 w-8 place-items-center rounded-lg transition " + (active ? "text-accent" : "")}>
                <i.icon className="h-4 w-4" />
              </span>
              {i.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <Link
          to="/switch"
          className="flex items-center gap-3 rounded-xl border border-border/50 px-3 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg">
            <Building2 className="h-4 w-4" />
          </span>
          {wsDict(lang).switchAccount}
        </Link>
      </div>

      <div className="px-6 pb-6 pt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        © {new Date().getFullYear()} {t.brand}
      </div>
    </aside>
  );
}

/* -------------------- Mobile bottom nav + FAB -------------------- */
export function MobileBottomNav({ accent }: { accent?: string } = {}) {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => stripLocalePrefix(s.location.pathname) });

  const items = [
    { to: "/dashboard", icon: Home, label: t.home },
    { to: "/vault", icon: BookmarkCheck, label: t.vault },
    { to: "/cards/new", icon: Plus, label: t.newCard },
    { to: "/settings", icon: Layers, label: t.settingsShort },
  ] as const;

  const fabColor = accent ? getReadableText(accent) : undefined;
  const fabStyle = accent
    ? { background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 12px 40px -8px ${accent}aa`, color: fabColor }
    : { background: "var(--gradient-gold)" };

  return (
    <div className="lg:hidden">
      <Link
        to="/scan"
        className={"fixed bottom-[calc(env(safe-area-inset-bottom)+3.25rem)] left-1/2 z-30 -translate-x-1/2 grid h-14 w-14 place-items-center rounded-full shadow-luxe ring-4 ring-background transition active:scale-95 " + (accent ? "" : "text-accent-foreground")}
        style={fabStyle}

        aria-label={t.scanCard}
      >
        <ScanLine className="h-6 w-6" strokeWidth={2.5} />
      </Link>

      <nav className="glass-strong fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[440px] safe-bottom pt-1.5 border-t border-border/40">
        <div className="grid grid-cols-5 items-center px-2">
          {items.slice(0, 2).map((i) => (
            <TabLink key={i.to} to={i.to} icon={<i.icon className="h-[18px] w-[18px]" />} label={i.label} active={path === i.to} />
          ))}
          <span aria-hidden />
          {items.slice(2).map((i) => (
            <TabLink key={i.to} to={i.to} icon={<i.icon className="h-[18px] w-[18px]" />} label={i.label} active={path === i.to} />
          ))}
        </div>
      </nav>
    </div>
  );
}


function TabLink({ to, icon, label, active }: { to: string; icon: ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={
        "flex flex-col items-center gap-0.5 py-1.5 text-[9px] font-medium tracking-wide transition " +
        (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
      }
    >
      <span className={"grid h-7 w-7 place-items-center rounded-lg transition " + (active ? "bg-secondary text-accent" : "")}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}


/* -------------------- Page header -------------------- */
export function PageHeader({
  title,
  subtitle,
  right,
  back,
  backParams,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  back?: string;
  backParams?: Record<string, unknown>;
}) {
  const { t } = useI18n();
  return (
    <header className="safe-top px-4 pb-2.5 pt-3 lg:px-8 lg:pb-6 lg:pt-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {back && (
            <Link
              to={back}
              params={backParams}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border/60 bg-card/60 text-muted-foreground backdrop-blur hover:text-foreground lg:hidden"
              aria-label={t.back}
            >
              <span className="text-base leading-none rtl:hidden">‹</span>
              <span className="hidden text-base leading-none rtl:inline">›</span>
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-[19px] font-semibold tracking-tight lg:text-3xl">{title}</h1>
            {subtitle && <p className="mt-0.5 truncate text-[11px] text-muted-foreground lg:text-sm">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}


/* -------------------- Bottom sheet / desktop modal -------------------- */
export function BottomSheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong relative mx-auto w-full max-w-[520px] rounded-t-3xl border-t border-border safe-bottom pt-3 shadow-luxe animate-in slide-in-from-bottom duration-300 lg:max-w-[460px] lg:rounded-3xl lg:border lg:pb-6"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/30 lg:hidden" />
        {title && <h3 className="px-5 pb-2 text-base font-semibold lg:text-lg">{title}</h3>}
        <div className="px-5 pt-2">{children}</div>
      </div>
    </div>
  );
}
