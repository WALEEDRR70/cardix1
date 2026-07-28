import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Calendar, Globe, Mail, MapPin, MessageCircle, Phone, Users, UserPlus, BadgeCheck } from "lucide-react";
import { getPreferredLocale } from "@/lib/locale-routing";
import { publishedServices } from "@/lib/company-services";
import { publicDict } from "@/components/company/public/strings";
import { wsDict } from "@/i18n/workspace";
import { downloadCompanyVCard, mailHref, siteHref, telHref, waHref } from "@/components/company/public/contact";
import {
  ActionButton,
  BranchCard,
  CompanyHero,
  SectionHeading,
  ServiceCard,
  ShareBlock,
  StickyActionBar,
  TeamGrouped,
  TeamRail,
  TrustBar,
} from "@/components/company/public/sections";

export const Route = createFileRoute("/company/$slug/")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Company on Cardixn` },
      { name: "description", content: `Official digital business card page, team and contact details for ${params.slug} on Cardixn.` },
      { property: "og:title", content: `${params.slug} — Company on Cardixn` },
      { property: "og:description", content: `Official digital business card page for ${params.slug}.` },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: `https://cardixn.com/company/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `https://cardixn.com/company/${params.slug}` }],
  }),
  component: CompanyPage,
});

const MAX_SERVICES = 6;
const MAX_TEAM_RAIL = 8;

function CompanyPage() {
  const { slug } = Route.useParams();
  const locale = getPreferredLocale();
  const d = publicDict(locale === "ar" ? "ar" : "en");
  const w = wsDict(locale);
  const [allServices, setAllServices] = useState(false);
  const [fullTeam, setFullTeam] = useState(false);

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

  const services = useMemo(() => publishedServices(data?.company.services), [data]);

  if (isLoading) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.loading}</div>;
  if (!data) return <div className="grid min-h-[100dvh] place-items-center text-sm text-muted-foreground">{w.companyNotFound}</div>;

  const { company, branches, departments, cards } = data;
  const accent = company.brand_primary;
  const publicUrl = typeof window !== "undefined" ? window.location.href : `https://cardixn.com/company/${slug}`;
  const socials = (company.socials as Record<string, string> | null) ?? {};
  const shownServices = allServices ? services : services.slice(0, MAX_SERVICES);
  const teamVisible = company.show_employees && cards.length > 0;

  async function share() {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: company.name, url: publicUrl });
        return;
      } catch {
        /* dismissed */
      }
    }
    await navigator.clipboard.writeText(publicUrl);
    toast.success(d.linkCopied);
  }

  const wa = waHref(company.phone);
  const tel = telHref(company.phone);
  const mail = mailHref(company.email);
  const site = siteHref(company.website);

  const primaryAction = (
    <ActionButton icon={UserPlus} label={d.saveContact} primary accent={accent} onClick={() => downloadCompanyVCard(company)} />
  );

  const trust = [
    company.is_verified && { icon: BadgeCheck, label: d.verified },
    (company.city || company.country) && { icon: MapPin, label: [company.city, company.country].filter(Boolean).join(", ") },
    company.founded_year && { icon: Calendar, label: `${d.founded} ${company.founded_year}` },
    branches.length > 0 && { icon: Building2, label: d.branchesCount(branches.length) },
    teamVisible && { icon: Users, label: d.teamCount(cards.length) },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    legalName: company.legal_name || undefined,
    description: company.description || undefined,
    url: `https://cardixn.com/company/${company.slug}`,
    logo: company.logo_url || undefined,
    image: company.cover_url || company.logo_url || undefined,
    telephone: company.phone || undefined,
    email: company.email || undefined,
    sameAs: Object.values(socials).filter(Boolean),
    address: company.address
      ? { "@type": "PostalAddress", streetAddress: company.address, addressLocality: company.city || undefined, addressCountry: company.country || undefined }
      : undefined,
  };

  return (
    <div className="min-h-[100dvh] pb-24 sm:pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <CompanyHero
        company={company}
        accent={accent}
        d={d}
        actions={
          <>
            {primaryAction}
            {wa && <ActionButton icon={MessageCircle} label={d.whatsapp} href={wa} accent={accent} />}
            {tel && <ActionButton icon={Phone} label={d.call} href={tel} accent={accent} />}
            {mail && <ActionButton icon={Mail} label={d.email} href={mail} accent={accent} />}
            {site && <ActionButton icon={Globe} label={d.website} href={site} accent={accent} />}
          </>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-5">
        <TrustBar items={trust} />

        {services.length > 0 && (
          <section className="mt-10">
            <SectionHeading
              title={d.services}
              action={
                services.length > MAX_SERVICES && !allServices ? (
                  <button type="button" onClick={() => setAllServices(true)} className="text-xs font-medium" style={{ color: accent }}>
                    {d.allServices}
                  </button>
                ) : undefined
              }
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shownServices.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  slug={company.slug}
                  accent={accent}
                  d={d}
                  fallbackPhone={company.phone}
                  fallbackWhatsapp={company.phone}
                  fallbackEmail={company.email}
                />
              ))}
            </div>
          </section>
        )}

        {teamVisible && (
          <section className="mt-12">
            <SectionHeading
              title={d.team}
              action={
                cards.length > MAX_TEAM_RAIL || !fullTeam ? (
                  <button type="button" onClick={() => setFullTeam((v) => !v)} className="text-xs font-medium" style={{ color: accent }}>
                    {fullTeam ? d.less : d.fullTeam}
                  </button>
                ) : undefined
              }
            />
            {fullTeam ? (
              <TeamGrouped slug={company.slug} departments={departments} cards={cards} accent={accent} />
            ) : (
              <TeamRail slug={company.slug} cards={cards.slice(0, MAX_TEAM_RAIL)} accent={accent} />
            )}
          </section>
        )}

        {branches.length > 0 && (
          <section className="mt-12">
            <SectionHeading title={d.branches} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((b) => (
                <BranchCard key={b.id} branch={b} accent={accent} d={d} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <ShareBlock
            url={publicUrl}
            accent={accent}
            d={d}
            socials={socials}
            onShare={share}
            contact={mail ? { href: mail, label: d.getInTouch } : undefined}
          />
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <Link to="/">Cardixn</Link>
        </p>
      </main>

      <StickyActionBar>
        <div className="flex-1">
          <ActionButton icon={UserPlus} label={d.saveContact} primary accent={accent} onClick={() => downloadCompanyVCard(company)} />
        </div>
        {wa && <ActionButton icon={MessageCircle} label={d.whatsapp} href={wa} accent={accent} />}
        {tel && <ActionButton icon={Phone} label={d.call} href={tel} accent={accent} />}
      </StickyActionBar>
    </div>
  );
}
