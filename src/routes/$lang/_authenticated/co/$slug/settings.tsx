import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { OverviewTab } from "@/components/company/sections";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/settings")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  return (
    <CompanyShell company={company} role={role} title={w.settings} subtitle={company.name}>
      <OverviewTab company={company} canEdit={canManageCompany(role)} role={role} />
    </CompanyShell>
  );
}
