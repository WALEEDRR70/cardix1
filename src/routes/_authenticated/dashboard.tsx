import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { CardPreview } from "@/components/CardPreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Eye, Sparkles, Trash2, Pencil, QrCode, X, Copy, Share2, ChevronLeft, ChevronRight, BookmarkPlus, Layers, Rows3, MoreHorizontal } from "lucide-react";
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

            {/* My cards — stack or list */}
            <section className="mt-6">
              <MyCards
                cards={cards!}
                onQr={(slug) => setQrSlug(slug)}
                onEdit={(id) => navigate({ to: "/cards/$id", params: { id } })}
                onDelete={(id) => setDeleteId(id)}
                onOpen={(slug) => navigate({ to: "/c/$slug", params: { slug } })}
                t={t}
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
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {saved.map((s: any) => {
                    const slug = s.cards?.slug as string | undefined;
                    const dest = slug ? { to: "/c/$slug" as const, params: { slug } } : { to: "/vault/$id" as const, params: { id: s.id } };
                    return (
                      <Link
                        key={s.id}
                        {...dest}
                        className="group block"
                      >
                        <CardPreview card={s as any} size="xs" />
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

type CardRow = {
  id: string;
  slug: string;
  name: string;
  [k: string]: unknown;
};

type CardActions = {
  cards: CardRow[];
  onQr: (slug: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (slug: string) => void;
};

function MyCards({ cards, onQr, onEdit, onDelete, onOpen, t }: CardActions & { t: ReturnType<typeof useI18n>["t"] }) {
  const [mode, setMode] = useState<"stack" | "list">("stack");
  // rotation offset: current top card index into `cards`
  const [offset, setOffset] = useState(0);
  const n = cards.length;

  // Reset offset if cards list changes size
  useEffect(() => {
    setOffset((o) => (n === 0 ? 0 : o % n));
  }, [n]);

  const ordered = n > 0 ? Array.from({ length: n }, (_, i) => cards[(offset + i) % n]) : [];

  function next() { setOffset((o) => (o + 1) % Math.max(1, n)); }
  function prev() { setOffset((o) => (o - 1 + n) % Math.max(1, n)); }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t.myCards}</h2>
        <div className="flex items-center gap-2">
          <div className="glass flex items-center rounded-full p-0.5">
            <button
              onClick={() => setMode("stack")}
              aria-label="Stack view"
              className={"grid h-7 w-7 place-items-center rounded-full transition " + (mode === "stack" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMode("list")}
              aria-label="List view"
              className={"grid h-7 w-7 place-items-center rounded-full transition " + (mode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              <Rows3 className="h-3.5 w-3.5" />
            </button>
          </div>
          <Link to="/cards/new" className="text-[11px] font-semibold text-primary">+ {t.createCard}</Link>
        </div>
      </div>

      {mode === "stack" ? (
        <CardStack
          ordered={ordered}
          onNext={next}
          onPrev={prev}
          onQr={onQr}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
          total={n}
          activeIndex={offset}
          setActiveIndex={(i) => setOffset(i)}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {cards.map((c) => (
            <div key={c.id} className="relative mx-auto w-full max-w-md">
              <button onClick={() => onOpen(c.slug)} className="block w-full" aria-label={c.name}>
                <CardPreview card={c as any} size="lg" />
              </button>
              <CardActionsMenu
                onEdit={() => onEdit(c.id)}
                onQr={() => onQr(c.slug)}
                onDelete={() => onDelete(c.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CardStack({
  ordered,
  onNext,
  onPrev,
  onQr,
  onEdit,
  onDelete,
  onOpen,
  total,
  activeIndex,
  setActiveIndex,
}: {
  ordered: CardRow[];
  onNext: () => void;
  onPrev: () => void;
  onQr: (slug: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (slug: string) => void;
  total: number;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}) {
  const [drag, setDrag] = useState(0);
  const [animating, setAnimating] = useState<null | "left" | "right">(null);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);
  const THRESHOLD = 80;
  // Show up to 3 behind card layers
  const visible = ordered.slice(0, Math.min(4, ordered.length));

  function onPointerDown(e: React.PointerEvent) {
    if (animating) return;
    startX.current = e.clientX;
    moved.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 6) moved.current = true;
    setDrag(dx);
  }
  function onPointerUp() {
    if (startX.current == null) return;
    const dx = drag;
    startX.current = null;
    if (Math.abs(dx) > THRESHOLD && total > 1) {
      const dir = dx < 0 ? "left" : "right";
      setAnimating(dir);
      setTimeout(() => {
        if (dir === "left") onNext(); else onPrev();
        setDrag(0);
        setAnimating(null);
      }, 220);
    } else {
      setDrag(0);
    }
  }

  return (
    <div className="relative">
      <div
        className="relative mx-auto w-full max-w-md select-none"
        style={{ height: "clamp(220px, 58vw, 300px)" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {visible.map((c, i) => {
          const isTop = i === 0;
          const behind = i;
          // stack effect
          const scale = 1 - behind * 0.05;
          const translateY = behind * 12;
          const opacity = behind === 0 ? 1 : 1 - behind * 0.15;
          const zIndex = 50 - behind;

          let transform = `translateY(${translateY}px) scale(${scale})`;
          let transition = "transform 220ms cubic-bezier(.2,.8,.2,1), opacity 220ms";
          if (isTop) {
            if (animating) {
              const off = animating === "left" ? -600 : 600;
              transform = `translateX(${off}px) rotate(${animating === "left" ? -20 : 20}deg)`;
            } else {
              const rot = drag / 20;
              transform = `translateX(${drag}px) rotate(${rot}deg)`;
              transition = drag === 0 ? transition : "none";
            }
          }

          return (
            <div
              key={c.id + "-" + i}
              className="absolute inset-x-0 top-0 mx-auto"
              style={{
                zIndex,
                transform,
                transition,
                opacity,
                touchAction: "pan-y",
              }}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { if (!moved.current && isTop) onOpen(c.slug); }}
                  className="block w-full cursor-grab active:cursor-grabbing"
                  aria-label={c.name}
                  tabIndex={isTop ? 0 : -1}
                >
                  <CardPreview card={c as any} size="lg" />
                </button>
                {isTop && (
                  <CardActionsMenu
                    onEdit={() => onEdit(c.id)}
                    onQr={() => onQr(c.slug)}
                    onDelete={() => onDelete(c.id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={onPrev}
            className="glass absolute left-1 top-[45%] hidden -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-foreground/80 md:grid"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNext}
            className="glass absolute right-1 top-[45%] hidden -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full text-foreground/80 md:grid"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Card ${i + 1}`}
                className={"h-1.5 rounded-full transition-all " + (i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/25")}
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

function CardActionsMenu({ onEdit, onQr, onDelete }: { onEdit: () => void; onQr: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute end-3 top-3 z-20" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="glass-strong grid h-8 w-8 place-items-center rounded-full text-foreground/80 backdrop-blur transition hover:text-foreground"
        aria-label="Actions"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="glass-strong absolute end-0 mt-2 flex min-w-[140px] flex-col gap-0.5 rounded-2xl p-1.5 shadow-luxe backdrop-blur-xl">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-foreground/90 transition hover:bg-white/10"
          >
            <Pencil className="h-3.5 w-3.5" /> <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onQr(); }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-foreground/90 transition hover:bg-white/10"
          >
            <QrCode className="h-3.5 w-3.5" /> <span>QR</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-destructive transition hover:bg-destructive/15"
          >
            <Trash2 className="h-3.5 w-3.5" /> <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
