// Visual gradient editor: multi-stop, drag positions, color + opacity, no CSS typing needed.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { tx } from "@/lib/tx";

export type Stop = { id: string; color: string; alpha: number; pos: number };
export type Grad = { type: "linear" | "radial"; angle: number; stops: Stop[] };

const uid = () => Math.random().toString(36).slice(2, 9);

function hexToRgb(hex: string) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length === 8) h = h.slice(0, 6);
  const n = parseInt(h || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function stopCss(s: Stop) {
  const { r, g, b } = hexToRgb(s.color);
  const c = s.alpha >= 1 ? s.color : `rgba(${r},${g},${b},${Number(s.alpha.toFixed(3))})`;
  return `${c} ${Number(s.pos.toFixed(2))}%`;
}

export function gradToCss(g: Grad): string {
  const stops = [...g.stops].sort((a, b) => a.pos - b.pos).map(stopCss).join(",");
  return g.type === "radial"
    ? `radial-gradient(circle at 50% 50%,${stops})`
    : `linear-gradient(${Math.round(g.angle)}deg,${stops})`;
}

function splitStops(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of body) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function parseColor(token: string): { color: string; alpha: number } {
  const t = token.trim();
  const rgba = t.match(/rgba?\(([^)]+)\)/i);
  if (rgba) {
    const p = rgba[1].split(/[,/ ]+/).filter(Boolean).map(Number);
    const hex = "#" + [p[0], p[1], p[2]].map((v) => Math.max(0, Math.min(255, v || 0)).toString(16).padStart(2, "0")).join("");
    return { color: hex, alpha: p[3] === undefined || Number.isNaN(p[3]) ? 1 : p[3] };
  }
  const hex8 = t.match(/^#([0-9a-f]{8})$/i);
  if (hex8) return { color: "#" + hex8[1].slice(0, 6), alpha: parseInt(hex8[1].slice(6), 16) / 255 };
  const hex3 = t.match(/^#([0-9a-f]{3})$/i);
  if (hex3) return { color: "#" + hex3[1].split("").map((c) => c + c).join(""), alpha: 1 };
  const hex6 = t.match(/^#([0-9a-f]{6})$/i);
  if (hex6) return { color: t.toLowerCase(), alpha: 1 };
  return { color: "#7c34ff", alpha: 1 };
}

export function cssToGrad(css: string | null | undefined): Grad {
  const fallback: Grad = {
    type: "linear",
    angle: 135,
    stops: [
      { id: uid(), color: "#7c34ff", alpha: 1, pos: 0 },
      { id: uid(), color: "#0b0713", alpha: 1, pos: 100 },
    ],
  };
  if (!css) return fallback;
  const m = css.match(/^\s*(linear|radial)-gradient\(([\s\S]*)\)\s*$/i);
  if (!m) return fallback;
  const type = m[1].toLowerCase() as "linear" | "radial";
  let parts = splitStops(m[2]);
  let angle = type === "linear" ? 180 : 135;
  if (parts.length && /deg|to\s|circle|ellipse|at\s/i.test(parts[0]) && !/#|rgb/i.test(parts[0])) {
    const deg = parts[0].match(/(-?[\d.]+)deg/);
    if (deg) angle = Number(deg[1]);
    parts = parts.slice(1);
  }
  if (parts.length < 2) return fallback;
  const stops: Stop[] = parts.map((p, i) => {
    const posM = p.match(/(-?[\d.]+)%\s*$/);
    const colorToken = posM ? p.slice(0, p.length - posM[0].length) : p;
    const { color, alpha } = parseColor(colorToken);
    const pos = posM ? Number(posM[1]) : (i / Math.max(1, parts.length - 1)) * 100;
    return { id: uid(), color, alpha, pos: Math.max(0, Math.min(100, pos)) };
  });
  return { type, angle, stops };
}

export function GradientEditor({
  ar,
  value,
  onChange,
  onRemove,
}: {
  ar: boolean;
  value: string | null | undefined;
  onChange: (css: string) => void;
  onRemove: () => void;
}) {
  const [grad, setGrad] = useState<Grad>(() => cssToGrad(value));
  const [activeId, setActiveId] = useState<string>(() => grad.stops[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string>(gradToCss(grad));

  // Sync when an external change (preset / AI) rewrites the gradient.
  useEffect(() => {
    if (!value || value === lastEmitted.current) return;
    const g = cssToGrad(value);
    lastEmitted.current = value;
    setGrad(g);
    setActiveId(g.stops[0]?.id ?? "");
  }, [value]);

  const commit = useCallback((g: Grad) => {
    setGrad(g);
    const css = gradToCss(g);
    lastEmitted.current = css;
    onChange(css);
  }, [onChange]);

  const sorted = useMemo(() => [...grad.stops].sort((a, b) => a.pos - b.pos), [grad.stops]);
  const active = grad.stops.find((s) => s.id === activeId) ?? sorted[0];

  const posFromEvent = (clientX: number) => {
    const el = barRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  };

  const dragStop = (id: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveId(id);
    const move = (ev: PointerEvent) => {
      const pos = posFromEvent(ev.clientX);
      setGrad((g) => {
        const next = { ...g, stops: g.stops.map((s) => (s.id === id ? { ...s, pos } : s)) };
        const css = gradToCss(next);
        lastEmitted.current = css;
        onChange(css);
        return next;
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const addStop = (clientX?: number) => {
    const pos = clientX !== undefined ? posFromEvent(clientX) : 50;
    const near = sorted.reduce((a, b) => (Math.abs(a.pos - pos) < Math.abs(b.pos - pos) ? a : b), sorted[0]);
    const s: Stop = { id: uid(), color: near?.color ?? "#ffffff", alpha: near?.alpha ?? 1, pos };
    commit({ ...grad, stops: [...grad.stops, s] });
    setActiveId(s.id);
  };

  const patchActive = (patch: Partial<Stop>) => {
    if (!active) return;
    commit({ ...grad, stops: grad.stops.map((s) => (s.id === active.id ? { ...s, ...patch } : s)) });
  };

  const removeActive = () => {
    if (!active || grad.stops.length <= 2) return;
    const rest = grad.stops.filter((s) => s.id !== active.id);
    commit({ ...grad, stops: rest });
    setActiveId(rest[0].id);
  };

  const preview = gradToCss({ ...grad, type: "linear", angle: 90 });

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tx("Gradient")}</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => addStop()} title={tx("Add stop")} className="rounded border border-border/60 p-1 text-muted-foreground hover:text-foreground">
            <Plus className="h-3 w-3" />
          </button>
          <button type="button" onClick={onRemove} title={tx("Remove gradient")} className="rounded border border-border/60 p-1 text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* stop rail */}
      <div className="pb-3 pt-1">
        <div
          ref={barRef}
          onDoubleClick={(e) => addStop(e.clientX)}
          className="relative h-7 cursor-copy rounded-md border border-border/60"
          style={{
            backgroundImage: `${preview}, repeating-conic-gradient(#8886 0% 25%, transparent 0% 50%)`,
            backgroundSize: "auto, 10px 10px",
          }}
        >
          {grad.stops.map((s) => (
            <button
              key={s.id}
              type="button"
              onPointerDown={dragStop(s.id)}
              onClick={() => setActiveId(s.id)}
              title={`${Math.round(s.pos)}%`}
              className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow ${s.id === active?.id ? "border-accent" : "border-white/80"}`}
              style={{ left: `${s.pos}%`, background: s.color }}
            />
          ))}
        </div>
        <p className="pt-1 text-[10px] text-muted-foreground">
          {tx("Drag handles to move stops, double-click to add one.")}
        </p>
      </div>

      {active && (
        <div className="space-y-2 rounded-md border border-border/50 p-2">
          <div className="grid grid-cols-[auto_1fr] items-center gap-2">
            <input
              type="color"
              value={active.color}
              onChange={(e) => patchActive({ color: e.target.value })}
              className="h-8 w-10 rounded bg-transparent"
            />
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{tx("Position")}</span><span>{Math.round(active.pos)}%</span>
              </div>
              <input type="range" min={0} max={100} step={0.5} value={active.pos} onChange={(e) => patchActive({ pos: Number(e.target.value) })} className="w-full accent-[hsl(var(--accent,270_80%_60%))]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{tx("Opacity")}</span><span>{Math.round(active.alpha * 100)}%</span>
            </div>
            <input type="range" min={0} max={100} value={Math.round(active.alpha * 100)} onChange={(e) => patchActive({ alpha: Number(e.target.value) / 100 })} className="w-full" />
          </div>
          {grad.stops.length > 2 && (
            <button type="button" onClick={removeActive} className="w-full rounded border border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
              {tx("Delete stop")}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] text-muted-foreground">{tx("Type")}</span>
          <select
            value={grad.type}
            onChange={(e) => commit({ ...grad, type: e.target.value as Grad["type"] })}
            className="w-full rounded-md border border-border/60 bg-background/60 px-2 py-1.5 text-xs outline-none focus:border-accent"
          >
            <option value="linear">{tx("Linear")}</option>
            <option value="radial">{tx("Radial")}</option>
          </select>
        </label>
        {grad.type === "linear" && (
          <label className="space-y-1">
            <span className="text-[10px] text-muted-foreground">{tx("Angle")} {Math.round(grad.angle)}°</span>
            <input type="range" min={0} max={360} value={grad.angle} onChange={(e) => commit({ ...grad, angle: Number(e.target.value) })} className="w-full" />
          </label>
        )}
      </div>
    </div>
  );
}
