// The visual canvas: renders the document and handles pan / zoom / marquee / drag / resize / rotate / snap.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useStudio } from "@/lib/studio/store";
import { resolveImageSrc, resolvePlaceholders, type StudioNode } from "@/lib/studio/types";
import { isSvgSrc, useInlineSvg } from "@/lib/studio/svg";
import { PenLayer } from "./PenLayer";
import { PathEditLayer } from "./PathEditLayer";
import employeePlaceholder from "@/assets/employee-placeholder.png.asset.json";


const GRID = 8;
const SNAP_TOLERANCE = 6;

/** Convert a CSS box-shadow value to a filter drop-shadow so the shadow
 *  follows the real silhouette of the shape instead of its bounding box. */
function toDropShadow(shadow: string): string {
  const parts = shadow.trim().split(/\s+(?![^(]*\))/);
  const lengths: string[] = [];
  const rest: string[] = [];
  for (const p of parts) {
    if (p === "inset") return "";
    if (/^-?[\d.]+(px|rem|em|%)?$/.test(p) && lengths.length < 4) lengths.push(p);
    else rest.push(p);
  }
  const [x = "0", y = "0", blur = "0"] = lengths;
  const color = rest.join(" ") || "rgba(0,0,0,.35)";
  return `drop-shadow(${x} ${y} ${blur} ${color})`;
}


