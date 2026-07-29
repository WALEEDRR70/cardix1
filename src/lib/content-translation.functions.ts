import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/i18n/config";
import type { TranslatedFields } from "@/lib/content-translation";

const Input = z.object({
  entityType: z.enum(["card", "company", "service"]),
  entityId: z.string().uuid(),
  /** service slug (empty for card/company) */
  entityKey: z.string().max(200).default(""),
  locale: z.enum(SUPPORTED_LOCALES),
});

/**
 * Return the cached AI translation of a published entity for `locale`,
 * generating (and caching) it on first request. Public by design: it only
 * ever reads published content and only writes into the translation cache.
 */
export const getContentTranslation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<{ fields: TranslatedFields }> => {
    if (data.locale === DEFAULT_LOCALE) return { fields: {} };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { collectSource } = await import("@/lib/content-translation.source.server");
    const { translateFields, hashSource } = await import("@/lib/content-translation.server");

    const source = await collectSource(supabaseAdmin, data.entityType, data.entityId, data.entityKey);
    if (!source || !Object.keys(source).length) return { fields: {} };

    const sourceHash = hashSource(source);

    const { data: cached } = await supabaseAdmin
      .from("content_translations")
      .select("fields, source_hash")
      .eq("entity_type", data.entityType)
      .eq("entity_id", data.entityId)
      .eq("entity_key", data.entityKey)
      .eq("locale", data.locale)
      .maybeSingle();

    if (cached && cached.source_hash === sourceHash) {
      return { fields: (cached.fields ?? {}) as TranslatedFields };
    }

    const fields = await translateFields(source, data.locale);
    if (!Object.keys(fields).length) return { fields: {} };

    await supabaseAdmin.from("content_translations").upsert(
      {
        entity_type: data.entityType,
        entity_id: data.entityId,
        entity_key: data.entityKey,
        locale: data.locale,
        source_hash: sourceHash,
        fields,
      },
      { onConflict: "entity_type,entity_id,entity_key,locale" },
    );

    return { fields };
  });
