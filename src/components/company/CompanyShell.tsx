import { useRouterState } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
import type { ReactNode } from "react";
import { useState } from "react";
import { BadgeCheck, ChevronLeft, Menu, X } from "lucide-react";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { COMPANY_SECTIONS, findCompanySection, type CompanySection, type CompanyTab } from "@/lib/company-nav";
import { useWs, type Company, type CompanyRole, roleLabel } from "@/lib/workspace";
import { stripLocalePrefix } from "@/lib/locale-routing";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";
import { SiteTopBar } from "@/components/SiteTopBar";

/**
 * Enterprise shell for the Company workspace: five sidebar sections, with the
 * remaining pages surfaced as tabs inside the section they belong to.
 */
export function CompanyShell({
  company,
  role,
  title,
  subtitle,
  actions,
  children,
}: {
  company: Company;
  role: CompanyRole;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { w } = useWs();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => stripLocalePrefix(s.location.pathname) });
  const base = `/co/${company.slug}`;
  const suffix = path.startsWith(base) ? path.slice(base.length) : "";
  const activeSection = findCompanySection(suffix);
  const activeTab = suffix.replace(/\/$/, "");

  const brandStyle = {
    ["--brand" as string]: company.brand_primary,
    ["--brand-2" as string]: company.brand_secondary,
  } as React.CSSProperties;

  const renderItem = (s: CompanySection) => {
    const active = s.path === activeSection.path;
    return (
      <Link
        key={s.path || "overview"}
        to={`/co/$slug${s.path}`}
        params={{ slug: company.slug }}
        onClick={() => setOpen(false)}
        className={
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition " +
          (active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")
        }
      >
        <s.icon className="h-4 w-4 shrink-0" style={active ? { color: company.brand_primary } : undefined} />
        <span className="truncate">{s.label(w)}</span>
      </Link>
    );
  };

  const renderTab = (t: CompanyTab) => {
    const active = t.path === activeTab;
    return (
      <Link
        key={t.path || "root"}
        to={`/co/$slug${t.path}`}
        params={{ slug: company.slug }}
        className={
          "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition " +
          (active
            ? "bg-secondary text-foreground"
            : t.advanced
              ? "text-muted-foreground/60 hover:text-foreground"
              : "text-muted-foreground hover:text-foreground")
        }
      >
        {t.label(w)}
      </Link>
    );
  };

  const nav = (
    <nav className="flex h-full flex-col">
      <Link to="/co/$slug" params={{ slug: company.slug }} className="flex items-center gap-3 px-5 pt-6">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/60"
          style={{ background: `linear-gradient(135deg, ${company.brand_primary}, ${company.brand_secondary})` }}
        >
          {company.logo_url ? (
            <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-white">{company.name.slice(0, 2).toUpperCase()}</span>
          )}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1 truncate text-sm font-semibold tracking-tight">
            {company.name}
            {company.is_verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
          </span>
          <span className="block truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {roleLabel(role, w)}
          </span>
        </span>
      </Link>

      <div className="mt-6 flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
        {COMPANY_SECTIONS.map(renderItem)}
      </div>

      <div className="border-t border-border/50 px-3 py-3">
        <AccountSwitcher activeCompanySlug={company.slug} />
      </div>
    </nav>
  );

  return (
    <div className="relative min-h-[100dvh] bg-background lg:flex" style={brandStyle}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-40"
        style={{
          background: `radial-gradient(900px 500px at 15% -10%, ${company.brand_primary}33, transparent 70%), radial-gradient(700px 400px at 100% 0%, ${company.brand_secondary}33, transparent 70%)`,
        }}
      />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl lg:flex rtl:left-auto rtl:right-0 rtl:border-l rtl:border-r-0">
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside
            className="glass-strong absolute inset-y-0 left-0 w-[276px] border-r border-border/60 rtl:left-auto rtl:right-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground rtl:left-3 rtl:right-auto"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-h-[100dvh] w-full flex-col lg:pl-[240px] rtl:lg:pl-0 rtl:lg:pr-[240px]">
        <SiteTopBar />
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/70 backdrop-blur-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 lg:px-8 lg:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border/60 bg-card/60 lg:hidden"
                aria-label="Menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <img src={logoAsset.url} alt="" className="h-7 w-7 shrink-0 object-contain lg:hidden" />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight lg:text-2xl">{title}</h1>
                {subtitle && <p className="truncate text-[11px] text-muted-foreground lg:text-sm">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>

          {activeSection.tabs.length > 1 && (
            <div className="flex gap-1 overflow-x-auto px-3 pb-2.5 lg:px-7">
              {activeSection.tabs.map(renderTab)}
            </div>
          )}
        </header>

        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

/** Placeholder used by sections that land in a later phase. */
export function SectionPlaceholder({ label }: { label: string }) {
  const { w } = useWs();
  return (
    <div className="glass grid min-h-[320px] place-items-center rounded-3xl border border-border/50 p-10 text-center">
      <div className="max-w-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{w.comingSoon}</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">{label}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{w.comingSoonDesc}</p>
      </div>
    </div>
  );
}
