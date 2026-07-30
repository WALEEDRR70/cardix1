import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  account_type: string | null;
  cards: {
    id: string;
    slug: string;
    name: string;
    title: string | null;
    company: string | null;
    card_type: string;
    bio: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    avatar_url: string | null;
    accent_color: string;
    template: string | null;
    design: Record<string, unknown> | null;
    socials: Record<string, unknown> | null;
    is_published: boolean;
    view_count: number;
    created_at: string;
  }[];
};

/** Platform-admin only: every signed-up user with their cards. */
export const listPlatformUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ users: AdminUserRow[]; totalCards: number }> => {
    // Authorize with the caller's own (RLS-scoped) client before touching admin access.
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("FORBIDDEN");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const authUsers: { id: string; email: string | null; created_at: string; last_sign_in_at: string | null }[] = [];
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      authUsers.push(
        ...data.users.map((u) => ({
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
        })),
      );
      if (data.users.length < 200) break;
    }

    const [{ data: profiles }, { data: cards }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, username, display_name, avatar_url, account_type"),
      supabaseAdmin
        .from("cards")
        .select("id, user_id, slug, name, title, company, card_type, bio, phone, whatsapp, email, website, address, avatar_url, accent_color, template, design, socials, is_published, view_count, created_at")
        .order("created_at", { ascending: false }),
    ]);

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const cardsByUser = new Map<string, AdminUserRow["cards"]>();
    for (const c of cards ?? []) {
      const list = cardsByUser.get(c.user_id) ?? [];
      list.push({
        id: c.id,
        slug: c.slug,
        name: c.name,
        title: c.title,
        company: c.company,
        card_type: c.card_type,
        bio: c.bio,
        phone: c.phone,
        whatsapp: c.whatsapp,
        email: c.email,
        website: c.website,
        address: c.address,
        avatar_url: c.avatar_url,
        accent_color: c.accent_color,
        template: c.template,
        design: (c.design as Record<string, unknown> | null) ?? null,
        socials: (c.socials as Record<string, unknown> | null) ?? null,
        is_published: c.is_published,
        view_count: c.view_count,
        created_at: c.created_at,
      });
      cardsByUser.set(c.user_id, list);
    }

    const users: AdminUserRow[] = authUsers
      .map((u) => {
        const p = profileById.get(u.id);
        return {
          ...u,
          display_name: p?.display_name ?? null,
          username: p?.username ?? null,
          avatar_url: p?.avatar_url ?? null,
          account_type: p?.account_type ?? null,
          cards: cardsByUser.get(u.id) ?? [],
        };
      })
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    return { users, totalCards: cards?.length ?? 0 };
  });
