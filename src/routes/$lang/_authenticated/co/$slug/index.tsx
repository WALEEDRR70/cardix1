import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyShell } from "@/components/company/CompanyShell";
import { useCompany } from "@/lib/company-context";
import { useWs } from "@/lib/workspace";
import { Link } from "@/lib/nav";
import { Users, IdCard, Eye, QrCode, ExternalLink, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/")({
  component: CompanyOverview,
});

function CompanyOverview() {
  const { company, role } = useCompany();
  const { w } = useWs();

  const { data } = useQuery({
    queryKey: ["co-overview", company.id],
    queryFn: async () => {
      const [{ count: employees }, { data: cards }] = await Promise.all([
        supabase
          .from("company_members")
          .select("id", { count: "exact", head: true })
          .eq("company_id", company.id)
          .eq("status", "active"),
        supabase.from("cards").select("id, is_published, view_count").eq("company_id", company.id),
      ]);
      const list = cards ?? [];
      return {
        employees: employees ?? 0,
        activeCards: list.filter((c) => c.is_published).length,
        totalCards: list.length,
        views: list.reduce((sum, c) => sum + (c.view_count ?? 0), 0),
      };
    },
  });

  const stats = [
    { icon: Users, label: w.totalEmployees, value: data?.employees ?? 0 },
    { icon: IdCard, label: w.activeCards, value: data?.activeCards ?? 0 },
    { icon: Eye, label: w.totalViews, value: data?.views ?? 0 },
    { icon: QrCode, label: w.qrScans, value: 0 },
  ];

  return (
    <CompanyShell company={company} role={role} title={w.overview} subtitle={company.name}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl border border-border/50 p-5">
            <s.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-3 text-3xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div
          className="rounded-3xl border border-border/50 p-6 lg:col-span-2"
          style={{
            background: `linear-gradient(135deg, ${company.brand_primary}22, ${company.brand_secondary}22)`,
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{w.companyWorkspace}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{company.name}</h2>
          {company.description && (
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{company.description}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/co/$slug/employees"
              params={{ slug: company.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              {w.employees} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
            <a
              href={`/company/${company.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
            >
              {w.viewPublicPage} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="glass rounded-3xl border border-border/50 p-6">
          <p className="text-sm font-semibold">{w.legacyAdmin}</p>
          <p className="mt-1 text-xs text-muted-foreground">{w.comingSoonDesc}</p>
          <Link
            to="/workspace/$id"
            params={{ id: company.id }}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
          >
            {w.legacyAdmin} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </CompanyShell>
  );
}
