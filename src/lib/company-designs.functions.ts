import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Re-applies the company's card designs to every employee card.
 * Only owners/admins of that company may run it.
 */
export const syncCompanyCardDesigns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { companyId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: me } = await context.supabase
      .from("company_members")
      .select("role")
      .eq("company_id", data.companyId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!me || (me.role !== "owner" && me.role !== "admin")) throw new Error("FORBIDDEN");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { resolveCompanyTemplate } = await import("@/lib/company-designs");

    const [{ data: company }, { data: templates }, { data: members }, { data: departments }] = await Promise.all([
      supabaseAdmin.from("companies").select("is_verified").eq("id", data.companyId).maybeSingle(),
      supabaseAdmin.from("company_templates").select("*").eq("company_id", data.companyId).order("sort_order"),
      supabaseAdmin
        .from("company_members")
        .select("user_id, role, department_id, job_title")
        .eq("company_id", data.companyId),
      supabaseAdmin.from("company_departments").select("id, name").eq("company_id", data.companyId),
    ]);

    const deptName = new Map((departments ?? []).map((d) => [d.id, d.name]));

    let updated = 0;
    for (const m of members ?? []) {
      const tpl = resolveCompanyTemplate((templates ?? []) as never, m.department_id, m.role);
      if (!tpl) continue;
      const department = m.department_id ? (deptName.get(m.department_id) ?? null) : null;
      const patch: Record<string, unknown> = {
        company_template_id: tpl.id,
        department_id: m.department_id,
        department,
        template: tpl.template,
        accent_color: tpl.accent_color,
        is_verified: company?.is_verified ?? false,
        updated_at: new Date().toISOString(),
      };
      const title = m.job_title || tpl.target_role || tpl.name || department;
      if (title) patch.title = title;
      if (tpl.design) patch.design = tpl.design;
      const { error } = await supabaseAdmin
        .from("cards")
        .update(patch as never)
        .eq("company_id", data.companyId)
        .eq("user_id", m.user_id)
        .eq("card_type", "employee");
      if (!error) updated += 1;
    }
    return { ok: true as const, updated };
  });
