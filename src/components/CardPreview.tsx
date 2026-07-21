import { Phone, Mail, Globe, MessageCircle, MapPin, Building2 } from "lucide-react";

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
  template?: string;
}

export function CardPreview({ card }: { card: CardData }) {
  const accent = card.accent_color || "#D4AF37";
  const initials = card.name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[oklch(0.13_0_0)] text-white shadow-luxe"
      style={{ ["--card-accent" as string]: accent }}
    >
      <div
        className="absolute inset-x-0 top-0 h-32 opacity-70"
        style={{ background: `radial-gradient(circle at 30% 0%, ${accent}55, transparent 60%)` }}
      />
      <div className="relative p-8">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-semibold ring-1 ring-white/20"
            style={{
              background: card.avatar_url ? undefined : `linear-gradient(135deg, ${accent}, #a8842a)`,
              backgroundImage: card.avatar_url ? `url(${card.avatar_url})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!card.avatar_url && initials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight">{card.name || "Your Name"}</h2>
            {card.title && <p className="truncate text-sm text-white/70">{card.title}</p>}
            {card.company && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/60">
                <Building2 className="h-3 w-3" /> {card.company}
              </p>
            )}
          </div>
        </div>

        {card.bio && (
          <p className="mt-5 text-sm leading-relaxed text-white/70 line-clamp-3">{card.bio}</p>
        )}

        <div className="mt-6 space-y-2">
          {card.phone && <Row icon={<Phone className="h-4 w-4" />} label={card.phone} href={`tel:${card.phone}`} />}
          {card.whatsapp && (
            <Row icon={<MessageCircle className="h-4 w-4" />} label={card.whatsapp} href={`https://wa.me/${card.whatsapp.replace(/\D/g, "")}`} />
          )}
          {card.email && <Row icon={<Mail className="h-4 w-4" />} label={card.email} href={`mailto:${card.email}`} />}
          {card.website && <Row icon={<Globe className="h-4 w-4" />} label={card.website.replace(/^https?:\/\//, "")} href={card.website.startsWith("http") ? card.website : `https://${card.website}`} />}
          {card.address && <Row icon={<MapPin className="h-4 w-4" />} label={card.address} />}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10 transition hover:bg-white/10">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80">
        {icon}
      </span>
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
