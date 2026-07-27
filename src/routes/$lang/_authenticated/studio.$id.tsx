import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/lib/nav";
import { StudioProvider, useStudioState } from "@/lib/studio/store";
import { emptyDoc, type StudioDoc } from "@/lib/studio/types";
import { CanvasStage } from "@/components/studio/CanvasStage";
import { ElementsPanel } from "@/components/studio/ElementsPanel";
import { PropertiesPanel } from "@/components/studio/PropertiesPanel";
import { StudioToolbar } from "@/components/studio/StudioToolbar";
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
        .select("id, title, name, design, accent_color, avatar_url, company_id, companies:company_id(logo_url, name, slug)")
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
  const company = (data as { companies?: { logo_url: string | null; name: string | null; slug: string | null } | null }).companies ?? null;
  const values: Record<string, string> = {};
  if (company?.logo_url) values["{{Logo}}"] = company.logo_url;
  if (data.avatar_url) values["{{Photo}}"] = data.avatar_url as string;
  if (company?.name) values["{{Company}}"] = company.name;
  return <Studio cardId={data.id} title={(data.title as string) || (data.name as string) || ""} initial={initial} values={values} company={company ? { slug: company.slug, name: company.name } : null} />;
}

function Studio({ cardId, title, initial, values, company }: { cardId: string; title: string; initial: StudioDoc; values?: Record<string, string>; company?: { slug: string | null; name: string | null } | null }) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const api = useStudioState(initial);
  const stageRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const lastSaved = useRef(JSON.stringify(initial));

  async function save(silent = false) {
    const json = JSON.stringify(api.state.doc);
    if (json === lastSaved.current) return;
    setSaving(true);
    const { error } = await supabase.from("cards").update({ design: api.state.doc as never }).eq("id", cardId);
    if (!error) {
      lastSaved.current = json;
      await supabase.from("card_design_versions").insert({
        card_id: cardId,
        user_id: (await supabase.auth.getSession()).data.session?.user.id ?? "",
        design: api.state.doc as never,
        label: silent ? "autosave" : "manual",
      } as never);
      if (!silent) toast.success(ar ? "تم حفظ التصميم" : "Design saved");
    } else if (!silent) {
      toast.error(error.message);
    }
    setSaving(false);
  }

  // auto save every 45s when the document changed
  useEffect(() => {
    const t = setInterval(() => { void save(true); }, 45000);
    return () => clearInterval(t);
  });

  return (
    <StudioProvider api={api}>
      <div className="flex h-[100dvh] flex-col bg-background" dir={ar ? "rtl" : "ltr"}>
        <div className="flex items-center gap-2 border-b border-border/60 bg-card/60 px-3 py-1.5 text-xs">
          <Link to={`/cards/${cardId}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {ar ? "رجوع إلى البطاقة" : "Back to card"}
          </Link>
          <span className="mx-1 h-3 w-px bg-border/60" />
          <Link to="/templates" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <LayoutTemplate className="h-3.5 w-3.5" />
            {ar ? "معرض القوالب" : "Template gallery"}
          </Link>
          {company?.slug && (
            <>
              <span className="mx-1 h-3 w-px bg-border/60" />
              <Link to={`/co/${company.slug}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {company.name || (ar ? "مساحة الشركة" : "Company workspace")}
              </Link>
            </>
          )}
        </div>
        <StudioToolbar ar={ar} title={title} saving={saving} onSave={() => void save(false)} />
        <div className="flex min-h-0 flex-1">
          <ElementsPanel ar={ar} />
          <CanvasStage stageRef={stageRef} values={values} />
          <PropertiesPanel ar={ar} />
        </div>
      </div>
    </StudioProvider>
  );
}
