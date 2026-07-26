import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell, SectionPlaceholder } from "@/components/company/CompanyShell";
import { useCompany } from "@/lib/company-context";
import { useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/analytics")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  return (
    <CompanyShell company={company} role={role} title={w.analytics} subtitle={company.name}>
      <SectionPlaceholder label={w.analytics} />
    </CompanyShell>
  );
}
