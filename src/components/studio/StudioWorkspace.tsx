// Shared Studio chrome (toolbar, panels, canvas, autosave) used by the card
// studio and the template studio. The caller decides where the design is saved.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { StudioProvider, useStudioState } from "@/lib/studio/store";
import type { StudioDoc } from "@/lib/studio/types";
import { CanvasStage } from "@/components/studio/CanvasStage";
import { ElementsPanel } from "@/components/studio/ElementsPanel";
import { PropertiesPanel } from "@/components/studio/PropertiesPanel";
import { StudioToolbar } from "@/components/studio/StudioToolbar";
import { Frame, Shapes, SlidersHorizontal, X } from "lucide-react";
import { tx } from "@/lib/tx";

export function StudioWorkspace({
  title,
  initial,
  values,
  breadcrumbs,
  onSave,
}: {
  title: string;
  initial: StudioDoc;
  values?: Record<string, string>;
  breadcrumbs?: ReactNode;
  onSave: (doc: StudioDoc, silent: boolean) => Promise<void>;
}) {
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
    try {
      await onSave(api.state.doc, silent);
      lastSaved.current = json;
      if (!silent) toast.success(tx("Design saved"));
    } catch (e) {
      if (!silent) toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // auto save every 45s when the document changed
  useEffect(() => {
    const t = setInterval(() => { void save(true); }, 45000);
    return () => clearInterval(t);
  });

  return (
    <StudioProvider api={api}>
      <div className="flex h-[100dvh] flex-col bg-background" dir={tx("ltr")}>
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-border/60 bg-card/60 px-3 py-1.5 text-xs [&>*]:shrink-0">
          {breadcrumbs}
          <button
            onClick={() => void save(false)}
            disabled={saving}
            className="ms-auto rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground disabled:opacity-60 lg:hidden"
          >
            {saving ? (tx("Saving…")) : tx("Save")}
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
                  aria-label={tx("Close")}
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
            {tx("Elements")}
          </button>
          <button
            onClick={() => setPanel(null)}
            className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition " + (!panel ? "border-accent bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground")}
          >
            <Frame className="h-4 w-4" />
            {tx("Canvas")}
          </button>
          <button
            onClick={() => setPanel(panel === "props" ? null : "props")}
            className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition " + (panel === "props" ? "border-accent bg-accent/15 text-foreground" : "border-border/60 text-muted-foreground")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {tx("Properties")}
          </button>
        </nav>
      </div>
    </StudioProvider>
  );
}
