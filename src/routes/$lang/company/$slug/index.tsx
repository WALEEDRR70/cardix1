import { createFileRoute } from "@tanstack/react-router";
import { CompanyPageView } from "@/components/company/public/CompanyPageView";

export const Route = createFileRoute("/$lang/company/$slug/")({
  head: ({ params }) => {
    const url = `https://cardixn.com/${params.lang}/company/${params.slug}`;
    return {
      meta: [
        { title: `${params.slug} — Company on Cardixn` },
        { name: "description", content: `Official digital business card page, team and contact details for ${params.slug} on Cardixn.` },
        { property: "og:title", content: `${params.slug} — Company on Cardixn` },
        { property: "og:description", content: `Official digital business card page for ${params.slug}.` },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: LocalizedCompanyPage,
});

function LocalizedCompanyPage() {
  const { slug, lang } = Route.useParams();
  return <CompanyPageView slug={slug} locale={lang} lang={lang} />;
}
