// Assign a studio card's design to a department (and optionally a staff role)
// by creating a company card-design rule, then re-syncing employee cards.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createCardDesign } from "@/lib/company-designs";
import { syncCompanyCardDesigns } from "@/lib/company-designs.functions";
import type { CompanyRole } from "@/lib/workspace";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const T = {
  en: {
    title: "Assign design to a department",
    desc: "Employees in the selected department (and role) will automatically get this design on their card.",
    dept: "Department",
    all: "All departments",
    role: "Role",
    anyRole: "All roles",
    name: "Design name",
    save: "Assign",
    saving: "Assigning…",
    ok: "Design assigned and employee cards synced",
    failed: "Could not assign the design",
    noDesign: "This card has no studio design yet.",
  },
  ar: {
    title: "تعيين التصميم لقسم",
    desc: "الموظفون في القسم (والدور) المحدد ستُطبَّق هذه التصميم على بطاقاتهم تلقائيًا.",
    dept: "القسم",
    all: "كل الأقسام",
    role: "الدور",
    anyRole: "كل الأدوار",
    name: "اسم التصميم",
    save: "تعيين",
    saving: "جارٍ التعيين…",
    ok: "تم تعيين التصميم ومزامنة بطاقات الموظفين",
    failed: "تعذّر تعيين التصميم",
    noDesign: "هذه البطاقة لا تحتوي على تصميم من الاستوديو بعد.",
  },
};

const ROLES: CompanyRole[] = ["owner", "admin", "manager", "employee", "viewer"];

export function AssignDesignDialog({
  open,
  onOpenChange,
  companyId,
  lang,
  card,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  companyId: string;
  lang: string;
  card: { id: string; name: string | null; design: unknown; template: string; accent_color: string } | null;
}) {
  const t = T[lang === "ar" ? "ar" : "en"];
  const [dept, setDept] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ["assign-departments", companyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_departments")
        .select("id, name")
        .eq("company_id", companyId)
        .order("sort_order");
      return data ?? [];
    },
    enabled: open,
  });

  async function submit() {
    if (!card) return;
    setSaving(true);
    try {
      await createCardDesign({
        companyId,
        name: name.trim() || card.name || "Card design",
        template: card.template,
        accentColor: card.accent_color,
        departmentId: dept || null,
        targetRole: (role || null) as CompanyRole | null,
        design: card.design ?? null,
      });
      await syncCompanyCardDesigns({ data: { companyId } });
      toast.success(t.ok);
      onOpenChange(false);
      setDept("");
      setRole("");
      setName("");
    } catch {
      toast.error(t.failed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>
        {!card?.design ? (
          <p className="text-sm text-muted-foreground">{t.noDesign}</p>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">{t.name}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={card.name ?? ""}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">{t.dept}</span>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t.all}</option>
                {departments.map((d: { id: string; name: string }) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-muted-foreground">{t.role}</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t.anyRole}</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? t.saving : t.save}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
