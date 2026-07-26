import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { AnalyticsTab } from "@/components/company/sections";
import { useCompany } from "@/lib/company-context";
import { useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/analytics")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  return (
    <CompanyShell company={company} role={role} title={w.analytics} subtitle={company.name}>
      <AnalyticsTab company={company} />
    </CompanyShell>
  );
}
