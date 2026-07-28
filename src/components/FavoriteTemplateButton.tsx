// Heart toggle that saves a community template to the signed-in user's favourites.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { listFavoriteTemplateIds, toggleFavoriteTemplate } from "@/lib/templates";

/** Shared query for the ids the current user saved. */
export function useFavoriteTemplateIds(userId: string | null) {
  return useQuery({
    queryKey: ["favorite-template-ids", userId],
    queryFn: () => listFavoriteTemplateIds(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function FavoriteTemplateButton({
  templateId,
  userId,
  ar,
  className,
  likeCount,
}: {
  templateId: string;
  userId: string | null;
  ar: boolean;
  className?: string;
  /** Public number of likes for this template; shown next to the heart. */
  likeCount?: number | null;
}) {
  const qc = useQueryClient();
  const { data: ids = [] } = useFavoriteTemplateIds(userId);
  const active = ids.includes(templateId);

  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleFavoriteTemplate(userId!, templateId, !active),
    // Optimistic: the heart flips instantly, so the like always "shows".
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["favorite-template-ids", userId] });
      const prev = qc.getQueryData<string[]>(["favorite-template-ids", userId]) ?? [];
      qc.setQueryData<string[]>(
        ["favorite-template-ids", userId],
        active ? prev.filter((id) => id !== templateId) : [...prev, templateId],
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["favorite-template-ids", userId], ctx.prev);
      toast.error((e as Error).message);
    },
    onSuccess: (now) => {
      toast.success(
        now
          ? ar ? "تمت الإضافة إلى المفضلة" : "Saved to favourites"
          : ar ? "تمت الإزالة من المفضلة" : "Removed from favourites",
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["favorite-template-ids"] });
      qc.invalidateQueries({ queryKey: ["favorite-templates"] });
      qc.invalidateQueries({ queryKey: ["popular-templates"] });
      qc.invalidateQueries({ queryKey: ["public-templates"] });
    },
  });

  if (!userId) return null;

  const base = typeof likeCount === "number" ? likeCount : null;
  const wasLiked = base !== null && ids.includes(templateId);
  const shown = base === null ? null : Math.max(base, wasLiked ? 1 : 0);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => mutate()}
      aria-pressed={active}
      title={active ? (ar ? "إزالة من المفضلة" : "Remove from favourites") : ar ? "حفظ في المفضلة" : "Save to favourites"}
      className={
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-2 text-[11px] font-semibold transition disabled:opacity-60 " +
        (active
          ? "border-accent/60 bg-accent/10 text-accent"
          : "border-border/60 text-muted-foreground hover:text-foreground") +
        (className ? " " + className : "")
      }
    >
      <Heart className={"h-3.5 w-3.5 " + (active ? "fill-current" : "")} />
      {shown !== null && shown > 0 && <span className="tabular-nums">{shown}</span>}
    </button>
  );
}
