// Direct-selection layer: edit the anchors and bezier handles of a path node.
import { useEffect, useRef, useState } from "react";
import type { StudioNode } from "@/lib/studio/types";
import {
  type Anchor, parsePath, serializePath, moveAnchor, moveHandle, toggleSmooth, flipHandles,
} from "@/lib/studio/path-edit";

type Props = {
  node: StudioNode;
  zoom: number;
  toDoc: (clientX: number, clientY: number) => { x: number; y: number };
  onChange: (path: string, transient: boolean) => void;
  onExit: () => void;
};

export function PathEditLayer({ node, zoom, toDoc, onChange, onExit }: Props) {
  const parsed = parsePath(node.path ?? "");
  const [anchors, setAnchors] = useState<Anchor[]>(parsed.anchors);
  const [closed] = useState(parsed.closed);
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<Anchor[]>(anchors);
  ref.current = anchors;
  const srcRef = useRef(node.path);

  // Re-sync when the underlying node changes from the outside (undo, panel edits).
  useEffect(() => {
    if (srcRef.current !== node.path) {
      srcRef.current = node.path;
      setAnchors(parsePath(node.path ?? "").anchors);
    }
  }, [node.path]);

  /** grid (0..100) -> screen px inside the artboard wrapper */
  const sx = (gx: number) => (node.x + (gx / 100) * node.w) * zoom;
  const sy = (gy: number) => (node.y + (gy / 100) * node.h) * zoom;
  /** document px -> grid (0..100) */
  const toGrid = (p: { x: number; y: number }) => ({
    x: ((p.x - node.x) / Math.max(1, node.w)) * 100,
    y: ((p.y - node.y) / Math.max(1, node.h)) * 100,
  });

  function commit(list: Anchor[], transient: boolean) {
    const d = serializePath(list, closed);
    srcRef.current = d;
    onChange(d, transient);
  }

  function startDrag(e: React.PointerEvent, i: number, kind: "anchor" | "in" | "out") {
    e.stopPropagation();
    e.preventDefault();
    setActive(i);
    const alt = e.altKey;
    const move = (ev: PointerEvent) => {
      const g = toGrid(toDoc(ev.clientX, ev.clientY));
      const next = ref.current.map((a, idx) => {
        if (idx !== i) return a;
        if (kind === "anchor") return moveAnchor(a, g.x, g.y);
        return moveHandle(a, kind === "in" ? "in" : "out", g.x, g.y, alt || ev.altKey);
      });
      setAnchors(next);
      commit(next, true);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      commit(ref.current, false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  }

  function apply(i: number, fn: (a: Anchor) => Anchor) {
    const next = ref.current.map((a, idx) => (idx === i ? fn(a) : a));
    setAnchors(next);
    commit(next, false);
  }

  // Keyboard: Escape leaves, Backspace removes the active anchor, arrows nudge it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "Escape") { e.preventDefault(); onExit(); return; }
      if (active == null) return;
      if ((e.key === "Backspace" || e.key === "Delete") && ref.current.length > 2) {
        e.preventDefault();
        const next = ref.current.filter((_, i) => i !== active);
        setAnchors(next);
        commit(next, false);
        setActive(null);
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = (e.shiftKey ? 4 : 1) * (100 / Math.max(1, node.w));
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        apply(active, (a) => moveAnchor(a, a.x + dx, a.y + dy));
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onExit, node.w]);

  return (
    <svg className="absolute inset-0 z-30 h-full w-full overflow-visible" style={{ pointerEvents: "none" }}>
      {anchors.map((a, i) => {
        const hasIn = Math.hypot(a.ix - a.x, a.iy - a.y) > 0.01;
        const hasOut = Math.hypot(a.ox - a.x, a.oy - a.y) > 0.01;
        const on = active === i;
        return (
          <g key={i}>
            {hasIn && <line x1={sx(a.x)} y1={sy(a.y)} x2={sx(a.ix)} y2={sy(a.iy)} stroke="var(--accent)" strokeWidth={1} opacity={0.7} />}
            {hasOut && <line x1={sx(a.x)} y1={sy(a.y)} x2={sx(a.ox)} y2={sy(a.oy)} stroke="var(--accent)" strokeWidth={1} opacity={0.7} />}
            {hasIn && (
              <circle
                cx={sx(a.ix)} cy={sy(a.iy)} r={5}
                fill="var(--accent)" stroke="white" strokeWidth={1}
                style={{ pointerEvents: "auto", cursor: "grab" }}
                onPointerDown={(e) => startDrag(e, i, "in")}
              />
            )}
            {hasOut && (
              <circle
                cx={sx(a.ox)} cy={sy(a.oy)} r={5}
                fill="var(--accent)" stroke="white" strokeWidth={1}
                style={{ pointerEvents: "auto", cursor: "grab" }}
                onPointerDown={(e) => startDrag(e, i, "out")}
              />
            )}
            <rect
              x={sx(a.x) - 5} y={sy(a.y) - 5} width={10} height={10}
              rx={a.smooth ? 5 : 1.5}
              fill={on ? "var(--accent)" : "white"}
              stroke="var(--accent)" strokeWidth={1.5}
              style={{ pointerEvents: "auto", cursor: "move" }}
              onPointerDown={(e) => {
                if (e.altKey) { e.stopPropagation(); e.preventDefault(); setActive(i); apply(i, toggleSmooth); return; }
                startDrag(e, i, "anchor");
              }}
              onDoubleClick={(e) => { e.stopPropagation(); e.preventDefault(); apply(i, flipHandles); }}
            />
          </g>
        );
      })}
    </svg>
  );
}
