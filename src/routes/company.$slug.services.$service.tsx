import { createFileRoute } from "@tanstack/react-router";
import { getPreferredLocale } from "@/lib/locale-routing";
import { ServicePageView } from "@/components/company/public/ServicePageView";

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
  return <ServicePageView slug={slug} service={service} locale={getPreferredLocale()} />;
}
