// Workspace flow for using a shared template. Company workspaces never pick
// from the personal card list: a template either becomes an official workspace
// card design (optionally targeted at a department / role) or a new company card.
import { useQuery } from "@tanstack/react-query";
import { Building2, Loader2, Plus, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { createCardDesign } from "@/lib/company-designs";
import { syncCompanyCardDesigns } from "@/lib/company-designs.functions";
import { docAccent } from "@/lib/studio/recolor";
import type { StudioDoc } from "@/lib/studio/types";
import type { DesignTemplate } from "@/lib/templates";
import { tx, txErr } from "@/lib/tx";
import type { CompanyRole } from "@/lib/workspace";

const ROLES: CompanyRole[] = ["owner", "admin", "manager", "employee", "viewer"];

export function UseTemplateWorkspaceDialog({
  tpl,
  open,
  onOpenChange,
  company,
  canManage,
  busy,
  onCreateCard,
  onSaved,
}: {
  tpl: DesignTemplate | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  company: { id: string; name: string; slug: string; brand_primary: string };
  canManage: boolean;
  busy: boolean;
  /** Creates a standalone company card from the template. */
  onCreateCard: () => void;
  /** Called after the template became a workspace card design. */
  onSaved: () => void;
}) {
  const [dept, setDept] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ["ws-departments", company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_departments")
        .select("id,name")
        .eq("company_id", company.id)
        .order("sort_order");
      return data ?? [];
    },
    enabled: open && canManage,
  });

  async function saveAsDesign() {
    if (!tpl) return;
    setSaving(true);
    try {
      const doc = tpl.design as unknown as StudioDoc;
      await createCardDesign({
        companyId: company.id,
        name: tpl.title,
        description: tpl.description ?? undefined,
        template: "studio",
        accentColor: docAccent(doc) || company.brand_primary,
        departmentId: dept || null,
        targetRole: (role || null) as CompanyRole | null,
        design: doc,
      });
      try {
        await syncCompanyCardDesigns({ data: { companyId: company.id } });
      } catch {
        /* sync is best-effort */
      }
      toast.success(tx("Design added to the workspace"));
      onSaved();
    } catch (e) {
      toast.error(txErr(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg grid-cols-[minmax(0,1fr)] overflow-y-auto overflow-x-hidden rounded-2xl p-4 sm:p-6">
        <DialogHeader className="min-w-0 pe-8">
          <DialogTitle>{tx("Use template in the workspace")}</DialogTitle>
          <DialogDescription>
            {tx("Company templates are managed by the workspace, not from your personal cards.")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-border/60 px-3 py-2 text-xs">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate font-semibold">{company.name}</span>
        </div>

        {canManage ? (
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {tx("Add as an official card design")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-border/60 bg-transparent px-3 py-2 text-xs"
              >
                <option value="">{tx("All departments")}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-border/60 bg-transparent px-3 py-2 text-xs"
              >
                <option value="">{tx("All roles")}</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {tx(r)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={saving || busy}
              onClick={saveAsDesign}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              {tx("Add to workspace designs")}
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {tx("Only workspace admins can add official card designs.")}
          </p>
        )}

        <button
          type="button"
          disabled={busy || saving}
          onClick={onCreateCard}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border/60 px-4 py-2.5 text-xs font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {tx("Create a new company card")}
        </button>
      </DialogContent>
    </Dialog>
  );
}
