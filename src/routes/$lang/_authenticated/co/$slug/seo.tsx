import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { SeoTab } from "@/components/company/reach";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/seo")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  return (
    <CompanyShell company={company} role={role} title={w.seo} subtitle={company.name}>
      <SeoTab company={company} canEdit={canManageCompany(role)} />
    </CompanyShell>
  );
}
