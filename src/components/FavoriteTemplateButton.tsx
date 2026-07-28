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
}: {
  templateId: string;
  userId: string | null;
  ar: boolean;
  className?: string;
}) {
  const qc = useQueryClient();
  const { data: ids = [] } = useFavoriteTemplateIds(userId);
  const active = ids.includes(templateId);

  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleFavoriteTemplate(userId!, templateId, !active),
    onSuccess: (now) => {
      qc.invalidateQueries({ queryKey: ["favorite-template-ids"] });
      qc.invalidateQueries({ queryKey: ["favorite-templates"] });
      toast.success(
        now
          ? ar ? "تمت الإضافة إلى المفضلة" : "Saved to favourites"
          : ar ? "تمت الإزالة من المفضلة" : "Removed from favourites",
      );
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (!userId) return null;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => mutate()}
      aria-pressed={active}
      title={active ? (ar ? "إزالة من المفضلة" : "Remove from favourites") : ar ? "حفظ في المفضلة" : "Save to favourites"}
      className={
        "grid shrink-0 place-items-center rounded-full border p-2 transition disabled:opacity-60 " +
        (active
          ? "border-accent/60 bg-accent/10 text-accent"
          : "border-border/60 text-muted-foreground hover:text-foreground") +
        (className ? " " + className : "")
      }
    >
      <Heart className={"h-3.5 w-3.5 " + (active ? "fill-current" : "")} />
    </button>
  );
}
