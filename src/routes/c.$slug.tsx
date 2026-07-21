import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardPreview } from "@/components/CardPreview";
import {
  Download,
  BookmarkPlus,
  Check,
  Share2,
  Copy,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  MapPin,
  QrCode,
  X,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";
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
      { name: "twitter:card", content: "summary_large_image" },
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

type CardRow = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  company: string | null;
  bio: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  avatar_url: string | null;
  accent_color: string;
  template: string | null;
  is_published: boolean;
  socials: Record<string, string> | null;
};

function PublicCard() {
  const { slug } = Route.useParams();
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const cardWrapRef = useRef<HTMLDivElement | null>(null);
  const qrSvgRef = useRef<SVGSVGElement | null>(null);

  const { data: card } = useQuery({
    queryKey: ["public-card", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as CardRow;
    },
  });

  useEffect(() => {
    if (!card) return;
    supabase.from("card_events").insert({ card_id: card.id, event_type: "view" });
  }, [card]);

  // 3D tilt on desktop
  useEffect(() => {
    const el = cardWrapRef.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`;
      });
    };
    const onLeave = () => {
      el.style.transform = "perspective(1200px) rotateY(0) rotateX(0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [card]);

  if (!card) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const accent = card.accent_color || "#D4AF37";
  const socials = (card.socials as Record<string, string> | null) ?? {};
  const socialEntries = Object.entries(socials).filter(([id, v]) => v && SOCIALS_BY_ID[id]);
  const publicUrl = typeof window !== "undefined" ? window.location.href : `/c/${slug}`;

  function vcard() {
    const socialLines = socialEntries.map(([id, v]) => {
      const meta = SOCIALS_BY_ID[id];
      return `X-SOCIALPROFILE;TYPE=${meta.name}:${meta.toUrl(v)}`;
    });
    const vcf = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${card!.name}`,
      card!.title && `TITLE:${card!.title}`,
      card!.company && `ORG:${card!.company}`,
      card!.phone && `TEL;TYPE=CELL:${card!.phone}`,
      card!.email && `EMAIL:${card!.email}`,
      card!.website && `URL:${card!.website}`,
      card!.address && `ADR:;;${card!.address};;;;`,
      ...socialLines,
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card!.slug}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    supabase.from("card_events").insert({ card_id: card!.id, event_type: "save" });
  }

  async function saveToVault() {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      window.location.href = `/auth?next=/c/${slug}`;
      return;
    }
    setSavingCard(true);
    const { error } = await supabase.from("saved_cards").insert({
      user_id: userRes.user.id,
      source: "public",
      source_card_id: card!.id,
      name: card!.name,
      title: card!.title,
      company: card!.company,
      bio: card!.bio,
      phone: card!.phone,
      whatsapp: card!.whatsapp,
      email: card!.email,
      address: card!.address,
      website: card!.website,
      avatar_url: card!.avatar_url,
    });
    setSavingCard(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("card_events").insert({ card_id: card!.id, event_type: "save" });
    setSaved(true);
    toast.success(t.savedToVault);
  }

  async function nativeShare() {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: card!.name, url: publicUrl });
        return;
      } catch {
        /* noop */
      }
    }
    navigator.clipboard.writeText(publicUrl);
    toast.success(t.linkCopied);
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    toast.success(t.linkCopied);
  }

  async function downloadQr() {
    const svg = qrSvgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 64, 64, size - 128, size - 128);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${card!.slug}-qr.png`;
        a.click();
      }, "image/png");
    };
    img.src = url;
  }

  const actions: {
    id: string;
    label: string;
    icon: typeof Phone;
    href?: string;
    onClick?: () => void;
  }[] = [
    card.phone ? { id: "call", label: t.call, icon: Phone, href: `tel:${card.phone}` } : null,
    card.whatsapp
      ? {
          id: "wa",
          label: "WhatsApp",
          icon: MessageCircle,
          href: `https://wa.me/${card.whatsapp.replace(/\D/g, "")}`,
        }
      : null,
    card.email ? { id: "email", label: "Email", icon: Mail, href: `mailto:${card.email}` } : null,
    card.website
      ? {
          id: "web",
          label: "Website",
          icon: Globe,
          href: card.website.startsWith("http") ? card.website : `https://${card.website}`,
        }
      : null,
    card.address
      ? {
          id: "map",
          label: "Location",
          icon: MapPin,
          href: `https://maps.google.com/?q=${encodeURIComponent(card.address)}`,
        }
      : null,
  ].filter(Boolean) as {
    id: string;
    label: string;
    icon: typeof Phone;
    href?: string;
    onClick?: () => void;
  }[];

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-background">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-mesh)", opacity: 0.6 }}
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-50 blur-[140px]"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 65%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full opacity-30 blur-[140px]"
        style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
      {/* Floating particles */}
      <Particles accent={accent} />

      {/* Top bar */}
      <header className="safe-top relative z-20 mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 pb-2 pt-4">
        <a
          href="/"
          className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground"
        >
          Cardix
        </a>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="glass grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
            aria-label={t.copyLink}
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={nativeShare}
            className="grid h-10 w-10 place-items-center rounded-full text-accent-foreground shadow-glow transition hover:scale-105"
            style={{ background: "var(--gradient-gold)" }}
            aria-label={t.share}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto w-full max-w-[1200px] px-5 pb-40 pt-2 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:pt-6">
          {/* HERO CARD */}
          <section className="flex flex-col items-center lg:items-end">
            <div
              className="relative w-full max-w-[588px] animate-fade-in"
              style={{ perspective: "1200px" }}
            >
              {/* Glow halo */}
              <div
                className="absolute -inset-10 rounded-[3rem] opacity-60 blur-3xl"
                style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }}
              />
              {/* Reflection under card */}
              <div
                className="absolute -bottom-6 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full opacity-40 blur-2xl"
                style={{ background: `radial-gradient(ellipse, ${accent}88, transparent 70%)` }}
              />
              <div ref={cardWrapRef} className="float-slow relative transition-transform duration-300 ease-out">
                <CardPreview card={card} size="xl" />
              </div>
            </div>
          </section>

          {/* IDENTITY + ACTIONS */}
          <section className="flex flex-col items-center gap-8 lg:items-start lg:pl-4">
            {/* Identity */}
            <div className="w-full max-w-md text-center lg:text-left animate-fade-in">
              <div className="flex items-center justify-center gap-2 lg:justify-start">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{card.name}</h1>
                <BadgeCheck className="h-6 w-6" style={{ color: accent }} aria-hidden />
              </div>
              {(card.title || card.company) && (
                <p className="mt-2 text-base text-muted-foreground">
                  {[card.title, card.company].filter(Boolean).join(" · ")}
                </p>
              )}
              {card.bio && (
                <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-foreground/80 lg:mx-0">
                  {card.bio}
                </p>
              )}
            </div>

            {/* Action grid */}
            {actions.length > 0 && (
              <section className="w-full max-w-md animate-fade-in">
                <SectionLabel accent={accent}>Quick actions</SectionLabel>
                <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-3">
                  {actions.map((a) => (
                    <ActionTile key={a.id} accent={accent} {...a} />
                  ))}
                </div>
              </section>
            )}

            {/* Socials */}
            {socialEntries.length > 0 && (
              <section className="w-full max-w-md animate-fade-in">
                <SectionLabel accent={accent}>Follow · Connect</SectionLabel>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {socialEntries.map(([id, val]) => {
                    const meta = SOCIALS_BY_ID[id];
                    return (
                      <a
                        key={id}
                        href={meta.toUrl(val)}
                        target="_blank"
                        rel="noreferrer"
                        title={meta.name}
                        className="glass group grid h-12 w-12 place-items-center rounded-full text-foreground/85 transition-all hover:-translate-y-0.5 hover:text-foreground"
                        style={{ boxShadow: `0 0 0 0 ${accent}00` }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.boxShadow = `0 0 24px -4px ${accent}aa`)
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 0 0 ${accent}00`)}
                      >
                        <meta.Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </section>
        </div>

        {/* QR SECTION */}
        <section className="mx-auto mt-16 w-full max-w-2xl animate-fade-in">
          <div className="text-center">
            <SectionLabel accent={accent} centered>
              Instant share
            </SectionLabel>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Scan the code</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <div className="mx-auto sm:mx-0">
              <div
                className="relative overflow-hidden rounded-[1.75rem] p-[1.5px]"
                style={{ background: `linear-gradient(140deg, ${accent}, transparent 40%, ${accent}66 90%)` }}
              >
                <div className="rounded-[calc(1.75rem-1.5px)] bg-white p-4">
                  <QRCodeSVG
                    ref={qrSvgRef}
                    value={publicUrl}
                    size={168}
                    fgColor="#0a0a0a"
                    bgColor="#ffffff"
                    level="H"
                    marginSize={0}
                  />
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 sm:p-5">
              <p className="text-sm text-muted-foreground">
                Point any camera at the code to open this card instantly — no app required.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <QrAction icon={QrCode} label="Expand" onClick={() => setQrOpen(true)} />
                <QrAction icon={Download} label="Download" onClick={downloadQr} />
                <QrAction icon={Share2} label="Share" onClick={nativeShare} />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <a
            href="/"
            className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground"
          >
            Powered by Cardix
          </a>
        </footer>
      </main>

      {/* Sticky save-contact CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
        <div className="pointer-events-none mx-auto flex w-full max-w-[560px] items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-6"
          style={{ background: "linear-gradient(to top, var(--background) 55%, transparent)" }}
        >
          <button
            onClick={vcard}
            className="pointer-events-auto flex flex-1 items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-accent-foreground shadow-glow transition hover:scale-[1.01]"
            style={{ background: "var(--gradient-gold)" }}
          >
            <Download className="h-4 w-4" /> {t.saveContact}
          </button>
          <button
            onClick={saveToVault}
            disabled={saved || savingCard}
            aria-label={t.saveToVault}
            className="glass pointer-events-auto grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full disabled:opacity-60"
          >
            {saved ? <Check className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* QR modal */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-black/70 backdrop-blur-md p-6"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[2rem] p-[1.5px]"
            style={{ background: `linear-gradient(140deg, ${accent}, transparent 40%, ${accent}66 90%)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[calc(2rem-1.5px)] bg-white p-6">
              <div className="grid place-items-center">
                <QRCodeSVG value={publicUrl} size={280} fgColor="#0a0a0a" bgColor="#ffffff" level="H" marginSize={0} />
              </div>
              <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
                {card.name}
              </p>
            </div>
            <button
              onClick={() => setQrOpen(false)}
              className="glass absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({
  children,
  accent,
  centered,
}: {
  children: React.ReactNode;
  accent: string;
  centered?: boolean;
}) {
  return (
    <div className={"flex items-center gap-2 " + (centered ? "justify-center" : "")}>
      <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
        {children}
      </span>
      <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
    </div>
  );
}

function ActionTile({
  icon: Icon,
  label,
  href,
  onClick,
  accent,
}: {
  icon: typeof Phone;
  label: string;
  href?: string;
  onClick?: () => void;
  accent: string;
}) {
  const inner = (
    <div className="glass card-lift group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl p-3 text-center transition hover:-translate-y-0.5">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accent}22, transparent 70%)` }}
      />
      <span
        className="relative grid h-11 w-11 place-items-center rounded-2xl text-accent-foreground shadow-glow"
        style={{ background: "var(--gradient-gold)" }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="relative text-[11px] font-medium text-foreground/80">{label}</span>
      <ArrowUpRight className="absolute right-2 top-2 h-3.5 w-3.5 text-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {inner}
    </a>
  ) : (
    <button onClick={onClick} className="block w-full text-left">
      {inner}
    </button>
  );
}

function QrAction({ icon: Icon, label, onClick }: { icon: typeof Phone; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass card-lift flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-foreground/85 transition hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Particles({ accent }: { accent: string }) {
  const items = Array.from({ length: 14 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((_, i) => {
        const left = (i * 73) % 100;
        const top = (i * 47) % 100;
        const size = 2 + ((i * 7) % 5);
        const delay = (i * 0.6) % 6;
        const duration = 8 + ((i * 3) % 8);
        return (
          <span
            key={i}
            className="absolute rounded-full opacity-40"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              background: accent,
              boxShadow: `0 0 12px ${accent}`,
              animation: `float-slow ${duration}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
