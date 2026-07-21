import { Phone, Mail, Globe, MessageCircle, MapPin, Briefcase } from "lucide-react";
import { SOCIALS_BY_ID } from "@/lib/socials";

export interface CardData {
  name: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  accent_color: string;
  template?: string | null;
  socials?: Record<string, string> | null;
}

export const TEMPLATES = [
  "luxury", "aurora", "ivory", "noir", "neon", "platinum",
  "midnight", "sunset", "ocean", "forest", "holographic", "executive",
  "mono", "marble", "carbon", "sand", "rose", "emerald", "cosmic",
] as const;
export type TemplateId = (typeof TEMPLATES)[number];

export function CardPreview({ card, size = "md" }: { card: CardData; size?: "sm" | "md" | "lg" | "xl" }) {
  const tpl = (card.template as TemplateId) || "luxury";
  const cls =
    size === "sm"
      ? "aspect-[1.65/1] w-full max-w-[320px]"
      : size === "lg"
        ? "aspect-[1.62/1] w-full max-w-[440px]"
        : size === "xl"
          ? "aspect-[1.62/1] w-full max-w-[600px]"
          : "aspect-[1.62/1] w-full max-w-[400px]";
  return (
    <div className={cls + " card-lift shadow-luxe rounded-3xl overflow-hidden"}>
      <TemplateSwitch tpl={tpl} card={card} />
    </div>
  );
}

export function CardFull({ card }: { card: CardData }) {
  return (
    <div className="flex flex-col gap-4">
      <CardPreview card={card} size="lg" />
      <ContactActions card={card} />
    </div>
  );
}

