import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/lib/nav";
import { emptyDoc, type StudioDoc } from "@/lib/studio/types";
import { StudioWorkspace } from "@/components/studio/StudioWorkspace";
import { ArrowLeft, Building2, LayoutTemplate, Loader2 } from "lucide-react";

export const Route = createFileRoute("/$lang/_authenticated/studio/$id")({
  head: () => ({
    meta: [
      { title: "Card Studio — Cardixn" },
      { name: "description", content: "Design digital business cards on a professional visual canvas with layers, snapping and export." },
      { property: "og:title", content: "Card Studio — Cardixn" },
      { property: "og:description", content: "A visual design studio built only for digital business cards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioRoute,
});

function StudioRoute() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["studio-card", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("id, title, name, company, bio, phone, whatsapp, email, website, address, department, working_hours, socials, design, accent_color, avatar_url, company_id, companies:company_id(logo_url, name, slug, tagline)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-[#07050d]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-[#07050d] text-center text-sm text-muted-foreground">
        <div>
          Card not found.
          <Link to="/dashboard" className="mt-3 block text-xs font-semibold text-primary">← Dashboard</Link>
        </div>
      </div>
    );
  }

  const initial = (data.design as StudioDoc | null) ?? emptyDoc((data.accent_color as string) || "#7c34ff");
  const company = (data as { companies?: { logo_url: string | null; name: string | null; slug: string | null; tagline?: string | null } | null }).companies ?? null;
  const socials = (data.socials as Record<string, string> | null) ?? {};
  const values: Record<string, string> = {};
  const put = (key: string, v?: string | null) => {
    if (typeof v === "string" && v.trim()) values[key] = v.trim();
  };
  put("{{Logo}}", company?.logo_url);
  put("{{Photo}}", data.avatar_url as string | null);
  // Never fall back to the demo company name — show the card's own company, or nothing.
  values["{{Company}}"] = (company?.name || (data.company as string | null) || "").trim();
  put("{{Tagline}}", company?.tagline ?? null);
  put("{{Employee Name}}", data.name as string | null);
  put("{{Job Title}}", data.title as string | null);
  put("{{Department}}", data.department as string | null);
  put("{{Bio}}", data.bio as string | null);
  put("{{Phone}}", data.phone as string | null);
  put("{{Mobile}}", data.phone as string | null);
  put("{{WhatsApp}}", data.whatsapp as string | null);
  put("{{Email}}", data.email as string | null);
  put("{{Website}}", data.website as string | null);
  put("{{Address}}", data.address as string | null);
  put("{{Hours}}", data.working_hours as string | null);
  put("{{LinkedIn}}", socials.linkedin);
  put("{{Instagram}}", socials.instagram);
  put("{{X}}", socials.x ?? socials.twitter);
  return <Studio cardId={data.id} title={(data.title as string) || (data.name as string) || ""} initial={initial} values={values} company={company ? { slug: company.slug, name: company.name } : null} />;
}

function Studio({ cardId, title, initial, values, company }: { cardId: string; title: string; initial: StudioDoc; values?: Record<string, string>; company?: { slug: string | null; name: string | null } | null }) {
  const { lang } = useI18n();
  const ar = lang === "ar";

  async function save(doc: StudioDoc, silent: boolean) {
    const { error } = await supabase.from("cards").update({ design: doc as never }).eq("id", cardId);
    if (error) throw new Error(error.message);
    // Keep any department design backed by this card in sync.
    await supabase
      .from("company_templates")
      .update({ design: doc as never })
      .filter("design->>sourceCardId", "eq", cardId);
    await supabase.from("card_design_versions").insert({
      card_id: cardId,
      user_id: (await supabase.auth.getSession()).data.session?.user.id ?? "",
      design: doc as never,
      label: silent ? "autosave" : "manual",
    } as never);
  }

  return (
    <StudioWorkspace
      title={title}
      initial={initial}
      values={values}
      onSave={save}
      breadcrumbs={
        <>
          <Link to={company?.slug ? `/co/${company.slug}/studio` : `/cards/${cardId}`} className="flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {company?.slug ? (ar ? "رجوع إلى مساحة الشركة" : "Back to workspace") : ar ? "رجوع إلى البطاقة" : "Back to card"}
          </Link>
          <span className="mx-1 h-3 w-px bg-border/60" />
          <Link to="/templates" className="flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground">
            <LayoutTemplate className="h-3.5 w-3.5" />
            {ar ? "معرض القوالب" : "Template gallery"}
          </Link>
          {company?.slug && (
            <>
              <span className="mx-1 h-3 w-px bg-border/60" />
              <Link to={`/co/${company.slug}`} className="flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {company.name || (ar ? "مساحة الشركة" : "Company workspace")}
              </Link>
            </>
          )}
        </>
      }
    />
  );
}

