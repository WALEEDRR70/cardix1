import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Building2, Check, Globe, Mail, MessageCircle, Phone } from "lucide-react";
import { getPreferredLocale } from "@/lib/locale-routing";
import { findService } from "@/lib/company-services";
import { tx } from "@/lib/tx";

export const Route = createFileRoute("/company/$slug/services/$service")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.service.replace(/-/g, " ")} — ${params.slug} services` },
      { name: "description", content: `Service details, pricing and direct contact for ${params.service.replace(/-/g, " ")} by ${params.slug}.` },
      { property: "og:title", content: `${params.service.replace(/-/g, " ")} — ${params.slug}` },
      { property: "og:description", content: `Service details and contact options by ${params.slug} on Cardixn.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicePage,
});

function ServicePage() {
  const { slug, service } = Route.useParams();
  const ar = getPreferredLocale() === "ar";

  const { data, isLoading } = useQuery({
    queryKey: ["public-company-service", slug, service],
    queryFn: async () => {
      const { data: company } = await supabase
        .from("companies")
        .select("id, slug, name, logo_url, brand_primary, brand_secondary, phone, email, website, services")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (!company) return null;
      return { company, service: findService(company.services, service) ?? null };
    },
  });

  if (isLoading) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{tx("Loading…")}</div>;
  if (!data?.service) {
    return (
      <div className="grid min-h-[100dvh] place-items-center gap-3 px-6 text-center text-sm text-muted-foreground">
        <p>{tx("Service not found")}</p>
        <Link to="/company/$slug" params={{ slug }} className="text-accent underline">
          {tx("Back to company page")}
        </Link>
      </div>
    );
  }

  const { company, service: s } = data;
  const accent = company.brand_primary;
  const phone = s.phone || company.phone;
  const email = s.email || company.email;
  const wa = (s.whatsapp || "").replace(/[^\d+]/g, "");

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-5 pb-24">
      <Link
        to="/company/$slug"
        params={{ slug }}
        className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        {company.name}
      </Link>

      <div
        className="mt-4 overflow-hidden rounded-[2rem] border border-border/60"
        style={{ background: `linear-gradient(135deg, ${accent}26, transparent)` }}
      >
        {s.image_url && <img src={s.image_url} alt={s.name} className="h-48 w-full object-cover" loading="lazy" />}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border/60 bg-card" style={{ color: accent }}>
              {company.logo_url ? <img src={company.logo_url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-5 w-5" />}
            </span>
            <p className="text-xs text-muted-foreground">{company.name}</p>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{s.name}</h1>
          {s.summary && <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {s.price && <Chip accent={accent}>{s.price}</Chip>}
            {s.duration && <Chip accent={accent}>{s.duration}</Chip>}
          </div>
        </div>
      </div>

      {s.description && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold tracking-tight">{tx("Details")}</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{s.description}</p>
        </section>
      )}

      {(s.features ?? []).length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold tracking-tight">{tx("Highlights")}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(s.features ?? []).map((f, i) => (
              <li key={`${f}-${i}`} className="glass flex items-center gap-2 rounded-2xl border border-border/60 px-4 py-3 text-sm">
                <Check className="h-4 w-4 shrink-0" style={{ color: accent }} />
                <span className="min-w-0 flex-1">{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold tracking-tight">{tx("Get in touch")}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {phone && <ActionRow icon={<Phone className="h-4 w-4" />} label={phone} href={`tel:${phone}`} accent={accent} />}
          {wa && <ActionRow icon={<MessageCircle className="h-4 w-4" />} label={tx("WhatsApp")} href={`https://wa.me/${wa.replace(/\D/g, "")}`} accent={accent} />}
          {email && <ActionRow icon={<Mail className="h-4 w-4" />} label={email} href={`mailto:${email}?subject=${encodeURIComponent(s.name)}`} accent={accent} />}
          {(s.website || company.website) && (
            <ActionRow icon={<Globe className="h-4 w-4" />} label={s.website || company.website!} href={s.website || company.website!} accent={accent} />
          )}
        </div>
      </section>
    </main>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: `${accent}55`, color: accent }}>
      {children}
    </span>
  );
}

function ActionRow({ icon, label, href, accent }: { icon: React.ReactNode; label: string; href: string; accent: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="glass flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 text-sm transition hover:border-accent/50"
    >
      <span style={{ color: accent }}>{icon}</span>
      <span className="truncate">{label}</span>
    </a>
  );
}
