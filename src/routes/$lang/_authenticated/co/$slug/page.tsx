import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/company/CompanyShell";
import { BranchesTab } from "@/components/company/sections";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/page")({ component: Page });

function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  return (
    <CompanyShell
      company={company}
      role={role}
      title={w.publicPage}
      subtitle={`/company/${company.slug}`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-3xl border border-border/60 p-4">
        <p className="flex-1 text-sm text-muted-foreground">{`/company/${company.slug}`}</p>
        <a
          href={`/company/${company.slug}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-border px-4 py-2 text-sm"
        >
          {w.viewPublicPage}
        </a>
      </div>
      <BranchesTab company={company} canEdit={canManageCompany(role)} />
    </CompanyShell>
  );
}
