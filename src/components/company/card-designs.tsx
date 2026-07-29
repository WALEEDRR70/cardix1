// Company card designs: per-department / per-role card templates that employee
// cards follow automatically (including after a promotion or a transfer).
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, RefreshCw, Wand2, Loader2, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyState, TextField } from "@/components/company/sections";
import { StaticCardPreview } from "@/components/studio/StaticCardPreview";
import { TEMPLATE_META } from "@/components/CardPreview";
import { supabase } from "@/integrations/supabase/client";
import { roleLabel, useWs, type Company, type CompanyRole } from "@/lib/workspace";
import {
  createCardDesign,
  deleteCardDesign,
  listCardDesigns,
  listWorkspaceDesignSources,
  updateCardDesign,
  type CardDesign,
} from "@/lib/company-designs";
import { syncCompanyCardDesigns } from "@/lib/company-designs.functions";
import type { StudioDoc } from "@/lib/studio/types";
import { tx } from "@/lib/tx";

const ROLES: CompanyRole[] = ["admin", "manager", "employee", "viewer"];

function txt(ar: boolean) {
  return {
    title: tx("Company cards by department & role"),
    desc: tx("Design one card per group: marketing employees, marketing leads, the marketing director… When someone is promoted or moved, their card design switches automatically."),
    name: tx("Design name"),
    department: tx("Department"),
    role: tx("Role"),
    anyDept: tx("All departments"),
    anyRole: tx("All roles"),
    classic: tx("Classic template"),
    accent: tx("Accent colour"),
    add: tx("Add design"),
    none: tx("No card designs yet"),
    designSource: tx("Design source"),
    pickDesign: tx("Pick a Studio design"),
    noSources: tx("Create a card in the Studio inside this workspace to use it here."),
    clearDesign: tx("Remove design"),
    auto: tx("Auto-assign"),
    fallback: tx("Default design"),
    sync: tx("Apply to employees now"),
    synced: tx("Employee cards updated"),
    saved: tx("Saved"),
    verified: tx("Verified badge is added to employee cards automatically when the company is verified."),
  };
}

export function CardDesignsTab({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { lang } = useWs();
  const { w } = useWs();
  const ar = lang === "ar";
  const t = txt(ar);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    department_id: "",
    target_role: "" as CompanyRole | "",
    template: company.default_template,
    accent_color: company.brand_primary,
  });

  const { data: designs = [] } = useQuery({
    queryKey: ["company-card-designs", company.id],
    queryFn: () => listCardDesigns(company.id),
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["company-departments", company.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_departments")
        .select("id, name")
        .eq("company_id", company.id)
        .order("sort_order");
      return data ?? [];
    },
  });
  const { data: sources = [] } = useQuery({
    queryKey: ["company-design-sources", company.id],
    queryFn: () => listWorkspaceDesignSources(company.id),
  });

  const deptName = (id: string | null) =>
    id ? (departments.find((d) => d.id === id)?.name ?? "—") : t.anyDept;

  async function add() {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await createCardDesign({
        companyId: company.id,
        name: form.name,
        template: form.template,
        accentColor: form.accent_color,
        departmentId: form.department_id || null,
        targetRole: form.target_role || null,
      });
      setForm({ ...form, name: "" });
      await qc.invalidateQueries({ queryKey: ["company-card-designs", company.id] });
      toast.success(t.saved);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, p: Partial<CardDesign>) {
    try {
      await updateCardDesign(id, p);
      await qc.invalidateQueries({ queryKey: ["company-card-designs", company.id] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    try {
      await deleteCardDesign(id);
      await qc.invalidateQueries({ queryKey: ["company-card-designs", company.id] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function syncAll() {
    setBusy(true);
    try {
      await syncCompanyCardDesigns({ data: { companyId: company.id } });
      toast.success(t.synced);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-semibold">{t.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <BadgeCheck className="h-3.5 w-3.5 text-accent" /> {t.verified}
        </p>
      </div>

      {canEdit && (
        <div className="grid gap-3 rounded-2xl border border-border/60 p-3 sm:grid-cols-2">
          <TextField label={t.name} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div>
            <label className="mb-1 block px-1 text-xs text-muted-foreground">{t.department}</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none"
            >
              <option value="">{t.anyDept}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block px-1 text-xs text-muted-foreground">{t.role}</label>
            <select
              value={form.target_role}
              onChange={(e) => setForm({ ...form, target_role: e.target.value as CompanyRole | "" })}
              className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none"
            >
              <option value="">{t.anyRole}</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{roleLabel(r, w)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block px-1 text-xs text-muted-foreground">{t.classic}</label>
            <select
              value={form.template}
              onChange={(e) => setForm({ ...form, template: e.target.value })}
              className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none"
            >
              {TEMPLATE_META.map((tp) => (
                <option key={tp.id} value={tp.id}>{tp.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2">
            <div>
              <label className="mb-1 block px-1 text-xs text-muted-foreground">{t.accent}</label>
              <input
                type="color"
                value={form.accent_color}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                className="h-11 w-16 rounded-xl border border-input bg-card"
              />
            </div>
            <button
              onClick={add}
              disabled={busy || !form.name.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow disabled:opacity-60"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Plus className="h-4 w-4" /> {t.add}
            </button>
          </div>
        </div>
      )}

      {designs.length === 0 && (
        <EmptyState
          icon={Wand2}
          title={t.none}
          hint={tx("Add a design tied to a department or role — it applies to those employees automatically.")}
        />
      )}


      <div className="space-y-3">
        {designs.map((d) => (
          <div key={d.id} className="rounded-2xl border border-border/60 bg-card/60 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {deptName(d.department_id)} · {d.target_role ? roleLabel(d.target_role, w) : t.anyRole}
                </p>
              </div>
              <span
                className="h-6 w-6 shrink-0 rounded-full border border-border/60"
                style={{ background: d.accent_color }}
              />
              {canEdit && (
                <>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={d.is_auto_assign}
                      onChange={(e) => patch(d.id, { is_auto_assign: e.target.checked })}
                    />
                    {t.auto}
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={d.is_default}
                      onChange={(e) => patch(d.id, { is_default: e.target.checked })}
                    />
                    {t.fallback}
                  </label>
                  <button onClick={() => remove(d.id)} className="rounded-lg p-2 text-destructive hover:bg-secondary">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {d.design ? (
                <StaticCardPreview doc={d.design as unknown as StudioDoc} width={180} />
              ) : (
                <span className="rounded-xl bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
                  {t.classic}: {TEMPLATE_META.find((x) => x.id === d.template)?.label ?? d.template}
                </span>
              )}
              {canEdit && (
                <div className="flex min-w-[200px] flex-1 flex-col gap-2">
                  <label className="px-1 text-[11px] text-muted-foreground">{t.designSource}</label>
                  {sources.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">{t.noSources}</p>
                  ) : (
                    <select
                      value=""
                      onChange={(e) => {
                        const src = sources.find((s) => s.id === e.target.value);
                        if (src) patch(d.id, { design: src.design as never });
                      }}
                      className="rounded-2xl border border-input bg-card px-3 py-2.5 text-xs outline-none"
                    >
                      <option value="">{t.pickDesign}</option>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                  {d.design && (
                    <button
                      onClick={() => patch(d.id, { design: null })}
                      className="flex items-center gap-1.5 self-start rounded-full border border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground"
                    >
                      <Wand2 className="h-3 w-3" /> {t.clearDesign}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {canEdit && designs.length > 0 && (
        <button
          onClick={syncAll}
          disabled={busy}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-border px-4 py-3 text-sm font-medium disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} {t.sync}
        </button>
      )}
    </Card>
  );
}
