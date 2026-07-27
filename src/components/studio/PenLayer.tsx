// Free-form pen tool (Illustrator/Figma grade):
// click = corner anchor, drag = bezier handle, Alt-drag = break symmetry,
// Shift = 45° constraints, click first anchor = close, click last anchor = retract handle.
import { useEffect, useRef, useState } from "react";

export type PenPoint = {
  x: number;
  y: number;
  /** outgoing handle (absolute doc coords) */
  hx: number;
  hy: number;
  /** incoming handle (absolute doc coords) */
  ix: number;
  iy: number;
  /** true once the user shaped this anchor's handles by hand */
  manual?: boolean;
};

export type PenResult = {
  path: string;
  x: number;
  y: number;
  w: number;
  h: number;
  closed: boolean;
};

const CLOSE_HIT = 9; // screen px radius to magnet onto the first anchor
const ANCHOR_HIT = 8;

function constrain(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  const step = Math.PI / 8; // 22.5°
  const a = Math.round(Math.atan2(dy, dx) / step) * step;
  return { x: ax + Math.cos(a) * len, y: ay + Math.sin(a) * len };
}

/**
 * Centripetal Catmull-Rom → cubic bezier handle fitting.
 * `amount` (0..1) scales handle length, so 0 = polyline, 1 = very round.
 * Anchors flagged `manual` keep the handles the user drew.
 */
export function autoSmooth(pts: PenPoint[], closed: boolean, amount: number): PenPoint[] {
  const n = pts.length;
  if (n < 2 || amount <= 0) {
    return pts.map((p) => (p.manual ? p : { ...p, hx: p.x, hy: p.y, ix: p.x, iy: p.y }));
  }
  const at = (i: number) => {
    if (closed) return pts[(i + n) % n];
    return pts[Math.min(n - 1, Math.max(0, i))];
  };
  return pts.map((p, i) => {
    if (p.manual) return p;
    const prev = at(i - 1);
    const next = at(i + 1);
    // centripetal parameterisation keeps loops and cusps from overshooting
    const dPrev = Math.pow(Math.hypot(p.x - prev.x, p.y - prev.y), 0.5) || 1e-6;
    const dNext = Math.pow(Math.hypot(next.x - p.x, next.y - p.y), 0.5) || 1e-6;
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len; ty /= len;
    // handle length ~ 1/3 of the neighbouring segment, scaled by the smoothness dial
    const k = (amount * 0.42) / 0.333;
    const outLen = (Math.hypot(next.x - p.x, next.y - p.y) / 3) * k * (dNext / ((dPrev + dNext) / 2));
    const inLen = (Math.hypot(p.x - prev.x, p.y - prev.y) / 3) * k * (dPrev / ((dPrev + dNext) / 2));
    const isEnd = !closed && (i === 0 || i === n - 1);
    return {
      ...p,
      hx: p.x + tx * (isEnd && i === n - 1 ? 0 : outLen),
      hy: p.y + ty * (isEnd && i === n - 1 ? 0 : outLen),
      ix: p.x - tx * (isEnd && i === 0 ? 0 : inLen),
      iy: p.y - ty * (isEnd && i === 0 ? 0 : inLen),
    };
  });
}


