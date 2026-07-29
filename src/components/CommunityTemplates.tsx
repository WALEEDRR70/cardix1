// Community template grid, reusable for a personal profile or a company workspace.
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@/lib/nav";
import { StaticCardPreview } from "@/components/studio/StaticCardPreview";
import { FavoriteTemplateButton } from "@/components/FavoriteTemplateButton";
import { supabase } from "@/integrations/supabase/client";
import {
  listFavoriteTemplates,
  listPopularTemplates,
  listPublicTemplates,
  useTemplate,
  type DesignTemplate,
  type TemplateAudience,
  type TemplateTarget,
} from "@/lib/templates";
import type { StudioDoc } from "@/lib/studio/types";
import { tx } from "@/lib/tx";

export const audienceLabel = (a: string, ar: boolean) =>
  a === "personal"
    ? tx("Personal")
    : a === "employee"
      ? tx("Employees")
      : tx("Mixed");

export function CommunityTemplates({
  ar,
  audience,
  target,
  limit,
  mode = "public",
}: {
  ar: boolean;
  /** Which template kind to show ("personal" and "employee" also include mixed templates). */
  audience: TemplateAudience | "all";
  /** Where a used template gets saved. */
  target: TemplateTarget;
  limit?: number;
  /** "favorites" shows the user's liked templates, falling back to popular suggestions. */
  mode?: "public" | "favorites";
}) {
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null));
  }, []);

  const favorites = useQuery({
    queryKey: ["favorite-templates", uid],
    queryFn: () => listFavoriteTemplates(uid!),
    enabled: mode === "favorites" && !!uid,
    staleTime: 30_000,
  });

  const publicQuery = useQuery({
    queryKey: mode === "favorites" ? ["popular-templates"] : ["public-templates", "", audience],
    queryFn: () => (mode === "favorites" ? listPopularTemplates(24) : listPublicTemplates(undefined, audience)),
    enabled: mode === "public" || (!!uid && favorites.isSuccess && favorites.data.length === 0) || (mode === "favorites" && !uid),
    staleTime: 60_000,
  });

  const usingSuggestions = mode === "favorites" && (favorites.data?.length ?? 0) === 0;
  const templates: DesignTemplate[] =
    mode === "favorites" ? (usingSuggestions ? (publicQuery.data ?? []) : favorites.data!) : (publicQuery.data ?? []);
  const isLoading = mode === "favorites" ? favorites.isLoading || (usingSuggestions && publicQuery.isLoading) : publicQuery.isLoading;

  async function onUse(tpl: DesignTemplate) {
    setBusyId(tpl.id);
    try {
      const cardId = await useTemplate(tpl, target);
      toast.success(
        target.kind === "company"
          ? tx("Template added to the workspace")
          : tx("Card created from template"),
      );
      navigate({ to: "/studio/$id", params: { id: cardId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="grid place-items-center py-10">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (templates.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        {tx("No templates published yet.")}
      </p>
    );
  }

  const shown = limit ? templates.slice(0, limit) : templates;

  return (
    <>
    {usingSuggestions && (
      <p className="mb-3 text-center text-[11px] text-muted-foreground">
        {tx("No favourites yet — here are the most-liked community designs.")}
      </p>
    )}
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((tpl) => (
        <li key={tpl.id} className="glass rounded-3xl border border-border/40 p-3">
          <div className="grid place-items-center overflow-hidden rounded-2xl bg-muted/20 p-2">
            <StaticCardPreview doc={tpl.design as unknown as StudioDoc} width={220} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">{tpl.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {audienceLabel((tpl as { audience?: string }).audience ?? "mixed", ar)}
                {tpl.author_name ? ` · ${tx("by")} ${tpl.author_name}` : ""}
              </p>
            </div>
            <FavoriteTemplateButton
              templateId={tpl.id}
              userId={uid}
              ar={ar}
              likeCount={(tpl as { like_count?: number }).like_count ?? 0}
            />
            <button
              onClick={() => void onUse(tpl)}
              disabled={busyId === tpl.id}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-[11px] font-semibold text-accent-foreground disabled:opacity-60"
            >
              {busyId === tpl.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              {target.kind === "company" ? (tx("Add to workspace")) : tx("Use")}
            </button>
          </div>
        </li>
      ))}
    </ul>
    </>
  );
}
