import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

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
    design: JsonValue;
    socials: JsonValue;
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
        .is("company_id", null)
        .eq("card_type", "personal")
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
        design: (c.design as JsonValue) ?? null,
        socials: (c.socials as JsonValue) ?? null,
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

export type AdminCardPatch = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  slug: string;
  is_published: boolean;
};

/** Platform-admin only: edit any card's data fields. */
export const adminUpdateCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: AdminCardPatch) => {
    if (!input?.id) throw new Error("MISSING_ID");
    if (!input.name?.trim()) throw new Error("MISSING_NAME");
    if (!/^[a-z0-9-]{2,60}$/i.test(input.slug?.trim() ?? "")) throw new Error("BAD_SLUG");
    return input;
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("FORBIDDEN");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const clean = (v: string | null) => {
      const s = (v ?? "").trim();
      return s.length ? s.slice(0, 2000) : null;
    };
    const { error } = await supabaseAdmin
      .from("cards")
      .update({
        name: data.name.trim().slice(0, 120),
        title: clean(data.title),
        company: clean(data.company),
        bio: clean(data.bio),
        phone: clean(data.phone),
        whatsapp: clean(data.whatsapp),
        email: clean(data.email),
        website: clean(data.website),
        address: clean(data.address),
        slug: data.slug.trim().toLowerCase(),
        is_published: data.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export type AdminCompanyRow = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  owner_id: string;
  owner_email: string | null;
  is_published: boolean;
  created_at: string;
  member_count: number;
  cards: AdminUserRow["cards"];
};

/** Platform-admin only: every company workspace with its corporate/employee cards. */
export const listPlatformCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ companies: AdminCompanyRow[]; totalCards: number }> => {
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("FORBIDDEN");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: companies }, { data: cards }, { data: members }] = await Promise.all([
      supabaseAdmin
        .from("companies")
        .select("id, slug, name, logo_url, owner_id, is_published, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("cards")
        .select("id, company_id, slug, name, title, company, card_type, bio, phone, whatsapp, email, website, address, avatar_url, accent_color, template, design, socials, is_published, view_count, created_at")
        .not("company_id", "is", null)
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("company_members").select("company_id").eq("status", "active"),
    ]);

    const emailByUser = new Map<string, string | null>();
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      for (const u of data.users) emailByUser.set(u.id, u.email ?? null);
      if (data.users.length < 200) break;
    }

    const cardsByCompany = new Map<string, AdminUserRow["cards"]>();
    for (const c of cards ?? []) {
      const key = c.company_id as string;
      const list = cardsByCompany.get(key) ?? [];
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
        design: (c.design as JsonValue) ?? null,
        socials: (c.socials as JsonValue) ?? null,
        is_published: c.is_published,
        view_count: c.view_count,
        created_at: c.created_at,
      });
      cardsByCompany.set(key, list);
    }

    const memberCount = new Map<string, number>();
    for (const m of members ?? []) memberCount.set(m.company_id, (memberCount.get(m.company_id) ?? 0) + 1);

    return {
      companies: (companies ?? []).map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        logo_url: c.logo_url,
        owner_id: c.owner_id,
        owner_email: emailByUser.get(c.owner_id) ?? null,
        is_published: c.is_published,
        created_at: c.created_at,
        member_count: memberCount.get(c.id) ?? 0,
        cards: cardsByCompany.get(c.id) ?? [],
      })),
      totalCards: cards?.length ?? 0,
    };
  });
