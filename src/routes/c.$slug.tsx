import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@/lib/nav";
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
import { toPng } from "html-to-image";
import QRCode from "qrcode";
import { localizedPath } from "@/lib/locale-routing";
import { fetchPublicCardMeta, publicCardHead } from "@/lib/public-card-meta";
import { avatarPhotoLine } from "@/lib/vcard-photo";
import { tx, txErr } from "@/lib/tx";
import { useTranslatedRow } from "@/lib/use-content-translation";



export const Route = createFileRoute("/c/$slug")({
  loader: async ({ params }) => ({ meta: await fetchPublicCardMeta(params.slug) }),
  head: ({ params, loaderData }) => {
    const url = `https://cardixn.com/c/${params.slug}`;
    return {
      meta: publicCardHead(loaderData?.meta ?? null, url, params.slug),
      links: [{ rel: "canonical", href: url }],
    };
  },
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
  design?: unknown;
  company_id?: string | null;
  logo_url?: string | null;
};

function PublicCard() {
  const { slug } = Route.useParams();
  return <PublicCardView slug={slug} />;
}

/** Reusable public card renderer — also used by company-scoped employee URLs. */
export function PublicCardView({ slug }: { slug: string }) {
  const { t, lang } = useI18n();
  const [saved, setSaved] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const cardWrapRef = useRef<HTMLDivElement | null>(null);
  const qrSvgRef = useRef<SVGSVGElement | null>(null);
  const posterRef = useRef<HTMLDivElement | null>(null);
  const [posterQr, setPosterQr] = useState<string>("");
  const [downloadingPoster, setDownloadingPoster] = useState(false);

  const { data: rawCard } = useQuery({
    queryKey: ["public-card", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select(
          "id, slug, name, title, company, bio, phone, whatsapp, email, website, address, avatar_url, cover_url, accent_color, template, socials, design, is_published, is_active, is_verified, card_type, company_id, department_id, department, extension, working_hours, languages, companies:company_id(logo_url, name)",
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      const row = data as Record<string, unknown>;
      const co = row.companies as { logo_url: string | null; name: string | null } | null;
      // Flatten the company logo so Studio designs can resolve {{Logo}}.
      return { ...row, logo_url: co?.logo_url ?? null } as CardRow;
    },
  });

  // AI-translated user content (bio, title, address…) for the visitor's language.
  const card = useTranslatedRow<CardRow>("card", rawCard, lang);

  useEffect(() => {
    if (!card) return;
    supabase.from("card_events").insert({ card_id: card.id, event_type: "view" });
    supabase.auth.getUser().then(async ({ data }) => {
      setIsAuthed(!!data.user);
      if (!data.user) {
        setIsOwner(false);
        return;
      }
      // Ownership is verified against the base table (only the owner can read it there)
      const { data: own } = await supabase
        .from("cards")
        .select("id")
        .eq("id", card.id)
        .eq("user_id", data.user.id)
        .maybeSingle();
      setIsOwner(!!own);
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
        {tx("Loading…")}
      </div>
    );
  }

  const accent = card.accent_color || "#7c34ff";
  const accentText = getReadableText(accent);

  const socials = (card.socials as Record<string, string> | null) ?? {};
  const socialEntries = Object.entries(socials).filter(([id, v]) => v && SOCIALS_BY_ID[id]);
  const publicUrl = typeof window !== "undefined" ? window.location.href : `/c/${slug}`;
  const isRTL = lang === "ar";

  async function vcard() {
    const socialLines = socialEntries.map(([id, v]) => {
      const meta = SOCIALS_BY_ID[id];
      return `X-SOCIALPROFILE;TYPE=${meta.name}:${meta.toUrl(v)}`;
    });
    const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
    const parts = (card!.name || "").trim().split(/\s+/);
    const given = parts[0] ?? "";
    const family = parts.length > 1 ? parts.slice(1).join(" ") : "";
    const photoLine = await avatarPhotoLine(card!.avatar_url);

    const vcf = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(family)};${esc(given)};;;`,
      `FN:${esc(card!.name)}`,
      card!.title && `TITLE:${esc(card!.title)}`,
      card!.company && `ORG:${esc(card!.company)}`,
      card!.phone && `TEL;TYPE=CELL:${card!.phone}`,
      card!.whatsapp && card!.whatsapp !== card!.phone && `TEL;TYPE=WORK:${card!.whatsapp}`,
      card!.email && `EMAIL;TYPE=INTERNET:${card!.email}`,
      card!.website && `URL:${card!.website}`,
      card!.address && `ADR;TYPE=WORK:;;${esc(card!.address)};;;;`,
      card!.bio && `NOTE:${esc(card!.bio)}`,
      `URL;TYPE=Cardixn:https://cardixn.com/c/${card!.slug}`,
      ...socialLines,
      photoLine,
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\r\n");
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
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
      window.location.href = `${localizedPath("/auth", lang)}?next=${encodeURIComponent(`/c/${slug}`)}`;
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
      toast.error(txErr(error));
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

  async function downloadCardImage() {
    if (!card) return;
    try {
      setDownloadingPoster(true);
      const qr = await QRCode.toDataURL(publicUrl, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 480,
        color: { dark: "#0a0a0a", light: "#ffffff" },
      });
      setPosterQr(qr);
      // wait a frame so the poster re-renders with the QR
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => setTimeout(r, 60));
      const node = posterRef.current;
      if (!node) return;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#050505",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${card.slug}-card.png`;
      a.click();
      supabase.from("card_events").insert({ card_id: card.id, event_type: "save" });
    } catch (e) {
      console.error(e);
      toast.error(tx("Failed to generate image"));
    } finally {
      setDownloadingPoster(false);
    }
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
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="Cardixn">
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
          <Link to="/" className="flex items-center gap-2" aria-label="Cardixn">
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
        )}


        {isOwner ? (
          <Link
            to="/cards/$id"
            params={{ id: card.id }}
            className="glass grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
            aria-label={t.editCard}
          >
            <Pencil className="h-4 w-4" />
          </Link>
        ) : (
          <button
            className="glass grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
            aria-label={t.more}
            onClick={nativeShare}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}

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
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              <IconOnlyAction icon={Download} label={t.download} onClick={downloadCardImage} disabled={downloadingPoster} />
              <IconOnlyAction icon={Maximize2} label={t.expand} onClick={() => setQrOpen(true)} />
            </div>
          )}
          <div className="flex items-center justify-center gap-2 pb-[calc(env(safe-area-inset-bottom)+96px)] lg:pb-6">
            <img src={logoAsset.url} alt="" className="h-4 w-4 opacity-70" />
            <Link
              to="/"
              className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground hover:text-foreground"
            >
              {tx("Powered by")} Cardixn
            </Link>
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




      {/* Off-screen poster used for image download */}
      <div style={{ position: "fixed", left: "-100000px", top: 0, pointerEvents: "none", opacity: 0 }} aria-hidden>
        <CardPoster card={card} accent={accent} accentText={accentText} qrDataUrl={posterQr} publicUrl={publicUrl} socialEntries={socialEntries} logoUrl={logoAsset.url} posterRef={posterRef} actions={actions} />
      </div>

      {isAuthed && <MobileBottomNav accent={accent} />}
    </div>
  );
}

