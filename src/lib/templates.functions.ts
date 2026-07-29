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

/** Loads a template for editing. Allowed for its author and for platform admins. */
export const getEditableTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { templateId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tpl } = await supabaseAdmin
      .from("design_templates")
      .select("id, title, description, tags, design, author_id, author_name, is_public")
      .eq("id", data.templateId)
      .maybeSingle();
    if (!tpl) throw new Error("NOT_FOUND");

    const isAuthor = tpl.author_id === context.userId;
    const { data: adminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAuthor && !adminRow) throw new Error("FORBIDDEN");

    return { ...tpl, canEdit: true as const, isAdminEdit: !isAuthor };
  });

/** Saves changes back onto the shared template itself (author or platform admin). */
export const saveTemplateDesign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { templateId: string; design: unknown; title?: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tpl } = await supabaseAdmin
      .from("design_templates")
      .select("id, author_id")
      .eq("id", data.templateId)
      .maybeSingle();
    if (!tpl) throw new Error("NOT_FOUND");

    const isAuthor = tpl.author_id === context.userId;
    const { data: adminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAuthor && !adminRow) throw new Error("FORBIDDEN");

    const patch: Record<string, unknown> = {
      design: data.design,
      updated_at: new Date().toISOString(),
    };
    if (data.title?.trim()) patch.title = data.title.trim();

    const { error } = await supabaseAdmin
      .from("design_templates")
      .update(patch as never)
      .eq("id", tpl.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
