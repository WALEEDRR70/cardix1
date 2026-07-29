// Edit a shared gallery template in place — available to its author and to
// platform admins (the owner), so design mistakes can be corrected for everyone.
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, LayoutTemplate, ShieldCheck } from "lucide-react";
import { Link } from "@/lib/nav";
import { useI18n } from "@/lib/i18n";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";
import { emptyDoc, type StudioDoc } from "@/lib/studio/types";
import { getEditableTemplate, saveTemplateDesign } from "@/lib/templates.functions";
import { tx } from "@/lib/tx";

export const Route = createFileRoute("/$lang/_authenticated/studio/tpl/$id")({
  head: () => ({
    meta: [
      { title: "Edit template — Cardixn Studio" },
      { name: "description", content: "Fix and refine a shared card template directly in the Cardixn design studio." },
      { property: "og:title", content: "Edit template — Cardixn Studio" },
      { property: "og:description", content: "Fix and refine a shared card template in the Cardixn design studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TemplateStudioRoute,
});

function TemplateStudioRoute() {
  const { id } = Route.useParams();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const load = useServerFn(getEditableTemplate);
  const save = useServerFn(saveTemplateDesign);

  const { data, isLoading, error } = useQuery({
    queryKey: ["editable-template", id],
    queryFn: () => load({ data: { templateId: id } }),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    const forbidden = error instanceof Error && error.message.includes("FORBIDDEN");
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-background px-6 text-center text-sm text-muted-foreground">
        <div>
          {forbidden
            ? tx("You are not allowed to edit this template.")
            : tx("Template not found.")}
          <Link to="/templates" className="mt-3 block text-xs font-semibold text-primary">
            ← {tx("Template gallery")}
          </Link>
        </div>
      </div>
    );
  }

  const initial = (data.design as unknown as StudioDoc | null) ?? emptyDoc("#7c34ff");

  return (
    <StudioWorkspace
      title={data.title}
      initial={initial}
      breadcrumbs={
        <>
          <Link to="/templates" className="flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground">
            <LayoutTemplate className="h-3.5 w-3.5" />
            {tx("Template gallery")}
          </Link>
          <span className="mx-1 h-3 w-px bg-border/60" />
          <span className="flex items-center gap-1 whitespace-nowrap text-muted-foreground">
            {data.isAdminEdit && <ShieldCheck className="h-3.5 w-3.5 text-accent" />}
            {tx("Editing the published template")}
          </span>
        </>
      }
      onSave={async (doc) => {
        await save({ data: { templateId: id, design: doc } });
      }}
    />
  );
}
