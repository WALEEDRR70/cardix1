import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { AuditTab } from "@/components/company/audit";
import { useCompany } from "@/lib/company-context";
import { useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/activity")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { user } = Route.useRouteContext() as { user: { id: string } };
  const { w } = useWs();
  return (
    <CompanyShell company={company} role={role} title={w.auditLog} subtitle={company.name}>
      <AuditTab company={company} userId={user.id} />
    </CompanyShell>
  );
}
