import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Sparkles, Trash2, Wand2, Search } from "lucide-react";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StaticCardPreview } from "@/components/studio/StaticCardPreview";
import { CardPreview } from "@/components/CardPreview";
import { cardDesignValues } from "@/components/DesignPreview";
import { demoCards } from "@/lib/demo-cards";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@/lib/nav";
import { SITE_ORIGIN, SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/config";
import { useAccount } from "@/lib/account";
import { useIsAdmin } from "@/lib/admin";
import { audienceLabel } from "@/components/CommunityTemplates";
import { UseTemplateDialog } from "@/components/UseTemplateDialog";
import { UseTemplateWorkspaceDialog } from "@/components/UseTemplateWorkspaceDialog";

import { FavoriteTemplateButton } from "@/components/FavoriteTemplateButton";
import {
  applyTemplateToCard,
  deleteTemplate,
  listFavoriteTemplates,
  listPopularTemplates,
  listMyTemplates,
  listPublicTemplates,
  useTemplate,
  type DesignTemplate,
  type TemplateAudience,
  type TemplateTarget,
} from "@/lib/templates";
import { SAMPLE_VALUES, type StudioDoc } from "@/lib/studio/types";
import { recolorDesign, docAccent } from "@/lib/studio/recolor";
import { TemplateColorSwatches } from "@/components/TemplateColorSwatches";
import { tx, txErr } from "@/lib/tx";

export const Route = createFileRoute("/$lang/templates")({
  head: ({ params }) => {
    const lang = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
    const url = `${SITE_ORIGIN}/${lang}/templates`;
    const isAr = lang === "ar";
    const title = tx("Card Template Gallery — Designs Shared by Cardixn Designers", lang);
    const description = tx("Browse digital business card templates shared by designers, save any template as your own copy and edit it freely in the Studio.", lang);
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
        ...SUPPORTED_LOCALES.map((l) => ({
          rel: "alternate",
          hrefLang: l,
          href: `${SITE_ORIGIN}/${l}/templates`,
        })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}/en/templates` },
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
  const [tab, setTab] = useState<"all" | "builtin" | "mine" | "saved">("all");
  const [audience, setAudience] = useState<TemplateAudience | "all">("all");
  const [pending, setPending] = useState<DesignTemplate | null>(null);
  /** Per-template accent chosen from the colour dots (template id → hex). */
  const [tint, setTint] = useState<Record<string, string>>({});
  const { data: account } = useAccount();
  /** Platform owner/admin may fix any published template in place. */
  const isAdmin = useIsAdmin(uid);
  /** Active context decides the destination: inside a workspace → workspace, otherwise personal. */
  const activeWorkspace =
    account?.accountType === "company"
      ? (account.managed.find((m) => m.company_id === account.activeCompanyId) ??
        account.managed[0] ??
        null)
      : null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null));
  }, []);

  /** The user's main card — template previews are filled with this data so they see the real result. */
  const { data: myCard } = useQuery({
    queryKey: ["preview-card", uid],
    queryFn: async () => {
      const { data } = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", uid!)
        .order("is_published", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(20);
      const rows = data ?? [];
      // Prefer the personal main card, then any published card, then anything.
      return (
        rows.find((c) => !c.company_id && c.is_published) ??
        rows.find((c) => !c.company_id) ??
        rows.find((c) => c.is_published) ??
        rows[0] ??
        null
      );
    },
    enabled: !!uid,
    staleTime: 60_000,
  });

  /**
   * Preview data: the real card fields, with the studio's default sample text
   * filling any field the user left empty (and everything when there is no card).
   */
  const previewValues = (() => {
    const base: Record<string, string> = { ...SAMPLE_VALUES };
    if (!myCard) return base;
    const real = cardDesignValues(myCard);
    for (const [k, v] of Object.entries(real)) if (v && v.trim()) base[k] = v;
    return base;
  })();


  const { data: templates = [], isLoading } = useQuery({
    queryKey:
      tab === "mine"
        ? ["my-templates", uid]
        : tab === "saved"
          ? ["favorite-templates", uid]
          : ["public-templates", search, audience],
    queryFn: () =>
      tab === "mine"
        ? listMyTemplates(uid!)
        : tab === "saved"
          ? listFavoriteTemplates(uid!)
          : listPublicTemplates(search, audience),
    enabled: tab === "all" || !!uid,
  });

  /** When the favourites tab is empty we suggest the most-liked community designs. */
  const { data: suggestions = [] } = useQuery({
    queryKey: ["popular-templates"],
    queryFn: () => listPopularTemplates(24),
    enabled: tab === "saved" && !isLoading && templates.length === 0,
    staleTime: 60_000,
  });

  function currentTarget(): TemplateTarget {
    const ws = activeWorkspace;
    if (!ws) return { kind: "personal" };
    return {
      kind: "company",
      companyId: ws.company.id,
      companyName: ws.company.name,
      companySlug: ws.company.slug,
      accent: ws.company.brand_primary,
    };
  }

  /** The template design with the picked accent applied (or the original design). */
  function tintedDoc(tpl: DesignTemplate): StudioDoc {
    const doc = tpl.design as unknown as StudioDoc;
    const c = tint[tpl.id];
    return c ? recolorDesign(doc, docAccent(doc), c) : doc;
  }

  function onUse(tpl: DesignTemplate) {
    if (!uid) {
      navigate({ to: "/auth" });
      return;
    }
    setPending({ ...tpl, design: tintedDoc(tpl) as unknown as DesignTemplate["design"] });
  }

  /** Creates a brand-new card from the pending template. */
  async function onCreateFromTemplate() {
    const tpl = pending;
    if (!tpl) return;
    setBusyId(tpl.id);
    try {
      const target = currentTarget();
      const cardId = await useTemplate(tpl, target);
      toast.success(
        target.kind === "company"
          ? tx("New card added to the workspace")
          : tx("New card created with this design"),
      );
      setPending(null);
      // Personal users land on the simple card editor; workspace designers go to the Studio.
      navigate({
        to: target.kind === "company" ? "/studio/$id" : "/cards/$id",
        params: { id: cardId },
      });
    } catch (e) {
      toast.error(txErr(e));
    } finally {
      setBusyId(null);
    }
  }

  /** Replaces an existing card's design with the pending template. */
  async function onApplyToCard(cardId: string) {
    const tpl = pending;
    if (!tpl) return;
    setBusyId(tpl.id);
    try {
      await applyTemplateToCard(tpl, cardId);
      await qc.invalidateQueries({ queryKey: ["template-target-cards"] });
      toast.success(tx("Design applied to the card"));
      setPending(null);
      navigate({ to: activeWorkspace ? "/studio/$id" : "/cards/$id", params: { id: cardId } });
    } catch (e) {
      toast.error(txErr(e));
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
      toast.error(txErr(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <MarketingLayout>
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-16">
        <div className="mb-7 text-center sm:mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-[11px] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            {tx("Template gallery")}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {tx("Templates designed by the community")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {tx("Save any template as your own copy and edit it freely in the Studio — the original stays exactly as its designer made it.")}
          </p>
        </div>

        <div className="mx-auto mb-4 flex w-fit flex-wrap items-center justify-center gap-1 rounded-full border border-border/60 p-1">
          {(uid
            ? (["all", "builtin", "saved", "mine"] as const)
            : (["all", "builtin"] as const)
          ).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={
                "rounded-full px-4 py-1.5 text-xs font-semibold transition " +
                (tab === k
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {k === "all"
                ? tx("Designer templates")
                : k === "builtin"
                  ? tx("Ready-made styles")
                  : k === "saved"
                    ? tx("Favourites")
                    : tx("My templates")}
            </button>
          ))}
        </div>

        <div className={tab === "all" ? "" : "hidden"}>
          <div className="mx-auto mb-4 flex max-w-md items-center gap-2 rounded-full border border-border/60 px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx("Search templates…")}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mx-auto mb-4 flex w-fit flex-wrap items-center justify-center gap-1 rounded-full border border-border/60 p-1">
            {(["all", "personal", "employee", "mixed"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setAudience(k)}
                className={
                  "rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition " +
                  (audience === k
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {k === "all" ? (tx("All")) : audienceLabel(k, ar)}
              </button>
            ))}
          </div>

          {uid && (
            <div className="mx-auto mb-8 flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/60 px-4 py-2.5 text-[11px]">
              <span className="text-muted-foreground">
                {tx("Will be saved into:")}
              </span>
              <span className="font-semibold">
                {activeWorkspace
                  ? activeWorkspace.company.name
                  : tx("My personal profile")}
              </span>
            </div>
          )}
        </div>

        {myCard && (
          <p className="mx-auto mb-6 w-fit rounded-full border border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
            {tx("Previewed with your card")}:{" "}
            <span className="font-semibold text-foreground">{myCard.name}</span>
          </p>
        )}

        {tab === "builtin" ? (
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {demoCards.map((card) => (
              <li
                key={card.template}
                className="group rounded-3xl border border-border/60 bg-card/50 p-4 transition hover:border-accent/60"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {card.template}
                  </span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: card.accent_color }}
                  />
                </div>
                <div className="flex justify-center transition group-hover:scale-[1.02]">
                  <CardPreview
                    card={
                      myCard
                        ? {
                            ...myCard,
                            design: null,
                            template: card.template,
                            accent_color: myCard.accent_color || card.accent_color,
                          }
                        : card
                    }
                    size="md"
                  />
                </div>
                <button
                  onClick={() => navigate({ to: uid ? "/cards/new" : "/auth" })}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {tx("Create a card in this style")}
                </button>
              </li>
            ))}
          </ul>
        ) : isLoading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 && !(tab === "saved" && suggestions.length > 0) ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            {tab === "saved"
              ? tx("No saved templates yet — tap the heart on any template to keep it here.")
              : tab === "mine"
                ? ar
                  ? 'لم تنشر أي قالب بعد — افتح تصميمك في الاستوديو واضغط "نشر كقالب".'
                  : 'You haven\'t published a template yet — open a design in the Studio and hit "Publish as template".'
                : tx("No templates published yet.")}
          </p>
        ) : (
          <>
            {tab === "saved" && templates.length === 0 && (
              <p className="mb-5 text-center text-xs text-muted-foreground">
                {tx("No favourites yet — here are the most-liked designs, tap the heart to keep one.")}
              </p>
            )}
            <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {(tab === "saved" && templates.length === 0 ? suggestions : templates).map((tpl) => (
                <li
                  key={tpl.id}
                  className="group overflow-hidden rounded-3xl border border-border/60 bg-card/50 p-4 transition hover:border-accent/60"
                >
                  <div className="grid place-items-center overflow-hidden rounded-2xl bg-muted/20 p-3">
                    <StaticCardPreview doc={tintedDoc(tpl)} width={240} values={previewValues} />
                  </div>
                  <TemplateColorSwatches
                    ar={ar}
                    value={tint[tpl.id] ?? null}
                    onChange={(c) =>
                      setTint((prev) => {
                        const next = { ...prev };
                        if (c) next[tpl.id] = c;
                        else delete next[tpl.id];
                        return next;
                      })
                    }
                  />
                  <div className="mt-4">
                    <h2 className="flex items-center gap-2 truncate text-sm font-semibold">
                      <span className="truncate">{tpl.title}</span>
                      {!tpl.is_public && (
                        <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                          {tx("Private")}
                        </span>
                      )}
                    </h2>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {tpl.author_name
                        ? ar
                          ? `بواسطة ${tpl.author_name}`
                          : `by ${tpl.author_name}`
                        : ""}
                      {tpl.use_count > 0 ? ` · ${tpl.use_count} ${tx("uses")}` : ""}
                    </p>
                    {tpl.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {tpl.description}
                      </p>
                    )}
                    {tpl.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tpl.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
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
                        {busyId === tpl.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="h-3.5 w-3.5" />
                        )}
                        {tx("Use template")}
                      </button>
                      <FavoriteTemplateButton
                        templateId={tpl.id}
                        userId={uid}
                        ar={ar}
                        likeCount={(tpl as { like_count?: number }).like_count ?? 0}
                      />
                      {(uid === tpl.author_id || isAdmin) && (
                        <button
                          onClick={() => navigate({ to: "/studio/tpl/$id", params: { id: tpl.id } })}
                          title={tx("Edit template design")}
                          className="rounded-full border border-border/60 p-2 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {uid === tpl.author_id && (
                        <button
                          onClick={() => onDelete(tpl)}
                          title={tx("Delete template")}
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
          </>
        )}
      </section>

      {activeWorkspace ? (
        <UseTemplateWorkspaceDialog
          tpl={pending}
          open={!!pending}
          onOpenChange={(v) => !v && setPending(null)}
          company={activeWorkspace.company}
          canManage
          busy={!!busyId}
          onCreateCard={onCreateFromTemplate}
          onSaved={() => {
            setPending(null);
            navigate({
              to: "/co/$slug/templates",
              params: { slug: activeWorkspace.company.slug },
            });
          }}
        />
      ) : (
        <UseTemplateDialog
          tpl={pending}
          open={!!pending}
          onOpenChange={(v) => !v && setPending(null)}
          ar={ar}
          userId={uid}
          companyId={null}
          busy={!!busyId}
          onApply={onApplyToCard}
          onCreate={onCreateFromTemplate}
        />
      )}

    </MarketingLayout>
  );
}