function TemplateSwitch({ tpl, card }: { tpl: TemplateId; card: CardData }) {
  switch (tpl) {
    case "aurora": return <AuroraTemplate card={card} />;
    case "ivory": return <IvoryTemplate card={card} />;
    case "noir": return <NoirTemplate card={card} />;
    case "neon": return <NeonTemplate card={card} />;
    case "platinum": return <PlatinumTemplate card={card} />;
    case "midnight": return <MidnightTemplate card={card} />;
    case "sunset": return <SunsetTemplate card={card} />;
    case "ocean": return <OceanTemplate card={card} />;
    case "forest": return <ForestTemplate card={card} />;
    case "holographic": return <HolographicTemplate card={card} />;
    case "executive": return <ExecutiveTemplate card={card} />;
    case "mono": return <MonoTemplate card={card} />;
    case "marble": return <MarbleTemplate card={card} />;
    case "carbon": return <CarbonTemplate card={card} />;
    case "sand": return <SandTemplate card={card} />;
    case "rose": return <RoseTemplate card={card} />;
    case "emerald": return <EmeraldTemplate card={card} />;
    case "cosmic": return <CosmicTemplate card={card} />;
    case "luxury":
    default: return <LuxuryTemplate card={card} />;
  }
}

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function Avatar({ card, ring, fallbackBg, size = 72 }: { card: CardData; ring: string; fallbackBg: string; size?: number }) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-2xl text-base font-semibold ring-1 ${ring} bg-cover bg-center shadow-lg`}
      style={{
        width: size,
        height: size,
        background: card.avatar_url ? undefined : fallbackBg,
        backgroundImage: card.avatar_url ? `url(${card.avatar_url})` : undefined,
      }}
    >
      {!card.avatar_url && initials(card.name || "")}
    </div>
  );
}

/* ---------- Shared body used by every template ---------- */

type Variant = "dark" | "light";

function CardBody({ card, variant, accent, brand }: { card: CardData; variant: Variant; accent: string; brand?: string }) {
  const isDark = variant === "dark";
  const nameCls = isDark ? "text-white" : "text-black";
  const titleCls = isDark ? "text-white/85" : "text-black/75";
  const subCls = isDark ? "text-white/60" : "text-black/55";
  const rowCls = isDark ? "text-white/85" : "text-black/75";
  const iconWrap = isDark ? "bg-white/10 text-white" : "bg-black/5 text-black/80";
  const chipCls = isDark ? "bg-white/10 text-white/90 ring-white/10" : "bg-black/5 text-black/80 ring-black/5";
  const ring = isDark ? "ring-white/25" : "ring-black/10";

  const socialEntries = Object.entries(card.socials || {}).filter(([, v]) => v && v.trim());

  return (
    <div className="relative flex h-full w-full flex-col p-4 sm:p-5">
      {/* Identity */}
      <div className="flex items-start gap-3">
        <Avatar card={card} ring={ring} fallbackBg={`linear-gradient(135deg, ${accent}, ${isDark ? "#111" : "#ddd"})`} size={64} />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-[17px] font-semibold leading-tight ${nameCls}`}>
            {card.name || "Your Name"}
          </p>
          {card.title && (
            <p className={`mt-0.5 truncate text-[11.5px] leading-tight ${titleCls}`}>{card.title}</p>
          )}
          {card.company && (
            <div className={`mt-1 flex items-center gap-1 truncate text-[10.5px] ${subCls}`}>
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">{card.company}</span>
            </div>
          )}
        </div>
        {brand && (
          <span className={`shrink-0 text-[9px] uppercase tracking-[0.3em] ${subCls}`}>{brand}</span>
        )}
      </div>

      {/* Info rows */}
      <div className="mt-3 grid gap-1">
        {card.phone && (
          <InfoRow icon={<Phone className="h-3 w-3" />} text={card.phone} rowCls={rowCls} iconWrap={iconWrap} />
        )}
        {card.address && (
          <InfoRow icon={<MapPin className="h-3 w-3" />} text={card.address} rowCls={rowCls} iconWrap={iconWrap} />
        )}
      </div>

      {/* Socials */}
      {socialEntries.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
          {socialEntries.slice(0, 5).map(([id, val]) => {
            const meta = SOCIALS_BY_ID[id];
            if (!meta) return null;
            const label = /^https?:\/\//i.test(val) ? meta.name : val.replace(/^@/, "");
            return (
              <span
                key={id}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-medium ring-1 ${chipCls}`}
              >
                <span
                  className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-white"
                  style={{ background: meta.color }}
                >
                  <meta.Icon className="h-2 w-2" />
                </span>
                <span className="max-w-[92px] truncate">{label}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon, text, rowCls, iconWrap,
}: { icon: React.ReactNode; text: string; rowCls: string; iconWrap: string }) {
  return (
    <div className={`flex items-center gap-2 text-[10.5px] ${rowCls}`}>
      <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-md ${iconWrap}`}>{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

/* ---------- Backgrounds ---------- */

function Bg({ children, style, className = "" }: { children?: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={`relative h-full w-full ${className}`} style={style}>{children}</div>;
}

function LuxuryTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#7c34ff";
  return (
    <Bg style={{ background: "linear-gradient(160deg,#161513,#050505)" }}>
      <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 85% 0%, ${a}44, transparent 55%)` }} />
      <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${a}33, transparent 70%)` }} />
      <div aria-hidden className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Luxury" />
    </Bg>
  );
}

function AuroraTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#a78bfa";
  return (
    <Bg style={{ background: "var(--gradient-aurora, linear-gradient(135deg,#7c3aed,#22d3ee,#f472b6))" }}>
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Aurora" />
    </Bg>
  );
}

function IvoryTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#9C7A3C";
  return (
    <Bg style={{ background: "linear-gradient(160deg,#faf7f0,#ece5d3)" }}>
      <div className="absolute right-4 top-4 h-6 w-6 rounded-full" style={{ background: a }} />
      <CardBody card={card} variant="light" accent={a} brand="Ivory" />
    </Bg>
  );
}

function NoirTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#ffffff";
  return (
    <Bg style={{ background: "#0a0a0a" }}>
      <div className="absolute left-0 top-0 h-full w-1.5" style={{ background: a }} />
      <CardBody card={card} variant="dark" accent={a} brand="Noir" />
    </Bg>
  );
}

function NeonTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#22d3ee";
  return (
    <Bg style={{ background: "#08070f" }}>
      <div className="absolute inset-0 opacity-90" style={{ background: `radial-gradient(circle at 20% 100%, ${a}55, transparent 55%), radial-gradient(circle at 100% 0%, #a78bfa55, transparent 55%)` }} />
      <CardBody card={card} variant="dark" accent={a} brand="Neon" />
    </Bg>
  );
}

function PlatinumTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#7c34ff";
  return (
    <Bg style={{ background: "linear-gradient(135deg,#e8e8ea,#b6b6bb 40%,#f4f4f5 60%,#9a9aa2)" }}>
      <div className="absolute inset-0 opacity-40" style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)" }} />
      <CardBody card={card} variant="light" accent={a} brand="Platinum" />
    </Bg>
  );
}

function MidnightTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#7c34ff";
  return (
    <Bg style={{ background: "linear-gradient(160deg,#0b1026,#050817)" }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 20% 0%, ${a}55, transparent 60%), radial-gradient(ellipse at 100% 100%, #1e3a8a55, transparent 60%)` }} />
      <div aria-hidden className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#ffffff33 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Midnight" />
    </Bg>
  );
}

function SunsetTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#ffd60a";
  return (
    <Bg style={{ background: "linear-gradient(135deg,#ff512f,#dd2476 55%,#7b2cbf)" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 20%, #ffd60a55, transparent 60%)" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Sunset" />
    </Bg>
  );
}

function OceanTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#38bdf8";
  return (
    <Bg style={{ background: "linear-gradient(160deg,#012a4a,#01497c 60%,#2a6f97)" }}>
      <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 100% 100%, ${a}55, transparent 55%)` }} />
      <CardBody card={card} variant="dark" accent={a} brand="Ocean" />
    </Bg>
  );
}

function ForestTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#84cc16";
  return (
    <Bg style={{ background: "linear-gradient(160deg,#0b3d2e,#164a3a 60%,#22593d)" }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Forest" />
    </Bg>
  );
}

function HolographicTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#c4b5fd";
  return (
    <Bg style={{ background: "linear-gradient(115deg,#a7f3d0,#93c5fd 25%,#c4b5fd 50%,#f9a8d4 75%,#fde68a)" }}>
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.6) 45%, transparent 70%)" }} />
      <CardBody card={card} variant="light" accent={a} brand="Holographic" />
    </Bg>
  );
}

function ExecutiveTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#c9a96e";
  return (
    <Bg style={{ background: "linear-gradient(180deg,#111827,#0b1120)" }}>
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: a }} />
      <CardBody card={card} variant="dark" accent={a} brand="Executive" />
    </Bg>
  );
}

function MonoTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#0a0a0a";
  return (
    <Bg style={{ background: "#ffffff" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <CardBody card={card} variant="light" accent={a} brand="Mono" />
    </Bg>
  );
}

function MarbleTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#7c34ff";
  return (
    <Bg style={{ background: "radial-gradient(circle at 20% 20%, #ffffff 0%, #ececec 25%, #d7d7d7 55%, #f5f5f5 80%)" }}>
      <div aria-hidden className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(120deg, transparent 30%, rgba(0,0,0,0.06) 50%, transparent 70%)" }} />
      <CardBody card={card} variant="light" accent={a} brand="Marble" />
    </Bg>
  );
}

function CarbonTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#22d3ee";
  return (
    <Bg style={{ background: "#0a0a0a" }}>
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(45deg, #1a1a1a 0 6px, #0a0a0a 6px 12px)" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Carbon" />
    </Bg>
  );
}

function SandTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#a0522d";
  return (
    <Bg style={{ background: "linear-gradient(160deg,#f5e6c8,#e8c9a0 60%,#c9a274)" }}>
      <CardBody card={card} variant="light" accent={a} brand="Sand" />
    </Bg>
  );
}

function RoseTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#fda4af";
  return (
    <Bg style={{ background: "linear-gradient(160deg,#831843,#be185d 60%,#f472b6)" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 100% 0%, #fda4af66, transparent 55%)" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Rose" />
    </Bg>
  );
}

function EmeraldTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#10b981";
  return (
    <Bg style={{ background: "linear-gradient(160deg,#022c22,#065f46 60%,#10b981)" }}>
      <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 0% 100%, #fbbf2455, transparent 55%)" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Emerald" />
    </Bg>
  );
}

function CosmicTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#a78bfa";
  return (
    <Bg style={{ background: "radial-gradient(ellipse at 30% 20%, #4c1d95 0%, #1e1b4b 40%, #030014 100%)" }}>
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#ffffff88 1px, transparent 1px), radial-gradient(#ffffff44 1px, transparent 1px)", backgroundSize: "40px 40px, 25px 25px", backgroundPosition: "0 0, 12px 8px" }} />
      <CardBody card={card} variant="dark" accent={a} brand="Cosmic" />
    </Bg>
  );
}

/* ---------- Contact actions (used on public page) ---------- */

export function ContactActions({ card }: { card: CardData }) {
  const items = [
    card.phone && { icon: Phone, label: card.phone, href: `tel:${card.phone}` },
    card.whatsapp && { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${card.whatsapp.replace(/\D/g, "")}` },
    card.email && { icon: Mail, label: card.email, href: `mailto:${card.email}` },
    card.website && {
      icon: Globe,
      label: card.website.replace(/^https?:\/\//, ""),
      href: card.website.startsWith("http") ? card.website : `https://${card.website}`,
    },
    card.address && { icon: MapPin, label: card.address, href: undefined },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href?: string }[];

  if (items.length === 0) return null;

  return (
    <div className="grid gap-2">
      {items.map((it, i) => (
        <ActionRow key={i} icon={<it.icon className="h-4 w-4" />} label={it.label} href={it.href} />
      ))}
    </div>
  );
}

