import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader } from "@/components/MobileShell";
import { CardPreview } from "@/components/CardPreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Eye, Sparkles, Trash2, Pencil, QrCode, X, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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
  const primary = cards?.[0];

  return (
    <MobileShell topBar={<PageHeader title={t.brand} subtitle={user.email ?? undefined} right={<ThemeToggle compact />} />}>
      <div className="px-4 lg:px-8">
        {/* Hero row */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          {/* Featured card */}
          <div className="order-1">
            {primary ? (
              <div className="relative">
                <div className="absolute -inset-8 rounded-[2.5rem] opacity-40 blur-2xl" style={{ background: "var(--gradient-mesh)" }} />
                <Link to="/c/$slug" params={{ slug: primary.slug }} className="relative flex justify-center lg:justify-start">
                  <CardPreview card={primary} size="lg" />
                </Link>
                <Link
                  to="/cards/$id"
                  params={{ id: primary.id }}
                  className="glass absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setQrSlug(primary.slug)}
                  className="glass absolute right-3 top-14 grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-foreground"
                  aria-label="QR"
                >
                  <QrCode className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <EmptyHome t={t} />
            )}
          </div>

          {/* Stats + quick actions (desktop side column) */}
          {cards && cards.length > 0 && (
            <div className="order-2 space-y-3">
              <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                <StatTile label={t.myCards} value={cards.length} />
                <StatTile label={t.totalViews} value={totalViews} />
                <StatTile label={t.templates.luxury} value={new Set(cards.map((c) => c.template)).size} icon={<Sparkles className="h-3.5 w-3.5" />} />
              </div>
              <Link
                to="/cards/new"
                className="hidden lg:flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-accent-foreground shadow-glow"
                style={{ background: "var(--gradient-gold)" }}
              >
                + {t.createCard}
              </Link>
            </div>
          )}
        </div>

        {/* All cards */}
        {cards && cards.length > 1 && (
          <section className="mt-10 lg:mt-14">
            <div className="mb-4 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground lg:text-base lg:tracking-normal lg:normal-case lg:text-foreground">{t.myCards}</h2>
              <span className="text-[11px] text-muted-foreground">{cards.length}</span>
            </div>
            <div className="grid gap-2 lg:gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {cards.slice(1).map((c) => (
                <div key={c.id} className="glass card-lift group flex items-center gap-3 rounded-2xl p-2.5 lg:p-4">
                  <Link to="/c/$slug" params={{ slug: c.slug }} className="grid h-12 w-20 shrink-0 overflow-hidden rounded-lg lg:h-16 lg:w-28">
                    <MiniCard card={c} />
                  </Link>
                  <Link to="/c/$slug" params={{ slug: c.slug }} className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold lg:text-sm">{c.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground lg:text-xs">{c.title || c.company || "/c/" + c.slug}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Eye className="h-3 w-3" /> {c.view_count ?? 0}
                    </p>
                  </Link>
                  <button
                    onClick={() => setQrSlug(c.slug)}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                    aria-label="QR"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    to="/cards/$id"
                    params={{ id: c.id }}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    aria-label={t.delete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </section>
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


function MiniCard({ card }: { card: { name: string; template?: string | null; accent_color: string; title?: string | null } }) {
  return <CardPreview card={{ ...card, accent_color: card.accent_color }} size="sm" />;
}
