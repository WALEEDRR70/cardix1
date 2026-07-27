import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CompanyShell } from "@/components/company/CompanyShell";
import { EmployeesTab, DepartmentsTab } from "@/components/company/sections";
import { InvitationsTab } from "@/components/company/reach";
import { useCompany } from "@/lib/company-context";
import { canManageCompany, canManageEmployees, useWs } from "@/lib/workspace";

export const Route = createFileRoute("/$lang/_authenticated/co/$slug/employees")({ component: Page });

type Pane = "people" | "departments" | "invites";

/** One "Team" screen: people, departments and invitations without extra pages. */
function Page() {
  const { company, role } = useCompany();
  const { user } = Route.useRouteContext() as { user: { id: string } };
  const { w } = useWs();
  const [pane, setPane] = useState<Pane>("people");

  const panes: { key: Pane; label: string }[] = [
    { key: "people", label: w.employees },
    { key: "departments", label: w.departments },
    { key: "invites", label: w.invite },
  ];

  return (
    <CompanyShell company={company} role={role} title={w.employees} subtitle={company.name}>
      <div className="mb-4 inline-flex rounded-full border border-border/60 bg-card/50 p-1">
        {panes.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPane(p.key)}
            className={
              "rounded-full px-4 py-1.5 text-[12px] font-medium transition " +
              (pane === p.key ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      {pane === "people" && <EmployeesTab company={company} canEdit={canManageEmployees(role)} userId={user.id} />}
      {pane === "departments" && <DepartmentsTab company={company} canEdit={canManageCompany(role)} />}
      {pane === "invites" && <InvitationsTab company={company} canEdit={canManageCompany(role)} />}
    </CompanyShell>
  );
}
