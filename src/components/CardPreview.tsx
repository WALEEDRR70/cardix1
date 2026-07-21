import { Phone, Mail, Globe, MessageCircle, MapPin } from "lucide-react";

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
        ? "aspect-[1.62/1] w-full max-w-[420px]"
        : size === "xl"
          ? "aspect-[1.62/1] w-full max-w-[588px]"
          : "aspect-[1.62/1] w-full max-w-[380px]";
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
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ card, ring, fallbackBg }: { card: CardData; ring: string; fallbackBg: string }) {
  return (
    <div
      className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-lg font-semibold ring-1 ${ring} bg-cover bg-center shadow-lg`}
      style={{
        background: card.avatar_url ? undefined : fallbackBg,
        backgroundImage: card.avatar_url ? `url(${card.avatar_url})` : undefined,
      }}
    >
      {!card.avatar_url && initials(card.name || "")}
    </div>
  );
}

/* ---------- Templates ---------- */

function LuxuryTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#7c34ff";
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(160deg,#161513,#050505)" }}>
      <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 85% 0%, ${a}44, transparent 55%)` }} />
      <div
        className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${a}33, transparent 70%)` }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
        }}
      />
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center gap-3">
          <Avatar card={card} ring="ring-white/25" fallbackBg={`linear-gradient(135deg, ${a}, #6b4a15)`} />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold leading-tight">{card.name || "Your Name"}</p>
            {card.title && <p className="truncate text-xs text-white/70">{card.title}</p>}
            {card.company && <p className="truncate text-[11px] text-white/50">{card.company}</p>}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Cardix</div>
          <div className="h-6 w-6 rounded-md" style={{ background: `linear-gradient(135deg, ${a}, #6b4a15)` }} />
        </div>
      </div>
    </div>
  );
}

function AuroraTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full text-white" style={{ background: "var(--gradient-aurora)" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      <div className="glass-strong absolute inset-3 rounded-2xl" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <Avatar card={card} ring="ring-white/40" fallbackBg="linear-gradient(135deg,#a78bfa,#4ade80)" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{card.name || "Your Name"}</p>
            {card.title && <p className="truncate text-xs text-white/80">{card.title}</p>}
            {card.company && <p className="truncate text-[11px] text-white/60">{card.company}</p>}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Aurora · Cardix</div>
      </div>
    </div>
  );
}

function IvoryTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#9C7A3C";
  return (
    <div className="relative h-full w-full" style={{ background: "linear-gradient(160deg,#faf7f0,#ece5d3)", color: "#1a1a1a" }}>
      <div className="absolute right-4 top-4 h-8 w-8 rounded-full" style={{ background: a }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <p style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[26px] leading-none tracking-tight">
            {card.name || "Your Name"}
          </p>
          {card.title && <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/60">{card.title}</p>}
        </div>
        <div className="flex items-end justify-between">
          <div>
            {card.company && <p className="text-xs text-black/70">{card.company}</p>}
            {card.email && <p className="text-[11px] text-black/50">{card.email}</p>}
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-black/40">Ivory</div>
        </div>
      </div>
    </div>
  );
}

function NoirTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full text-white" style={{ background: "#0a0a0a" }}>
      <div className="absolute left-0 top-0 h-full w-1.5 bg-white" />
      <div className="relative flex h-full flex-col justify-between p-6 pl-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">{card.company || "Independent"}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs text-white/60">{card.title}</p>}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/70">
          {card.phone && <span>{card.phone}</span>}
          {card.email && <span className="truncate">{card.email}</span>}
        </div>
      </div>
    </div>
  );
}

function NeonTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#22d3ee";
  return (
    <div className="relative h-full w-full text-white" style={{ background: "#08070f" }}>
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle at 20% 100%, ${a}55, transparent 55%), radial-gradient(circle at 100% 0%, #a78bfa55, transparent 55%)`,
        }}
      />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <Avatar card={card} ring="ring-white/30" fallbackBg={`linear-gradient(135deg,${a},#a78bfa)`} />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{card.name || "Your Name"}</p>
            {card.title && <p className="truncate text-xs text-white/70">{card.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-6 rounded-full" style={{ background: a, boxShadow: `0 0 12px ${a}` }} />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Neon · Cardix</span>
        </div>
      </div>
    </div>
  );
}

function PlatinumTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full" style={{ color: "#141414", background: "linear-gradient(135deg,#e8e8ea,#b6b6bb 40%,#f4f4f5 60%,#9a9aa2)" }}>
      <div className="absolute inset-0 opacity-40" style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-black/50">Platinum</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs text-black/60">{card.title}</p>}
        </div>
        <div className="flex items-center justify-between text-[11px] text-black/60">
          <span>{card.company}</span>
          <span className="truncate">{card.website?.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Actions ---------- */

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

/* ---------- Extra Templates ---------- */

function MidnightTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#7c34ff";
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(160deg,#0b1026,#050817)" }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 20% 0%, ${a}55, transparent 60%), radial-gradient(ellipse at 100% 100%, #1e3a8a55, transparent 60%)` }} />
      <div aria-hidden className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#ffffff33 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/50">{card.company || "Midnight"}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs text-white/70">{card.title}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: a, boxShadow: `0 0 10px ${a}` }} />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Cardix</span>
        </div>
      </div>
    </div>
  );
}

function SunsetTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(135deg,#ff512f,#dd2476 55%,#7b2cbf)" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 20%, #ffd60a55, transparent 60%)" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <Avatar card={card} ring="ring-white/40" fallbackBg="linear-gradient(135deg,#ffd60a,#ff512f)" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{card.name || "Your Name"}</p>
            {card.title && <p className="truncate text-xs text-white/85">{card.title}</p>}
            {card.company && <p className="truncate text-[11px] text-white/70">{card.company}</p>}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/75">Sunset</div>
      </div>
    </div>
  );
}

function OceanTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#38bdf8";
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(160deg,#012a4a,#01497c 60%,#2a6f97)" }}>
      <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 100% 100%, ${a}55, transparent 55%)` }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">{card.company || "Ocean"}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs text-white/70">{card.title}</p>}
        </div>
        <div className="flex items-end justify-between text-[11px] text-white/70">
          <span>{card.email}</span>
          <span className="h-6 w-6 rounded-full ring-2 ring-white/40" style={{ background: a }} />
        </div>
      </div>
    </div>
  );
}

function ForestTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(160deg,#0b3d2e,#164a3a 60%,#22593d)" }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <Avatar card={card} ring="ring-white/25" fallbackBg="linear-gradient(135deg,#84cc16,#166534)" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{card.name || "Your Name"}</p>
            {card.title && <p className="truncate text-xs text-white/75">{card.title}</p>}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/60">Forest · Cardix</div>
      </div>
    </div>
  );
}

function HolographicTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(115deg,#a7f3d0,#93c5fd 25%,#c4b5fd 50%,#f9a8d4 75%,#fde68a)" }}>
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.6) 45%, transparent 70%)" }} />
      <div className="relative flex h-full flex-col justify-between p-6" style={{ color: "#1a1030" }}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-70">Holographic</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs opacity-80">{card.title}</p>}
        </div>
        <div className="text-[10px] uppercase tracking-[0.35em] opacity-70">{card.company || "Cardix"}</div>
      </div>
    </div>
  );
}

function ExecutiveTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#c9a96e";
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(180deg,#111827,#0b1120)" }}>
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: a }} />
      <div className="relative flex h-full flex-col justify-between p-6 pl-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em]" style={{ color: a }}>{card.company || "Executive"}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs text-white/70">{card.title}</p>}
        </div>
        <div className="flex items-end justify-between text-[11px] text-white/60">
          <span>{card.phone}</span>
          <span className="truncate">{card.website?.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    </div>
  );
}

function MonoTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full" style={{ background: "#ffffff", color: "#0a0a0a" }}>
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-black/50">{card.company || "Studio"}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs text-black/60">{card.title}</p>}
        </div>
        <div className="flex items-end justify-between text-[11px] text-black/60">
          <span>{card.email}</span>
          <span>Cardix</span>
        </div>
      </div>
    </div>
  );
}

function MarbleTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#7c34ff";
  return (
    <div className="relative h-full w-full" style={{ color: "#1a1a1a", background: "radial-gradient(circle at 20% 20%, #ffffff 0%, #ececec 25%, #d7d7d7 55%, #f5f5f5 80%)" }}>
      <div aria-hidden className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(120deg, transparent 30%, rgba(0,0,0,0.06) 50%, transparent 70%)" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <p style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[28px] leading-none">{card.name || "Your Name"}</p>
          {card.title && <p className="mt-1 text-xs uppercase tracking-[0.25em] text-black/60">{card.title}</p>}
        </div>
        <div className="flex items-center justify-between text-[11px] text-black/60">
          <span>{card.company}</span>
          <span className="h-2 w-10 rounded-full" style={{ background: a }} />
        </div>
      </div>
    </div>
  );
}

function CarbonTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#22d3ee";
  return (
    <div className="relative h-full w-full text-white" style={{ background: "#0a0a0a" }}>
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(45deg, #1a1a1a 0 6px, #0a0a0a 6px 12px)" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <Avatar card={card} ring="ring-white/20" fallbackBg={`linear-gradient(135deg, ${a}, #1a1a1a)`} />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{card.name || "Your Name"}</p>
            {card.title && <p className="truncate text-xs text-white/70">{card.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/50">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: a }} /> Carbon
        </div>
      </div>
    </div>
  );
}

function SandTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#a0522d";
  return (
    <div className="relative h-full w-full" style={{ background: "linear-gradient(160deg,#f5e6c8,#e8c9a0 60%,#c9a274)", color: "#3d2914" }}>
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-70">{card.company || "Sand"}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs opacity-70">{card.title}</p>}
        </div>
        <div className="h-1 w-16 rounded-full" style={{ background: a }} />
      </div>
    </div>
  );
}

function RoseTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(160deg,#831843,#be185d 60%,#f472b6)" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 100% 0%, #fda4af66, transparent 55%)" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <Avatar card={card} ring="ring-white/40" fallbackBg="linear-gradient(135deg,#fda4af,#be185d)" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{card.name || "Your Name"}</p>
            {card.title && <p className="truncate text-xs text-white/85">{card.title}</p>}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/70">Rose · Cardix</div>
      </div>
    </div>
  );
}

function EmeraldTemplate({ card }: { card: CardData }) {
  return (
    <div className="relative h-full w-full text-white" style={{ background: "linear-gradient(160deg,#022c22,#065f46 60%,#10b981)" }}>
      <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 0% 100%, #fbbf2455, transparent 55%)" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">{card.company || "Emerald"}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{card.name || "Your Name"}</p>
          {card.title && <p className="text-xs text-white/80">{card.title}</p>}
        </div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/60">Cardix</div>
      </div>
    </div>
  );
}

function CosmicTemplate({ card }: { card: CardData }) {
  const a = card.accent_color || "#a78bfa";
  return (
    <div className="relative h-full w-full text-white" style={{ background: "radial-gradient(ellipse at 30% 20%, #4c1d95 0%, #1e1b4b 40%, #030014 100%)" }}>
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#ffffff88 1px, transparent 1px), radial-gradient(#ffffff44 1px, transparent 1px)", backgroundSize: "40px 40px, 25px 25px", backgroundPosition: "0 0, 12px 8px" }} />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center gap-3">
          <Avatar card={card} ring="ring-white/30" fallbackBg={`linear-gradient(135deg, ${a}, #4c1d95)`} />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{card.name || "Your Name"}</p>
            {card.title && <p className="truncate text-xs text-white/75">{card.title}</p>}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/60">Cosmic</div>
      </div>
    </div>
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
