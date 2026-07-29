// Re-tints a whole Studio design toward a new accent color, keeping the original
// light/dark structure so the card stays readable. Neutral grays stay neutral.
import type { StudioDoc, StudioNode, NodeStyle } from "@/lib/studio/types";
import { hex, rgb } from "@/lib/studio/color";

type HSL = { h: number; s: number; l: number };

function rgbToHsl(r: number, g: number, b: number): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
  else if (max === G) h = ((B - R) / d + 2) / 6;
  else h = ((R - G) / d + 4) / 6;
  return { h, s, l };
}

function hslToHex({ h, s, l }: HSL): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * v).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Maps a single color onto the target accent hue, preserving lightness and neutrals. */
function shift(color: string, from: HSL, to: HSL): string {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})([0-9a-f]{2})?$/i.exec(color.trim());
  if (!m) return color;
  const suffix = m[2] ?? "";
  const [r, g, b] = rgb(hex(color));
  const c = rgbToHsl(r, g, b);
  if (c.s < 0.08) return color; // neutral gray / black / white stays untouched
  // Every saturated color adopts the target hue directly (no relative rotation),
  // so the picked accent is always the color that actually shows on the card.
  const next: HSL = {
    h: to.h,
    s: to.s <= 0.02 ? Math.min(c.s, 0.06) : Math.min(1, to.s * (0.55 + 0.45 * (c.s / Math.max(0.2, from.s || 1)))),
    l: c.l,
  };
  return hslToHex(next) + suffix;
}

/** Rewrites every hex color inside an arbitrary paint string (gradients, shadows…). */
function shiftPaint(value: string | null | undefined, from: HSL, to: HSL): string | null | undefined {
  if (!value) return value;
  return value.replace(/#[0-9a-fA-F]{3,8}\b/g, (c) => shift(c, from, to));
}

const PAINT_KEYS: (keyof NodeStyle)[] = [
  "fill", "gradient", "color", "borderColor", "shadow", "glow", "stroke", "svgFill", "svgStroke",
];

function recolorNode(n: StudioNode, from: HSL, to: HSL): StudioNode {
  const style: NodeStyle = { ...n.style };
  for (const k of PAINT_KEYS) {
    const v = style[k];
    if (typeof v === "string") (style as Record<string, unknown>)[k] = shiftPaint(v, from, to);
  }
  if (style.svgColorMap) {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(style.svgColorMap)) {
      map[k] = v === "none" ? v : (shiftPaint(v, from, to) as string);
    }
    style.svgColorMap = map;
  }
  return { ...n, style, children: n.children?.map((c) => recolorNode(c, from, to)) };
}

/**
 * Returns a copy of `doc` with all colors rotated from `fromAccent` to `toAccent`.
 * Returns the original document when either color is invalid or identical.
 */
export function recolorDesign(doc: StudioDoc, fromAccent: string, toAccent: string): StudioDoc {
  const a = hex(fromAccent, ""), b = hex(toAccent, "");
  if (!a || !b || a === b) return doc;
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const from = rgbToHsl(r1, g1, b1);
  const to = rgbToHsl(r2, g2, b2);
  return {
    ...doc,
    background: {
      ...doc.background,
      color: shiftPaint(doc.background.color, from, to) as string,
      gradient: shiftPaint(doc.background.gradient, from, to) ?? null,
    },
    nodes: doc.nodes.map((n) => recolorNode(n, from, to)),
  };
}

/**
 * Best guess of a design's current accent: the most frequently used saturated color.
 * Falls back to a neutral blue when the design has no colored paint.
 */
export function docAccent(doc: StudioDoc): string {
  const counts = new Map<string, number>();
  const scan = (value: string | null | undefined) => {
    if (!value) return;
    for (const c of value.match(/#[0-9a-fA-F]{6}\b/g) ?? []) {
      const [r, g, b] = rgb(hex(c));
      const { s, l } = rgbToHsl(r, g, b);
      if (s < 0.18 || l < 0.08 || l > 0.94) continue;
      const k = c.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  };
  const walk = (n: StudioNode) => {
    for (const k of PAINT_KEYS) {
      const v = n.style[k];
      if (typeof v === "string") scan(v);
    }
    if (n.style.svgColorMap) Object.values(n.style.svgColorMap).forEach((v) => scan(v));
    n.children?.forEach(walk);
  };
  scan(doc.background.color);
  scan(doc.background.gradient);
  doc.nodes.forEach(walk);
  let best = "", top = 0;
  for (const [c, n] of counts) if (n > top) { top = n; best = c; }
  return best || "#3b82f6";
}
