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
import { ArrowLeft, Building2, LayoutTemplate, Loader2, Shapes, Frame, SlidersHorizontal, X } from "lucide-react";

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
        .select("id, title, name, bio, phone, whatsapp, email, website, address, department, working_hours, socials, design, accent_color, avatar_url, company_id, companies:company_id(logo_url, name, slug, tagline)")
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
  put("{{Company}}", company?.name);
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
  const api = useStudioState(initial);
  const stageRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [panel, setPanel] = useState<"elements" | "props" | null>(null);
  const lastSaved = useRef(JSON.stringify(initial));

  async function save(silent = false) {
    const json = JSON.stringify(api.state.doc);
    if (json === lastSaved.current) return;
    setSaving(true);
    const { error } = await supabase.from("cards").update({ design: api.state.doc as never }).eq("id", cardId);
    if (!error) {
      lastSaved.current = json;
      // Keep any department design backed by this card in sync.
      await supabase
        .from("company_templates")
        .update({ design: api.state.doc as never })
        .filter("design->>sourceCardId", "eq", cardId);
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
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-border/60 bg-card/60 px-3 py-1.5 text-xs [&>*]:shrink-0">
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
          <button
            onClick={() => void save(false)}
            disabled={saving}
            className="ms-auto rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground disabled:opacity-60 lg:hidden"
          >
            {saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : ar ? "حفظ" : "Save"}
          </button>
        </div>
        <StudioToolbar ar={ar} title={title} saving={saving} onSave={() => void save(false)} />

        {/* Desktop: three columns. Mobile: canvas only + panels as sheets. */}
        <div className="relative flex min-h-0 flex-1">
          <div className="hidden lg:flex">
            <ElementsPanel ar={ar} />
          </div>
          <CanvasStage stageRef={stageRef} values={values} />
          <div className="hidden lg:flex">
            <PropertiesPanel ar={ar} />
          </div>

          {panel && (
            <div className="absolute inset-0 z-40 flex lg:hidden">
              <button
                aria-label="close"
                className="absolute inset-0 bg-background/70 backdrop-blur-sm"
                onClick={() => setPanel(null)}
              />
              <div className="relative ms-auto flex h-full w-[86%] max-w-[340px] flex-col bg-card shadow-2xl [&>aside]:h-full [&>aside]:w-full [&>aside]:min-w-0 [&>aside]:overflow-y-auto">
                <button
                  onClick={() => setPanel(null)}
                  className="absolute end-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full border border-border/60 bg-background/80 text-muted-foreground"
                  aria-label={ar ? "إغلاق" : "Close"}
                >
                  <X className="h-4 w-4" />
                </button>
                {panel === "elements" ? <ElementsPanel ar={ar} /> : <PropertiesPanel ar={ar} />}
              </div>
            </div>
          )}
        </div>

        {/* Mobile panel switcher */}
        <nav className="flex items-center gap-2 border-t border-border/60 bg-card/70 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
          <button
            onClick={() => setPanel(panel === "elements" ? null : "elements")}
            className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition " + (panel === "elements" ? "border-accent bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground")}
          >
            <Shapes className="h-4 w-4" />
            {ar ? "العناصر" : "Elements"}
          </button>
          <button
            onClick={() => setPanel(null)}
            className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition " + (!panel ? "border-accent bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground")}
          >
            <Frame className="h-4 w-4" />
            {ar ? "اللوحة" : "Canvas"}
          </button>
          <button
            onClick={() => setPanel(panel === "props" ? null : "props")}
            className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition " + (panel === "props" ? "border-accent bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {ar ? "الخصائص" : "Properties"}
          </button>
        </nav>
      </div>
    </StudioProvider>
  );
}

