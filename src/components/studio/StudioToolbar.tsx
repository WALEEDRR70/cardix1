// Top toolbar: tools, history, view, arrange, zoom, export and save — grouped into compact clusters.
import { useEffect, useRef, useState } from "react";
import {
  Undo2, Redo2, Grid3x3, Magnet, Ruler, ZoomIn, ZoomOut, Download, Save, Loader2,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  Group, Ungroup, CopyPlus, Trash2, Maximize, MousePointer2, PenTool, Spline,
  Eye, LayoutGrid, ChevronDown,
} from "lucide-react";

import { toPng, toJpeg, toSvg } from "html-to-image";
import { useStudio } from "@/lib/studio/store";
import { PublishTemplateDialog } from "@/components/studio/PublishTemplateDialog";
import { cn } from "@/lib/utils";
import { tx } from "@/lib/tx";

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
    <header className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-border/60 bg-card/50 px-3 py-2 [&>*]:shrink-0">
      <span className="me-1 hidden max-w-[180px] truncate text-sm font-semibold sm:inline">{title || (tx("Untitled card"))}</span>


      {/* Tools */}
      <div className="flex items-center rounded-lg border border-border/50 bg-background/40 p-0.5">
        <Btn
          title={tx("Select tool (V)")}
          active={state.tool === "select"}
          onClick={() => dispatch({ t: "tool", value: "select" })}
        ><MousePointer2 className="h-4 w-4" /></Btn>
        <Btn
          title={tx("Pen tool (P) — click to add a point, drag to curve, Enter to finish")}
          active={state.tool === "pen"}
          onClick={() => dispatch({ t: "tool", value: state.tool === "pen" ? "select" : "pen" })}
        ><PenTool className="h-4 w-4" /></Btn>
        <Btn
          title={tx("Edit points (A) — drag anchors & handles, Alt toggles smooth/corner")}
          active={state.tool === "node"}
          onClick={() => dispatch({ t: "tool", value: state.tool === "node" ? "select" : "node" })}
        ><Spline className="h-4 w-4" /></Btn>
      </div>

      {/* History */}
      <div className="flex items-center rounded-lg border border-border/50 bg-background/40 p-0.5">
        <Btn title={tx("Undo (Ctrl+Z)")} disabled={!state.past.length} onClick={() => dispatch({ t: "undo" })}><Undo2 className="h-4 w-4" /></Btn>
        <Btn title={tx("Redo (Ctrl+Shift+Z)")} disabled={!state.future.length} onClick={() => dispatch({ t: "redo" })}><Redo2 className="h-4 w-4" /></Btn>
      </div>

      {/* View menu */}
      <Menu
        label={tx("View")}
        icon={Eye}
        title={tx("Grid, snapping and guides")}
      >
        <MenuToggle on={state.grid} onClick={() => dispatch({ t: "toggle", key: "grid" })} icon={Grid3x3} label={tx("Grid")} />
        <MenuToggle on={state.snap} onClick={() => dispatch({ t: "toggle", key: "snap" })} icon={Magnet} label={tx("Snap")} />
        <MenuToggle on={state.guides} onClick={() => dispatch({ t: "toggle", key: "guides" })} icon={Ruler} label={tx("Guides")} />
      </Menu>

      {/* Arrange menu (align + distribute) */}
      <Menu
        label={tx("Arrange")}
        icon={LayoutGrid}
        disabled={!sel}
        title={tx("Align and distribute")}
      >
        <div className="grid grid-cols-3 gap-1 p-1.5">
          {([
            ["left", AlignStartVertical, tx("Align left")],
            ["hcenter", AlignCenterVertical, tx("Center horizontally")],
            ["right", AlignEndVertical, tx("Align right")],
            ["top", AlignStartHorizontal, tx("Align top")],
            ["vcenter", AlignCenterHorizontal, tx("Center vertically")],
            ["bottom", AlignEndHorizontal, tx("Align bottom")],
          ] as const).map(([how, Icon, label]) => (
            <button
              key={how}
              title={label}
              onClick={() => dispatch({ t: "align", ids: state.selection, how })}
              className="flex items-center justify-center rounded-md border border-border/40 p-2 text-muted-foreground hover:border-accent/60 hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div className="border-t border-border/50">
          <MenuItem
            disabled={state.selection.length < 3}
            onClick={() => dispatch({ t: "distribute", ids: state.selection, axis: "h" })}
            icon={AlignHorizontalSpaceAround}
            label={tx("Distribute horizontally")}
          />
          <MenuItem
            disabled={state.selection.length < 3}
            onClick={() => dispatch({ t: "distribute", ids: state.selection, axis: "v" })}
            icon={AlignVerticalSpaceAround}
            label={tx("Distribute vertically")}
          />
        </div>
      </Menu>

      {/* Contextual object actions — only when something is selected */}
      {sel && (
        <div className="flex items-center rounded-lg border border-border/50 bg-background/40 p-0.5">
          <Btn title={tx("Group (Ctrl+G)")} disabled={state.selection.length < 2} onClick={() => dispatch({ t: "group", ids: state.selection })}><Group className="h-4 w-4" /></Btn>
          <Btn title={tx("Ungroup")} onClick={() => state.selection[0] && dispatch({ t: "ungroup", id: state.selection[0] })}><Ungroup className="h-4 w-4" /></Btn>
          <Btn title={tx("Duplicate (Ctrl+D)")} onClick={() => dispatch({ t: "duplicate", ids: state.selection })}><CopyPlus className="h-4 w-4" /></Btn>
          <Btn title={tx("Delete")} onClick={() => dispatch({ t: "remove", ids: state.selection })}><Trash2 className="h-4 w-4" /></Btn>
        </div>
      )}

      {/* Zoom */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-background/40 p-0.5">
        <Btn title={tx("Zoom out")} onClick={() => dispatch({ t: "zoom", value: state.zoom - 0.1 })}><ZoomOut className="h-4 w-4" /></Btn>
        <select
          title={tx("Zoom level")}
          value={zoomPreset}
          onChange={(e) => (e.target.value === "fit" ? dispatch({ t: "fit" }) : dispatch({ t: "zoom", value: Number(e.target.value) }))}
          className="rounded-md border border-border/60 bg-transparent px-1.5 py-1 text-[11px] text-muted-foreground outline-none"
        >
          {!PRESETS.includes(Math.round(state.zoom * 100)) && <option value={state.zoom}>{Math.round(state.zoom * 100)}%</option>}
          {PRESETS.map((p) => <option key={p} value={p / 100}>{p}%</option>)}
          <option value="fit">{tx("Fit")}</option>
        </select>
        <Btn title={tx("Zoom in")} onClick={() => dispatch({ t: "zoom", value: state.zoom + 0.1 })}><ZoomIn className="h-4 w-4" /></Btn>
        <Btn title={tx("Fit to screen")} onClick={() => dispatch({ t: "fit" })}><Maximize className="h-4 w-4" /></Btn>
      </div>

      <div className="flex-1" />

      <PublishTemplateDialog ar={ar} defaultTitle={title} />

      <details ref={menuRef} className="relative">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:border-accent/60">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {tx("Export")}
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
        {tx("Save")}
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

function Menu({
  label, icon: Icon, children, disabled, title,
}: { label: string; icon: React.ElementType; children: React.ReactNode; disabled?: boolean; title?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.removeAttribute("open");
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  if (disabled) {
    return (
      <span title={title} className="flex items-center gap-1 rounded-lg border border-border/50 px-2 py-1.5 text-[11px] text-muted-foreground/40">
        <Icon className="h-4 w-4" />
        {label}
      </span>
    );
  }

  return (
    <details ref={ref} className="relative">
      <summary
        title={title}
        className="flex cursor-pointer list-none items-center gap-1 rounded-lg border border-border/50 bg-background/40 px-2 py-1.5 text-[11px] text-muted-foreground hover:border-accent/60 hover:text-foreground"
      >
        <Icon className="h-4 w-4" />
        {label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </summary>
      <div
        className="absolute start-0 z-30 mt-1 w-52 overflow-hidden rounded-lg border border-border/60 bg-card text-xs shadow-xl"
        onClick={() => ref.current?.removeAttribute("open")}
      >
        {children}
      </div>
    </details>
  );
}

function MenuItem({
  icon: Icon, label, onClick, disabled,
}: { icon: React.ElementType; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-muted/50 disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function MenuToggle({
  icon: Icon, label, on, onClick,
}: { icon: React.ElementType; label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-muted/50">
      <Icon className={cn("h-3.5 w-3.5 shrink-0", on && "text-accent")} />
      <span className="flex-1 truncate">{label}</span>
      <span className={cn("h-2 w-2 rounded-full", on ? "bg-accent" : "bg-border")} />
    </button>
  );
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
