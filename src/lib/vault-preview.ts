import { supabase } from "@/integrations/supabase/client";

type SourceCardPreview = {
  id?: string | null;
  user_id?: string | null;
  slug?: string | null;
  name?: string | null;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  accent_color?: string | null;
  template?: string | null;
  design?: unknown;
  socials?: unknown;
  is_published?: boolean | null;
  is_active?: boolean | null;
};

type SavedCardPreviewRow = object & {
  source_card?: SourceCardPreview | null;
  cards?: SourceCardPreview | null;
};

const PREVIEW_FIELDS = [
  "name", "title", "company", "bio", "phone", "whatsapp", "email", "website", "address",
  "avatar_url", "accent_color", "template", "design", "socials",
] as const;

function normalized(value?: string | null) {
  return (value ?? "").trim().toLocaleLowerCase();
}

export function hasStudioDesign(design: unknown): boolean {
  const d = design as { nodes?: unknown; w?: unknown; h?: unknown } | null;
  return !!d && typeof d === "object" && Array.isArray(d.nodes) && typeof d.w === "number" && typeof d.h === "number";
}

function sourceFrom(row: SavedCardPreviewRow): SourceCardPreview | null {
  return row.source_card ?? row.cards ?? null;
}

function mergeSource<T extends SavedCardPreviewRow>(row: T, source: SourceCardPreview): T {
  const overlay: Record<string, unknown> = {};
  for (const key of PREVIEW_FIELDS) {
    const value = source[key];
    if (value !== null && value !== undefined) overlay[key] = value;
  }
  const next = { ...row, ...overlay } as SavedCardPreviewRow;
  if ("source_card" in row) next.source_card = source;
  if ("cards" in row) next.cards = source;
  return next as T;
}

/**
 * Vault rows can point at an older public card saved before the owner applied a
 * Studio design. Prefer the live source design; if that card has no Studio JSON,
 * fall forward to the owner's latest published designed card with the same name.
 */
export async function resolveSavedCardPreviews<T extends SavedCardPreviewRow>(rows: T[]): Promise<T[]> {
  const needsFallback = rows
    .map(sourceFrom)
    .filter((source): source is SourceCardPreview =>
      !!source && source.is_published !== false && source.is_active !== false && !!source.user_id && !hasStudioDesign(source.design),
    );

  const ownerIds = Array.from(new Set(needsFallback.map((source) => source.user_id).filter(Boolean))) as string[];
  let replacements: SourceCardPreview[] = [];

  if (ownerIds.length > 0) {
    const { data } = await supabase
      .from("cards")
      .select("id,user_id,slug,name,title,company,bio,phone,whatsapp,email,website,address,avatar_url,accent_color,template,design,socials,is_published,is_active,updated_at")
      .in("user_id", ownerIds)
      .eq("is_published", true)
      .eq("is_active", true)
      .not("design", "is", null)
      .order("updated_at", { ascending: false })
      .limit(120);
    replacements = ((data ?? []) as SourceCardPreview[]).filter((card) => hasStudioDesign(card.design));
  }

  return rows.map((row) => {
    const source = sourceFrom(row);
    if (!source || source.is_published === false) return row;

    const resolved = hasStudioDesign(source.design)
      ? source
      : replacements.find((candidate) =>
          candidate.user_id === source.user_id &&
          normalized(candidate.name) === normalized(source.name ?? ((row as SourceCardPreview).name as string | null | undefined)) &&
          (!normalized(source.company) || normalized(candidate.company) === normalized(source.company)),
        );

    return resolved ? mergeSource(row, resolved) : mergeSource(row, source);
  });
}