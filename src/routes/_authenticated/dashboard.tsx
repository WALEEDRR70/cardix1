import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { CardPreview } from "@/components/CardPreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Eye, Sparkles, Trash2, Pencil, QrCode, X, Copy, Share2, ChevronLeft, ChevronRight, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { QRCodeSVG } from "qrcode.react";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — Cardix" },
      { name: "description", content: "Manage your Cardix digital business cards." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [qrSlug, setQrSlug] = useState<string | null>(null);

  const { data: cards } = useQuery({
    queryKey: ["cards", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: saved } = useQuery({
    queryKey: ["saved_cards", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_cards")
        .select("id, name, title, company, avatar_url, accent_color, template, source_card_id, notes, cards:source_card_id(slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("cards").delete().eq("id", deleteId);
    setDeleting(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cards"] });
    toast.success(t.deleted);
    setDeleteId(null);
  }

  const totalViews = cards?.reduce((a, c) => a + (c.view_count ?? 0), 0) ?? 0;
  const hasCards = !!cards && cards.length > 0;

  return (
    <MobileShell topBar={<PageHeader title={t.brand} subtitle={user.email ?? undefined} right={<ThemeToggle compact />} />}>
      <div className="px-4 lg:px-8">
        {hasCards ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <StatTile label={t.myCards} value={cards!.length} />
              <StatTile label={t.totalViews} value={totalViews} />
              <StatTile label={t.templates.luxury} value={new Set(cards!.map((c) => c.template)).size} icon={<Sparkles className="h-3.5 w-3.5" />} />
            </div>

            {/* Slider — my cards */}
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.myCards}</h2>
                <Link to="/cards/new" className="text-[11px] font-semibold text-primary">+ {t.createCard}</Link>
              </div>
              <CardSlider
                cards={cards!}
                onQr={(slug) => setQrSlug(slug)}
                onEdit={(id) => navigate({ to: "/cards/$id", params: { id } })}
                onDelete={(id) => setDeleteId(id)}
                onOpen={(slug) => navigate({ to: "/c/$slug", params: { slug } })}
              />
            </section>

            {/* Saved cards */}
            <section className="mt-10">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.vault}</h2>
                {saved && saved.length > 0 && (
                  <Link to="/vault" className="text-[11px] font-semibold text-primary">{saved.length}</Link>
                )}
              </div>
              {saved && saved.length > 0 ? (
                <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
                  {saved.map((s: any) => {
                    const slug = s.cards?.slug as string | undefined;
                    const dest = slug ? { to: "/c/$slug" as const, params: { slug } } : { to: "/vault/$id" as const, params: { id: s.id } };
                    return (
                      <Link
                        key={s.id}
                        {...dest}
                        className="glass card-lift group flex items-center gap-3 rounded-2xl p-2.5"
                      >
                        <div className="grid h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[15px] font-semibold text-foreground/70">
                              {(s.name ?? "?").slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold">{s.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{s.title || s.company || ""}</p>
                          {s.notes && (
                            <p className="mt-0.5 line-clamp-1 text-[10.5px] text-muted-foreground/80">{s.notes}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Link
                  to="/vault"
                  className="glass flex flex-col items-center gap-2 rounded-2xl p-6 text-center"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/60 text-foreground/70">
                    <BookmarkPlus className="h-5 w-5" />
                  </div>
                  <p className="text-[12px] text-muted-foreground">{t.emptyVault}</p>
                </Link>
              )}
            </section>
          </>
        ) : (
          <EmptyHome t={t} />
        )}
      </div>
      <ConfirmDeleteDialog
        open={!!deleteId}
        loading={deleting}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        onConfirm={() => { void confirmDelete(); }}
      />
      <QrDialog slug={qrSlug} onClose={() => setQrSlug(null)} />
    </MobileShell>
  );
}

function CardSlider({
  cards,
  onQr,
  onEdit,
  onDelete,
  onOpen,
}: {
  cards: any[];
  onQr: (slug: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (slug: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth;
      if (!w) return;
      const idx = Math.round(el.scrollLeft / w);
      setActive(Math.min(cards.length - 1, Math.max(0, idx)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [cards.length]);

  function scrollTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {cards.map((c) => (
          <div key={c.id} className="w-full shrink-0 snap-center px-1">
            <div className="relative mx-auto flex max-w-md justify-center">
              <button
                onClick={() => onOpen(c.slug)}
                className="block w-full"
                aria-label={c.name}
              >
                <CardPreview card={c} size="lg" />
              </button>
              <button
                onClick={() => onEdit(c.id)}
                className="glass absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-foreground"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onQr(c.slug)}
                className="glass absolute right-3 top-14 grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-foreground"
                aria-label="QR"
              >
                <QrCode className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="glass absolute right-3 top-[100px] grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {cards.length > 1 && (
        <>
          <button
            onClick={() => scrollTo(Math.max(0, active - 1))}
            disabled={active === 0}
            className="glass absolute left-1 top-1/2 hidden -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-foreground/80 disabled:opacity-30 md:grid"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollTo(Math.min(cards.length - 1, active + 1))}
            disabled={active === cards.length - 1}
            className="glass absolute right-1 top-1/2 hidden -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-foreground/80 disabled:opacity-30 md:grid"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Card ${i + 1}`}
                className={"h-1.5 rounded-full transition-all " + (i === active ? "w-6 bg-primary" : "w-1.5 bg-foreground/25")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QrDialog({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  if (!slug) return null;
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/c/${slug}`;
  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "Cardix", url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Copied");
    }
  }
  async function copy() {
    await navigator.clipboard.writeText(url);
    toast.success("Copied");
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="glass-strong relative w-full max-w-sm rounded-3xl border border-border/40 p-6" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-secondary/60 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mx-auto grid w-fit rounded-2xl bg-white p-4">
          <QRCodeSVG
            value={url}
            size={220}
            fgColor="#0a0a0a"
            bgColor="#ffffff"
            level="H"
            marginSize={0}
            imageSettings={{ src: logoAsset.url, height: 40, width: 40, excavate: true }}
          />
        </div>
        <p dir="ltr" className="mt-4 truncate text-center text-[12px] text-muted-foreground">{url}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={copy} className="glass flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium">
            <Copy className="h-4 w-4" /> Copy
          </button>
          <button
            onClick={share}
            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}


function EmptyHome({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <div className="glass mt-4 flex flex-col items-center gap-4 rounded-3xl p-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl text-accent-foreground" style={{ background: "var(--gradient-gold)" }}>
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <p className="text-lg font-semibold">{t.createCard}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.noCards}</p>
      </div>
      <Link
        to="/cards/new"
        className="rounded-full px-5 py-2.5 text-sm font-semibold text-accent-foreground"
        style={{ background: "var(--gradient-gold)" }}
      >
        {t.createCard}
      </Link>
    </div>
  );
}

function StatTile({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-2.5 lg:p-3">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground lg:text-[10px]">
        {icon} {label}
      </div>
      <p className="mt-0.5 text-xl font-semibold tracking-tight lg:text-2xl">{value}</p>
    </div>
  );
}
