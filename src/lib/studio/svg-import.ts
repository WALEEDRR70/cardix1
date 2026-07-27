// Turns raw SVG markup into editable Studio `path` nodes (0..100 grid),
// so imported backgrounds keep their colors AND stay point-editable forever.
import { node, type StudioDoc, type StudioNode } from "./types";

export type SvgLayer = {
  /** Path data normalized into the 0..100 x 0..100 studio grid. */
  d: string;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number | null;
  opacity: number;
};

export type SvgArtwork = {
  vbW: number;
  vbH: number;
  layers: SvgLayer[];
};

const NUM = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g;

type Pt = { x: number; y: number };

/* ------------------------------------------------------------------ */
/* Path normalization: any command set -> absolute M / L / C / Z       */
/* ------------------------------------------------------------------ */

function arcToCubics(p0: Pt, rx: number, ry: number, xRot: number, large: number, sweep: number, p1: Pt): Pt[][] {
  if (rx === 0 || ry === 0) return [[p0, p1, p1]];
  const rad = (xRot * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const dx = (p0.x - p1.x) / 2, dy = (p0.y - p1.y) / 2;
  const x1 = cos * dx + sin * dy;
  const y1 = -sin * dx + cos * dy;
  let RX = Math.abs(rx), RY = Math.abs(ry);
  const check = (x1 * x1) / (RX * RX) + (y1 * y1) / (RY * RY);
  if (check > 1) { const s = Math.sqrt(check); RX *= s; RY *= s; }
  const den = RX * RX * y1 * y1 + RY * RY * x1 * x1;
  const num = RX * RX * RY * RY - den;
  let coef = Math.sqrt(Math.max(0, num / den));
  if (large === sweep) coef = -coef;
  const cx1 = (coef * RX * y1) / RY;
  const cy1 = (-coef * RY * x1) / RX;
  const cx = cos * cx1 - sin * cy1 + (p0.x + p1.x) / 2;
  const cy = sin * cx1 + cos * cy1 + (p0.y + p1.y) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy) || 1;
    let a = Math.acos(Math.min(1, Math.max(-1, dot / len)));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const theta = ang(1, 0, (x1 - cx1) / RX, (y1 - cy1) / RY);
  let delta = ang((x1 - cx1) / RX, (y1 - cy1) / RY, (-x1 - cx1) / RX, (-y1 - cy1) / RY);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const steps = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2)));
  const out: Pt[][] = [];
  const step = delta / steps;
  const k = (4 / 3) * Math.tan(step / 4);
  let a0 = theta;
  const at = (a: number): Pt => ({
    x: cos * RX * Math.cos(a) - sin * RY * Math.sin(a) + cx,
    y: sin * RX * Math.cos(a) + cos * RY * Math.sin(a) + cy,
  });
  const der = (a: number): Pt => ({
    x: -cos * RX * Math.sin(a) - sin * RY * Math.cos(a),
    y: -sin * RX * Math.sin(a) + cos * RY * Math.cos(a),
  });
  for (let i = 0; i < steps; i++) {
    const a1 = a0 + step;
    const s = at(a0), e = at(a1);
    const ds = der(a0), de = der(a1);
    out.push([
      { x: s.x + k * ds.x, y: s.y + k * ds.y },
      { x: e.x - k * de.x, y: e.y - k * de.y },
      e,
    ]);
    a0 = a1;
  }
  return out;
}

