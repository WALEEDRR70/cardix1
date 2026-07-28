import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import { getReadableText } from "@/lib/contrast";
import { useDragScroll } from "@/lib/use-drag-scroll";
import { SOCIALS_BY_ID, type SocialId } from "@/lib/socials";
import type { CompanyService } from "@/lib/company-services";
import { mailHref, mapsHref, siteHref, telHref, waHref } from "./contact";
import type { publicDict } from "./strings";

type D = ReturnType<typeof publicDict>;

/* ---------------------------------------------- primitives */

export function ActionButton({
  href,
  onClick,
  icon: Icon,
  label,
  primary,
  accent,
  iconOnly,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ElementType;
  label: string;
  primary?: boolean;
  accent: string;
  iconOnly?: boolean;
}) {
  const cls = iconOnly
    ? "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border/60 bg-card/60 text-foreground transition hover:border-foreground/30"
    : primary
    ? "flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:opacity-90"
    : "flex h-11 items-center justify-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 text-sm font-medium text-foreground transition hover:border-foreground/30";
  const style = primary && !iconOnly ? { background: accent, color: getReadableText(accent) } : undefined;
  const inner = (
    <>
      <Icon className="h-4 w-4 shrink-0" style={primary && !iconOnly ? undefined : { color: accent }} />
      {!iconOnly && <span className="truncate">{label}</span>}
    </>
  );
  if (href)
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls} style={style} onClick={onClick} aria-label={iconOnly ? label : undefined}>
        {inner}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls} style={style} aria-label={iconOnly ? label : undefined}>
      {inner}
    </button>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <h2 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      {action}
    </div>
  );
}

/* ---------------------------------------------- hero */