function CardPoster({
  card, accent, accentText, qrDataUrl, publicUrl, socialEntries, logoUrl, posterRef, actions,
}: {
  card: CardRow;
  accent: string;
  accentText: string;
  qrDataUrl: string;
  publicUrl: string;
  socialEntries: [string, string][];
  logoUrl: string;
  posterRef: React.RefObject<HTMLDivElement | null>;
  actions: { id: string; label: string; value?: string; icon: typeof Phone }[];
}) {
  const infoRows = actions.filter((a) => a.id !== "save" && a.value);
  const isRtl = /[\u0600-\u06FF]/.test(card.name || "") || /[\u0600-\u06FF]/.test(card.bio || "");
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <div
      ref={posterRef}
      dir={dir}
      style={{
        width: 1080,
        minHeight: 1920,
        padding: "80px 68px 72px",
        boxSizing: "border-box",
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, ${accent}55, transparent 60%),
          radial-gradient(ellipse 60% 40% at 100% 60%, ${accent}33, transparent 60%),
          radial-gradient(ellipse 60% 40% at 0% 40%, ${accent}33, transparent 60%),
          linear-gradient(180deg, #100722 0%, #08040f 55%, #030106 100%)
        `,
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans Arabic', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating orbs */}
      <div style={{ position: "absolute", top: 180, insetInlineStart: -80, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${accent}88, transparent 70%)`, filter: "blur(60px)" }} />
      <div style={{ position: "absolute", top: 620, insetInlineEnd: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${accent}77, transparent 70%)`, filter: "blur(70px)" }} />
      <div style={{ position: "absolute", bottom: 200, insetInlineStart: 40, width: 220, height: 220, borderRadius: "50%", background: `radial-gradient(circle, ${accent}55, transparent 70%)`, filter: "blur(60px)" }} />
      {/* Subtle grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.08, backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`, backgroundSize: "72px 72px", maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)" }} />

      {/* Top brand row */}
      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${accent}, ${accent}99)`, display: "grid", placeItems: "center", boxShadow: `0 12px 40px -8px ${accent}` }}>
            <img src={logoUrl} alt="" crossOrigin="anonymous" style={{ width: 32, height: 32 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.28em", color: "#fff" }}>CARDIX</span>
            <span dir="ltr" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.32em", color: accent, marginTop: 6 }}>DIGITAL BUSINESS CARD</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 999, background: `linear-gradient(135deg, ${accent}33, ${accent}0d)`, border: `1px solid ${accent}66`, boxShadow: `0 0 24px ${accent}44` }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: accent, display: "grid", placeItems: "center", color: accentText, fontSize: 14, fontWeight: 900 }}>✓</span>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.05em" }}>{tx("Verified")}</span>
        </div>
      </div>

      {/* Avatar with glow ring */}
      {card.avatar_url && (
        <div style={{ position: "relative", marginTop: 8 }}>
          <div style={{ position: "absolute", inset: -22, borderRadius: "50%", background: `conic-gradient(from 210deg, ${accent}, transparent 40%, ${accent}88 70%, ${accent})`, filter: "blur(6px)", opacity: 0.95 }} />
          <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `3px solid ${accent}`, boxShadow: `0 0 60px ${accent}, inset 0 0 30px ${accent}66` }} />
          <div style={{ position: "relative", width: 280, height: 280, borderRadius: "50%", overflow: "hidden", background: "#0a0514" }}>
            <img src={card.avatar_url} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
      )}

      {/* Name + title */}
      <div style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginTop: -4 }}>
        <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", color: "#fff", textShadow: `0 6px 40px ${accent}aa` }}>{card.name}</div>
        {card.title && (
          <div style={{ fontSize: 30, fontWeight: 600, color: accent, letterSpacing: "0.01em" }}>{card.title}</div>
        )}
        {card.company && (
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "0.28em", opacity: 0.75, textTransform: "uppercase" }}>{card.company}</div>
        )}
        {card.bio && (
          <div style={{ marginTop: 6, fontSize: 20, lineHeight: 1.6, opacity: 0.7, maxWidth: 780 }}>{card.bio}</div>
        )}
      </div>

      {/* Contact rows */}
      {infoRows.length > 0 && (
        <div style={{ position: "relative", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {infoRows.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 24px", background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))", border: `1px solid ${accent}33`, borderRadius: 22, position: "relative", overflow: "hidden", minWidth: 0 }}>
                <div style={{ position: "absolute", insetInlineEnd: 0, top: 14, bottom: 14, width: 3, borderRadius: 3, background: `linear-gradient(180deg, transparent, ${accent}, transparent)` }} />
                <span style={{ width: 64, height: 64, display: "grid", placeItems: "center", borderRadius: 18, background: `linear-gradient(135deg, ${accent}44, ${accent}11)`, border: `1px solid ${accent}66`, color: accent, flexShrink: 0, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 20px -6px ${accent}88` }}>
                  <Icon style={{ width: 30, height: 30 }} strokeWidth={2.2} />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 18, opacity: 0.6, letterSpacing: "0.06em", fontWeight: 600 }}>{a.label}</div>
                  <div dir="ltr" style={{ fontSize: 28, fontWeight: 800, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: isRtl ? "right" : "left", color: "#fff" }}>{a.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Socials — circular icons with usernames underneath */}
      {socialEntries.length > 0 && (
        <div style={{ position: "relative", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, justifyContent: "center" }}>
            <span style={{ height: 1, width: 80, background: `linear-gradient(90deg, transparent, ${accent})` }} />
            <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, boxShadow: `0 0 10px ${accent}` }} />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.4em", color: accent }}>FOLLOW ME</span>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, boxShadow: `0 0 10px ${accent}` }} />
            <span style={{ height: 1, width: 80, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "center" }}>
            {socialEntries.slice(0, 8).map(([id, val]) => {
              const meta = SOCIALS_BY_ID[id];
              if (!meta) return null;
              const handle = /^https?:\/\//i.test(val) ? (val.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/").pop() || val) : val.replace(/^@/, "");
              return (
                <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 110 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: `radial-gradient(circle, ${accent}66, transparent 70%)`, filter: "blur(10px)" }} />
                    <span style={{ position: "relative", width: 82, height: 82, display: "grid", placeItems: "center", borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, ${accent}99)`, color: accentText, boxShadow: `0 12px 30px -8px ${accent}, inset 0 1px 0 rgba(255,255,255,0.3)` }}>
                      <meta.Icon size={40} />
                    </span>
                  </div>
                  <span dir="ltr" style={{ fontSize: 17, fontWeight: 700, color: "#fff", opacity: 0.95 }}>@{handle}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QR + NFC block */}
      <div style={{ position: "relative", width: "100%", marginTop: "auto", display: "flex", alignItems: "center", gap: 32, padding: 28, background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))", border: `1px solid ${accent}44`, borderRadius: 32, boxShadow: `0 20px 60px -20px ${accent}66` }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -14, borderRadius: 32, background: `linear-gradient(135deg, ${accent}, transparent, ${accent})`, filter: "blur(18px)", opacity: 0.85 }} />
          <div style={{ position: "relative", background: "#fff", padding: 18, borderRadius: 28, boxShadow: `0 0 0 2px ${accent}` }}>
            {qrDataUrl && <img src={qrDataUrl} alt="" style={{ width: 340, height: 340, display: "block" }} />}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 82, height: 82, borderRadius: 20, background: "linear-gradient(135deg, #1a0b2e, #0a0514)", display: "grid", placeItems: "center", border: "5px solid #fff", boxShadow: `0 6px 18px ${accent}` }}>
              <img src={logoUrl} alt="" crossOrigin="anonymous" style={{ width: 44, height: 44 }} />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, textAlign: isRtl ? "right" : "left" }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: accent, letterSpacing: "-0.02em", marginBottom: 10 }}>
            {tx("Scan QR Code")}
          </div>
          <div style={{ fontSize: 19, opacity: 0.75, lineHeight: 1.5, marginBottom: 18 }}>
            {tx("Save my card instantly or share it directly")}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: `${accent}22`, border: `1px solid ${accent}66` }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: accent, display: "grid", placeItems: "center", color: accentText, fontSize: 12, fontWeight: 900 }}>))</span>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.15em" }}>NFC READY</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, paddingTop: 6 }}>
        <span style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, ${accent}55)` }} />
        <span dir="ltr" style={{ fontSize: 16, opacity: 0.7, fontWeight: 600, letterSpacing: "0.06em", color: "#fff" }}>
          {publicUrl.replace(/^https?:\/\//, "")}
        </span>
        <span style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${accent}55, transparent)` }} />
      </div>
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
  value,
  href,
  onClick,
  accent,
}: {
  icon: typeof Phone;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  accent: string;
}) {
  const inner = (
    <div
      className="glass card-lift group relative flex items-center gap-3 overflow-hidden rounded-2xl p-3 pe-4 text-start transition hover:-translate-y-0.5"
      style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.04)` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at 0% 50%, ${accent}22, transparent 70%)` }}
      />
      <span
        className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl text-foreground"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${accent}33, ${accent}11 60%, transparent 75%)`,
          boxShadow: `inset 0 0 0 1px ${accent}33`,
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="relative flex min-w-0 flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        {value && (
          <span dir="ltr" className="truncate text-[13px] font-medium text-foreground/90">
            {value}
          </span>
        )}
      </span>
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
  disabled,
}: {
  icon: typeof Phone;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="glass card-lift grid h-10 w-10 place-items-center rounded-full text-foreground/85 transition hover:text-foreground disabled:opacity-50"
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
