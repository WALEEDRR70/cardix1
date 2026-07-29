// Community design templates: publish a Studio design and reuse it as a fresh, editable copy.
import { supabase } from "@/integrations/supabase/client";
import type { StudioDoc, StudioNode } from "@/lib/studio/types";
import type { Tables } from "@/integrations/supabase/types";

export type DesignTemplate = Tables<"design_templates">;

/** Who a shared template is meant for. */
export type TemplateAudience = "personal" | "employee" | "mixed";

/** Where a used template should be saved: the personal profile or a company workspace. */
export type TemplateTarget =
  | { kind: "personal" }
  | { kind: "company"; companyId: string; companyName: string; companySlug: string; accent?: string | null };

/** Deep copy of a design with fresh node ids so edits never touch the original template. */
export function cloneDesign(doc: StudioDoc): StudioDoc {
  const newId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `n${Math.random().toString(36).slice(2, 10)}`;
  const cloneNode = (n: StudioNode): StudioNode => ({
    ...n,
    id: newId(),
    style: { ...n.style },
    children: n.children?.map(cloneNode),
  });
  return {
    ...doc,
    background: { ...doc.background },
    nodes: doc.nodes.map(cloneNode),
  };
}

export async function publishTemplate(input: {
  title: string;
  description?: string;
  tags: string[];
  design: StudioDoc;
  isPublic: boolean;
  audience?: TemplateAudience;
  companyId?: string | null;
}): Promise<DesignTemplate> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  if (!uid) throw new Error("not signed in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", uid)
    .maybeSingle();

  const { data, error } = await supabase
    .from("design_templates")
    .insert({
      author_id: uid,
      author_name: profile?.display_name || profile?.username || null,
      title: input.title.trim() || "Untitled template",
      description: input.description?.trim() || null,
      tags: input.tags,
      design: input.design as never,
      is_public: input.isPublic,
      audience: input.audience ?? "mixed",
      company_id: input.companyId ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as DesignTemplate;
}

export async function listPublicTemplates(
  search?: string,
  audience?: TemplateAudience | "all",
): Promise<DesignTemplate[]> {
  let q = supabase
    .from("design_templates")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(60);
  if (search?.trim()) q = q.ilike("title", `%${search.trim()}%`);
  if (audience && audience !== "all") q = q.in("audience", [audience, "mixed"]);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DesignTemplate[];
}

export async function listMyTemplates(userId: string): Promise<DesignTemplate[]> {
  const { data, error } = await supabase
    .from("design_templates")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DesignTemplate[];
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("design_templates").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Saves a public template as an editable copy — either in the signed-in user's
 * personal profile or inside a company workspace, depending on `target`.
 * The template row itself is never modified — only its use counter.
 */
export async function useTemplate(
  tpl: DesignTemplate,
  target: TemplateTarget = { kind: "personal" },
): Promise<string> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  if (!uid) throw new Error("not signed in");

  const design = cloneDesign(tpl.design as unknown as StudioDoc);
  const base = tpl.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "design";
  const rand = Math.random().toString(36).slice(2, 7);
  const isCompany = target.kind === "company";
  const slug = isCompany ? `${target.companySlug}-${base}-${rand}` : `tpl-${base}-${rand}`;

  // Prefill the new card with the user's main card so the details form is not empty.
  const main = await getMainCard(uid);

  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id: uid,
      company_id: isCompany ? target.companyId : null,
      name: (isCompany ? target.companyName : main?.name) || tpl.title,
      slug,
      card_type: isCompany ? "company" : "personal",
      accent_color: (isCompany ? target.accent : null) || design.background?.color || "#7c34ff",
      design: design as never,
      title: main?.title ?? null,
      company: main?.company ?? null,
      bio: main?.bio ?? null,
      phone: main?.phone ?? null,
      whatsapp: main?.whatsapp ?? null,
      email: main?.email ?? null,
      website: main?.website ?? null,
      address: main?.address ?? null,
      avatar_url: main?.avatar_url ?? null,
      socials: (main?.socials ?? {}) as never,
    })
    .select("id")
    .single();
  if (error) throw error;


  try {
    const { bumpTemplateUse } = await import("@/lib/templates.functions");
    await bumpTemplateUse({ data: { templateId: tpl.id } });
  } catch {
    /* counter is best-effort */
  }

  return data.id as string;
}

/** Card row shown in the "use template on an existing card" picker. */
export type TemplateTargetCard = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  avatar_url: string | null;
  bio: string | null;
  accent_color: string;
  template: string | null;
  socials: unknown;
  design: unknown;
  updated_at: string;
};

/** Cards the signed-in user can repaint with a template, scoped to the active context. */
export async function listTargetCards(userId: string, companyId?: string | null): Promise<TemplateTargetCard[]> {
  let q = supabase
    .from("cards")
    .select("id,name,title,company,slug,phone,whatsapp,email,website,address,avatar_url,bio,accent_color,template,socials,design,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(40);
  q = companyId ? q.eq("company_id", companyId) : q.is("company_id", null);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TemplateTargetCard[];
}

/** Replaces an existing card's design with a fresh copy of the template. */
export async function applyTemplateToCard(tpl: DesignTemplate, cardId: string): Promise<string> {
  const design = cloneDesign(tpl.design as unknown as StudioDoc);
  const { error } = await supabase.from("cards").update({ design: design as never }).eq("id", cardId);
  if (error) throw error;
  try {
    const { bumpTemplateUse } = await import("@/lib/templates.functions");
    await bumpTemplateUse({ data: { templateId: tpl.id } });
  } catch {
    /* counter is best-effort */
  }
  return cardId;
}

/* ------------------------------ favourites ------------------------------- */

/** Ids of templates the signed-in user saved to their favourites. */
export async function listFavoriteTemplateIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("template_favorites")
    .select("template_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.template_id as string);
}

/** Full template rows the user saved, newest first. */
export async function listFavoriteTemplates(userId: string): Promise<DesignTemplate[]> {
  const { data, error } = await supabase
    .from("template_favorites")
    .select("created_at, design_templates(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .map((r) => (r as { design_templates: DesignTemplate | null }).design_templates)
    .filter((t): t is DesignTemplate => !!t);
}

/** Adds or removes a template from the user's favourites. Returns the new state. */
export async function toggleFavoriteTemplate(userId: string, templateId: string, next: boolean): Promise<boolean> {
  if (next) {
    const { error } = await supabase
      .from("template_favorites")
      .insert({ user_id: userId, template_id: templateId });
    if (error && error.code !== "23505") throw error;
    return true;
  }
  const { error } = await supabase
    .from("template_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("template_id", templateId);
  if (error) throw error;
  return false;
}

/** Most-liked public templates — used to suggest designs when a user has no favourites yet. */
export async function listPopularTemplates(limit = 24, exclude: string[] = []): Promise<DesignTemplate[]> {
  let q = supabase
    .from("design_templates")
    .select("*")
    .eq("is_public", true)
    .order("like_count", { ascending: false })
    .order("use_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (exclude.length) q = q.not("id", "in", `(${exclude.join(",")})`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DesignTemplate[];
}