function ActionRow({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  const inner = (
    <div className="glass card-lift flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}

export const TEMPLATE_META: { id: TemplateId; label: string; preview: string }[] = [
  { id: "luxury", label: "Luxury", preview: "linear-gradient(135deg,#161513,#050505)" },
  { id: "aurora", label: "Aurora", preview: "linear-gradient(135deg,#7c3aed,#22d3ee,#f472b6)" },
  { id: "ivory", label: "Ivory", preview: "linear-gradient(135deg,#faf7f0,#ece5d3)" },
  { id: "noir", label: "Noir", preview: "#0a0a0a" },
  { id: "neon", label: "Neon", preview: "linear-gradient(135deg,#22d3ee,#a78bfa)" },
  { id: "platinum", label: "Platinum", preview: "linear-gradient(135deg,#e8e8ea,#9a9aa2)" },
  { id: "midnight", label: "Midnight", preview: "linear-gradient(135deg,#0b1026,#1e3a8a)" },
  { id: "sunset", label: "Sunset", preview: "linear-gradient(135deg,#ff512f,#dd2476,#7b2cbf)" },
  { id: "ocean", label: "Ocean", preview: "linear-gradient(135deg,#012a4a,#2a6f97)" },
  { id: "forest", label: "Forest", preview: "linear-gradient(135deg,#0b3d2e,#22593d)" },
  { id: "holographic", label: "Holo", preview: "linear-gradient(115deg,#a7f3d0,#93c5fd,#c4b5fd,#f9a8d4,#fde68a)" },
  { id: "executive", label: "Executive", preview: "linear-gradient(135deg,#111827,#c9a96e)" },
  { id: "mono", label: "Mono", preview: "#ffffff" },
  { id: "marble", label: "Marble", preview: "radial-gradient(circle at 20% 20%,#ffffff,#d7d7d7)" },
  { id: "carbon", label: "Carbon", preview: "repeating-linear-gradient(45deg,#1a1a1a 0 6px,#0a0a0a 6px 12px)" },
  { id: "sand", label: "Sand", preview: "linear-gradient(135deg,#f5e6c8,#c9a274)" },
  { id: "rose", label: "Rose", preview: "linear-gradient(135deg,#831843,#f472b6)" },
  { id: "emerald", label: "Emerald", preview: "linear-gradient(135deg,#022c22,#10b981)" },
  { id: "cosmic", label: "Cosmic", preview: "radial-gradient(ellipse at 30% 20%,#4c1d95,#030014)" },
];
