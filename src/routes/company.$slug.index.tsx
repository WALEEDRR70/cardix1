import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BadgeCheck, Building2, Globe, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { wsDict } from "@/i18n/workspace";
import { getPreferredLocale } from "@/lib/locale-routing";

export const Route = createFileRoute("/company/$slug/")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Company on Cardixn` },
      { name: "description", content: `Official digital business card page, team and contact details for ${params.slug} on Cardixn.` },
      { property: "og:title", content: `${params.slug} — Company on Cardixn` },
      { property: "og:description", content: `Official digital business card page for ${params.slug}.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  const { slug } = Route.useParams();
  const w = wsDict(getPreferredLocale());

  const { data, isLoading } = useQuery({
    queryKey: ["public-company", slug],
    queryFn: async () => {
      const { data: company } = await supabase.from("companies").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (!company) return null;
      const [{ data: branches }, { data: departments }, { data: cards }] = await Promise.all([
        supabase.from("company_branches").select("*").eq("company_id", company.id).order("sort_order"),
        supabase.from("company_departments").select("id, name").eq("company_id", company.id).order("sort_order"),
        supabase
          .from("cards")
          .select("id, slug, name, title, avatar_url, department_id, card_type")
          .eq("company_id", company.id)
          .eq("card_type", "employee")
          .eq("is_active", true)
          .eq("is_published", true),
      ]);
      return { company, branches: branches ?? [], departments: departments ?? [], cards: cards ?? [] };
    },
  });

  if (isLoading) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.loading}</div>;
  if (!data) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.companyNotFound}</div>;

  const { company, branches, departments, cards } = data;
  const services = publishedServices(company.services);
  const accent = company.brand_primary;


  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-5 pb-20">
      <div
        className="relative mt-6 overflow-hidden rounded-[2rem] border border-border/60"
        style={{ background: company.cover_url ? undefined : `linear-gradient(135deg, ${accent}33, transparent)` }}
      >
        {company.cover_url && <img src={company.cover_url} alt="" className="h-40 w-full object-cover" />}
        <div className={"flex items-end gap-4 p-6 " + (company.cover_url ? "-mt-10" : "")}>
          <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-border/60 bg-card" style={{ color: accent }}>
            {company.logo_url ? <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" /> : <Building2 className="h-7 w-7" />}
          </span>
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <span className="truncate">{company.name}</span>
              {company.is_verified && <BadgeCheck className="h-5 w-5" style={{ color: accent }} />}
            </h1>
            {company.legal_name && <p className="text-xs text-muted-foreground">{company.legal_name}</p>}
          </div>
        </div>
      </div>

      {company.description && <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{company.description}</p>}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {company.website && <ContactRow icon={<Globe className="h-4 w-4" />} label={company.website} href={company.website} accent={accent} />}
        {company.email && <ContactRow icon={<Mail className="h-4 w-4" />} label={company.email} href={`mailto:${company.email}`} accent={accent} />}
        {company.phone && <ContactRow icon={<Phone className="h-4 w-4" />} label={company.phone} href={`tel:${company.phone}`} accent={accent} />}
        {company.address && <ContactRow icon={<MapPin className="h-4 w-4" />} label={company.address} accent={accent} />}
      </div>

      {services.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-tight">{getPreferredLocale() === "ar" ? "خدماتنا" : "Our services"}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <Link
                key={s.id}
                to="/company/$slug/services/$service"
                params={{ slug: company.slug, service: s.slug }}
                className="glass flex items-center gap-3 rounded-2xl border border-border/60 p-4 transition hover:border-accent/50"
              >
                {s.image_url && <img src={s.image_url} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" loading="lazy" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{s.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{s.summary || s.price || ""}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
              </Link>
            ))}
          </div>
        </section>
      )}


      {branches.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-tight">{w.branches}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {branches.map((b) => (
              <div key={b.id} className="glass rounded-2xl border border-border/60 p-4">
                <p className="text-sm font-medium">{b.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{[b.city, b.country, b.address].filter(Boolean).join(" · ")}</p>
                {b.phone && <p className="mt-1 text-xs" style={{ color: accent }}>{b.phone}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {company.show_employees && cards.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-tight">{w.ourTeam}</h2>
          <div className="space-y-5">
            {[...departments, { id: null as string | null, name: "—" }]
              .map((dep) => ({ dep, list: cards.filter((c) => c.department_id === dep.id) }))
              .filter(({ list }) => list.length > 0)
              .map(({ dep, list }) => (
                <div key={dep.id ?? "none"}>
                  {departments.length > 0 && <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{dep.name}</p>}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {list.map((c) => (
                      <Link
                        key={c.id}
                        to="/company/$slug/$employee"
                        params={{ slug: company.slug, employee: c.slug }}
                        className="glass flex items-center gap-3 rounded-2xl border border-border/60 p-3 transition hover:border-accent/50"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-xs font-semibold" style={{ color: accent }}>
                          {c.avatar_url ? <img src={c.avatar_url} alt="" className="h-full w-full object-cover" /> : c.name.slice(0, 2).toUpperCase()}
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
        </section>
      )}
    </main>
  );
}

function ContactRow({ icon, label, href, accent }: { icon: React.ReactNode; label: string; href?: string; accent: string }) {
  const inner = (
    <span className="glass flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 text-sm">
      <span style={{ color: accent }}>{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{inner}</a> : inner;
}
