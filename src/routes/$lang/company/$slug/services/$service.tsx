import { createFileRoute } from "@tanstack/react-router";
import { ServicePageView } from "@/components/company/public/ServicePageView";

export const Route = createFileRoute("/$lang/company/$slug/services/$service")({
  head: ({ params }) => {
    const url = `https://cardixn.com/${params.lang}/company/${params.slug}/services/${params.service}`;
    return {
      meta: [
        { title: `${params.service.replace(/-/g, " ")} — ${params.slug} services` },
        { name: "description", content: `Service details, pricing and direct contact for ${params.service.replace(/-/g, " ")} by ${params.slug}.` },
        { property: "og:title", content: `${params.service.replace(/-/g, " ")} — ${params.slug}` },
        { property: "og:description", content: `Service details and contact options by ${params.slug} on Cardixn.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: LocalizedServicePage,
});

function LocalizedServicePage() {
  const { slug, service, lang } = Route.useParams();
  return <ServicePageView slug={slug} service={service} locale={lang} lang={lang} />;
}
