// Server/client safe fetch of the minimal public card fields used for link previews (SSR head tags).
import { supabase } from "@/integrations/supabase/client";

export type PublicCardMeta = {
  slug: string;
  name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export async function fetchPublicCardMeta(slug: string): Promise<PublicCardMeta | null> {
  const { data } = await supabase
    .from("cards")
    .select("slug, name, title, company, bio, avatar_url, cover_url, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!data) return null;
  const img = (data.cover_url as string | null) || (data.avatar_url as string | null) || null;
  return {
    slug: data.slug as string,
    name: (data.name as string) || slug,
    title: (data.title as string | null) ?? null,
    company: (data.company as string | null) ?? null,
    bio: (data.bio as string | null) ?? null,
    avatarUrl: img && /^https?:\/\//.test(img) ? img : null,
  };
}

/** Builds title/description/og tags for a public card URL. */
export function publicCardHead(meta: PublicCardMeta | null, url: string, slug: string) {
  const name = meta?.name || slug;
  const role = [meta?.title, meta?.company].filter(Boolean).join(" · ");
  const title = role ? `${name} — ${role}` : `${name} — Cardixn`;
  const description =
    meta?.bio?.trim() ||
    (role
      ? `${role}. Save ${name}'s contact details instantly from their Cardixn digital business card.`
      : `Save ${name}'s contact details instantly from their Cardixn digital business card.`);
  const meta_ = [
    { title },
    { name: "description", content: description.slice(0, 155) },
    { property: "og:title", content: title },
    { property: "og:description", content: description.slice(0, 155) },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "Cardixn" },
    { name: "twitter:card", content: meta?.avatarUrl ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description.slice(0, 155) },
  ];
  if (meta?.avatarUrl) {
    meta_.push(
      { property: "og:image", content: meta.avatarUrl },
      { property: "og:image:alt", content: `${name} — Cardixn digital business card` },
      { name: "twitter:image", content: meta.avatarUrl },
    );
  }
  return meta_;
}
