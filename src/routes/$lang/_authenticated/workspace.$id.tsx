import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import {
  Building2, Users, Palette, LayoutGrid, ListTree, MapPin, BarChart3, ExternalLink, Lock,
} from "lucide-react";
import {
  useWs, canManageCompany, canManageEmployees, type Company, type CompanyRole, type MemberStatus,
} from "@/lib/workspace";
import {
  OverviewTab, BrandTab, EmployeesTab, DepartmentsTab, TemplatesTab, FieldsTab, BranchesTab, AnalyticsTab,
} from "@/components/company/sections";

export const Route = createFileRoute("/$lang/_authenticated/workspace/$id")({
  head: () => ({ meta: [{ title: "Workspace — Cardixn" }] }),
  component: WorkspaceAdmin,
});

type TabKey = "overview" | "brand" | "employees" | "departments" | "templates" | "fields" | "branches" | "analytics";

function WorkspaceAdmin() {
  const { w } = useWs();
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const [tab, setTab] = useState<TabKey>("overview");

  const { data: company, isLoading } = useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Company | null;
    },
  });

  const { data: me } = useQuery({
    queryKey: ["company-me", id, user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_members")
        .select("role, status")
        .eq("company_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      return data as { role: CompanyRole; status: MemberStatus } | null;
    },
  });

  if (isLoading) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.loading}</div>;
  if (!company) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.companyNotFound}</div>;

  const role = me?.role ?? null;
  const admin = canManageCompany(role);

  const tabs: { key: TabKey; label: string; icon: typeof Users }[] = [
    { key: "overview", label: w.overview, icon: Building2 },
    { key: "brand", label: w.brand, icon: Palette },
    { key: "employees", label: w.employees, icon: Users },
    { key: "departments", label: w.departments, icon: ListTree },
    { key: "templates", label: w.templates, icon: LayoutGrid },
    { key: "fields", label: w.fields, icon: Lock },
    { key: "branches", label: w.branches, icon: MapPin },
    { key: "analytics", label: w.analytics, icon: BarChart3 },
  ];

  return (
    <MobileShell
      topBar={
        <PageHeader
          title={company.name}
          subtitle={"/company/" + company.slug}
          back="/workspace"
          right={
            <a
              href={`/company/${company.slug}`}
              target="_blank"
              rel="noreferrer"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
              aria-label={w.viewPublicPage}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          }
        />
      }
    >
      <div className="px-5 pb-12 lg:px-8">
        <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition " +
                (tab === tb.key
                  ? "border-transparent text-accent-foreground shadow-glow"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
              style={tab === tb.key ? { background: "var(--gradient-gold)" } : undefined}
            >
              <tb.icon className="h-3.5 w-3.5" /> {tb.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab company={company} canEdit={admin} role={role} />}
        {tab === "brand" && <BrandTab company={company} canEdit={admin} />}
        {tab === "employees" && <EmployeesTab company={company} canEdit={canManageEmployees(role)} userId={user.id} />}
        {tab === "departments" && <DepartmentsTab company={company} canEdit={admin} />}
        {tab === "templates" && <TemplatesTab company={company} canEdit={admin} />}
        {tab === "fields" && <FieldsTab company={company} canEdit={admin} />}
        {tab === "branches" && <BranchesTab company={company} canEdit={admin} />}
        {tab === "analytics" && <AnalyticsTab company={company} />}
      </div>
    </MobileShell>
  );
}
