import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Link, useNavigate } from "@/lib/nav";
import { useAccount, useAccountActions } from "@/lib/account";
import { useWs, roleLabel } from "@/lib/workspace";
import { useI18n } from "@/lib/i18n";
import { ArrowRight, BadgeCheck, Building2, Plus, User } from "lucide-react";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";
import { tx } from "@/lib/tx";

export const Route = createFileRoute("/$lang/_authenticated/co/")({
  head: () => ({
    meta: [
      { title: "Company workspaces — Cardixn Business" },
      { name: "description", content: "Choose the company workspace you want to manage on Cardixn." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BusinessHub,
});

/** Business landing: routes the user straight into their company workspace. */
function BusinessHub() {
  const { w } = useWs();
  const { t } = useI18n();
  const nav = useNavigate();
  const { data, isLoading } = useAccount();
  const { setActiveCompany } = useAccountActions();

  const managed = data?.managed ?? [];
  const employed = data?.employed ?? [];

  useEffect(() => {
    if (!data) return;
    if (managed.length === 1) {
      nav({ to: "/co/$slug", params: { slug: managed[0].company.slug }, replace: true });
    } else if (managed.length === 0 && employed.length === 0) {
      nav({ to: "/co/new", replace: true });
    } else if (managed.length === 0 && employed.length > 0) {
      nav({ to: "/me", replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading || !data || managed.length <= 1) {
    return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.loading}</div>;
  }

  async function open(companyId: string, slug: string) {
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
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-2">
          <img src={logoAsset.url} alt="" className="h-8 w-8 object-contain" />
          <span className="text-sm font-semibold tracking-tight">{t.brand}</span>
          <span className="ms-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {tx("Business")}
          </span>
        </div>

        <h1 className="mt-8 flex items-center gap-3 text-3xl font-semibold tracking-tight">
          <Building2 className="h-7 w-7" /> {tx("Your company workspaces")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{w.companyAccountDesc}</p>

        <div className="mt-8 space-y-2">
          {managed.map((m) => (
            <button
              key={m.company_id}
              onClick={() => open(m.company_id, m.company.slug)}
              className="glass flex w-full items-center gap-3 rounded-2xl border border-border/50 p-4 text-start transition hover:shadow-soft"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl"
                style={{ background: `linear-gradient(135deg, ${m.company.brand_primary}, ${m.company.brand_secondary})` }}
              >
                {m.company.logo_url ? (
                  <img src={m.company.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white">{m.company.name.slice(0, 2).toUpperCase()}</span>
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
            to="/co/new"
            className="flex items-center gap-2 rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> {w.createWorkspace}
          </Link>
        </div>

        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <User className="h-3.5 w-3.5" /> {tx("Go to your personal account")}
        </Link>
      </div>
    </div>
  );
}
