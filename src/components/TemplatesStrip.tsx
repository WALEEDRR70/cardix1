import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Wand2, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { StaticCardPreview } from "@/components/studio/StaticCardPreview";
import { listPublicTemplates, useTemplate, type DesignTemplate } from "@/lib/templates";
import type { StudioDoc } from "@/lib/studio/types";

/** Community templates surfaced inside the personal account so any user can start a card from one. */
export function TemplatesStrip({ limit = 6 }: { limit?: number }) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["public-templates", ""],
    queryFn: () => listPublicTemplates(),
    staleTime: 60_000,
  });

  async function onUse(tpl: DesignTemplate) {
    setBusyId(tpl.id);
    try {
      const cardId = await useTemplate(tpl);
      toast.success(ar ? "تم إنشاء بطاقة من القالب" : "Card created from template");
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
  if (templates.length === 0) return null;

  const shown = templates.slice(0, limit);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <LayoutTemplate className="h-3.5 w-3.5" />
          {ar ? "قوالب جاهزة" : "Ready-made templates"}
        </h2>
        <Link to="/templates" className="text-[11px] font-semibold text-primary">
          {ar ? "عرض الكل" : "See all"}
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((tpl) => (
          <li key={tpl.id} className="glass rounded-3xl border border-border/40 p-3">
            <div className="grid place-items-center overflow-hidden rounded-2xl bg-muted/20 p-2">
              <StaticCardPreview doc={tpl.design as unknown as StudioDoc} width={220} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{tpl.title}</p>
                {tpl.author_name && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {ar ? `بواسطة ${tpl.author_name}` : `by ${tpl.author_name}`}
                  </p>
                )}
              </div>
              <button
                onClick={() => void onUse(tpl)}
                disabled={busyId === tpl.id}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-[11px] font-semibold text-accent-foreground disabled:opacity-60"
              >
                {busyId === tpl.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                {ar ? "استخدم" : "Use"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