/** Rewrites any path data into absolute `M / L / C / Z` commands. */
export function toAbsoluteCubics(d: string): string {
  const tokens = d.match(/[astvzqmhlcASTVZQMHLC]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  let i = 0;
  let cmd = "";
  const out: string[] = [];
  const cur: Pt = { x: 0, y: 0 };
  const start: Pt = { x: 0, y: 0 };
  const st: { ctrl: Pt | null; q: Pt | null } = { ctrl: null, q: null };
  const f = (v: number) => (Math.round(v * 1000) / 1000).toString();
  const num = () => Number(tokens[i++]);

  const line = (p: Pt) => { out.push(`L ${f(p.x)} ${f(p.y)}`); cur.x = p.x; cur.y = p.y; st.ctrl = null; st.q = null; };
  const cubic = (c1: Pt, c2: Pt, p: Pt) => {
    out.push(`C ${f(c1.x)} ${f(c1.y)}, ${f(c2.x)} ${f(c2.y)}, ${f(p.x)} ${f(p.y)}`);
    cur.x = p.x; cur.y = p.y; st.ctrl = c2; st.q = null;
  };

  while (i < tokens.length) {
    const t = tokens[i];
    if (/[a-zA-Z]/.test(t)) { cmd = t; i++; }
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const bx = rel ? cur.x : 0;
    const by = rel ? cur.y : 0;

    switch (C) {
      case "M": {
        const p = { x: bx + num(), y: by + num() };
        out.push(`M ${f(p.x)} ${f(p.y)}`);
        cur.x = p.x; cur.y = p.y; start.x = p.x; start.y = p.y;
        st.ctrl = null; st.q = null;
        cmd = rel ? "l" : "L";
        break;
      }
      case "L": line({ x: bx + num(), y: by + num() }); break;
      case "H": line({ x: bx + num(), y: cur.y }); break;
      case "V": line({ x: cur.x, y: by + num() }); break;
      case "C": {
        const c1 = { x: bx + num(), y: by + num() };
        const c2 = { x: bx + num(), y: by + num() };
        cubic(c1, c2, { x: bx + num(), y: by + num() });
        break;
      }
      case "S": {
        const c1 = st.ctrl ? { x: 2 * cur.x - st.ctrl.x, y: 2 * cur.y - st.ctrl.y } : { ...cur };
        const c2 = { x: bx + num(), y: by + num() };
        cubic(c1, c2, { x: bx + num(), y: by + num() });
        break;
      }
      case "Q": {
        const q = { x: bx + num(), y: by + num() };
        const p = { x: bx + num(), y: by + num() };
        const c1 = { x: cur.x + (2 / 3) * (q.x - cur.x), y: cur.y + (2 / 3) * (q.y - cur.y) };
        const c2 = { x: p.x + (2 / 3) * (q.x - p.x), y: p.y + (2 / 3) * (q.y - p.y) };
        cubic(c1, c2, p);
        st.q = qc;
        break;
      }
      case "T": {
        const qc = st.q ? { x: 2 * cur.x - st.q.x, y: 2 * cur.y - st.q.y } : { ...cur };
        const p = { x: bx + num(), y: by + num() };
        const c1 = { x: cur.x + (2 / 3) * (q.x - cur.x), y: cur.y + (2 / 3) * (q.y - cur.y) };
        const c2 = { x: p.x + (2 / 3) * (q.x - p.x), y: p.y + (2 / 3) * (q.y - p.y) };
        cubic(c1, c2, p);
        st.q = qc;
        break;
      }
      case "A": {
        const rx = num(), ry = num(), rot = num(), large = num(), sweep = num();
        const p = { x: bx + num(), y: by + num() };
        for (const [c1, c2, e] of arcToCubics({ ...cur }, rx, ry, rot, large, sweep, p)) cubic(c1, c2, e);
        break;
      }
      case "Z": {
        out.push("Z");
        cur.x = start.x; cur.y = start.y;
        st.ctrl = null; st.q = null;
        break;
      }
      default:
        i++; // unknown token — skip so we never loop forever
    }
    if (!tokens.length) break;
  }

  return out.join(" ");
}

/** Scales absolute path data from a viewBox into the 0..100 studio grid. */
export function scalePathTo100(d: string, vb: { x: number; y: number; w: number; h: number }): string {
  return d.replace(/([MLC])([^MLCZ]*)/g, (_m, cmd: string, body: string) => {
    const nums = (body.match(NUM) ?? []).map(Number);
    const mapped: string[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = ((nums[i] - vb.x) / vb.w) * 100;
      const y = ((nums[i + 1] - vb.y) / vb.h) * 100;
      mapped.push(`${x.toFixed(3)} ${y.toFixed(3)}`);
    }
    return `${cmd} ${mapped.join(", ")} `;
  }).replace(/\s+/g, " ").trim();
}

/* ------------------------------------------------------------------ */
/* SVG markup parsing                                                  */
/* ------------------------------------------------------------------ */

function parseStyleClasses(markup: string): Record<string, { fill?: string; stroke?: string; strokeWidth?: string; opacity?: string }> {
  const map: Record<string, { fill?: string; stroke?: string; strokeWidth?: string; opacity?: string }> = {};
  const styles = markup.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? [];
  for (const block of styles) {
    const css = block.replace(/<\/?style[^>]*>/gi, "");
    const rules = css.match(/\.[-\w]+\s*(?:,\s*\.[-\w]+\s*)*\{[^}]*\}/g) ?? [];
    for (const rule of rules) {
      const selectors = (rule.slice(0, rule.indexOf("{")).match(/\.[-\w]+/g) ?? []).map((s) => s.slice(1));
      const body = rule.slice(rule.indexOf("{") + 1, rule.lastIndexOf("}"));
      const pick = (prop: string) => body.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`, "i"))?.[1]?.trim();
      for (const sel of selectors) {
        map[sel] = {
          ...map[sel],
          fill: pick("fill") ?? map[sel]?.fill,
          stroke: pick("stroke") ?? map[sel]?.stroke,
          strokeWidth: pick("stroke-width") ?? map[sel]?.strokeWidth,
          opacity: pick("opacity") ?? map[sel]?.opacity,
        };
      }
    }
  }
  return map;
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"))?.[1]
    ?? tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, "i"))?.[1];
}

function inlineStyleProp(tag: string, prop: string): string | undefined {
  const style = attr(tag, "style");
  if (!style) return undefined;
  return style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i"))?.[1]?.trim();
}

/** Converts primitive shapes (rect / circle / ellipse / polygon / line) to path data. */
function primitiveToPath(tag: string, name: string): string | null {
  const n = (v?: string) => (v === undefined ? 0 : Number(v) || 0);
  if (name === "rect") {
    const x = n(attr(tag, "x")), y = n(attr(tag, "y"));
    const w = n(attr(tag, "width")), h = n(attr(tag, "height"));
    if (!w || !h) return null;
    return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  if (name === "circle" || name === "ellipse") {
    const cx = n(attr(tag, "cx")), cy = n(attr(tag, "cy"));
    const r = n(attr(tag, "r"));
    const rx = name === "circle" ? r : n(attr(tag, "rx"));
    const ry = name === "circle" ? r : n(attr(tag, "ry"));
    if (!rx || !ry) return null;
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  }
  if (name === "polygon" || name === "polyline") {
    const pts = (attr(tag, "points")?.match(NUM) ?? []).map(Number);
    if (pts.length < 4) return null;
    let d = `M ${pts[0]} ${pts[1]}`;
    for (let i = 2; i + 1 < pts.length; i += 2) d += ` L ${pts[i]} ${pts[i + 1]}`;
    return name === "polygon" ? `${d} Z` : d;
  }
  if (name === "line") {
    return `M ${n(attr(tag, "x1"))} ${n(attr(tag, "y1"))} L ${n(attr(tag, "x2"))} ${n(attr(tag, "y2"))}`;
  }
  return null;
}

/** Parses SVG markup into normalized, editable layers. */
export function parseSvgArtwork(markup: string): SvgArtwork | null {
  const svgTag = markup.match(/<svg[^>]*>/i)?.[0];
  if (!svgTag) return null;

  const vbNums = (attr(svgTag, "viewBox")?.match(NUM) ?? []).map(Number);
  const wAttr = Number((attr(svgTag, "width") ?? "").replace(/[^\d.]/g, "")) || 0;
  const hAttr = Number((attr(svgTag, "height") ?? "").replace(/[^\d.]/g, "")) || 0;
  const vb = vbNums.length === 4
    ? { x: vbNums[0], y: vbNums[1], w: vbNums[2], h: vbNums[3] }
    : { x: 0, y: 0, w: wAttr || 1000, h: hAttr || 1000 };
  if (!vb.w || !vb.h) return null;

  const classes = parseStyleClasses(markup);
  const layers: SvgLayer[] = [];

  const tags = markup.match(/<(path|rect|circle|ellipse|polygon|polyline|line)\b[^>]*\/?>/gi) ?? [];
  for (const tag of tags) {
    const name = tag.match(/^<(\w+)/)![1].toLowerCase();
    const raw = name === "path" ? attr(tag, "d") : primitiveToPath(tag, name);
    if (!raw) continue;

    const cls = (attr(tag, "class") ?? "").split(/\s+/).filter(Boolean);
    const fromClass = cls.reduce<Record<string, string | undefined>>((acc, c) => ({ ...acc, ...(classes[c] ?? {}) }), {});
    const fill = inlineStyleProp(tag, "fill") ?? attr(tag, "fill") ?? fromClass.fill ?? "#000000";
    const stroke = inlineStyleProp(tag, "stroke") ?? attr(tag, "stroke") ?? fromClass.stroke ?? null;
    const sw = inlineStyleProp(tag, "stroke-width") ?? attr(tag, "stroke-width") ?? fromClass.strokeWidth;
    const op = inlineStyleProp(tag, "opacity") ?? attr(tag, "opacity") ?? fromClass.opacity;

    const abs = toAbsoluteCubics(raw);
    if (!abs) continue;

    layers.push({
      d: scalePathTo100(abs, vb),
      fill: fill === "none" ? "transparent" : fill,
      stroke: !stroke || stroke === "none" ? null : stroke,
      strokeWidth: sw ? (Number(sw) / Math.max(vb.w, vb.h)) * 100 : null,
      opacity: op ? Math.min(1, Math.max(0, Number(op) || 1)) : 1,
    });
  }

  if (!layers.length) return null;
  return { vbW: vb.w, vbH: vb.h, layers };
}

/** Builds studio path nodes for an artwork, fitted onto the card (cover / contain). */
export function artworkToNodes(
  art: SvgArtwork,
  doc: Pick<StudioDoc, "w" | "h">,
  opts: { fit?: "cover" | "contain" | "stretch"; label?: string } = {},
): StudioNode[] {
  const fit = opts.fit ?? "cover";
  let w = doc.w, h = doc.h;
  if (fit !== "stretch") {
    const s = fit === "cover"
      ? Math.max(doc.w / art.vbW, doc.h / art.vbH)
      : Math.min(doc.w / art.vbW, doc.h / art.vbH);
    w = art.vbW * s;
    h = art.vbH * s;
  }
  const x = Math.round((doc.w - w) / 2);
  const y = Math.round((doc.h - h) / 2);
  const label = opts.label ?? "Background";

  return art.layers.map((l, i) =>
    node("path", {
      name: `${label} ${i + 1}`,
      x, y, w: Math.round(w), h: Math.round(h),
      opacity: l.opacity,
      path: l.d,
      style: {
        fill: l.fill ?? "transparent",
        stroke: l.stroke,
        strokeWidth: l.strokeWidth ?? 0,
        cap: "round",
      },
    }),
  );
}
