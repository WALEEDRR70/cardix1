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

    const [{ data: company }, { data: templates }, { data: members }] = await Promise.all([
      supabaseAdmin.from("companies").select("is_verified").eq("id", data.companyId).maybeSingle(),
      supabaseAdmin.from("company_templates").select("*").eq("company_id", data.companyId).order("sort_order"),
      supabaseAdmin
        .from("company_members")
        .select("user_id, role, department_id")
        .eq("company_id", data.companyId),
    ]);

    let updated = 0;
    for (const m of members ?? []) {
      const tpl = resolveCompanyTemplate((templates ?? []) as never, m.department_id, m.role);
      if (!tpl) continue;
      const patch: Record<string, unknown> = {
        company_template_id: tpl.id,
        department_id: m.department_id,
        template: tpl.template,
        accent_color: tpl.accent_color,
        is_verified: company?.is_verified ?? false,
        updated_at: new Date().toISOString(),
      };
      if (tpl.design) patch.design = tpl.design;
      const { error } = await supabaseAdmin
        .from("cards")
        .update(patch)
        .eq("company_id", data.companyId)
        .eq("user_id", m.user_id)
        .eq("card_type", "employee");
      if (!error) updated += 1;
    }
    return { ok: true as const, updated };
  });
