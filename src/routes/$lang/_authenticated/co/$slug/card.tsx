import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { CompanyCardTab } from "@/components/company/reach";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/card")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  return (
    <CompanyShell company={company} role={role} title={w.companyCard} subtitle={company.name}>
      <CompanyCardTab company={company} canEdit={canManageCompany(role)} />
    </CompanyShell>
  );
}
