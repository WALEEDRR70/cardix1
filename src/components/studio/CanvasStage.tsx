// The visual canvas: renders the document and handles drag / resize / rotate / snap.
import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useStudio } from "@/lib/studio/store";
import { resolvePlaceholders, type StudioNode } from "@/lib/studio/types";

const GRID = 8;
const SNAP_TOLERANCE = 6;

export function NodeContent({ n, values }: { n: StudioNode; values?: Record<string, string> }) {
  const s = n.style;
  switch (n.type) {
    case "text":
      return (
        <div
          className="h-full w-full whitespace-pre-wrap break-words"
          style={{
            color: s.color,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            letterSpacing: s.letterSpacing,
            lineHeight: s.lineHeight,
            textAlign: s.align,
            padding: s.padding,
          }}
        >
          {resolvePlaceholders(n.text ?? "", values)}
        </div>
      );
    case "button":
      return (
        <div
          className="grid h-full w-full place-items-center"
          style={{
            background: s.gradient ?? s.fill,
            color: s.color,
            borderRadius: s.radius,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
          }}
        >
          {resolvePlaceholders(n.text ?? "Button", values)}
        </div>
      );
    case "image":
      return n.src ? (
        <img src={n.src} alt="" className="h-full w-full object-cover" style={{ borderRadius: s.radius }} />
      ) : (
        <div
          className="grid h-full w-full place-items-center border border-dashed text-[10px] uppercase tracking-widest"
          style={{ borderRadius: s.radius, borderColor: "#ffffff40", color: "#ffffff80" }}
        >
          image
        </div>
      );
    case "qr":
      return (
        <div
          className="grid h-full w-full place-items-center"
          style={{ background: s.fill, borderRadius: s.radius, padding: s.padding }}
        >
          <QRCodeSVG value={values?.["{{QR}}"] ?? "https://cardixn.com"} size={Math.min(n.w, n.h) - (s.padding ?? 0) * 2} bgColor="transparent" fgColor="#0b0713" />
        </div>
      );
    case "line":
      return <div className="h-full w-full" style={{ background: s.gradient ?? s.fill, borderRadius: s.radius }} />;
    case "shape":
      return (
        <div
          className="h-full w-full"
          style={{
            background: s.gradient ?? s.fill,
            borderRadius: n.shape === "ellipse" ? "50%" : s.radius,
            border: s.borderWidth ? `${s.borderWidth}px solid ${s.borderColor ?? "#fff"}` : undefined,
            backdropFilter: s.blur ? `blur(${s.blur}px)` : undefined,
            clipPath: n.shape === "triangle" ? "polygon(50% 0, 100% 100%, 0 100%)" : undefined,
          }}
        />
      );
    case "group":
      return (
        <>
          {n.children?.map((c) => (
            <div
              key={c.id}
              style={{
                position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h,
                transform: `rotate(${c.rot}deg)`, opacity: c.hidden ? 0 : c.opacity,
              }}
            >
              <NodeContent n={c} values={values} />
            </div>
          ))}
        </>
      );
    default:
      return null;
  }
}

type Drag =
  | { mode: "move"; ids: string[]; startX: number; startY: number; origin: { id: string; x: number; y: number }[] }
  | { mode: "resize"; id: string; handle: string; startX: number; startY: number; box: { x: number; y: number; w: number; h: number } }
  | { mode: "rotate"; id: string; cx: number; cy: number };

