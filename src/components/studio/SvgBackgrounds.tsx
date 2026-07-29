// Editable SVG backgrounds: pick a preset or paste/upload any SVG — every path
// becomes a studio vector node whose points and colors stay editable.
import { useMemo, useState } from "react";
import { Layers, Upload, Wand2, X } from "lucide-react";
import { useStudio } from "@/lib/studio/store";
import { SVG_BACKGROUNDS } from "@/lib/studio/svg-backgrounds";
import { artworkToNodes, parseSvgArtwork, type SvgArtwork } from "@/lib/studio/svg-import";
import { cn } from "@/lib/utils";
import { tx } from "@/lib/tx";

function Thumb({ art, className }: { art: SvgArtwork; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("h-full w-full", className)}>
      {art.layers.map((l, i) => (
        <path
          key={i}
          d={l.d}
          fill={l.fill ?? "transparent"}
          stroke={l.stroke ?? "none"}
          strokeWidth={l.strokeWidth ?? 0}
          opacity={l.opacity}
        />
      ))}
    </svg>
  );
}

export function SvgBackgrounds({ ar }: { ar: boolean }) {
  const { state, dispatch } = useStudio();
  const [open, setOpen] = useState(false);
  const [markup, setMarkup] = useState("");
  const [fit, setFit] = useState<"cover" | "contain" | "stretch">("cover");
  const [error, setError] = useState<string | null>(null);

  const presets = useMemo(
    () => SVG_BACKGROUNDS.map((p) => ({ ...p, art: parseSvgArtwork(p.markup) })).filter((p) => p.art),
    [],
  );
  const custom = useMemo(() => (markup.trim() ? parseSvgArtwork(markup) : null), [markup]);

  function insert(art: SvgArtwork | null, label: string) {
    if (!art) { setError(tx("No editable paths found in this SVG.")); return; }
    setError(null);
    dispatch({
      t: "addMany",
      place: "back",
      nodes: artworkToNodes(art, state.doc, { fit, label }),
    });
    setOpen(false);
  }

  async function onFile(file: File) {
    const text = await file.text();
    setMarkup(text);
    setError(null);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {presets.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => insert(p.art, ar ? p.ar : p.en)}
            className="group overflow-hidden rounded-md border border-border/50 bg-background/40 text-start transition hover:border-accent"
          >
            <div className="h-16 w-full overflow-hidden">
              <Thumb art={p.art!} />
            </div>
            <span className="block truncate px-1.5 py-1 text-[10px] text-muted-foreground group-hover:text-foreground">
              {ar ? p.ar : p.en}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border/60 px-2 py-2 text-[11px] text-muted-foreground transition hover:border-accent hover:text-foreground"
      >
        <Upload className="h-3.5 w-3.5" />
        {tx("Import SVG background")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur">
          <div className="w-full max-w-2xl rounded-xl border border-border/60 bg-card p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold">
                  {tx("Import an editable SVG background")}
                </h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-muted/40">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-2 text-[11px] text-muted-foreground">
              {tx("Paste SVG code or upload a file. Every path becomes its own vector node — points and colors stay editable, even after publishing.")}
            </p>

            <textarea
              value={markup}
              onChange={(e) => { setMarkup(e.target.value); setError(null); }}
              placeholder='<svg viewBox="0 0 1131 999"><path d="M942 0H0v999h845Z"/></svg>'
              spellCheck={false}
              dir="ltr"
              className="h-40 w-full resize-none rounded-md border border-border/60 bg-background/60 p-2 font-mono text-[11px] outline-none focus:border-accent"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-md border border-border/60 px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                {tx("Upload .svg")}
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }}
                />
              </label>

              <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5">
                {(["cover", "contain", "stretch"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFit(f)}
                    className={cn(
                      "rounded px-2 py-1 text-[10px]",
                      fit === f ? "bg-accent/20 text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f === "cover" ? (tx("Cover"))
                      : f === "contain" ? (tx("Contain"))
                        : (tx("Stretch"))}
                  </button>
                ))}
              </div>

              <div className="ms-auto flex items-center gap-2">
                {custom && (
                  <div className="h-10 w-16 overflow-hidden rounded border border-border/60">
                    <Thumb art={custom} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => insert(custom, tx("Background"))}
                  disabled={!custom}
                  className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[11px] font-medium text-accent-foreground disabled:opacity-40"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {tx("Add as editable layers")}
                </button>
              </div>
            </div>

            {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
            {custom && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                {ar ? `${custom.layers.length} مسار جاهز للتعديل` : `${custom.layers.length} editable paths detected`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