export function CompanyHero({
  company,
  accent,
  d,
  actions,
}: {
  company: {
    name: string;
    legal_name?: string | null;
    tagline?: string | null;
    description?: string | null;
    logo_url?: string | null;
    cover_url?: string | null;
    is_verified?: boolean;
  };
  accent: string;
  d: D;
  actions: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const lead = company.tagline || company.description?.split(/\n/)[0] || "";
  const rest = company.tagline ? company.description : company.description?.split(/\n/).slice(1).join("\n");

  return (
    <header className="relative overflow-hidden rounded-b-[2.5rem] border-b border-border/50">
      <div className="relative h-44 w-full overflow-hidden sm:h-60">
        {company.cover_url ? (
          <img src={company.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        ) : (
          <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${accent}55, transparent 70%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
      </div>

      <div className="mx-auto -mt-14 w-full max-w-5xl px-5 pb-7 sm:-mt-16">
        <span
          className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border border-border/60 bg-card p-2 shadow-lg sm:h-28 sm:w-28"
          style={{ color: accent }}
        >
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-full w-full object-contain" />
          ) : (
            <Building2 className="h-9 w-9" />
          )}
        </span>


        <h1 className="mt-4 flex items-center gap-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="min-w-0 break-words">{company.name}</span>
          {company.is_verified && <BadgeCheck className="h-6 w-6 shrink-0" style={{ color: accent }} />}
        </h1>
        {lead && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{lead}</p>}
        {rest && (
          <>
            {open && <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{rest}</p>}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-1.5 text-xs font-medium"
              style={{ color: accent }}
            >
              {open ? d.less : d.more}
            </button>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-2">{actions}</div>
      </div>
    </header>
  );
}

/* ---------------------------------------------- trust bar */

export function TrustBar({ items }: { items: { icon: React.ElementType; label: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border/50 py-3 text-[12px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <it.icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{it.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------- services */

export function ServiceCard({
  service,
  slug,
  accent,
  d,
  fallbackPhone,
  fallbackWhatsapp,
  fallbackEmail,
  onRequest,
}: {
  service: CompanyService;
  slug: string;
  accent: string;
  d: D;
  fallbackPhone?: string | null;
  fallbackWhatsapp?: string | null;
  fallbackEmail?: string | null;
  onRequest?: () => void;
}) {
  const request =
    waHref(service.whatsapp || fallbackWhatsapp) ||
    telHref(service.phone || fallbackPhone) ||
    mailHref(service.email || fallbackEmail);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/40 transition hover:border-foreground/20">
      <Link
        to="/company/$slug/services/$service"
        params={{ slug, service: service.slug }}
        className="block"
      >
        {service.image_url ? (
          <img src={service.image_url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="aspect-[16/9] w-full" style={{ background: `linear-gradient(135deg, ${accent}33, transparent)` }} />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to="/company/$slug/services/$service" params={{ slug, service: service.slug }} className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{service.name}</h3>
          {service.summary && <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{service.summary}</p>}
        </Link>
        {(service.price || service.duration) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {service.price && (
              <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: `${accent}1f`, color: accent }}>
                {service.price}
              </span>
            )}
            {service.duration && (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">{service.duration}</span>
            )}
          </div>
        )}
        <div className="mt-4 flex items-center gap-2 pt-0">
          {request && (
            <a
              href={request}
              target={request.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              onClick={onRequest}
              className="flex h-9 flex-1 items-center justify-center rounded-full text-[12px] font-semibold transition hover:opacity-90"
              style={{ background: accent, color: getReadableText(accent) }}
            >
              {d.requestService}
            </a>
          )}
          <Link
            to="/company/$slug/services/$service"
            params={{ slug, service: service.slug }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 text-muted-foreground transition hover:text-foreground"
            aria-label={service.name}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------- team */

type TeamCard = { id: string; slug: string; name: string; title: string | null; avatar_url: string | null };

export function TeamRail({ slug, cards, accent, onOpen }: { slug: string; cards: TeamCard[]; accent: string; onOpen?: () => void }) {
  const ref = useDragScroll<HTMLDivElement>();
  return (
    <div ref={ref} className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {cards.map((c) => (
        <Link
          key={c.id}
          to="/company/$slug/$employee"
          params={{ slug, employee: c.slug }}
          onClick={onOpen}
          className="w-[150px] shrink-0 snap-start rounded-2xl border border-border/60 bg-card/40 p-4 text-center transition hover:border-foreground/20"
        >
          <span className="mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-semibold" style={{ color: accent }}>
            {c.avatar_url ? <img src={c.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" /> : c.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="mt-3 block truncate text-[13px] font-medium">{c.name}</span>
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{c.title}</span>
        </Link>
      ))}
    </div>
  );
}

export function TeamGrouped({
  slug,
  departments,
  cards,
  accent,
}: {
  slug: string;
  departments: { id: string | null; name: string }[];
  cards: (TeamCard & { department_id: string | null })[];
  accent: string;
}) {
  return (
    <div className="space-y-6">
      {[...departments, { id: null as string | null, name: "—" }]
        .map((dep) => ({ dep, list: cards.filter((c) => c.department_id === dep.id) }))
        .filter(({ list }) => list.length > 0)
        .map(({ dep, list }) => (
          <div key={dep.id ?? "none"}>
            {departments.length > 0 && (
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{dep.name}</p>
            )}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <Link
                  key={c.id}
                  to="/company/$slug/$employee"
                  params={{ slug, employee: c.slug }}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 transition hover:border-foreground/20"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-xs font-semibold" style={{ color: accent }}>
                    {c.avatar_url ? <img src={c.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" /> : c.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{c.title}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

/* ---------------------------------------------- branches */

export function BranchCard({
  branch,
  accent,
  d,
}: {
  branch: { id: string; name: string; address: string | null; city: string | null; country: string | null; phone: string | null; map_url: string | null };
  accent: string;
  d: D;
}) {
  const map = branch.map_url || mapsHref(branch.name, branch.address, branch.city, branch.country);
  return (
    <div className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-4">
      <p className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
        <span className="truncate">{branch.name}</span>
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
        {[branch.address, branch.city, branch.country].filter(Boolean).join(" · ")}
      </p>
      <div className="mt-3 flex gap-2">
        {map && (
          <a
            href={map}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border/60 text-[12px] font-medium transition hover:border-foreground/30"
          >
            <Navigation className="h-3.5 w-3.5" style={{ color: accent }} />
            {d.directions}
          </a>
        )}
        {branch.phone && (
          <a
            href={telHref(branch.phone)}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border/60 text-[12px] font-medium transition hover:border-foreground/30"
          >
            <Phone className="h-3.5 w-3.5" style={{ color: accent }} />
            {d.call}
          </a>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------- share / footer */

export function ShareBlock({
  url,
  accent,
  d,
  socials,
  onShare,
  contact,
}: {
  url: string;
  accent: string;
  d: D;
  socials: Record<string, string>;
  onShare: () => void;
  contact?: { href: string; label: string };
}) {
  const entries = Object.entries(socials).filter(([id, v]) => v && SOCIALS_BY_ID[id as SocialId]);
  return (
    <section className="rounded-3xl border border-border/60 bg-card/40 p-6">
      <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <div className="mx-auto rounded-2xl bg-white p-3 sm:mx-0">
          <QRCodeSVG value={url} size={132} level="M" bgColor="#ffffff" fgColor="#0a0a0a" />
        </div>
        <div className="text-center sm:text-start">
          <h2 className="text-lg font-semibold tracking-tight">{d.scanTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{d.scanDesc}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <ActionButton icon={Share2} label={d.share} onClick={onShare} primary accent={accent} />
            {contact && <ActionButton icon={Mail} label={contact.label} href={contact.href} accent={accent} />}
          </div>
          {entries.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {entries.map(([id, v]) => {
                const meta = SOCIALS_BY_ID[id as SocialId];
                return (
                  <a
                    key={id}
                    href={meta.toUrl(v)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={meta.name}
                    className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition hover:text-foreground"
                  >
                    <meta.Icon size={16} />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------- sticky mobile bar */

export function StickyActionBar({ children, showAfter = 260 }: { children: React.ReactNode; showAfter?: number }) {
  const [show, setShow] = useState(false);
  const raf = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setShow(window.scrollY > showAfter));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [showAfter]);

  return (
    <div
      className={
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl transition-transform duration-200 sm:hidden " +
        (show ? "translate-y-0" : "translate-y-full")
      }
    >
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export const HeroIcons = { UserPlus, MessageCircle, Phone, Mail, Globe, Users, MapPin, BadgeCheck };
export { siteHref, mapsHref, telHref, mailHref, waHref };
