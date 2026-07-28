import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveJobTitle } from "@/lib/role-titles";

/** Look up an invitation by its token (public — only non-sensitive fields). */
export const getInvitation = createServerFn({ method: "GET" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite } = await supabaseAdmin
      .from("company_invitations")
      .select("id, email, name, job_title, phone, role, status, expires_at, company_id, department_id")
      .eq("token", data.token)
      .maybeSingle();
    if (!invite) return { ok: false as const };
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("id, name, slug, logo_url, brand_primary, default_template, website, address, is_verified")
      .eq("id", invite.company_id)
      .maybeSingle();
    const valid =
      invite.status === "pending" && new Date(invite.expires_at).getTime() > Date.now() && !!company;
    return {
      ok: valid,
      invitation: {
        email: invite.email,
        name: invite.name,
        job_title: invite.job_title,
        role: invite.role,
        status: invite.status,
      },
      company: company
        ? { name: company.name, slug: company.slug, logo_url: company.logo_url, brand_primary: company.brand_primary, is_verified: company.is_verified }
        : null,
    };
  });

/** Accept an invitation: links the signed-in user to the company and creates their employee card. */
export const acceptInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userEmail = String(context.claims.email ?? "").toLowerCase();

    const { data: invite } = await supabaseAdmin
      .from("company_invitations")
      .select("*")
      .eq("token", data.token)
      .maybeSingle();

    if (!invite || invite.status !== "pending" || new Date(invite.expires_at).getTime() < Date.now()) {
      throw new Error("INVALID_INVITATION");
    }
    // Link-only invitations have no email: anyone holding the (single-use) link joins.
    if (invite.email && invite.email.toLowerCase() !== userEmail) {
      throw new Error("EMAIL_MISMATCH");
    }
    const memberEmail = invite.email ?? userEmail;


    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", invite.company_id)
      .maybeSingle();
    if (!company) throw new Error("INVALID_INVITATION");

    // Resolve which company card design this employee should receive:
    // the design attached to the invitation link, otherwise the best match
    // for their department + role.
    const { resolveCompanyTemplate } = await import("@/lib/company-designs");
    const { data: allDesigns } = await supabaseAdmin
      .from("company_templates")
      .select("*")
      .eq("company_id", invite.company_id)
      .order("sort_order");
    const designs = allDesigns ?? [];
    const tpl =
      (invite.template_id ? designs.find((d) => d.id === invite.template_id) : null) ??
      resolveCompanyTemplate(designs as never, invite.department_id, invite.role);

    // Job title + department come from the company assignment — never typed by
    // the employee. Fall back to the assigned design name, then the department.
    const { data: dept } = invite.department_id
      ? await supabaseAdmin
          .from("company_departments")
          .select("name")
          .eq("id", invite.department_id)
          .maybeSingle()
      : { data: null };
    const departmentName = dept?.name ?? null;
    const jobTitle = invite.job_title ?? tpl?.target_role ?? tpl?.name ?? dept?.name ?? null;

    // The company owner must never be downgraded by accepting an invite link.
    const isOwner = company.owner_id === context.userId;
    await supabaseAdmin.from("company_members").upsert(
      {
        company_id: invite.company_id,
        user_id: context.userId,
        role: isOwner ? "owner" : invite.role,
        status: "active",
        department_id: invite.department_id,
        job_title: jobTitle,
        corporate_email: memberEmail || null,
        phone: invite.phone,
      },
      { onConflict: "company_id,user_id" },
    );

    // Create the employee card if the user does not have one for this company yet.
    // Only employee cards count — company design/master cards (card_type = 'company')
    // may belong to the same user and must not block creation.
    const { data: existing } = await supabaseAdmin
      .from("cards")
      .select("id, slug")
      .eq("company_id", invite.company_id)
      .eq("user_id", context.userId)
      .eq("card_type", "employee")
      .maybeSingle();

    let cardSlug = existing?.slug ?? null;
    if (!existing) {
      const base =
        (invite.name ?? (memberEmail || "employee").split("@")[0])
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "employee";
      const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      const { data: card } = await supabaseAdmin
        .from("cards")
        .insert({
          user_id: context.userId,
          company_id: invite.company_id,
          department_id: invite.department_id,
          department: departmentName,
          company_template_id: tpl?.id ?? null,
          card_type: "employee",
          slug,
          name: invite.name ?? (memberEmail || "employee").split("@")[0],
          title: jobTitle,
          company: company.name,
          email: memberEmail || null,
          phone: invite.phone,
          website: company.website,
          address: company.address,
          avatar_url: null,
          accent_color: tpl?.accent_color ?? company.brand_primary,
          template: tpl?.template ?? company.default_template,
          design: (tpl?.design ?? null) as never,
          is_verified: company.is_verified,
        })
        .select("slug")
        .single();
      cardSlug = card?.slug ?? null;
    } else if (tpl) {
      await supabaseAdmin
        .from("cards")
        .update({
          company_template_id: tpl.id,
          department_id: invite.department_id,
          department: departmentName,
          ...(jobTitle ? { title: jobTitle } : {}),
          accent_color: tpl.accent_color,
          template: tpl.template,
          is_verified: company.is_verified,
          ...(tpl.design ? { design: tpl.design as never } : {}),
        })
        .eq("id", existing.id);
    }


    await supabaseAdmin
      .from("company_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invite.id);

    await supabaseAdmin.from("company_audit_logs").insert({
      company_id: invite.company_id,
      actor_id: context.userId,
      action: "invitation.accepted",
      entity: "company_members",
      metadata: { email: memberEmail },
    });

    return { ok: true as const, companySlug: company.slug, cardSlug };
  });