/** Builds an SVG path from anchors, mapping doc coords through `map`. */
export function penPath(
  pts: PenPoint[],
  closed: boolean,
  map: (x: number, y: number) => [number, number],
  live?: { anchor: { x: number; y: number }; inX: number; inY: number } | null,
): string {
  if (!pts.length) return "";
  const f = (x: number, y: number) => map(x, y).map((v) => v.toFixed(2)).join(" ");
  let d = `M ${f(pts[0].x, pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    d += ` C ${f(a.hx, a.hy)}, ${f(b.ix, b.iy)}, ${f(b.x, b.y)}`;
  }
  if (closed && pts.length > 1) {
    const a = pts[pts.length - 1];
    const b = pts[0];
    d += ` C ${f(a.hx, a.hy)}, ${f(b.ix, b.iy)}, ${f(b.x, b.y)} Z`;
  } else if (live) {
    const a = pts[pts.length - 1];
    d += ` C ${f(a.hx, a.hy)}, ${f(live.inX, live.inY)}, ${f(live.anchor.x, live.anchor.y)}`;
  }
  return d;
}

/** Point + tangent on a cubic bezier at t (used for contour direction arrows). */
function cubicAt(a: PenPoint, b: PenPoint, t: number) {
  const p0 = [a.x, a.y], p1 = [a.hx, a.hy], p2 = [b.ix, b.iy], p3 = [b.x, b.y];
  const mt = 1 - t;
  const pos = [0, 1].map(
    (k) => mt * mt * mt * p0[k] + 3 * mt * mt * t * p1[k] + 3 * mt * t * t * p2[k] + t * t * t * p3[k],
  );
  const tan = [0, 1].map(
    (k) => 3 * mt * mt * (p1[k] - p0[k]) + 6 * mt * t * (p2[k] - p1[k]) + 3 * t * t * (p3[k] - p2[k]),
  );
  return { x: pos[0], y: pos[1], angle: (Math.atan2(tan[1], tan[0]) * 180) / Math.PI };
}

/** Arrow markers along the contour showing the drawing direction (winding). */
function contourArrows(pts: PenPoint[], closed: boolean) {
  const out: { x: number; y: number; angle: number }[] = [];
  const n = pts.length;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < 12) continue;
    out.push(cubicAt(a, b, 0.5));
  }
  return out;
}

function bbox(pts: PenPoint[], closed: boolean) {
  const xs: number[] = [];
  const ys: number[] = [];
  pts.forEach((p, i) => {
    xs.push(p.x);
    ys.push(p.y);
    // only include handles that actually shape a rendered segment
    if (closed || i < pts.length - 1) { xs.push(p.hx); ys.push(p.hy); }
    if (closed || i > 0) { xs.push(p.ix); ys.push(p.iy); }
  });
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, w: Math.max(1, Math.max(...xs) - minX), h: Math.max(1, Math.max(...ys) - minY) };
}

export function PenLayer({
  zoom,
  grid,
  snap,
  toDoc,
  onCommit,
  onExit,
}: {
  zoom: number;
  grid?: number;
  snap?: boolean;
  toDoc: (clientX: number, clientY: number) => { x: number; y: number };
  onCommit: (r: PenResult) => void;
  onExit: () => void;
}) {
  const [pts, setPts] = useState<PenPoint[]>([]);
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<"first" | "last" | null>(null);
  const [dragging, setDragging] = useState(false);
  const [smoothOn, setSmoothOn] = useState(true);
  const [smoothness, setSmoothness] = useState(0.5);
  const [handleMode, setHandleMode] = useState<"symmetric" | "independent">("symmetric");
  const mods = useRef({ shift: false, alt: false });
  const ptsRef = useRef(pts);
  ptsRef.current = pts;
  const modeRef = useRef(handleMode);
  modeRef.current = handleMode;
  const smoothRef = useRef({ on: smoothOn, amount: smoothness });
  smoothRef.current = { on: smoothOn, amount: smoothness };

  const g = snap && grid && grid > 1 ? grid : 0;
  const snapped = (v: number) => (g ? Math.round(v / g) * g : v);

  const shape = (list: PenPoint[], closed: boolean) =>
    smoothRef.current.on ? autoSmooth(list, closed, smoothRef.current.amount) : list;

  function finish(closed: boolean) {
    const list = shape(ptsRef.current, closed);
    if (list.length < 2) {
      setPts([]); setLive(null);
      return;
    }
    const b = bbox(list, closed);
    const path = penPath(list, closed, (x, y) => [((x - b.x) / b.w) * 100, ((y - b.y) / b.h) * 100]);
    setPts([]); setLive(null); setHover(null);
    onCommit({ path, ...b, closed });
  }


  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      mods.current.shift = e.shiftKey;
      mods.current.alt = e.altKey;
      if (e.key === "Enter") { e.preventDefault(); finish(false); }
      else if (e.key === "Escape") {
        e.preventDefault();
        if (ptsRef.current.length) { setPts([]); setLive(null); } else onExit();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        if (ptsRef.current.length) { e.preventDefault(); setPts((p) => p.slice(0, -1)); }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (ptsRef.current.length) { e.preventDefault(); e.stopPropagation(); setPts((p) => p.slice(0, -1)); }
      } else if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        setSmoothness((v) => Math.min(1, Math.max(0, +(v + (e.key === "]" ? 0.05 : -0.05)).toFixed(2))));
      } else if (e.key.toLowerCase() === "s" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSmoothOn((v) => !v);
      } else if (e.key.toLowerCase() === "m" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setHandleMode((v) => (v === "symmetric" ? "independent" : "symmetric"));
      }

    }
    function onUp(e: KeyboardEvent) { mods.current.shift = e.shiftKey; mods.current.alt = e.altKey; }
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onUp, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onUp, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExit]);

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    mods.current.shift = e.shiftKey;
    mods.current.alt = e.altKey;

    const raw = toDoc(e.clientX, e.clientY);
    const list = ptsRef.current;
    const first = list[0];
    const last = list[list.length - 1];
    const hit = ANCHOR_HIT / zoom;

    // magnet-close on the first anchor
    if (first && list.length > 1 && Math.hypot(raw.x - first.x, raw.y - first.y) < CLOSE_HIT / zoom) {
      finish(true);
      return;
    }
    // click the last anchor: retract its outgoing handle (curve -> corner)
    if (last && Math.hypot(raw.x - last.x, raw.y - last.y) < hit) {
      setPts((prev) =>
        prev.map((p, i) => (i === prev.length - 1 ? { ...p, hx: p.x, hy: p.y, manual: true } : p)),
      );
      return;
    }

    let px = snapped(raw.x);
    let py = snapped(raw.y);
    // Shift constrains the new anchor to 22.5° from the previous one
    if (mods.current.shift && last) {
      const c = constrain(last.x, last.y, raw.x, raw.y);
      px = c.x; py = c.y;
    }

    const index = list.length;
    setPts((prev) => [...prev, { x: px, y: py, hx: px, hy: py, ix: px, iy: py }]);
    setDragging(true);

    const move = (ev: PointerEvent) => {
      mods.current.shift = ev.shiftKey;
      mods.current.alt = ev.altKey;
      const q = toDoc(ev.clientX, ev.clientY);
      const out = mods.current.shift ? constrain(px, py, q.x, q.y) : q;
      setPts((prev) =>
        prev.map((pt, i) =>
          i === index
            ? (() => {
                // Alt temporarily inverts the active handle mode
                const symmetric =
                  modeRef.current === "symmetric" ? !mods.current.alt : mods.current.alt;
                return {
                  ...pt,
                  // dragging a handle opts this anchor out of auto-smoothing
                  manual: Math.hypot(out.x - pt.x, out.y - pt.y) > 1.5,
                  hx: out.x,
                  hy: out.y,
                  ix: symmetric ? 2 * pt.x - out.x : pt.x,
                  iy: symmetric ? 2 * pt.y - out.y : pt.y,
                };
              })()
            : pt,
        ),
      );
    };

    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  }

  function onMove(e: React.PointerEvent) {
    const raw = toDoc(e.clientX, e.clientY);
    const list = ptsRef.current;
    const first = list[0];
    const last = list[list.length - 1];
    const hit = ANCHOR_HIT / zoom;
    if (first && list.length > 1 && Math.hypot(raw.x - first.x, raw.y - first.y) < CLOSE_HIT / zoom) setHover("first");
    else if (last && Math.hypot(raw.x - last.x, raw.y - last.y) < hit) setHover("last");
    else setHover(null);

    if (e.shiftKey && last) setLive(constrain(last.x, last.y, raw.x, raw.y));
    else setLive({ x: snapped(raw.x), y: snapped(raw.y) });
  }

  const map = (x: number, y: number): [number, number] => [x * zoom, y * zoom];
  const shaped = smoothOn ? autoSmooth(pts, false, smoothness) : pts;
  const last = shaped[shaped.length - 1];
  // preview the smoothed curve including the point under the cursor
  const previewPts =
    live && last && !dragging
      ? (smoothOn
          ? autoSmooth([...pts, { x: live.x, y: live.y, hx: live.x, hy: live.y, ix: live.x, iy: live.y }], false, smoothness)
          : [...shaped, { x: live.x, y: live.y, hx: live.x, hy: live.y, ix: live.x, iy: live.y }])
      : shaped;
  const d = penPath(previewPts, false, map);
  const closePreview =
    hover === "first" && pts.length > 1
      ? penPath(smoothOn ? autoSmooth(pts, true, smoothness) : pts, true, map)
      : "";
  // contour direction arrows: shown while dragging a handle or closing the shape
  const showDirection = dragging || (hover === "first" && pts.length > 1);
  const arrows = showDirection
    ? contourArrows(
        closePreview ? (smoothOn ? autoSmooth(pts, true, smoothness) : pts) : previewPts,
        !!closePreview,
      )
    : [];




  return (
    <div
      className="absolute inset-0 z-20"
      style={{ cursor: hover === "first" ? "pointer" : "crosshair" }}
      onPointerDown={onPointerDown}
      onPointerMove={onMove}
      onPointerLeave={() => { setLive(null); setHover(null); }}
      onDoubleClick={(e) => { e.stopPropagation(); finish(false); }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {closePreview && (
          <path d={closePreview} fill="var(--accent)" fillOpacity={0.12} stroke="var(--accent)" strokeWidth={1.5} />
        )}
        {d && !closePreview && (
          <>
            <path d={d} fill="none" stroke="black" strokeOpacity={0.35} strokeWidth={3} />
            <path d={d} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
          </>
        )}

        {/* live crosshair guide from the last anchor */}
        {live && last && !dragging && (
          <line
            x1={last.x * zoom} y1={last.y * zoom} x2={live.x * zoom} y2={live.y * zoom}
            stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" opacity={0.5}
          />
        )}

        {shaped.map((p, i) => {
          const hasOut = Math.hypot(p.hx - p.x, p.hy - p.y) > 0.5;
          const hasIn = Math.hypot(p.ix - p.x, p.iy - p.y) > 0.5;
          const isFirst = i === 0;
          const auto = !p.manual;
          const op = auto ? 0.35 : 0.8;
          const highlight = (isFirst && hover === "first") || (i === shaped.length - 1 && hover === "last");
          return (
            <g key={i}>
              {hasOut && (
                <>
                  <line x1={p.x * zoom} y1={p.y * zoom} x2={p.hx * zoom} y2={p.hy * zoom} stroke="var(--accent)" strokeWidth={1} opacity={op} />
                  <circle cx={p.hx * zoom} cy={p.hy * zoom} r={3.5} fill="white" stroke="var(--accent)" strokeWidth={1.5} opacity={auto ? 0.6 : 1} />
                </>
              )}
              {hasIn && (
                <>
                  <line x1={p.x * zoom} y1={p.y * zoom} x2={p.ix * zoom} y2={p.iy * zoom} stroke="var(--accent)" strokeWidth={1} opacity={op} />
                  <circle cx={p.ix * zoom} cy={p.iy * zoom} r={3.5} fill="white" stroke="var(--accent)" strokeWidth={1.5} opacity={auto ? 0.6 : 1} />
                </>
              )}
              {highlight && (
                <circle cx={p.x * zoom} cy={p.y * zoom} r={8} fill="none" stroke="var(--accent)" strokeWidth={1.5} opacity={0.8} />
              )}
              <rect
                x={p.x * zoom - 3.5}
                y={p.y * zoom - 3.5}
                width={7}
                height={7}
                rx={hasOut || hasIn ? 3.5 : 0}
                fill={isFirst ? "var(--accent)" : "white"}
                stroke="var(--accent)"
                strokeWidth={1.5}
              />
            </g>
          );
        })}

        {/* ghost anchor under the cursor */}
        {live && !dragging && !hover && (
          <rect
            x={live.x * zoom - 3} y={live.y * zoom - 3} width={6} height={6}
            fill="white" stroke="var(--accent)" strokeWidth={1.25} opacity={0.85}
          />
        )}
      </svg>

      {/* smoothing control */}
      <div
        className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border/60 bg-background/85 px-3 py-1.5 text-[11px] shadow-lg backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerMove={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setSmoothOn((v) => !v)}
          className={`rounded-full px-2 py-0.5 font-medium transition ${
            smoothOn ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Auto-smooth
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={smoothness}
          disabled={!smoothOn}
          onChange={(e) => setSmoothness(Number(e.target.value))}
          className="w-32 accent-[var(--accent)] disabled:opacity-40"
        />
        <span className="w-7 text-end tabular-nums text-muted-foreground">{Math.round(smoothness * 100)}</span>
      </div>

    </div>
  );
}
