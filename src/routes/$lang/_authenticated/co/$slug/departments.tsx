import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { DepartmentsTab } from "@/components/company/sections";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/departments")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  return (
    <CompanyShell company={company} role={role} title={w.departments} subtitle={company.name}>
      <DepartmentsTab company={company} canEdit={canManageCompany(role)} />
    </CompanyShell>
  );
}
