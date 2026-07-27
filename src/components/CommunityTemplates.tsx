// Community template grid, reusable for a personal profile or a company workspace.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@/lib/nav";
import { StaticCardPreview } from "@/components/studio/StaticCardPreview";
import {
  listPublicTemplates,
  useTemplate,
  type DesignTemplate,
  type TemplateAudience,
  type TemplateTarget,
} from "@/lib/templates";
import type { StudioDoc } from "@/lib/studio/types";

export const audienceLabel = (a: string, ar: boolean) =>
  a === "personal"
    ? ar ? "للأفراد" : "Personal"
    : a === "employee"
      ? ar ? "لموظفي الشركات" : "Employees"
      : ar ? "مشترك" : "Mixed";

export function CommunityTemplates({
  ar,
  audience,
  target,
  limit,
}: {
  ar: boolean;
  /** Which template kind to show ("personal" and "employee" also include mixed templates). */
  audience: TemplateAudience | "all";
  /** Where a used template gets saved. */
  target: TemplateTarget;
  limit?: number;
}) {
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["public-templates", "", audience],
    queryFn: () => listPublicTemplates(undefined, audience),
    staleTime: 60_000,
  });

  async function onUse(tpl: DesignTemplate) {
    setBusyId(tpl.id);
    try {
      const cardId = await useTemplate(tpl, target);
      toast.success(
        target.kind === "company"
          ? ar ? "تمت إضافة القالب إلى مساحة العمل" : "Template added to the workspace"
          : ar ? "تم إنشاء بطاقة من القالب" : "Card created from template",
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
        {ar ? "لا توجد قوالب منشورة بعد." : "No templates published yet."}
      </p>
    );
  }

  const shown = limit ? templates.slice(0, limit) : templates;

  return (
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
                {tpl.author_name ? ` · ${ar ? "بواسطة" : "by"} ${tpl.author_name}` : ""}
              </p>
            </div>
            <button
              onClick={() => void onUse(tpl)}
              disabled={busyId === tpl.id}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-[11px] font-semibold text-accent-foreground disabled:opacity-60"
            >
              {busyId === tpl.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              {target.kind === "company" ? (ar ? "أضف للمساحة" : "Add to workspace") : ar ? "استخدم" : "Use"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
