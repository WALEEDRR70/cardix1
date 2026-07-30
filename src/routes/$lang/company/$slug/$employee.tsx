import { createFileRoute } from "@tanstack/react-router";
import { PublicCardView } from "@/routes/c.$slug";
import { fetchPublicCardMeta, publicCardHead } from "@/lib/public-card-meta";

export const Route = createFileRoute("/$lang/company/$slug/$employee")({
  loader: async ({ params }) => ({ meta: await fetchPublicCardMeta(params.employee) }),
  head: ({ params, loaderData }) => {
    const url = `https://cardixn.com/${params.lang}/company/${params.slug}/${params.employee}`;
    return {
      meta: publicCardHead(loaderData?.meta ?? null, url, params.employee),
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: LocalizedEmployeeCardPage,
});

function LocalizedEmployeeCardPage() {
  const { employee } = Route.useParams();
  return <PublicCardView slug={employee} />;
}
