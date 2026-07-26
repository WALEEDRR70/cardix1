import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { EmployeesTab } from "@/components/company/sections";
import { useCompany } from "@/lib/company-context";
import { canManageEmployees, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/employees")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { user } = Route.useRouteContext() as { user: { id: string } };
  const { w } = useWs();
  return (
    <CompanyShell company={company} role={role} title={w.employees} subtitle={company.name}>
      <EmployeesTab company={company} canEdit={canManageEmployees(role)} userId={user.id} />
    </CompanyShell>
  );
}
