import { createFileRoute } from "@tanstack/react-router";
import { PublicCardView } from "@/routes/c.$slug";

export const Route = createFileRoute("/company/$slug/$employee")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.employee} — ${params.slug} on Cardixn` },
      { name: "description", content: `Digital business card for ${params.employee} at ${params.slug}.` },
      { property: "og:title", content: `${params.employee} — ${params.slug}` },
      { property: "og:description", content: `Digital business card for ${params.employee} at ${params.slug}.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmployeeCardPage,
});

function EmployeeCardPage() {
  const { employee } = Route.useParams();
  return <PublicCardView slug={employee} />;
}
