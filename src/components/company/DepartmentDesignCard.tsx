// One assigned card design inside a department: live preview + the list of
// fields an employee is allowed to personalise (everything else stays locked).
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, Pencil, Trash2, Wand2, Unlock, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@/lib/nav";
import { supabase } from "@/integrations/supabase/client";
import { DesignPreview } from "@/components/DesignPreview";
import type { StudioDoc } from "@/lib/studio/types";
import {
  EDITABLE_FIELD_KEYS,
  ensureDesignEditorCard,
  getEditableFields,
  setEditableFields,
  type EditableFieldKey,
} from "@/lib/company-designs";


const LABELS: Record<EditableFieldKey, { en: string; ar: string }> = {
  name: { en: "Employee name", ar: "اسم الموظف" },
  title: { en: "Job title", ar: "المسمى الوظيفي" },
  avatar_url: { en: "Photo", ar: "الصورة" },
  phone: { en: "Phone", ar: "رقم الجوال" },
  whatsapp: { en: "WhatsApp", ar: "واتساب" },
  email: { en: "Email", ar: "البريد" },
  website: { en: "Website", ar: "الموقع" },
  address: { en: "Address", ar: "العنوان" },
  bio: { en: "Bio", ar: "النبذة" },
};

export function DepartmentDesignCard({
  design,
  companySlug,
  companyId,
  canEdit,
  ar,
  roleLabel,
}: {
  design: {
    id: string;
    name: string;
    accent_color: string;
    target_role: string | null;
    department_id?: string | null;
    design: unknown;
  };
  companySlug: string;
  companyId: string;
  canEdit: boolean;
  ar: boolean;
  roleLabel?: string | null;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<EditableFieldKey[]>(() => getEditableFields(design.design));
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);

  // One-time invite link that pre-assigns this department + role + design.
  async function copyInviteLink() {
    setInviting(true);
    try {
      const { data: auth } = await supabase.auth.getSession();
      const token = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
      const { error } = await supabase.from("company_invitations").insert({
        company_id: companyId,
        email: null,
        department_id: design.department_id ?? null,
        template_id: design.id,
        role: (design.target_role as "employee") ?? "employee",
        token,
        invited_by: auth.session?.user.id ?? null,
        expires_at: new Date(Date.now() + 14 * 864e5).toISOString(),
      });
      if (error) throw error;
      const origin = typeof window !== "undefined" ? window.location.origin : "https://cardixn.com";
      await navigator.clipboard.writeText(`${origin}/join/${token}`);
      qc.invalidateQueries({ queryKey: ["company-invitations", companyId] });
      toast.success(ar ? "تم نسخ رابط الدعوة" : "Invite link copied");
    } catch {
      toast.error(ar ? "تعذّر إنشاء الرابط" : "Could not create the link");
    } finally {
      setInviting(false);
    }
  }

  const doc = design.design as StudioDoc | null;
  const hasDoc = !!doc && Array.isArray((doc as { nodes?: unknown }).nodes);

  async function toggle(key: EditableFieldKey) {
    const next = fields.includes(key) ? fields.filter((f) => f !== key) : [...fields, key];
    setFields(next);
    setSaving(true);
    try {
      await setEditableFields(design.id, design.design, next);
      qc.invalidateQueries({ queryKey: ["department-designs", companyId] });
      qc.invalidateQueries({ queryKey: ["company-card-designs", companyId] });
    } catch {
      toast.error(ar ? "تعذّر الحفظ" : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-3">
      <div className="flex gap-3">
        <div className="w-32 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
          {hasDoc ? (
            <DesignPreview doc={doc as StudioDoc} />
          ) : (
            <div className="grid aspect-[1.75/1] place-items-center text-muted-foreground">
              <Wand2 className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: design.accent_color }} />
            <p className="min-w-0 flex-1 truncate text-sm font-medium">{design.name}</p>
            {canEdit && (
              <button
                onClick={async () => {
                  await supabase.from("company_templates").delete().eq("id", design.id);
                  qc.invalidateQueries({ queryKey: ["department-designs", companyId] });
                }}
                className="text-muted-foreground hover:text-destructive"
                aria-label={ar ? "إزالة" : "Remove"}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {roleLabel && <p className="mt-0.5 text-[11px] text-muted-foreground">{roleLabel}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={openDesigner}
              disabled={opening}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:border-primary/60 hover:text-primary disabled:opacity-60"
            >
              {opening ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pencil className="h-3 w-3" />}
              {ar ? "تعديل التصميم" : "Edit design"}
            </button>

            <button
              type="button"
              onClick={copyInviteLink}
              disabled={inviting}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:border-primary/60 hover:text-primary disabled:opacity-60"
            >
              {inviting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
              {ar ? "نسخ رابط دعوة" : "Copy invite link"}
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:border-primary/60 hover:text-primary"
            >
              <Lock className="h-3 w-3" />
              {ar ? "العناصر القابلة للتعديل" : "Editable fields"}
              <span className="text-muted-foreground">({fields.length}/{EDITABLE_FIELD_KEYS.length})</span>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <p className="mb-2 text-[11px] text-muted-foreground">
            {ar
              ? "حدّد ما يستطيع الموظف تغييره في بطاقته — الباقي يبقى ثابتًا من الشركة."
              : "Choose what an employee may change on their card — everything else stays company-locked."}
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {EDITABLE_FIELD_KEYS.map((key) => {
              const on = fields.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!canEdit || saving}
                  onClick={() => toggle(key)}
                  className={
                    "flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition disabled:opacity-60 " +
                    (on
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground")
                  }
                >
                  <span>{ar ? LABELS[key].ar : LABELS[key].en}</span>
                  {on ? <Unlock className="h-3.5 w-3.5 text-primary" /> : <Lock className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
