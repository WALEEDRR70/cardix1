// Designer templates rendered as a slider under the built-in template picker.
// Tapping a thumbnail repaints THIS card with that design.
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { StaticCardPreview } from "@/components/studio/StaticCardPreview";
import { supabase } from "@/integrations/supabase/client";
import {
  applyTemplateToCard,
  listFavoriteTemplates,
  listPublicTemplates,
  type DesignTemplate,
} from "@/lib/templates";
import type { StudioDoc } from "@/lib/studio/types";
import { tx, txErr } from "@/lib/tx";

export function ApplyTemplatesStrip({ cardId }: { cardId: string }) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const qc = useQueryClient();
  const scrollRef = useDragScroll<HTMLDivElement>();
  const [uid, setUid] = useState<string | null>(null);
  const [tab, setTab] = useState<"public" | "favorites">("public");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

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
      setAppliedId(tpl.id);
      await qc.invalidateQueries({ queryKey: ["card", cardId] });
      toast.success(tx("Design applied to this card"));
    } catch (e) {
      toast.error(txErr(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {tx("Designer templates")}
        </label>
        <div className="flex gap-1.5">
          {(["public", "favorites"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition " +
                (tab === k ? "border-accent bg-accent/10 text-accent" : "border-border/60 text-muted-foreground")
              }
            >
              {k === "favorites" && <Heart className="h-2.5 w-2.5" />}
              {k === "public" ? (tx("All")) : tx("Favourites")}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid h-[58px] place-items-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-muted-foreground">
          {tab === "favorites"
            ? tx("No saved templates yet.")
            : tx("No templates published yet.")}
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="no-scrollbar -mx-4 flex cursor-grab gap-2.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0"
        >
          {templates.map((tpl) => {
            const active = appliedId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => void apply(tpl)}
                disabled={busyId === tpl.id}
                title={tpl.title}
                className="group flex shrink-0 snap-start flex-col items-center gap-1.5 disabled:opacity-60"
              >
                <span
                  className={
                    "relative grid h-[46px] w-[72px] place-items-center overflow-hidden rounded-xl border bg-muted/20 transition " +
                    (active ? "border-accent ring-2 ring-accent shadow-glow" : "border-border/60")
                  }
                >
                  <span className="pointer-events-none block origin-center scale-[0.98]">
                    <StaticCardPreview doc={tpl.design as unknown as StudioDoc} width={72} />
                  </span>
                  {busyId === tpl.id && (
                    <span className="absolute inset-0 grid place-items-center bg-background/60">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    </span>
                  )}
                  {active && busyId !== tpl.id && (
                    <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-foreground">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span
                  className={
                    "max-w-[72px] truncate text-[10px] font-medium tracking-wide transition " +
                    (active ? "text-foreground" : "text-muted-foreground")
                  }
                >
                  {tpl.title}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
