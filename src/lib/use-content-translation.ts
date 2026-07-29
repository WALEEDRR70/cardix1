import { useQuery } from "@tanstack/react-query";
import { getContentTranslation } from "@/lib/content-translation.functions";
import { applyTranslation, type TranslatableEntity, type TranslatedFields } from "@/lib/content-translation";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";

/**
 * Fetch (and cache) the AI translation of a published entity for the current
 * UI language. Returns `{}` for English or while the translation is generated.
 */
export function useContentTranslation(
  entityType: TranslatableEntity,
  entityId: string | null | undefined,
  locale: string,
  entityKey = "",
): TranslatedFields {
  const enabled = !!entityId && isSupportedLocale(locale) && locale !== DEFAULT_LOCALE;
  const { data } = useQuery({
    queryKey: ["content-translation", entityType, entityId, entityKey, locale],
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const res = await getContentTranslation({
        data: { entityType, entityId: entityId!, entityKey, locale: locale as never },
      });
      return res.fields;
    },
  });
  return data ?? {};
}

/** Convenience: entity row with its translated fields merged in. */
export function useTranslatedRow<T extends Record<string, unknown>>(
  entityType: TranslatableEntity,
  row: T | null | undefined,
  locale: string,
  entityKey = "",
): T | null | undefined {
  const fields = useContentTranslation(entityType, row?.id as string | undefined, locale, entityKey);
  if (!row) return row;
  return applyTranslation(row, fields);
}
