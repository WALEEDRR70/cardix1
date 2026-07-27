import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CompanyShell } from "@/components/company/CompanyShell";
import { PaneTabs } from "@/components/company/PaneTabs";
import { OverviewTab, FieldsTab } from "@/components/company/sections";
import { SeoTab } from "@/components/company/reach";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/settings")({ component: Page });

type Pane = "general" | "permissions" | "seo";

/** One "Settings" screen: general, permissions and SEO without extra pages. */
function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  const [pane, setPane] = useState<Pane>("general");
  const canEdit = canManageCompany(role);

  return (
    <CompanyShell company={company} role={role} title={w.settings} subtitle={company.name}>
      <PaneTabs
        value={pane}
        onChange={setPane}
        panes={[
          { key: "general", label: w.settings },
          { key: "permissions", label: w.permissions },
          { key: "seo", label: w.seo },
        ]}
      />

      {pane === "general" && <OverviewTab company={company} canEdit={canEdit} role={role} />}
      {pane === "permissions" && <FieldsTab company={company} canEdit={canEdit} />}
      {pane === "seo" && <SeoTab company={company} canEdit={canEdit} />}
    </CompanyShell>
  );
}
