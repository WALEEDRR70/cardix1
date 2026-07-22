import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { MobileBottomNav } from "@/components/MobileShell";
import { Home as HomeIcon } from "lucide-react";
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
  Maximize2,
  X,
  BadgeCheck,
  MoreHorizontal,
  UserPlus,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { SOCIALS_BY_ID } from "@/lib/socials";
import logoAsset from "@/assets/cardix-logo.svg.asset.json";

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
  const { t } = useI18n();
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background">
      <p className="text-sm text-muted-foreground">{t.cardNotFound}</p>
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
  const { t, lang } = useI18n();
  const [saved, setSaved] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
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
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(!!data.user);
      setIsOwner(!!data.user && data.user.id === (card as CardRow & { user_id: string }).user_id);
    });
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
        el.style.transform = `perspective(1200px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
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

  const accent = card.accent_color || "#7c34ff";
  const accentText = getReadableText(accent);

  const socials = (card.socials as Record<string, string> | null) ?? {};
  const socialEntries = Object.entries(socials).filter(([id, v]) => v && SOCIALS_BY_ID[id]);
  const publicUrl = typeof window !== "undefined" ? window.location.href : `/c/${slug}`;
  const isRTL = lang === "ar";

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
    const note = window.prompt(t.noteOptional, "") ?? "";
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
      accent_color: card!.accent_color,
      template: card!.template ?? "luxury",
      socials: card!.socials ?? {},
      notes: note,
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

  type ActionItem = { id: string; label: string; value?: string; icon: typeof Phone; href?: string; onClick?: () => void };
  const prettyWebsite = card.website ? card.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";
  const actions: ActionItem[] = [
    card.phone ? { id: "call", label: t.call, value: card.phone, icon: Phone, href: `tel:${card.phone}` } : null,
    card.whatsapp
      ? {
          id: "wa",
          label: t.whatsapp,
          value: card.whatsapp,
          icon: MessageCircle,
          href: `https://wa.me/${card.whatsapp.replace(/\D/g, "")}`,
        }
      : null,
    card.email ? { id: "email", label: t.email, value: card.email, icon: Mail, href: `mailto:${card.email}` } : null,
    card.website
      ? {
          id: "web",
          label: t.website,
          value: prettyWebsite,
          icon: Globe,
          href: card.website.startsWith("http") ? card.website : `https://${card.website}`,
        }
      : null,
    card.address
      ? {
          id: "map",
          label: t.location,
          value: card.address,
          icon: MapPin,
          href: `https://maps.google.com/?q=${encodeURIComponent(card.address)}`,
        }
      : null,
    { id: "save", label: t.saveContact, value: card.name, icon: UserPlus, onClick: vcard },
  ].filter(Boolean) as ActionItem[];

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-background">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-mesh)", opacity: 0.55 }}
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-50 blur-[140px]"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 65%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full opacity-25 blur-[140px]"
        style={{ background: `radial-gradient(circle, ${accent}66, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
      <Particles accent={accent} />

      {/* Top bar */}
      <header className="safe-top relative z-20 mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 pb-2 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={nativeShare}
            className="grid h-11 w-11 place-items-center rounded-full transition hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 10px 30px -8px ${accent}aa`, color: accentText }}

            aria-label={t.share}
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={copyLink}
            className="glass grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
            aria-label={t.copyLink}
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        {isAuthed ? (
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="Cardix">
            <span
              aria-hidden
              className="inline-block h-7 w-7"
              style={{
                backgroundColor: accent,
                WebkitMaskImage: `url(${logoAsset.url})`,
                maskImage: `url(${logoAsset.url})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                filter: `drop-shadow(0 0 10px ${accent}88)`,
              }}
            />
            <span className="text-[13px] font-semibold tracking-[0.32em]" style={{ color: accent }}>CARDIX</span>
          </Link>
        ) : (
          <a href="/" className="flex items-center gap-2" aria-label="Cardix">
            <span
              aria-hidden
              className="inline-block h-7 w-7"
              style={{
                backgroundColor: accent,
                WebkitMaskImage: `url(${logoAsset.url})`,
                maskImage: `url(${logoAsset.url})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                filter: `drop-shadow(0 0 10px ${accent}88)`,
              }}
            />
            <span className="text-[13px] font-semibold tracking-[0.32em]" style={{ color: accent }}>CARDIX</span>
          </a>
        )}


        <button
          className="glass grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
          aria-label={t.more}
          onClick={nativeShare}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      {/* Main */}
      <main className={"relative z-10 mx-auto w-full max-w-[1200px] px-5 pt-3 lg:pb-24 " + (isAuthed ? "pb-[260px]" : "pb-40")}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-16 lg:pt-4">
          {/* HERO CARD */}
          <section className="flex flex-col items-center lg:sticky lg:top-6 lg:items-end">
            <div className="relative w-full max-w-[560px] animate-fade-in" style={{ perspective: "1200px" }}>
              <div
                className="absolute -inset-10 rounded-[3rem] opacity-60 blur-3xl"
                style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }}
              />
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
          <section className="flex flex-col items-center gap-7 lg:items-start lg:pl-2">
            {/* Identity */}
            <div className="w-full max-w-md text-center lg:text-start animate-fade-in">
              <div className="flex items-center justify-center gap-2 lg:justify-start">
                <BadgeCheck className="h-6 w-6 shrink-0" style={{ color: accent }} aria-hidden />
                <h1 className="text-[34px] font-semibold leading-tight tracking-tight sm:text-5xl">
                  {card.name}
                </h1>
              </div>
              {(card.title || card.company) && (
                <p className="mt-2 text-[15px] text-muted-foreground">
                  {[card.title, card.company].filter(Boolean).join(" · ")}
                </p>
              )}
              {card.bio && (
                <p className="relative mx-auto mt-5 max-w-md px-6 text-[15px] leading-relaxed text-foreground/85 lg:mx-0">
                  <span
                    className="absolute start-0 top-0 text-2xl leading-none"
                    style={{ color: accent, opacity: 0.7 }}
                    aria-hidden
                  >
                    “
                  </span>
                  {card.bio}
                  <span
                    className="absolute end-0 bottom-0 text-2xl leading-none"
                    style={{ color: accent, opacity: 0.7 }}
                    aria-hidden
                  >
                    ”
                  </span>
                </p>
              )}
            </div>

            {/* Action grid */}
            {actions.length > 0 && (
              <section className="w-full max-w-md animate-fade-in">
                <div className="grid grid-cols-3 gap-2.5">
                  {actions.map((a) => (
                    <ActionTile key={a.id} accent={accent} {...a} />
                  ))}
                </div>
              </section>
            )}

            {/* Socials */}
            {socialEntries.length > 0 && (
              <section className="w-full max-w-md animate-fade-in">
                <SectionLabel accent={accent} centered={!isRTL ? false : true}>
                  {t.followMe}
                </SectionLabel>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  {socialEntries.map(([id, val]) => {
                    const meta = SOCIALS_BY_ID[id];
                    return (
                      <a
                        key={id}
                        href={meta.toUrl(val)}
                        target="_blank"
                        rel="noreferrer"
                        title={meta.name}
                        className="glass group grid h-12 w-12 place-items-center rounded-full text-foreground/90 transition-all hover:-translate-y-0.5 hover:text-foreground"
                        style={{ boxShadow: `0 0 0 0 ${accent}00` }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.boxShadow = `0 0 22px -4px ${accent}aa`)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.boxShadow = `0 0 0 0 ${accent}00`)
                        }
                      >
                        <meta.Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {/* QR panel — visible only to the card owner */}
            {isOwner && (
            <section className="w-full max-w-md animate-fade-in">
              <div
                className="relative overflow-hidden rounded-[28px] p-[1.5px]"
                style={{
                  background: `linear-gradient(140deg, ${accent}, transparent 45%, ${accent}66 90%)`,
                }}
              >
                <div className="glass-strong rounded-[calc(28px-1.5px)] p-5">
                  <SectionLabel accent={accent} centered>
                    {t.instantShare}
                  </SectionLabel>

                  <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                    <button
                      onClick={() => setQrOpen(true)}
                      className="relative rounded-2xl p-[1.5px] transition hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(140deg, ${accent}, ${accent}55)`,
                      }}
                      aria-label={t.expand}
                    >
                      <div className="relative rounded-[calc(1rem-1px)] bg-white p-2.5">
                        <QRCodeSVG
                          ref={qrSvgRef}
                          value={publicUrl}
                          size={140}
                          fgColor="#0a0a0a"
                          bgColor="#ffffff"
                          level="H"
                          marginSize={0}
                          imageSettings={{
                            src: logoAsset.url,
                            height: 28,
                            width: 28,
                            excavate: true,
                          }}
                        />
                      </div>
                    </button>

                    <div className="min-w-0">
                      <p className="text-[13px] leading-relaxed text-foreground/80">
                        {t.scanQrDesc}
                      </p>
                    </div>
                  </div>


                </div>
              </div>
            </section>
            )}
          </section>
        </div>

        {/* Save contact CTA (inline) */}
        <div className="mt-10 flex w-full max-w-[560px] items-center gap-2 self-center px-2">
          <button
            onClick={vcard}
            className="flex flex-1 items-center justify-center gap-2 rounded-full py-4 text-[15px] font-semibold transition hover:scale-[1.01]"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 14px 40px -10px ${accent}aa`, color: accentText }}
          >
            <UserPlus className="h-4 w-4" /> {t.saveContact}
          </button>
          {isAuthed && (
            <button
              onClick={saveToVault}
              disabled={saved || savingCard}
              aria-label={t.saveToVault}
              className="glass grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full disabled:opacity-60"
            >
              {saved ? <Check className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col items-center gap-4">
          {isOwner && (
            <div className="flex items-center gap-2">
              <IconOnlyAction icon={Share2} label={t.share} onClick={nativeShare} />
              <IconOnlyAction icon={Download} label={t.download} onClick={downloadQr} />
              <IconOnlyAction icon={Maximize2} label={t.expand} onClick={() => setQrOpen(true)} />
            </div>
          )}
          <div className="flex items-center justify-center gap-2 pb-[calc(env(safe-area-inset-bottom)+96px)] lg:pb-6">
            <img src={logoAsset.url} alt="" className="h-4 w-4 opacity-70" />
            <a
              href="/"
              className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground"
            >
              Powered by Cardix
            </a>
          </div>
        </footer>

      </main>


      {/* QR modal */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-black/70 backdrop-blur-md p-6"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[2rem] p-[1.5px]"
            style={{
              background: `linear-gradient(140deg, ${accent}, transparent 40%, ${accent}66 90%)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[calc(2rem-1.5px)] bg-white p-6">
              <div className="grid place-items-center">
                <QRCodeSVG
                  value={publicUrl}
                  size={280}
                  fgColor="#0a0a0a"
                  bgColor="#ffffff"
                  level="H"
                  marginSize={0}
                  imageSettings={{
                    src: logoAsset.url,
                    height: 52,
                    width: 52,
                    excavate: true,
                  }}
                />
              </div>
              <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
                {card.name}
              </p>
            </div>
            <button
              onClick={() => setQrOpen(false)}
              className="glass absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full text-foreground"
              aria-label={t.close}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* NFC UI disabled */}




      {isAuthed && <MobileBottomNav accent={accent} />}
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
      <span className="h-px w-6" style={{ background: `linear-gradient(to right, transparent, ${accent}88)` }} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px w-6" style={{ background: `linear-gradient(to left, transparent, ${accent}88)` }} />
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
    <div
      className="glass card-lift group relative flex aspect-[1.05/1] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl p-3 text-center transition hover:-translate-y-0.5"
      style={{
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.04)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accent}22, transparent 70%)` }}
      />
      <span
        className="relative grid h-10 w-10 place-items-center rounded-full text-foreground"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${accent}33, ${accent}11 60%, transparent 75%)`,
          boxShadow: `inset 0 0 0 1px ${accent}33`,
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="relative text-[12px] font-medium text-foreground/85">{label}</span>
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

function IconOnlyAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Phone;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="glass card-lift grid h-10 w-10 place-items-center rounded-full text-foreground/85 transition hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}


function getReadableText(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const toLin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
  return L > 0.5 ? "#0a0a0a" : "#ffffff";
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
