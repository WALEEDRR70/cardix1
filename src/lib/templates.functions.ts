import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Bumps the public use counter of a community template. Runs server-side only. */
export const bumpTemplateUse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { templateId: string }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tpl } = await supabaseAdmin
      .from("design_templates")
      .select("id, use_count, is_public")
      .eq("id", data.templateId)
      .maybeSingle();
    if (!tpl || !tpl.is_public) return { ok: false as const };
    await supabaseAdmin
      .from("design_templates")
      .update({ use_count: (tpl.use_count ?? 0) + 1 })
      .eq("id", tpl.id);
    return { ok: true as const };
  });
