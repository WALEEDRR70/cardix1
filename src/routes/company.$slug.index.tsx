import { createFileRoute } from "@tanstack/react-router";
import { getPreferredLocale } from "@/lib/locale-routing";
import { CompanyPageView } from "@/components/company/public/CompanyPageView";

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

function CompanyPage() {
  const { slug } = Route.useParams();
  return <CompanyPageView slug={slug} locale={getPreferredLocale()} />;
}
