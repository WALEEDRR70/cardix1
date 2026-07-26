// Top toolbar: history, alignment, zoom, grid toggles, export and save.
import { useRef, useState } from "react";
import {
  Undo2, Redo2, Grid3x3, Magnet, Ruler, ZoomIn, ZoomOut, Download, Save, Loader2,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  Group, Ungroup, CopyPlus, Trash2, Maximize, MousePointer2, PenTool, Spline,
} from "lucide-react";

import { toPng, toJpeg, toSvg } from "html-to-image";
import { useStudio } from "@/lib/studio/store";
import { cn } from "@/lib/utils";

const PRESETS = [25, 50, 75, 100, 150, 200, 300];

export function StudioToolbar({
  ar, onSave, saving, title,
}: { ar: boolean; onSave: () => void; saving: boolean; title: string }) {
  const { state, dispatch } = useStudio();
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const sel = state.selection.length > 0;
  const zoomPreset = String(state.zoom);

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

      <Btn
        title={ar ? "أداة التحديد (V)" : "Select tool (V)"}
        active={state.tool === "select"}
        onClick={() => dispatch({ t: "tool", value: "select" })}
      ><MousePointer2 className="h-4 w-4" /></Btn>
      <Btn
        title={ar ? "أداة البنتول (P) — انقر لإضافة نقطة، اسحب لمنحنى، Enter للإنهاء" : "Pen tool (P) — click to add a point, drag to curve, Enter to finish"}
        active={state.tool === "pen"}
        onClick={() => dispatch({ t: "tool", value: state.tool === "pen" ? "select" : "pen" })}
      ><PenTool className="h-4 w-4" /></Btn>
      <Btn
        title={ar ? "تعديل المسار (A) — اسحب النقاط والمقابض، Alt للتبديل بين ناعم/زاوية، نقر مزدوج لعكس اتجاه المقابض" : "Edit path (A) — drag anchors & handles, Alt toggles smooth/corner, double-click flips handle direction"}
        active={state.tool === "node"}
        onClick={() => dispatch({ t: "tool", value: state.tool === "node" ? "select" : "node" })}
      ><Spline className="h-4 w-4" /></Btn>

      <span className="mx-1 h-5 w-px bg-border/60" />

      <Btn title={ar ? "تراجع" : "Undo"} disabled={!state.past.length} onClick={() => dispatch({ t: "undo" })}><Undo2 className="h-4 w-4" /></Btn>
      <Btn title={ar ? "إعادة" : "Redo"} disabled={!state.future.length} onClick={() => dispatch({ t: "redo" })}><Redo2 className="h-4 w-4" /></Btn>

      <span className="mx-1 h-5 w-px bg-border/60" />


      <Btn title={ar ? "الشبكة" : "Grid"} active={state.grid} onClick={() => dispatch({ t: "toggle", key: "grid" })}><Grid3x3 className="h-4 w-4" /></Btn>
      <Btn title={ar ? "المحاذاة" : "Snap"} active={state.snap} onClick={() => dispatch({ t: "toggle", key: "snap" })}><Magnet className="h-4 w-4" /></Btn>
      <Btn title={ar ? "الأدلة" : "Guides"} active={state.guides} onClick={() => dispatch({ t: "toggle", key: "guides" })}><Ruler className="h-4 w-4" /></Btn>

      <span className="mx-1 h-5 w-px bg-border/60" />

      {/* alignment + distribution */}
      {([
        ["left", AlignStartVertical, ar ? "محاذاة لليسار" : "Align left"],
        ["hcenter", AlignCenterVertical, ar ? "توسيط أفقي" : "Center horizontally"],
        ["right", AlignEndVertical, ar ? "محاذاة لليمين" : "Align right"],
        ["top", AlignStartHorizontal, ar ? "محاذاة للأعلى" : "Align top"],
        ["vcenter", AlignCenterHorizontal, ar ? "توسيط عمودي" : "Center vertically"],
        ["bottom", AlignEndHorizontal, ar ? "محاذاة للأسفل" : "Align bottom"],
      ] as const).map(([how, Icon, label]) => (
        <Btn key={how} title={label} disabled={!sel} onClick={() => dispatch({ t: "align", ids: state.selection, how })}>
          <Icon className="h-4 w-4" />
        </Btn>
      ))}
      <Btn title={ar ? "توزيع أفقي" : "Distribute horizontally"} disabled={state.selection.length < 3} onClick={() => dispatch({ t: "distribute", ids: state.selection, axis: "h" })}><AlignHorizontalSpaceAround className="h-4 w-4" /></Btn>
      <Btn title={ar ? "توزيع عمودي" : "Distribute vertically"} disabled={state.selection.length < 3} onClick={() => dispatch({ t: "distribute", ids: state.selection, axis: "v" })}><AlignVerticalSpaceAround className="h-4 w-4" /></Btn>

      <span className="mx-1 h-5 w-px bg-border/60" />

      <Btn title={ar ? "تجميع" : "Group"} disabled={state.selection.length < 2} onClick={() => dispatch({ t: "group", ids: state.selection })}><Group className="h-4 w-4" /></Btn>
      <Btn title={ar ? "فك التجميع" : "Ungroup"} disabled={!sel} onClick={() => state.selection[0] && dispatch({ t: "ungroup", id: state.selection[0] })}><Ungroup className="h-4 w-4" /></Btn>
      <Btn title={ar ? "تكرار" : "Duplicate"} disabled={!sel} onClick={() => dispatch({ t: "duplicate", ids: state.selection })}><CopyPlus className="h-4 w-4" /></Btn>
      <Btn title={ar ? "حذف" : "Delete"} disabled={!sel} onClick={() => dispatch({ t: "remove", ids: state.selection })}><Trash2 className="h-4 w-4" /></Btn>

      <span className="mx-1 h-5 w-px bg-border/60" />

      <Btn title="Zoom out" onClick={() => dispatch({ t: "zoom", value: state.zoom - 0.1 })}><ZoomOut className="h-4 w-4" /></Btn>
      <select
        value={zoomPreset}
        onChange={(e) => (e.target.value === "fit" ? dispatch({ t: "fit" }) : dispatch({ t: "zoom", value: Number(e.target.value) }))}
        className="rounded-md border border-border/60 bg-transparent px-1.5 py-1 text-[11px] text-muted-foreground outline-none"
      >
        {!PRESETS.includes(Math.round(state.zoom * 100)) && <option value={state.zoom}>{Math.round(state.zoom * 100)}%</option>}
        {PRESETS.map((p) => <option key={p} value={p / 100}>{p}%</option>)}
        <option value="fit">{ar ? "ملء الشاشة" : "Fit"}</option>
      </select>
      <Btn title="Zoom in" onClick={() => dispatch({ t: "zoom", value: state.zoom + 0.1 })}><ZoomIn className="h-4 w-4" /></Btn>
      <Btn title={ar ? "ملاءمة" : "Fit to screen"} onClick={() => dispatch({ t: "fit" })}><Maximize className="h-4 w-4" /></Btn>


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
