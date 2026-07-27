// Company-owned card designs: one design per (department, role) combination.
// A card design is a `company_templates` row that can be targeted at a
// department, at a staff role, or both. Employee cards follow the best
// matching design and are re-synced automatically on promotion / transfer.
import { supabase } from "@/integrations/supabase/client";
import type { CompanyRole, CompanyTemplate } from "@/lib/workspace";

export type CardDesign = CompanyTemplate;

/**
 * Mirrors `app_private.resolve_company_template`: the most specific
 * auto-assigned design wins (department + role > department > role > default).
 */
export function resolveCompanyTemplate(
  templates: CardDesign[],
  departmentId: string | null,
  role: CompanyRole,
): CardDesign | null {
  const score = (t: CardDesign) =>
    (t.department_id ? 4 : 0) + (t.target_role ? 2 : 0) + (t.is_default ? 1 : 0);
  const matches = templates
    .filter(
      (t) =>
        t.is_auto_assign &&
        (t.department_id === null || t.department_id === departmentId) &&
        (t.target_role === null || t.target_role === role),
    )
    .sort((a, b) => score(b) - score(a) || a.sort_order - b.sort_order);
  return matches[0] ?? null;
}

export async function listCardDesigns(companyId: string): Promise<CardDesign[]> {
  const { data, error } = await supabase
    .from("company_templates")
    .select("*")
    .eq("company_id", companyId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as CardDesign[];
}

export async function createCardDesign(input: {
  companyId: string;
  name: string;
  description?: string;
  template: string;
  accentColor: string;
  departmentId: string | null;
  targetRole: CompanyRole | null;
  design?: unknown;
}): Promise<CardDesign> {
  const { data, error } = await supabase
    .from("company_templates")
    .insert({
      company_id: input.companyId,
      name: input.name.trim() || "Card design",
      description: input.description?.trim() || null,
      template: input.template,
      accent_color: input.accentColor,
      department_id: input.departmentId,
      target_role: input.targetRole,
      design: (input.design ?? null) as never,
      is_approved: true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as CardDesign;
}

export async function updateCardDesign(id: string, patch: Partial<CardDesign>): Promise<void> {
  const { error } = await supabase.from("company_templates").update(patch as never).eq("id", id);
  if (error) throw error;
}

export async function deleteCardDesign(id: string): Promise<void> {
  const { error } = await supabase.from("company_templates").delete().eq("id", id);
  if (error) throw error;
}

/** Studio designs already available inside this workspace, usable as a design source. */
export async function listWorkspaceDesignSources(companyId: string) {
  const { data, error } = await supabase
    .from("cards")
    .select("id, name, design, accent_color, updated_at")
    .eq("company_id", companyId)
    .not("design", "is", null)
    .order("updated_at", { ascending: false })
    .limit(24);
  if (error) throw error;
  return data ?? [];
}

/* ------------------- employee-editable field permissions ------------------ */

/** Card fields a company can open up for employees to personalise. */
export const EDITABLE_FIELD_KEYS = [
  "name",
  "title",
  "avatar_url",
  "phone",
  "whatsapp",
  "email",
  "website",
  "address",
  "bio",
] as const;
export type EditableFieldKey = (typeof EDITABLE_FIELD_KEYS)[number];

/** Sensible default: personal contact details are editable, company data
 * (job title, department, branding) is owned by the company and locked. */
export const DEFAULT_EDITABLE_FIELDS: EditableFieldKey[] = [
  "name",
  "avatar_url",
  "phone",
  "whatsapp",
  "email",
  "bio",
];

/** Reads the allow-list stored alongside a design (`design.editableFields`). */
export function getEditableFields(design: unknown): EditableFieldKey[] {
  const raw = (design as { editableFields?: unknown } | null)?.editableFields;
  if (!Array.isArray(raw)) return DEFAULT_EDITABLE_FIELDS;
  return raw.filter((k): k is EditableFieldKey =>
    (EDITABLE_FIELD_KEYS as readonly string[]).includes(k as string),
  );
}

/** Turns the allow-list into the `locked` map used by CardForm. */
export function lockedFieldsFromDesign(design: unknown): Record<string, boolean> {
  const editable = new Set(getEditableFields(design));
  const locked: Record<string, boolean> = {
    company: true,
    accent_color: true,
    template: true,
    slug: true,
  };
  for (const k of EDITABLE_FIELD_KEYS) locked[k] = !editable.has(k);
  return locked;
}

/** Persists the allow-list inside the design payload of a company card design. */
export async function setEditableFields(templateId: string, design: unknown, fields: EditableFieldKey[]) {
  const next = { ...((design as Record<string, unknown>) ?? {}), editableFields: fields };
  const { error } = await supabase
    .from("company_templates")
    .update({ design: next as never })
    .eq("id", templateId);
  if (error) throw error;
}
