import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/nav";
import { useAccount } from "@/lib/account";
import { useWs } from "@/lib/workspace";
import { ArrowRight, BadgeCheck, ExternalLink, QrCode, BarChart3, ArrowLeftRight } from "lucide-react";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";

export const Route = createFileRoute("/$lang/_authenticated/me")({
  component: EmployeeSpace,
});

/**
 * Minimal employee space — no company administration, only the employee's own
 * corporate card.
 */
function EmployeeSpace() {
  const { w } = useWs();
  const { data: account, isLoading } = useAccount();
  const membership = account?.employed[0] ?? account?.memberships[0] ?? null;

  const { data: card } = useQuery({
    enabled: !!membership,
    queryKey: ["employee-card", membership?.company_id, account?.userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("cards")
        .select("id, slug, full_name, job_title, is_active, view_count")
        .eq("company_id", membership!.company_id)
        .eq("user_id", account!.userId!)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) {
    return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.loading}</div>;
  }

  if (!membership) {
    return (
      <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold">{w.noAccessTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{w.noAccessDesc}</p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            {w.backToPersonal}
          </Link>
        </div>
      </div>
    );
  }

  const company = membership.company;

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-[560px] bg-background px-5 pb-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-50"
        style={{
          background: `radial-gradient(600px 300px at 50% -20%, ${company.brand_primary}55, transparent 70%)`,
        }}
      />

      <header className="safe-top relative z-10 flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <img src={logoAsset.url} alt="" className="h-8 w-8 object-contain" />
          <span className="text-sm font-semibold tracking-tight">{w.employeeSpace}</span>
        </div>
        <Link
          to="/switch"
          className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground"
          aria-label={w.switchAccount}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="relative z-10">
        <div
          className="rounded-3xl border border-border/50 p-6"
          style={{ background: `linear-gradient(135deg, ${company.brand_primary}22, ${company.brand_secondary}22)` }}
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${company.brand_primary}, ${company.brand_secondary})` }}
            >
              {company.logo_url ? (
                <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white">{company.name.slice(0, 2).toUpperCase()}</span>
              )}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-base font-semibold tracking-tight">
                {company.name}
                {company.is_verified && <BadgeCheck className="h-4 w-4 text-accent" />}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {membership.job_title || w.employeeCard}
              </p>
            </div>
          </div>

          <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{w.lockedByCompany}</p>
          <p className="mt-1 text-xs text-muted-foreground">{w.lockedByCompanyDesc}</p>
        </div>

        {card ? (
          <div className="mt-4 space-y-2">
            <Link
              to="/cards/$id"
              params={{ id: card.id }}
              className="glass flex items-center gap-3 rounded-2xl border border-border/50 p-4"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{card.full_name}</span>
                <span className="block truncate text-xs text-muted-foreground">{card.job_title || w.myCard}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
            </Link>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={`/c/${card.slug}`}
                target="_blank"
                rel="noreferrer"
                className="glass flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 p-4 text-[11px]"
              >
                <ExternalLink className="h-4 w-4" /> {w.publicPage}
              </a>
              <a
                href={`/c/${card.slug}`}
                target="_blank"
                rel="noreferrer"
                className="glass flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 p-4 text-[11px]"
              >
                <QrCode className="h-4 w-4" /> QR
              </a>
              <Link
                to="/cards/$id/analytics"
                params={{ id: card.id }}
                className="glass flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 p-4 text-[11px]"
              >
                <BarChart3 className="h-4 w-4" /> {w.analytics}
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass mt-4 rounded-2xl border border-border/50 p-6 text-center text-sm text-muted-foreground">
            {w.comingSoonDesc}
          </div>
        )}
      </section>
    </div>
  );
}
