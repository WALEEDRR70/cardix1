import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardPreview } from "@/components/CardPreview";
import { Download, BookmarkPlus, Check, Share2, Copy, Phone, Mail, Globe, MessageCircle, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { SOCIALS_BY_ID } from "@/lib/socials";

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

  const accent = card.accent_color || "#D4AF37";
  const socials = (card.socials as Record<string, string> | null) ?? {};
  const socialEntries = Object.entries(socials).filter(([id, v]) => v && SOCIALS_BY_ID[id]);

  function vcard() {
    const socialLines = socialEntries.map(([id, v]) => {
      const meta = SOCIALS_BY_ID[id];
      return `X-SOCIALPROFILE;TYPE=${meta.name}:${meta.toUrl(v)}`;
    });
    const vcf = [
      "BEGIN:VCARD", "VERSION:3.0",
      `FN:${card!.name}`,
      card!.title && `TITLE:${card!.title}`,
      card!.company && `ORG:${card!.company}`,
      card!.phone && `TEL;TYPE=CELL:${card!.phone}`,
      card!.email && `EMAIL:${card!.email}`,
      card!.website && `URL:${card!.website}`,
      card!.address && `ADR:;;${card!.address};;;;`,
      ...socialLines,
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

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t.linkCopied);
  }

  const publicUrl = typeof window !== "undefined" ? window.location.href : `/c/${slug}`;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-background">
      {/* Ambient luxurious background */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-mesh)", opacity: 0.55 }} />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 65%)` }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }} />

      <div className="relative z-10 mx-auto w-full max-w-[560px] px-5">
        {/* Top bar */}
        <div className="safe-top flex items-center justify-between pb-2 pt-4">
          <a href="/" className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground">
            Cardix
          </a>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="glass grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground" aria-label={t.copyLink}>
              <Copy className="h-4 w-4" />
            </button>
            <button onClick={nativeShare} className="grid h-9 w-9 place-items-center rounded-full text-accent-foreground shadow-glow" style={{ background: "var(--gradient-gold)" }} aria-label={t.share}>
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <main className="flex flex-col items-center gap-6 pb-10 pt-3">
          {/* Hero card */}
          <div className="float-slow relative">
            <div className="absolute -inset-6 rounded-[2.5rem] opacity-60 blur-2xl" style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }} />
            <div className="relative">
              <CardPreview card={card} size="lg" />
            </div>
          </div>

          {/* Name / title stack */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{card.name}</h1>
            {(card.title || card.company) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[card.title, card.company].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          {card.bio && (
            <p className="glass max-w-md rounded-2xl px-5 py-4 text-center text-sm leading-relaxed text-foreground/85">
              {card.bio}
            </p>
          )}

          {/* QR — centerpiece */}
          <div className="relative mt-2 w-full max-w-[300px]">
            <div className="absolute -inset-3 rounded-[2rem] opacity-70 blur-2xl" style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }} />
            <div
              className="relative overflow-hidden rounded-[2rem] p-[1.5px]"
              style={{ background: `linear-gradient(140deg, ${accent}, transparent 40%, ${accent}66 90%)` }}
            >
              <div className="rounded-[calc(2rem-1.5px)] bg-white p-6">
                <div className="grid place-items-center">
                  <QRCodeSVG
                    value={publicUrl}
                    size={220}
                    fgColor="#0a0a0a"
                    bgColor="#ffffff"
                    level="H"
                    marginSize={0}
                  />
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-black/60">Scan to connect</span>
                  <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
                </div>
              </div>
            </div>
          </div>

          {/* Contact rows */}
          <ContactList card={card} />

          {/* Socials */}
          {socialEntries.length > 0 && (
            <section className="w-full max-w-md">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Follow · Connect
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {socialEntries.map(([id, val]) => {
                  const meta = SOCIALS_BY_ID[id];
                  return (
                    <a
                      key={id}
                      href={meta.toUrl(val)}
                      target="_blank"
                      rel="noreferrer"
                      title={meta.name}
                      className="group relative grid h-12 w-12 place-items-center rounded-2xl text-white shadow-glow transition hover:scale-110"
                      style={{ background: meta.color }}
                    >
                      <meta.Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Primary CTAs */}
          <div className="mt-2 grid w-full max-w-md grid-cols-2 gap-2">
            <button
              onClick={vcard}
              className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-accent-foreground shadow-glow"
              style={{ background: "var(--gradient-gold)" }}
            >
              <Download className="h-4 w-4" /> {t.saveContact}
            </button>
            <button
              onClick={saveToVault}
              disabled={saved || savingCard}
              className="glass flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-60"
            >
              {saved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
              {saved ? t.savedToVault : t.saveToVault}
            </button>
          </div>

          <a href="/" className="mt-2 text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground">
            Powered by Cardix
          </a>
        </main>
      </div>
    </div>
  );
}

function ContactList({ card }: { card: {
  phone?: string | null; whatsapp?: string | null; email?: string | null;
  website?: string | null; address?: string | null;
} }) {
  const items = [
    card.phone && { icon: Phone, label: card.phone, href: `tel:${card.phone}` },
    card.whatsapp && { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${card.whatsapp.replace(/\D/g, "")}` },
    card.email && { icon: Mail, label: card.email, href: `mailto:${card.email}` },
    card.website && {
      icon: Globe,
      label: card.website.replace(/^https?:\/\//, ""),
      href: card.website.startsWith("http") ? card.website : `https://${card.website}`,
    },
    card.address && { icon: MapPin, label: card.address, href: undefined as string | undefined },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href?: string }[];

  if (items.length === 0) return null;

  return (
    <div className="grid w-full max-w-md gap-2">
      {items.map((it, i) => {
        const inner = (
          <div className="glass card-lift flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
              <it.icon className="h-4 w-4" />
            </span>
            <span className="truncate">{it.label}</span>
          </div>
        );
        return it.href ? (
          <a key={i} href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            {inner}
          </a>
        ) : (
          <div key={i}>{inner}</div>
        );
      })}
    </div>
  );
}
