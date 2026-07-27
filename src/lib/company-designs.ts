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
