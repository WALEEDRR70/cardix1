// Top toolbar: history, zoom, grid toggles, export and save.
import { useRef, useState } from "react";
import {
  Undo2, Redo2, Grid3x3, Magnet, Ruler, ZoomIn, ZoomOut, Download, Save, Loader2,
} from "lucide-react";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { useStudio } from "@/lib/studio/store";
import { cn } from "@/lib/utils";

export function StudioToolbar({
  ar, onSave, saving, title,
}: { ar: boolean; onSave: () => void; saving: boolean; title: string }) {
  const { state, dispatch } = useStudio();
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);

  const stage = () => document.querySelector<HTMLElement>("[data-studio-stage]");

  async function exportAs(kind: "png" | "jpg" | "svg" | "json") {
    if (kind === "json") {
      download(`${title || "card"}.cardix.json`, URL.createObjectURL(new Blob([JSON.stringify(state.doc, null, 2)], { type: "application/json" })));
      return;
    }
    const el = stage();
    if (!el) return;
    setBusy(true);
    try {
      const opts = { pixelRatio: 3, cacheBust: true, style: { transform: "scale(1)", transformOrigin: "top left" } };
      const url = kind === "png" ? await toPng(el, opts) : kind === "jpg" ? await toJpeg(el, { ...opts, quality: 0.96 }) : await toSvg(el, opts);
      download(`${title || "card"}.${kind}`, url);
    } finally {
      setBusy(false);
      menuRef.current?.removeAttribute("open");
    }
  }

  return (
    <header className="flex items-center gap-2 border-b border-border/60 bg-card/50 px-3 py-2">
      <span className="me-2 truncate text-sm font-semibold">{title || (ar ? "بطاقة بدون عنوان" : "Untitled card")}</span>

      <Btn title={ar ? "تراجع" : "Undo"} disabled={!state.past.length} onClick={() => dispatch({ t: "undo" })}><Undo2 className="h-4 w-4" /></Btn>
      <Btn title={ar ? "إعادة" : "Redo"} disabled={!state.future.length} onClick={() => dispatch({ t: "redo" })}><Redo2 className="h-4 w-4" /></Btn>

      <span className="mx-1 h-5 w-px bg-border/60" />

      <Btn title={ar ? "الشبكة" : "Grid"} active={state.grid} onClick={() => dispatch({ t: "toggle", key: "grid" })}><Grid3x3 className="h-4 w-4" /></Btn>
      <Btn title={ar ? "المحاذاة" : "Snap"} active={state.snap} onClick={() => dispatch({ t: "toggle", key: "snap" })}><Magnet className="h-4 w-4" /></Btn>
      <Btn title={ar ? "الأدلة" : "Guides"} active={state.guides} onClick={() => dispatch({ t: "toggle", key: "guides" })}><Ruler className="h-4 w-4" /></Btn>

      <span className="mx-1 h-5 w-px bg-border/60" />

      <Btn title="Zoom out" onClick={() => dispatch({ t: "zoom", value: state.zoom - 0.1 })}><ZoomOut className="h-4 w-4" /></Btn>
      <span className="w-10 text-center text-xs text-muted-foreground">{Math.round(state.zoom * 100)}%</span>
      <Btn title="Zoom in" onClick={() => dispatch({ t: "zoom", value: state.zoom + 0.1 })}><ZoomIn className="h-4 w-4" /></Btn>

      <div className="flex-1" />

      <details ref={menuRef} className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:border-accent/60">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {ar ? "تصدير" : "Export"}
        </summary>
        <div className="absolute end-0 z-30 mt-1 w-36 overflow-hidden rounded-lg border border-border/60 bg-card text-xs shadow-xl">
          {(["png", "jpg", "svg", "json"] as const).map((k) => (
            <button key={k} onClick={() => exportAs(k)} className="block w-full px-3 py-2 text-start hover:bg-muted/50">
              {k.toUpperCase()}
            </button>
          ))}
        </div>
      </details>

      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {ar ? "حفظ" : "Save"}
      </button>
    </header>
  );
}

function download(name: string, url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

function Btn({ active, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...rest}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground disabled:opacity-40",
        active && "bg-accent/20 text-foreground",
      )}
    />
  );
}