export function CanvasStage({ stageRef }: { stageRef?: React.RefObject<HTMLDivElement | null> }) {
  const { state, dispatch, selected } = useStudio();
  const { doc, zoom, grid, snap, guides } = state;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [snapLines, setSnapLines] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const round = useCallback((v: number) => (snap ? Math.round(v / GRID) * GRID : Math.round(v)), [snap]);

  const onPointerDownNode = (e: React.PointerEvent, n: StudioNode) => {
    if (n.locked) return;
    e.stopPropagation();
    const ids = e.shiftKey
      ? state.selection.includes(n.id) ? state.selection : [...state.selection, n.id]
      : state.selection.includes(n.id) ? state.selection : [n.id];
    dispatch({ t: "select", ids });
    setDrag({
      mode: "move",
      ids,
      startX: e.clientX,
      startY: e.clientY,
      origin: ids.map((id) => {
        const target = doc.nodes.find((m) => m.id === id) ?? n;
        return { id, x: target.x, y: target.y };
      }),
    });
  };

  useEffect(() => {
    if (!drag) return;
    function onMove(e: PointerEvent) {
      if (!drag) return;
      if (drag.mode === "move") {
        const dx = (e.clientX - drag.startX) / zoom;
        const dy = (e.clientY - drag.startY) / zoom;
        const lines: { x: number[]; y: number[] } = { x: [], y: [] };
        for (const o of drag.origin) {
          const target = doc.nodes.find((m) => m.id === o.id);
          if (!target) continue;
          let nx = round(o.x + dx);
          let ny = round(o.y + dy);
          if (guides) {
            const cx = nx + target.w / 2;
            const cy = ny + target.h / 2;
            if (Math.abs(cx - doc.w / 2) < SNAP_TOLERANCE) { nx = doc.w / 2 - target.w / 2; lines.x.push(doc.w / 2); }
            if (Math.abs(cy - doc.h / 2) < SNAP_TOLERANCE) { ny = doc.h / 2 - target.h / 2; lines.y.push(doc.h / 2); }
          }
          dispatch({ t: "update", ids: [o.id], patch: { x: nx, y: ny }, transient: true });
        }
        setSnapLines(lines);
      } else if (drag.mode === "resize") {
        const dx = (e.clientX - drag.startX) / zoom;
        const dy = (e.clientY - drag.startY) / zoom;
        const b = drag.box;
        let { x, y, w, h } = b;
        if (drag.handle.includes("e")) w = Math.max(16, b.w + dx);
        if (drag.handle.includes("s")) h = Math.max(16, b.h + dy);
        if (drag.handle.includes("w")) { w = Math.max(16, b.w - dx); x = b.x + (b.w - w); }
        if (drag.handle.includes("n")) { h = Math.max(16, b.h - dy); y = b.y + (b.h - h); }
        dispatch({
          t: "update", ids: [drag.id], transient: true,
          patch: { x: round(x), y: round(y), w: round(w), h: round(h) },
        });
      } else if (drag.mode === "rotate") {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + drag.cx * zoom;
        const cy = rect.top + drag.cy * zoom;
        const deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
        dispatch({ t: "update", ids: [drag.id], patch: { rot: Math.round(deg) }, transient: true });
      }
    }
    function onUp() {
      setDrag(null);
      setSnapLines({ x: [], y: [] });
      // seal the transient edits into one history entry
      dispatch({ t: "replace", doc });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, dispatch, doc, zoom, round, guides]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ t: e.shiftKey ? "redo" : "undo" });
      } else if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        dispatch({ t: "duplicate", ids: state.selection });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selection.length) { e.preventDefault(); dispatch({ t: "remove", ids: state.selection }); }
      } else if (e.key.startsWith("Arrow") && state.selection.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
        const dy = e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0;
        for (const id of state.selection) {
          const n = doc.nodes.find((m) => m.id === id);
          if (n) dispatch({ t: "update", ids: [id], patch: { x: n.x + dx, y: n.y + dy } });
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.selection, doc]);

  return (
    <div
      className="relative grid flex-1 place-items-center overflow-auto bg-[#07050d] p-10"
      onPointerDown={() => dispatch({ t: "select", ids: [] })}
    >
      <div
        ref={wrapRef}
        style={{ width: doc.w * zoom, height: doc.h * zoom }}
        className="relative"
      >
        <div
          ref={stageRef}
          data-studio-stage
          style={{
            width: doc.w,
            height: doc.h,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            background: doc.background.gradient ?? doc.background.color,
            backgroundImage: doc.background.image ? `url(${doc.background.image})` : undefined,
            backgroundSize: "cover",
          }}
          className="absolute left-0 top-0 overflow-hidden rounded-[28px] shadow-2xl"
        >
          {grid && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: `${GRID * 4}px ${GRID * 4}px`,
              }}
            />
          )}
          {guides && (
            <div aria-hidden className="pointer-events-none absolute inset-6 rounded-[20px] border border-dashed border-white/15" />
          )}

          {doc.nodes.map((n) => (
            <div
              key={n.id}
              onPointerDown={(e) => onPointerDownNode(e, n)}
              style={{
                position: "absolute",
                left: n.x, top: n.y, width: n.w, height: n.h,
                transform: `rotate(${n.rot}deg)`,
                opacity: n.hidden ? 0 : n.opacity,
                cursor: n.locked ? "default" : "move",
                boxShadow: n.style.shadow ?? undefined,
                filter: n.style.glow ? `drop-shadow(0 0 18px ${n.style.glow})` : undefined,
              }}
            >
              <NodeContent n={n} />
            </div>
          ))}

          {snapLines.x.map((x) => (
            <div key={`x${x}`} className="pointer-events-none absolute top-0 h-full w-px bg-accent" style={{ left: x }} />
          ))}
          {snapLines.y.map((y) => (
            <div key={`y${y}`} className="pointer-events-none absolute left-0 h-px w-full bg-accent" style={{ top: y }} />
          ))}
        </div>

        {/* selection overlays live outside the exported stage */}
        {selected.map((n) => (
          <div
            key={n.id}
            className="pointer-events-none absolute border border-accent"
            style={{
              left: n.x * zoom, top: n.y * zoom, width: n.w * zoom, height: n.h * zoom,
              transform: `rotate(${n.rot}deg)`,
            }}
          >
            {selected.length === 1 && !n.locked && (
              <>
                {["nw", "ne", "sw", "se", "n", "s", "e", "w"].map((h) => (
                  <span
                    key={h}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDrag({ mode: "resize", id: n.id, handle: h, startX: e.clientX, startY: e.clientY, box: { x: n.x, y: n.y, w: n.w, h: n.h } });
                    }}
                    className="pointer-events-auto absolute h-2.5 w-2.5 rounded-full border border-accent bg-background"
                    style={handleStyle(h)}
                  />
                ))}
                <span
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setDrag({ mode: "rotate", id: n.id, cx: n.x + n.w / 2, cy: n.y + n.h / 2 });
                  }}
                  className="pointer-events-auto absolute left-1/2 h-3 w-3 -translate-x-1/2 cursor-grab rounded-full border border-accent bg-background"
                  style={{ top: -26 }}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function handleStyle(h: string): React.CSSProperties {
  const s: React.CSSProperties = { cursor: `${h}-resize` };
  if (h.includes("n")) s.top = -5; else if (h.includes("s")) s.bottom = -5; else { s.top = "50%"; s.marginTop = -5; }
  if (h.includes("w")) s.left = -5; else if (h.includes("e")) s.right = -5; else { s.left = "50%"; s.marginLeft = -5; }
  return s;
}
