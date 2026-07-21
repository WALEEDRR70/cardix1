import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CardForm, type CardFormData } from "@/components/CardForm";
import { useI18n } from "@/lib/i18n";
import { MobileShell, PageHeader, BottomSheet } from "@/components/MobileShell";
import { BarChart3, Download, Share2, Copy, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/cards/$id")({
  head: () => ({ meta: [{ title: "Edit card — Cardix" }] }),
  component: EditCard,
  errorComponent: () => <NotFoundView />,
  notFoundComponent: () => <NotFoundView />,
});

function NotFoundView() {
  return (
    <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Card not found.</p>
        <Link to="/dashboard" className="mt-3 inline-block text-xs font-semibold text-primary">← Dashboard</Link>
      </div>
    </div>
  );
}

function EditCard() {
  const { t } = useI18n();
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [shareOpen, setShareOpen] = useState(false);

  const { data: card, isLoading } = useQuery({
    queryKey: ["card", id, user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!card) return <NotFoundView />;

  const initial: CardFormData = {
    name: card.name, slug: card.slug, title: card.title ?? "", company: card.company ?? "",
    bio: card.bio ?? "", phone: card.phone ?? "", whatsapp: card.whatsapp ?? "",
    email: card.email ?? "", website: card.website ?? "", address: card.address ?? "",
    avatar_url: card.avatar_url ?? "",
    accent_color: card.accent_color, template: card.template || "luxury", is_published: card.is_published,
    socials: (card.socials as Record<string, string>) ?? {},
  };

  async function onSubmit(d: CardFormData): Promise<void> {
    const { error } = await supabase.from("cards").update(d).eq("id", id).eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["card", id, user.id] });
    qc.invalidateQueries({ queryKey: ["cards"] });
    toast.success("Saved");
  }

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/c/${card.slug}` : `/c/${card.slug}`;

  async function nativeShare() {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try { await nav.share({ title: card!.name, url: publicUrl }); return; } catch { /* cancelled */ }
    }
    navigator.clipboard.writeText(publicUrl);
    toast.success(t.linkCopied);
  }


  function downloadQr() {
    const svg = document.querySelector<SVGSVGElement>("#card-qr svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024; canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 1024, 1024);
      ctx.drawImage(img, 32, 32, 960, 960);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${card!.slug}-qr.png`;
      a.click();
    };
    img.src = url;
  }

  return (
    <MobileShell
      topBar={
        <PageHeader
          title={t.editCard}
          subtitle={"/c/" + card.slug}
          back="/dashboard"
          right={
            <>
              <Link to="/cards/$id/analytics" params={{ id }} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground" aria-label={t.analytics}>
                <BarChart3 className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setShareOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-full text-accent-foreground"
                style={{ background: "var(--gradient-gold)" }}
                aria-label={t.share}
              >
                <Share2 className="h-4 w-4" />
              </button>
            </>
          }
        />
      }
    >
      <div className="px-5 lg:px-8">
        <CardForm initial={initial} onSubmit={onSubmit} submitLabel={t.save} />
      </div>

      <BottomSheet open={shareOpen} onClose={() => setShareOpen(false)} title={t.shareCard}>
        <div id="card-qr" className="mx-auto mt-2 grid w-fit place-items-center rounded-3xl bg-white p-5">
          <QRCodeSVG value={publicUrl} size={200} fgColor="#0a0a0a" bgColor="#ffffff" level="M" />
        </div>
        <p className="mt-4 truncate rounded-xl bg-secondary px-4 py-2 text-center text-xs text-muted-foreground">{publicUrl}</p>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <SheetAction icon={<Share2 className="h-5 w-5" />} label={t.share} onClick={nativeShare} />
          <SheetAction icon={<Copy className="h-5 w-5" />} label={t.copyLink} onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success(t.linkCopied); }} />
          <SheetAction icon={<Radio className="h-5 w-5" />} label="NFC" onClick={writeNfc} />
          <SheetAction icon={<Download className="h-5 w-5" />} label="QR" onClick={downloadQr} />
        </div>
        <a href={`/c/${card.slug}`} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm">
          <ExternalLink className="h-4 w-4" /> {t.view}
        </a>
        <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <QrCode className="h-3 w-3" /> {card.view_count} {t.totalViews.toLowerCase()}
        </div>
      </BottomSheet>
    </MobileShell>
  );
}

function SheetAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass flex flex-col items-center gap-1.5 rounded-2xl p-3 text-[11px] font-medium hover:bg-card"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">{icon}</span>
      {label}
    </button>
  );
}
