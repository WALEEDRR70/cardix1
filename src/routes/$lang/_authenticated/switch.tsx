import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@/lib/nav";
import { useAccount, useAccountActions } from "@/lib/account";
import { useWs, roleLabel } from "@/lib/workspace";
import { useI18n } from "@/lib/i18n";
import { Building2, User, BadgeCheck, Plus, ArrowRight } from "lucide-react";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";

export const Route = createFileRoute("/$lang/_authenticated/switch")({
  component: SwitchPage,
});

function SwitchPage() {
  const { w } = useWs();
  const { t } = useI18n();
  const nav = useNavigate();
  const { data, isLoading } = useAccount();
  const { setActiveCompany } = useAccountActions();

  if (isLoading || !data) {
    return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.loading}</div>;
  }

  async function enterPersonal() {
    if (data?.userId) await setActiveCompany(data.userId, null);
    nav({ to: "/dashboard" });
  }

  async function enterCompany(companyId: string, slug: string) {
    if (data?.userId) await setActiveCompany(data.userId, companyId);
    nav({ to: "/co/$slug", params: { slug } });
  }

  return (
    <div className="relative min-h-[100dvh] bg-background px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: "var(--gradient-mesh)" }}
      />
      <div className="relative mx-auto w-full max-w-4xl">
        <div className="flex items-center gap-2">
          <img src={logoAsset.url} alt="" className="h-8 w-8 object-contain" />
          <span className="text-sm font-semibold tracking-tight">{t.brand}</span>
        </div>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight lg:text-4xl">{w.chooseAccount}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{w.chooseAccountDesc}</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <button
            onClick={enterPersonal}
            className="glass group rounded-3xl border border-border/50 p-6 text-start transition hover:shadow-soft"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary">
              <User className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">{w.personalAccount}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{w.personalAccountDesc}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
              {w.continueLabel} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 rtl:rotate-180" />
            </span>
          </button>

          <div className="glass rounded-3xl border border-border/50 p-6">
            <span
              className="grid h-11 w-11 place-items-center rounded-2xl"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Building2 className="h-5 w-5 text-accent-foreground" />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">{w.companyAccount}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{w.companyAccountDesc}</p>

            <div className="mt-5 space-y-2">
              {data.managed.map((m) => (
                <button
                  key={m.company_id}
                  onClick={() => enterCompany(m.company_id, m.company.slug)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 text-start transition hover:border-border"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${m.company.brand_primary}, ${m.company.brand_secondary})`,
                    }}
                  >
                    {m.company.logo_url ? (
                      <img src={m.company.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {m.company.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 truncate text-sm font-medium">
                      {m.company.name}
                      {m.company.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-accent" />}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">{roleLabel(m.role, w)}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                </button>
              ))}

              <Link
                to="/workspace"
                className="flex items-center gap-2 rounded-2xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground transition hover:text-foreground"
              >
                <Plus className="h-4 w-4" /> {w.createWorkspace}
              </Link>
            </div>
          </div>
        </div>

        {data.employed.length > 0 && (
          <div className="mt-6">
            <p className="px-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{w.employeeSpace}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {data.employed.map((m) => (
                <Link
                  key={m.company_id}
                  to="/me"
                  className="glass flex items-center gap-3 rounded-2xl border border-border/50 p-3"
                >
                  <span
                    className="h-8 w-1.5 rounded-full"
                    style={{ background: m.company.brand_primary }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{m.company.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {m.job_title || roleLabel(m.role, w)}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
