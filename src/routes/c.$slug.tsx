import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardPreview, ContactActions } from "@/components/CardPreview";
import { Download, QrCode as QrIcon, BookmarkPlus, Check, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { BottomSheet } from "@/components/MobileShell";

export const Route = createFileRoute("/c/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Cardix` },
      { name: "description", content: "A digital business card on Cardix." },
      { property: "og:title", content: `${params.slug} — Cardix` },
      { property: "og:description", content: "Digital business card by Cardix." },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: PublicCard,
  errorComponent: () => <NotFoundView />,
  notFoundComponent: () => <NotFoundView />,
});

function NotFoundView() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background">
      <p className="text-sm text-muted-foreground">Card not found.</p>
    </div>
  );
}

function PublicCard() {
  const { slug } = Route.useParams();
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const { data: card } = useQuery({
    queryKey: ["public-card", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  useEffect(() => {
    if (!card) return;
    supabase.from("card_events").insert({ card_id: card.id, event_type: "view" });
  }, [card]);

  if (!card) return <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">Loading…</div>;

  function vcard() {
    const vcf = [
      "BEGIN:VCARD", "VERSION:3.0",
      `FN:${card!.name}`,
      card!.title && `TITLE:${card!.title}`,
      card!.company && `ORG:${card!.company}`,
      card!.phone && `TEL;TYPE=CELL:${card!.phone}`,
      card!.email && `EMAIL:${card!.email}`,
      card!.website && `URL:${card!.website}`,
      card!.address && `ADR:;;${card!.address};;;;`,
      "END:VCARD",
    ].filter(Boolean).join("\n");
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${card!.slug}.vcf`; a.click();
    URL.revokeObjectURL(url);
    supabase.from("card_events").insert({ card_id: card!.id, event_type: "save" });
  }

  async function saveToVault() {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) { window.location.href = `/auth?next=/c/${slug}`; return; }
    setSavingCard(true);
    const { error } = await supabase.from("saved_cards").insert({
      user_id: userRes.user.id, source: "public", source_card_id: card!.id,
      name: card!.name, title: card!.title, company: card!.company, bio: card!.bio,
      phone: card!.phone, whatsapp: card!.whatsapp, email: card!.email,
      address: card!.address, website: card!.website, avatar_url: card!.avatar_url,
    });
    setSavingCard(false);
    if (error) { toast.error(error.message); return; }
    await supabase.from("card_events").insert({ card_id: card!.id, event_type: "save" });
    setSaved(true);
    toast.success(t.savedToVault);
  }

  async function nativeShare() {
    const publicUrl = window.location.href;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) { try { await nav.share({ title: card!.name, url: publicUrl }); return; } catch { /* noop */ } }
    navigator.clipboard.writeText(publicUrl);
    toast.success(t.linkCopied);
  }

  const publicUrl = typeof window !== "undefined" ? window.location.href : `/c/${slug}`;

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-[520px] overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />

      <div className="safe-top relative z-10 flex items-center justify-between px-5 pb-2">
        <a href="/" className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          Cardix
        </a>
        <button onClick={nativeShare} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card/70 text-muted-foreground backdrop-blur hover:text-foreground">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <main className="relative z-10 flex flex-col items-center gap-6 px-5 pb-10 pt-4">
        <div className="float-slow">
          <CardPreview card={card} size="lg" />
        </div>

        {card.bio && (
          <p className="glass max-w-md rounded-2xl px-5 py-4 text-center text-sm text-foreground/80">{card.bio}</p>
        )}

        <div className="w-full max-w-md">
          <ContactActions card={card} />
        </div>

        <div className="mt-2 grid w-full max-w-md grid-cols-3 gap-2">
          <ActionButton onClick={vcard} icon={<Download className="h-4 w-4" />} label={t.saveContact} primary />
          <ActionButton onClick={() => setQrOpen(true)} icon={<QrIcon className="h-4 w-4" />} label="QR" />
          <ActionButton onClick={saveToVault} disabled={saved || savingCard} icon={saved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />} label={saved ? t.savedToVault : t.saveToVault} />
        </div>

        <a href="/" className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          Powered by Cardix
        </a>
      </main>

      <BottomSheet open={qrOpen} onClose={() => setQrOpen(false)} title={t.scan}>
        <div className="mx-auto mt-2 grid w-fit place-items-center rounded-3xl bg-white p-5">
          <QRCodeSVG value={publicUrl} size={220} fgColor="#0a0a0a" bgColor="#ffffff" level="M" />
        </div>
        <p className="mt-4 truncate rounded-xl bg-secondary px-4 py-2 text-center text-xs text-muted-foreground">{publicUrl}</p>
      </BottomSheet>
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled, primary }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        (primary
          ? "text-accent-foreground shadow-glow"
          : "glass text-foreground") +
        " flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[11px] font-semibold disabled:opacity-60"
      }
      style={primary ? { background: "var(--gradient-gold)" } : undefined}
    >
      {icon}
      <span className="line-clamp-1">{label}</span>
    </button>
  );
}
