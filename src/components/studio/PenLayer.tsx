// Free-form pen tool: click to drop anchors, drag to pull bezier handles.
import { useEffect, useRef, useState } from "react";

export type PenPoint = { x: number; y: number; hx: number; hy: number };

export type PenResult = {
  path: string;
  x: number;
  y: number;
  w: number;
  h: number;
  closed: boolean;
};

const CLOSE_HIT = 10; // doc px radius to snap back onto the first anchor

function mirror(p: PenPoint) {
  return { x: 2 * p.x - p.hx, y: 2 * p.y - p.hy };
}

/** Builds an SVG path from anchors, mapping doc coords through `map`. */
export function penPath(
  pts: PenPoint[],
  closed: boolean,
  map: (x: number, y: number) => [number, number],
  live?: { x: number; y: number } | null,
): string {
  if (!pts.length) return "";
  const f = (x: number, y: number) => map(x, y).map((v) => v.toFixed(2)).join(" ");
  let d = `M ${f(pts[0].x, pts[0].y)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const bin = mirror(b);
    d += ` C ${f(a.hx, a.hy)}, ${f(bin.x, bin.y)}, ${f(b.x, b.y)}`;
  }
  if (closed && pts.length > 1) {
    const a = pts[pts.length - 1];
    const b = pts[0];
    const bin = mirror(b);
    d += ` C ${f(a.hx, a.hy)}, ${f(bin.x, bin.y)}, ${f(b.x, b.y)} Z`;
  } else if (live) {
    const a = pts[pts.length - 1];
    d += ` C ${f(a.hx, a.hy)}, ${f(live.x, live.y)}, ${f(live.x, live.y)}`;
  }
  return d;
}

function bbox(pts: PenPoint[]) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of pts) {
    const m = mirror(p);
    xs.push(p.x, p.hx, m.x);
    ys.push(p.y, p.hy, m.y);
  }
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, w: Math.max(1, Math.max(...xs) - minX), h: Math.max(1, Math.max(...ys) - minY) };
}

export function PenLayer({
  zoom,
  toDoc,
  onCommit,
  onExit,
}: {
  zoom: number;
  toDoc: (clientX: number, clientY: number) => { x: number; y: number };
  onCommit: (r: PenResult) => void;
  onExit: () => void;
}) {
  const [pts, setPts] = useState<PenPoint[]>([]);
  const [live, setLive] = useState<{ x: number; y: number } | null>(null);
  const ptsRef = useRef(pts);
  ptsRef.current = pts;

  function finish(closed: boolean) {
    const list = ptsRef.current;
    if (list.length < 2) {
      setPts([]);
      setLive(null);
      return;
    }
    const b = bbox(list);
    const path = penPath(list, closed, (x, y) => [((x - b.x) / b.w) * 100, ((y - b.y) / b.h) * 100]);
    setPts([]);
    setLive(null);
    onCommit({ path, ...b, closed });
  }

  // Keyboard: Enter finishes, Escape cancels / leaves the tool, Backspace undoes an anchor.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") { e.preventDefault(); finish(false); }
      else if (e.key === "Escape") {
        e.preventDefault();
        if (ptsRef.current.length) { setPts([]); setLive(null); } else onExit();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        if (ptsRef.current.length) { e.preventDefault(); setPts((p) => p.slice(0, -1)); }
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExit]);

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const p = toDoc(e.clientX, e.clientY);
    const first = ptsRef.current[0];
    if (first && ptsRef.current.length > 1 && Math.hypot(p.x - first.x, p.y - first.y) < CLOSE_HIT / zoom) {
      finish(true);
      return;
    }
    const index = ptsRef.current.length;
    setPts((prev) => [...prev, { x: p.x, y: p.y, hx: p.x, hy: p.y }]);
    const move = (ev: PointerEvent) => {
      const q = toDoc(ev.clientX, ev.clientY);
      setPts((prev) => prev.map((pt, i) => (i === index ? { ...pt, hx: q.x, hy: q.y } : pt)));
    };
    const up = () => window.removeEventListener("pointermove", move);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  }

  const map = (x: number, y: number): [number, number] => [x * zoom, y * zoom];
  const d = penPath(pts, false, map, live);

  return (
    <div
      className="absolute inset-0 z-20"
      style={{ cursor: "crosshair" }}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => setLive(toDoc(e.clientX, e.clientY))}
      onPointerLeave={() => setLive(null)}
      onDoubleClick={(e) => { e.stopPropagation(); finish(false); }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {d && <path d={d} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 4" />}
        {pts.map((p, i) => {
          const m = mirror(p);
          const hasHandle = Math.hypot(p.hx - p.x, p.hy - p.y) > 0.5;
          return (
            <g key={i}>
              {hasHandle && (
                <>
                  <line x1={m.x * zoom} y1={m.y * zoom} x2={p.hx * zoom} y2={p.hy * zoom} stroke="var(--accent)" strokeWidth={1} opacity={0.6} />
                  <circle cx={p.hx * zoom} cy={p.hy * zoom} r={3} fill="var(--accent)" />
                  <circle cx={m.x * zoom} cy={m.y * zoom} r={3} fill="var(--accent)" />
                </>
              )}
              <rect
                x={p.x * zoom - 3.5}
                y={p.y * zoom - 3.5}
                width={7}
                height={7}
                fill={i === 0 ? "var(--accent)" : "white"}
                stroke="var(--accent)"
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
