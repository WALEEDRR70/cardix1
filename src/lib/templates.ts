// Community design templates: publish a Studio design and reuse it as a fresh, editable copy.
import { supabase } from "@/integrations/supabase/client";
import type { StudioDoc, StudioNode } from "@/lib/studio/types";
import type { Tables } from "@/integrations/supabase/types";

export type DesignTemplate = Tables<"design_templates">;

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
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as DesignTemplate;
}

export async function listPublicTemplates(search?: string): Promise<DesignTemplate[]> {
  let q = supabase
    .from("design_templates")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(60);
  if (search?.trim()) q = q.ilike("title", `%${search.trim()}%`);
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
 * Saves a public template as the signed-in user's own editable card design.
 * The template row itself is never modified — only its use counter.
 */
export async function useTemplate(tpl: DesignTemplate): Promise<string> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  if (!uid) throw new Error("not signed in");

  const design = cloneDesign(tpl.design as unknown as StudioDoc);
  const slug = `tpl-${tpl.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "design"}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

  const { data, error } = await supabase
    .from("cards")
    .insert({
      user_id: uid,
      name: tpl.title,
      slug,
      card_type: "personal",
      accent_color: design.background?.color || "#7c34ff",
      design: design as never,
    })
    .select("id")
    .single();
  if (error) throw error;

  await supabase.rpc("increment_template_use", { _template_id: tpl.id });
  return data.id as string;
}