function ImageNode({ n, values }: { n: StudioNode; values?: Record<string, string> }) {
  const s = n.style;
  const src = resolveImageSrc(n, values);
  const inline = useInlineSvg(src, {
    fill: s.svgFill,
    stroke: s.svgStroke,
    strokeWidth: s.svgStrokeWidth,
    colorMap: s.svgColorMap,
    removeBg: s.svgRemoveBg,
  });

  const svg = isSvgSrc(src) && s.svgInline !== false ? inline : null;

  if (!src) {
    if (n.imageSource === "employee") {
      return (
        <img
          src={employeePlaceholder.url}
          alt=""
          className="h-full w-full object-cover"
          style={{ borderRadius: s.radius }}
        />
      );
    }
    return (
      <div
        className="grid h-full w-full place-items-center border border-dashed text-[10px] uppercase tracking-widest"
        style={{ borderRadius: s.radius, borderColor: "#ffffff40", color: "#ffffff80" }}
      >
        {n.imageSource === "logo" ? "logo" : "image"}
      </div>
    );
  }

  if (svg) {
    return (
      <div
        className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
        style={{ borderRadius: s.radius, overflow: "hidden" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return <img src={src} alt="" className="h-full w-full object-cover" style={{ borderRadius: s.radius }} />;
}

export function NodeContent({ n, values }: { n: StudioNode; values?: Record<string, string> }) {
  const s = n.style;
  switch (n.type) {
    case "text":
      return (
        <div
          className="h-full w-full whitespace-pre-wrap break-words"
          style={{
            color: s.color,
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            letterSpacing: s.letterSpacing,
            lineHeight: s.lineHeight,
            textAlign: s.align,
            textTransform: s.textTransform,
            padding: s.padding,
            ...(s.maxLines
              ? {
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical" as const,
                  WebkitLineClamp: s.maxLines,
                  overflow: "hidden",
                }
              : null),
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
      return <ImageNode n={n} values={values} />;

    case "qr":
      return (
        <div
          className="grid h-full w-full place-items-center"
          style={{ background: s.fill, borderRadius: s.radius, padding: s.padding }}
        >
          <QRCodeSVG value={values?.["{{QR}}"] ?? "https://cardixn.com"} size={Math.min(n.w, n.h) - (s.padding ?? 0) * 2} bgColor="transparent" fgColor="#0b0713" />
        </div>
      );
    case "path":
      return (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          shapeRendering="geometricPrecision"
          className="h-full w-full overflow-visible"
          style={{ filter: s.blur ? `blur(${s.blur}px)` : undefined }}
        >
          <path
            d={n.path ?? ""}
            fill={s.gradient ? "none" : (s.fill && s.fill !== "transparent" ? s.fill : "none")}
            fillRule="evenodd"
            stroke={s.stroke ?? undefined}
            strokeWidth={s.strokeWidth ?? 0}
            strokeLinecap={s.cap ?? "round"}
            strokeLinejoin="round"
            strokeMiterlimit={2}
            strokeDasharray={s.dash ?? undefined}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
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
  | { mode: "resize"; id: string; handle: string; startX: number; startY: number; box: { x: number; y: number; w: number; h: number }; ratio: number }
  | { mode: "rotate"; id: string; cx: number; cy: number };

type Marquee = { x0: number; y0: number; x1: number; y1: number };

export function CanvasStage({ stageRef }: { stageRef?: React.RefObject<HTMLDivElement | null> }) {
  const { state, dispatch, selected, addNode } = useStudio();
  const { doc, zoom, pan, grid, snap, guides, fitTick, tool } = state;

  const viewportRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [panning, setPanning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });

  const round = useCallback((v: number) => (snap ? Math.round(v / GRID) * GRID : Math.round(v)), [snap]);

  /** Screen point -> document coordinates. */
  const toDoc = useCallback(
    (clientX: number, clientY: number) => {
      const r = viewportRef.current?.getBoundingClientRect();
      if (!r) return { x: 0, y: 0 };
      return { x: (clientX - r.left - pan.x) / zoom, y: (clientY - r.top - pan.y) / zoom };
    },
    [pan.x, pan.y, zoom],
  );

  /** Alignment targets from the canvas and every unselected node. */
  const snapTargets = useMemo(() => {
    const xs: number[] = [0, doc.w / 2, doc.w];
    const ys: number[] = [0, doc.h / 2, doc.h];
    for (const n of doc.nodes) {
      xs.push(n.x, n.x + n.w / 2, n.x + n.w);
      ys.push(n.y, n.y + n.h / 2, n.y + n.h);
    }
    return { xs, ys };
  }, [doc]);

  // Fit the artboard into the viewport (on mount, on resize, and on demand).
  useEffect(() => {
    const r = viewportRef.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    const z = Math.min((r.width - 96) / doc.w, (r.height - 96) / doc.h);
    const next = Math.max(0.05, Math.min(5, z));
    dispatch({ t: "zoom", value: next });
    dispatch({ t: "pan", x: (r.width - doc.w * next) / 2, y: (r.height - doc.h * next) / 2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitTick, doc.w, doc.h]);

  // Trackpad / wheel: pinch or ctrl+wheel zooms around the cursor, plain wheel pans.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const r = el!.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        const nz = Math.max(0.05, Math.min(5, zoom * Math.exp(-e.deltaY / 300)));
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        dispatch({ t: "zoom", value: nz });
        dispatch({ t: "pan", x: px - ((px - pan.x) * nz) / zoom, y: py - ((py - pan.y) * nz) / zoom });
      } else {
        dispatch({ t: "pan", x: pan.x - e.deltaX, y: pan.y - e.deltaY });
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [dispatch, pan.x, pan.y, zoom]);

  const onPointerDownNode = (e: React.PointerEvent, n: StudioNode) => {
    if (spaceDown || e.button === 1 || tool === "pen") return;
    if (tool === "node" && n.type === "path") return;
    if (n.locked) return;

    e.stopPropagation();
    const ids = e.shiftKey
      ? state.selection.includes(n.id) ? state.selection : [...state.selection, n.id]
      : state.selection.includes(n.id) ? state.selection : [n.id];
    dispatch({ t: "select", ids });
    if (editingId && editingId !== n.id) setEditingId(null);
    if (editingId === n.id) return;
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

  // Background pointer: pan (space / middle button) or marquee-select.
  const onPointerDownViewport = (e: React.PointerEvent) => {
    if (spaceDown || e.button === 1) {
      e.preventDefault();
      const startX = e.clientX - pan.x;
      const startY = e.clientY - pan.y;
      setPanning(true);
      const move = (ev: PointerEvent) => dispatch({ t: "pan", x: ev.clientX - startX, y: ev.clientY - startY });
      const up = () => {
        setPanning(false);
        window.removeEventListener("pointermove", move);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up, { once: true });
      return;
    }
    if (e.button !== 0 || tool === "pen") return;
    setEditingId(null);
    dispatch({ t: "select", ids: [] });
    const start = toDoc(e.clientX, e.clientY);
    setMarquee({ x0: start.x, y0: start.y, x1: start.x, y1: start.y });
  };

  // Marquee selection lifecycle.
  useEffect(() => {
    if (!marquee) return;
    function onMove(e: PointerEvent) {
      if (e.buttons === 0) { onUp(); return; }
      const p = toDoc(e.clientX, e.clientY);
      setMarquee((m) => (m ? { ...m, x1: p.x, y1: p.y } : m));
    }
    function onUp() {
      setMarquee((m) => {
        if (m) {
          const x = Math.min(m.x0, m.x1);
          const y = Math.min(m.y0, m.y1);
          const w = Math.abs(m.x1 - m.x0);
          const h = Math.abs(m.y1 - m.y0);
          if (w > 4 && h > 4) {
            const hits = doc.nodes
              .filter((n) => !n.locked && !n.hidden && n.x < x + w && n.x + n.w > x && n.y < y + h && n.y + n.h > y)
              .map((n) => n.id);
            dispatch({ t: "select", ids: hits });
          }
        }
        return null;
      });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [marquee, toDoc, doc.nodes, dispatch]);


  useEffect(() => {
    if (!drag) return;
    function onMove(e: PointerEvent) {
      if (!drag) return;
      if (drag.mode === "move") {
        let dx = (e.clientX - drag.startX) / zoom;
        let dy = (e.clientY - drag.startY) / zoom;
        const lines: { x: number[]; y: number[] } = { x: [], y: [] };
        const moving = new Set(drag.origin.map((o) => o.id));
        const boxes = drag.origin
          .map((o) => {
            const target = doc.nodes.find((m) => m.id === o.id);
            return target ? { id: o.id, x: o.x, y: o.y, w: target.w, h: target.h } : null;
          })
          .filter(Boolean) as { id: string; x: number; y: number; w: number; h: number }[];
        if (!boxes.length) return;

        // Group bounding box: snap once so relative spacing is preserved
        // and at most one guide per axis is drawn.
        const gx0 = Math.min(...boxes.map((b) => b.x));
        const gy0 = Math.min(...boxes.map((b) => b.y));
        const gx1 = Math.max(...boxes.map((b) => b.x + b.w));
        const gy1 = Math.max(...boxes.map((b) => b.y + b.h));
        const gw = gx1 - gx0;
        const gh = gy1 - gy0;

        dx = round(gx0 + dx) - gx0;
        dy = round(gy0 + dy) - gy0;

        if (guides && !e.altKey) {
          const staticNodes = doc.nodes.filter((n) => !moving.has(n.id));
          const xs = [0, doc.w / 2, doc.w];
          const ys = [0, doc.h / 2, doc.h];
          for (const n of staticNodes) {
            xs.push(n.x, n.x + n.w / 2, n.x + n.w);
            ys.push(n.y, n.y + n.h / 2, n.y + n.h);
          }
          const candX = [gx0 + dx, gx0 + dx + gw / 2, gx0 + dx + gw];
          for (let i = 0; i < candX.length; i++) {
            const hit = xs.find((t) => Math.abs(candX[i] - t) < SNAP_TOLERANCE);
            if (hit !== undefined) {
              dx += hit - candX[i];
              lines.x.push(hit);
              break;
            }
          }
          const candY = [gy0 + dy, gy0 + dy + gh / 2, gy0 + dy + gh];
          for (let i = 0; i < candY.length; i++) {
            const hit = ys.find((t) => Math.abs(candY[i] - t) < SNAP_TOLERANCE);
            if (hit !== undefined) {
              dy += hit - candY[i];
              lines.y.push(hit);
              break;
            }
          }
        }

        for (const b of boxes) {
          dispatch({ t: "update", ids: [b.id], patch: { x: b.x + dx, y: b.y + dy }, transient: true });
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
        // Shift keeps the original aspect ratio on corner handles.
        if (e.shiftKey && drag.handle.length === 2) {
          h = Math.max(16, w / drag.ratio);
          if (drag.handle.includes("n")) y = b.y + b.h - h;
        }
        dispatch({
          t: "update", ids: [drag.id], transient: true,
          patch: { x: round(x), y: round(y), w: round(w), h: round(h) },
        });
      } else if (drag.mode === "rotate") {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + drag.cx * zoom;
        const cy = rect.top + drag.cy * zoom;
        let deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
        if (e.shiftKey) deg = Math.round(deg / 15) * 15;
        dispatch({ t: "update", ids: [drag.id], patch: { rot: Math.round(deg) }, transient: true });
      }
      // Safety: if the button was released while the pointerup event was lost
      // (pointer left the window/iframe), end the drag instead of sticking.
      if (e.buttons === 0) onUp();
    }
    function onUp() {
      setDrag(null);
      setSnapLines({ x: [], y: [] });
      // seal the transient edits into one history entry
      dispatch({ t: "replace", doc });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [drag, dispatch, doc, zoom, round, guides, snapTargets]);


  // Keyboard: shortcuts + space-to-pan.
  useEffect(() => {
    function editable(t: EventTarget | null) {
      const el = t as HTMLElement | null;
      const tag = el?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable === true;
    }
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" && !editable(e.target)) { e.preventDefault(); setSpaceDown(true); }
      if (editable(e.target)) return;
      const meta = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (!meta && (key === "p" || key === "v" || key === "a")) {
        e.preventDefault();
        dispatch({ t: "tool", value: key === "p" ? "pen" : key === "a" ? "node" : "select" });
        return;
      }
      if (meta && key === "z") {

        e.preventDefault();
        dispatch({ t: e.shiftKey ? "redo" : "undo" });
      } else if (meta && key === "y") {
        e.preventDefault();
        dispatch({ t: "redo" });
      } else if (meta && key === "d") {
        e.preventDefault();
        dispatch({ t: "duplicate", ids: state.selection });
      } else if (meta && key === "c") {
        dispatch({ t: "copy", ids: state.selection });
      } else if (meta && key === "v") {
        dispatch({ t: "paste" });
      } else if (meta && key === "a") {
        e.preventDefault();
        dispatch({ t: "select", ids: doc.nodes.filter((n) => !n.locked).map((n) => n.id) });
      } else if (meta && key === "g") {
        e.preventDefault();
        if (e.shiftKey) { if (state.selection[0]) dispatch({ t: "ungroup", id: state.selection[0] }); }
        else dispatch({ t: "group", ids: state.selection });
      } else if (meta && key === "0") {
        e.preventDefault();
        dispatch({ t: "fit" });
      } else if (meta && (key === "=" || key === "+")) {
        e.preventDefault();
        dispatch({ t: "zoom", value: zoom + 0.1 });
      } else if (meta && key === "-") {
        e.preventDefault();
        dispatch({ t: "zoom", value: zoom - 0.1 });
      } else if (key === "escape") {
        setEditingId(null);
        dispatch({ t: "select", ids: [] });
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
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceDown(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch, state.selection, doc, zoom]);

  const marqueeBox = marquee && {
    left: Math.min(marquee.x0, marquee.x1) * zoom,
    top: Math.min(marquee.y0, marquee.y1) * zoom,
    width: Math.abs(marquee.x1 - marquee.x0) * zoom,
    height: Math.abs(marquee.y1 - marquee.y0) * zoom,
  };

  return (
    <div
      ref={viewportRef}
      className="relative flex-1 overflow-hidden bg-[#07050d]"
      style={{ cursor: panning ? "grabbing" : spaceDown ? "grab" : "default" }}
      onPointerDown={onPointerDownViewport}
    >
      <div
        ref={wrapRef}
        style={{ position: "absolute", left: pan.x, top: pan.y, width: doc.w * zoom, height: doc.h * zoom }}
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
          }}
          className="absolute left-0 top-0 overflow-hidden rounded-[28px] shadow-2xl"
        >
          {doc.background.image && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url(${doc.background.image})`,
                backgroundSize: doc.background.fit === "contain" ? "contain" : doc.background.fit === "repeat" ? "auto" : "cover",
                backgroundRepeat: doc.background.fit === "repeat" ? "repeat" : "no-repeat",
                backgroundPosition: "center",
                opacity: doc.background.imageOpacity ?? 1,
              }}
            />
          )}

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
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onPointerDown={(e) => onPointerDownNode(e, n)}

              onDoubleClick={(e) => {
                if (n.type === "text" || n.type === "button") { e.stopPropagation(); setEditingId(n.id); }
              }}
              style={{
                position: "absolute",
                left: n.x, top: n.y, width: n.w, height: n.h,
                transform: `rotate(${n.rot}deg)`,
                opacity: n.hidden ? 0 : n.opacity,
                cursor: n.locked ? "default" : "move",
                filter: [
                  n.style.shadow ? toDropShadow(n.style.shadow) : null,
                  n.style.glow ? `drop-shadow(0 0 18px ${n.style.glow})` : null,
                ].filter(Boolean).join(" ") || undefined,

              }}
            >
              {editingId === n.id ? (
                <TextEditor node={n} onDone={(text) => { dispatch({ t: "update", ids: [n.id], patch: { text } }); setEditingId(null); }} />
              ) : (
                <NodeContent n={n} />
              )}
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
            <span className="absolute -top-5 start-0 whitespace-nowrap rounded bg-accent px-1.5 py-0.5 text-[9px] font-medium text-accent-foreground">
              {Math.round(n.w)} × {Math.round(n.h)}
            </span>
            {selected.length === 1 && !n.locked && editingId !== n.id && (
              <>
                {["nw", "ne", "sw", "se", "n", "s", "e", "w"].map((h) => (
                  <span
                    key={h}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setDrag({ mode: "resize", id: n.id, handle: h, startX: e.clientX, startY: e.clientY, box: { x: n.x, y: n.y, w: n.w, h: n.h }, ratio: n.w / Math.max(1, n.h) });
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

        {marqueeBox && (
          <div
            className="pointer-events-none absolute border border-accent bg-accent/10"
            style={marqueeBox}
          />
        )}

        {tool === "node" && !spaceDown && selected.length === 1 && selected[0].type === "path" && (
          <PathEditLayer
            node={selected[0]}
            zoom={zoom}
            toDoc={toDoc}
            onExit={() => dispatch({ t: "tool", value: "select" })}
            onChange={(path, transient) =>
              dispatch({ t: "update", ids: [selected[0].id], patch: { path }, transient })
            }
          />
        )}

        {tool === "pen" && !spaceDown && (
          <PenLayer
            zoom={zoom}
            grid={8}
            snap={snap && grid}

            toDoc={toDoc}
            onExit={() => dispatch({ t: "tool", value: "select" })}

            onCommit={(r) => {
              addNode("path", {
                name: "Pen path",
                x: Math.round(r.x),
                y: Math.round(r.y),
                w: Math.round(r.w),
                h: Math.round(r.h),
                path: r.path,
                style: r.closed
                  ? { fill: "#7c34ff", stroke: null, strokeWidth: 0 }
                  : { fill: "transparent", stroke: "#7c34ff", strokeWidth: 3, cap: "round" },
              });
            }}
          />
        )}
      </div>


      <div className="pointer-events-none absolute bottom-3 end-3 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[10px] text-muted-foreground backdrop-blur">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

/** Inline text editing directly on the canvas (double-click a text node). */
function TextEditor({ node, onDone }: { node: StudioNode; onDone: (text: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const s = node.style;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = node.text ?? "";
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onDone(e.currentTarget.textContent ?? "")}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
          e.preventDefault();
          onDone(e.currentTarget.textContent ?? "");
        }
      }}
      className="h-full w-full whitespace-pre-wrap break-words outline-none ring-1 ring-accent"
      style={{
        color: s.color,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
        textAlign: s.align,
        padding: s.padding,
        cursor: "text",
      }}
    />
  );
}

function handleStyle(h: string): React.CSSProperties {
  const s: React.CSSProperties = { cursor: `${h}-resize` };
  if (h.includes("n")) s.top = -5; else if (h.includes("s")) s.bottom = -5; else { s.top = "50%"; s.marginTop = -5; }
  if (h.includes("w")) s.left = -5; else if (h.includes("e")) s.right = -5; else { s.left = "50%"; s.marginLeft = -5; }
  return s;
}
