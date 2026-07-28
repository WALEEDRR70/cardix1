// Designer templates shown inside the card editor: tapping one repaints THIS card.
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, LayoutTemplate, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { StaticCardPreview } from "@/components/studio/StaticCardPreview";
import { FavoriteTemplateButton } from "@/components/FavoriteTemplateButton";
import { supabase } from "@/integrations/supabase/client";
import {
  applyTemplateToCard,
  listFavoriteTemplates,
  listPublicTemplates,
  type DesignTemplate,
} from "@/lib/templates";
import type { StudioDoc } from "@/lib/studio/types";

export function ApplyTemplatesStrip({ cardId }: { cardId: string }) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const qc = useQueryClient();
  const [uid, setUid] = useState<string | null>(null);
  const [tab, setTab] = useState<"public" | "favorites">("public");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null));
  }, []);

  const publicQuery = useQuery({
    queryKey: ["public-templates", "", "personal"],
    queryFn: () => listPublicTemplates(undefined, "personal"),
    staleTime: 60_000,
  });
  const favorites = useQuery({
    queryKey: ["favorite-templates", uid],
    queryFn: () => listFavoriteTemplates(uid!),
    enabled: !!uid,
    staleTime: 30_000,
  });

  const templates: DesignTemplate[] = tab === "favorites" ? (favorites.data ?? []) : (publicQuery.data ?? []);
  const isLoading = tab === "favorites" ? favorites.isLoading : publicQuery.isLoading;

  async function apply(tpl: DesignTemplate) {
    setBusyId(tpl.id);
    try {
      await applyTemplateToCard(tpl, cardId);
      await qc.invalidateQueries({ queryKey: ["card", cardId] });
      toast.success(ar ? "تم تطبيق القالب على البطاقة" : "Template applied to this card");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <LayoutTemplate className="h-3.5 w-3.5" />
          {ar ? "قوالب المصممين" : "Designer templates"}
        </h2>
        <Link to="/templates" className="text-[11px] font-semibold text-primary">
          {ar ? "عرض الكل" : "See all"}
        </Link>
      </div>

      <div className="mb-3 flex gap-2 px-1">
        {(["public", "favorites"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition " +
              (tab === k ? "border-accent bg-accent/10 text-accent" : "border-border/60 text-muted-foreground")
            }
          >
            {k === "favorites" && <Heart className="h-3 w-3" />}
            {k === "public" ? (ar ? "الكل" : "All") : ar ? "المفضلة" : "Favourites"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-8">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          {tab === "favorites"
            ? ar ? "لم تحفظ أي قالب بعد." : "No saved templates yet."
            : ar ? "لا توجد قوالب منشورة بعد." : "No templates published yet."}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.slice(0, 12).map((tpl) => (
            <li key={tpl.id} className="glass rounded-3xl border border-border/40 p-3">
              <button
                type="button"
                onClick={() => void apply(tpl)}
                disabled={busyId === tpl.id}
                className="grid w-full place-items-center overflow-hidden rounded-2xl bg-muted/20 p-2 disabled:opacity-60"
              >
                <StaticCardPreview doc={tpl.design as unknown as StudioDoc} width={220} />
              </button>
              <div className="mt-3 flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-[13px] font-semibold">{tpl.title}</p>
                <FavoriteTemplateButton
                  templateId={tpl.id}
                  userId={uid}
                  ar={ar}
                  likeCount={(tpl as { like_count?: number }).like_count ?? 0}
                />
                <button
                  type="button"
                  onClick={() => void apply(tpl)}
                  disabled={busyId === tpl.id}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-[11px] font-semibold text-accent-foreground disabled:opacity-60"
                >
                  {busyId === tpl.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {ar ? "تطبيق" : "Apply"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
