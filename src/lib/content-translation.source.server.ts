import type { SupabaseClient } from "@supabase/supabase-js";
import { TRANSLATABLE_FIELDS, type TranslatableEntity, type TranslatedFields } from "@/lib/content-translation";
import { publishedServices } from "@/lib/company-services";

type Admin = SupabaseClient<never, never, never> | SupabaseClient;

function pick(row: Record<string, unknown>, keys: readonly string[]): TranslatedFields {
  const out: TranslatedFields = {};
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) out[k] = v;
    else if (Array.isArray(v) && v.length) out[k] = v.map(String).filter(Boolean);
  }
  return out;
}

/** Read the translatable source text of a published entity. */
export async function collectSource(
  admin: Admin,
  entityType: TranslatableEntity,
  entityId: string,
  entityKey: string,
): Promise<TranslatedFields | null> {
  const db = admin as SupabaseClient;

  if (entityType === "card") {
    const { data } = await db
      .from("cards")
      .select("title, company, bio, address, working_hours, department, is_published")
      .eq("id", entityId)
      .maybeSingle();
    if (!data || !(data as Record<string, unknown>).is_published) return null;
    return pick(data as Record<string, unknown>, TRANSLATABLE_FIELDS.card);
  }

  const { data: company } = await db
    .from("companies")
    .select("tagline, description, industry, address, services, is_published")
    .eq("id", entityId)
    .maybeSingle();
  if (!company || !(company as Record<string, unknown>).is_published) return null;

  if (entityType === "company") {
    return pick(company as Record<string, unknown>, TRANSLATABLE_FIELDS.company);
  }

  const service = publishedServices((company as Record<string, unknown>).services).find(
    (s) => s.slug === entityKey,
  );
  if (!service) return null;
  return pick(service as unknown as Record<string, unknown>, TRANSLATABLE_FIELDS.service);
}
