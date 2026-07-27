import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CompanyShell } from "@/components/company/CompanyShell";
import { PaneTabs } from "@/components/company/PaneTabs";
import { AnalyticsTab, BranchesTab } from "@/components/company/sections";
import { QrTab, NfcTab } from "@/components/company/reach";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/analytics")({ component: Page });

type Pane = "stats" | "qr" | "page" | "nfc";

/** One "Reach" screen: stats, QR, public page and NFC without extra pages. */
function Page() {
  const { company, role } = useCompany();
  const { w } = useWs();
  const [pane, setPane] = useState<Pane>("stats");

  return (
    <CompanyShell company={company} role={role} title={w.analytics} subtitle={company.name}>
      <PaneTabs
        value={pane}
        onChange={setPane}
        panes={[
          { key: "stats", label: w.analytics },
          { key: "qr", label: w.qrManager },
          { key: "page", label: w.publicPage },
          { key: "nfc", label: w.nfcManager },
        ]}
      />

      {pane === "stats" && <AnalyticsTab company={company} />}
      {pane === "qr" && <QrTab company={company} />}
      {pane === "page" && (
        <>
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
        </>
      )}
      {pane === "nfc" && <NfcTab company={company} />}
    </CompanyShell>
  );
}
