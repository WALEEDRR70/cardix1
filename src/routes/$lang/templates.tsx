import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Trash2, Wand2, Search } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StaticCardPreview } from "@/components/studio/StaticCardPreview";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { deleteTemplate, listMyTemplates, listPublicTemplates, useTemplate, type DesignTemplate } from "@/lib/templates";
import type { StudioDoc } from "@/lib/studio/types";

export const Route = createFileRoute("/$lang/templates")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/templates`;
    const isAr = lang === "ar";
    const title = isAr
      ? "معرض قوالب البطاقات — تصاميم جاهزة من مصممي Cardixn"
      : "Card Template Gallery — Designs Shared by Cardixn Designers";
    const description = isAr
      ? "تصفّح قوالب بطاقات الأعمال الرقمية التي شاركها المصممون، واحفظ أي قالب كنسخة خاصة بك وعدّله في استوديو التصميم."
      : "Browse digital business card templates shared by designers, save any template as your own copy and edit it freely in the Studio.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: url },
        ...SUPPORTED_LOCALES.map((l) => ({ rel: "alternate", hreflang: l, href: `${SITE_ORIGIN}/${l}/templates` })),
        { rel: "alternate", hreflang: "x-default", href: `${SITE_ORIGIN}/en/templates` },
      ],
    };
  },
  component: TemplatesGallery,
});

function TemplatesGallery() {
  const { lang } = Route.useParams();
  const ar = (isSupportedLocale(lang) ? lang : DEFAULT_LOCALE) === "ar";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "mine">("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null));
  }, []);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: tab === "mine" ? ["my-templates", uid] : ["public-templates", search],
    queryFn: () => (tab === "mine" ? listMyTemplates(uid!) : listPublicTemplates(search)),
    enabled: tab === "all" || !!uid,
  });

  async function onUse(tpl: DesignTemplate) {
    if (!uid) {
      navigate({ to: "/auth" });
      return;
    }
    setBusyId(tpl.id);
    try {
      const cardId = await useTemplate(tpl);
      toast.success(ar ? "تم حفظ نسخة خاصة بك" : "Saved your own copy");
      navigate({ to: "/studio/$id", params: { id: cardId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(tpl: DesignTemplate) {
    setBusyId(tpl.id);
    try {
      await deleteTemplate(tpl.id);
      await qc.invalidateQueries({ queryKey: ["public-templates"] });
      await qc.invalidateQueries({ queryKey: ["my-templates"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <MarketingLayout>
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-[11px] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {ar ? "معرض القوالب" : "Template gallery"}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {ar ? "قوالب صمّمها مصممون مثلك" : "Templates designed by the community"}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {ar
              ? "احفظ أي قالب كنسخة خاصة بك وعدّل عليه بحرية في الاستوديو — القالب الأصلي يبقى كما صمّمه صاحبه."
              : "Save any template as your own copy and edit it freely in the Studio — the original stays exactly as its designer made it."}
          </p>
        </div>

        {uid && (
          <div className="mx-auto mb-4 flex w-fit items-center gap-1 rounded-full border border-border/60 p-1">
            {(["all", "mine"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
                  (tab === k ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")
                }
              >
                {k === "all" ? (ar ? "كل القوالب" : "All templates") : ar ? "قوالبي" : "My templates"}
              </button>
            ))}
          </div>
        )}

        <div className={"mx-auto mb-8 flex max-w-md items-center gap-2 rounded-full border border-border/60 px-4 py-2 " + (tab === "mine" ? "hidden" : "")}>
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ar ? "ابحث عن قالب…" : "Search templates…"}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            {tab === "mine"
              ? ar
                ? "لم تنشر أي قالب بعد — افتح تصميمك في الاستوديو واضغط \"نشر كقالب\"."
                : "You haven't published a template yet — open a design in the Studio and hit \"Publish as template\"."
              : ar
                ? "لا توجد قوالب منشورة بعد."
                : "No templates published yet."}
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => (
              <li
                key={tpl.id}
                className="group overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-4 transition hover:border-accent/60"
              >
                <div className="grid place-items-center overflow-hidden rounded-2xl bg-muted/20 p-3">
                  <StaticCardPreview doc={tpl.design as unknown as StudioDoc} width={240} />
                </div>
                <div className="mt-4">
                  <h2 className="flex items-center gap-2 truncate text-sm font-semibold">
                    <span className="truncate">{tpl.title}</span>
                    {!tpl.is_public && (
                      <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                        {ar ? "خاص" : "Private"}
                      </span>
                    )}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {tpl.author_name ? (ar ? `بواسطة ${tpl.author_name}` : `by ${tpl.author_name}`) : ""}
                    {tpl.use_count > 0 ? ` · ${tpl.use_count} ${ar ? "استخدام" : "uses"}` : ""}
                  </p>
                  {tpl.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{tpl.description}</p>
                  )}
                  {tpl.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tpl.tags.map((t) => (
                        <span key={t} className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => onUse(tpl)}
                      disabled={busyId === tpl.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-60"
                    >
                      {busyId === tpl.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      {ar ? "احفظ وعدّل نسختي" : "Save & edit my copy"}
                    </button>
                    {uid === tpl.author_id && (
                      <button
                        onClick={() => onDelete(tpl)}
                        title={ar ? "حذف القالب" : "Delete template"}
                        className="rounded-full border border-border/60 p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </MarketingLayout>
  );
}
