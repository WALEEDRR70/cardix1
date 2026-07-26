// Loads SVG files as inline markup so their colors/strokes can be overridden in the Studio.
import { useEffect, useState } from "react";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

export function isSvgSrc(src?: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:image/svg+xml")) return true;
  try {
    const clean = src.split("?")[0].split("#")[0];
    return clean.toLowerCase().endsWith(".svg");
  } catch {
    return false;
  }
}

async function load(src: string): Promise<string> {
  if (cache.has(src)) return cache.get(src)!;
  let p = inflight.get(src);
  if (!p) {
    p = fetch(src)
      .then((r) => (r.ok ? r.text() : ""))
      .catch(() => "")
      .then((t) => {
        cache.set(src, t);
        inflight.delete(src);
        return t;
      });
    inflight.set(src, p);
  }
  return p;
}

export type SvgOverrides = {
  fill?: string | null;
  stroke?: string | null;
  strokeWidth?: number | null;
  /** Map of original color -> new color ("none" = transparent). */
  colorMap?: Record<string, string> | null;
  /** Removes full-bleed background rectangles (usually the white sheet). */
  removeBg?: boolean;
};

const PAINTED = "path,circle,ellipse,rect,polygon,polyline,line,g,text";

const NAMED: Record<string, string> = {
  black: "#000000", white: "#ffffff", red: "#ff0000", green: "#008000",
  blue: "#0000ff", gray: "#808080", grey: "#808080", silver: "#c0c0c0",
};

/** Normalizes a paint value to lowercase #rrggbb, or null when it isn't a plain color. */
export function normalizeColor(v?: string | null): string | null {
  if (!v) return null;
  let c = v.trim().toLowerCase();
  if (!c || c === "none" || c === "transparent" || c === "currentcolor" || c.startsWith("url(")) return null;
  if (NAMED[c]) c = NAMED[c];
  if (c.startsWith("#")) {
    if (c.length === 4) return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    if (c.length === 7) return c;
    if (c.length === 9) return c.slice(0, 7);
    return null;
  }
  const m = c.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (m) {
    const hex = (x: string) => Math.max(0, Math.min(255, Math.round(parseFloat(x)))).toString(16).padStart(2, "0");
    return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`;
  }
  return null;
}

function paintOf(el: Element, prop: "fill" | "stroke"): string | null {
  const style = el.getAttribute("style");
  if (style) {
    const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i"));
    if (m) return m[1].trim();
  }
  return el.getAttribute(prop);
}

function setPaint(el: Element, prop: "fill" | "stroke", value: string) {
  const style = el.getAttribute("style");
  if (style && new RegExp(`(?:^|;)\\s*${prop}\\s*:`, "i").test(style)) {
    el.setAttribute("style", style.replace(new RegExp(`(^|;)\\s*${prop}\\s*:[^;]*`, "gi"), `$1${prop}:${value}`));
  }
  el.setAttribute(prop, value);
}

function parseDoc(markup: string): Document | null {
  if (!markup || typeof window === "undefined") return null;
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  return doc.querySelector("svg") ? doc : null;
}

/** Lists the distinct colors used inside an SVG, most-used first. */
export function extractSvgColors(markup: string): { color: string; count: number }[] {
  const doc = parseDoc(markup);
  if (!doc) return [];
  const counts = new Map<string, number>();
  doc.querySelectorAll(`${PAINTED},svg,stop`).forEach((el) => {
    for (const prop of ["fill", "stroke"] as const) {
      const c = normalizeColor(paintOf(el, prop));
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const sc = normalizeColor(el.getAttribute("stop-color"));
    if (sc) counts.set(sc, (counts.get(sc) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count);
}

function isFullBleedRect(el: Element, vb: number[] | null): boolean {
  if (el.tagName.toLowerCase() !== "rect") return false;
  const w = parseFloat(el.getAttribute("width") ?? "0");
  const h = parseFloat(el.getAttribute("height") ?? "0");
  if (!vb) return false;
  return w >= vb[2] * 0.95 && h >= vb[3] * 0.95;
}

/** Rewrites the markup: applies fill / stroke overrides and makes it fill its box. */
export function transformSvg(markup: string, o: SvgOverrides): string {
  const doc = parseDoc(markup);
  if (!doc) return markup && typeof window === "undefined" ? markup : "";
  const svg = doc.querySelector("svg")!;
  doc.querySelectorAll("script,foreignObject").forEach((el) => el.remove());

  const vbAttr = svg.getAttribute("viewBox");
  if (!vbAttr) {
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) svg.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
  }
  const vb = (svg.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
  const viewBox = vb.length === 4 && vb.every((x) => !Number.isNaN(x)) ? vb : null;

  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  if (o.removeBg) {
    Array.from(svg.querySelectorAll("rect")).forEach((el) => {
      if (isFullBleedRect(el, viewBox) && !el.closest("clipPath,mask,defs")) el.remove();
    });
  }

  const map = o.colorMap ?? null;
  if (map && Object.keys(map).length) {
    svg.querySelectorAll(`${PAINTED},stop`).forEach((el) => {
      for (const prop of ["fill", "stroke"] as const) {
        const cur = normalizeColor(paintOf(el, prop));
        if (cur && map[cur]) setPaint(el, prop, map[cur]);
      }
      const sc = normalizeColor(el.getAttribute("stop-color"));
      if (sc && map[sc]) {
        const next = map[sc];
        el.setAttribute("stop-color", next === "none" ? "transparent" : next);
        if (next === "none") el.setAttribute("stop-opacity", "0");
      }
    });
    for (const prop of ["fill", "stroke"] as const) {
      const cur = normalizeColor(svg.getAttribute(prop));
      if (cur && map[cur]) svg.setAttribute(prop, map[cur]);
    }
  }

  const hasFill = o.fill !== undefined && o.fill !== null && o.fill !== "";
  const hasStroke = o.stroke !== undefined && o.stroke !== null && o.stroke !== "";
  const hasSW = o.strokeWidth !== undefined && o.strokeWidth !== null;

  if (hasFill || hasStroke || hasSW) {
    const nodes: Element[] = [svg, ...Array.from(svg.querySelectorAll(PAINTED))];
    for (const el of nodes) {
      if (hasFill && el !== svg && el.tagName.toLowerCase() !== "g") {
        if (normalizeColor(paintOf(el, "fill")) || !el.getAttribute("fill")) setPaint(el, "fill", o.fill as string);
      }
      if (hasFill && (el === svg || el.tagName.toLowerCase() === "g")) {
        if (normalizeColor(paintOf(el, "fill"))) setPaint(el, "fill", o.fill as string);
      }
      if (hasStroke && el !== svg) setPaint(el, "stroke", o.stroke as string);
      if (hasSW && el !== svg) el.setAttribute("stroke-width", String(o.strokeWidth));
    }
  }

  return new XMLSerializer().serializeToString(svg);
}

/** Loads the raw markup of an SVG url (null while loading / not an svg). */
export function useSvgMarkup(src: string | undefined): string | null {
  const [raw, setRaw] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!src || !isSvgSrc(src)) { setRaw(null); return; }
    if (src.startsWith("data:image/svg+xml")) {
      try {
        const [meta, body] = src.split(",");
        setRaw(meta.includes("base64") ? atob(body) : decodeURIComponent(body));
      } catch { setRaw(null); }
      return;
    }
    load(src).then((t) => { if (alive) setRaw(t || null); });
    return () => { alive = false; };
  }, [src]);
  return raw;
}

/** Returns the inline (and recolored) markup for an SVG url, or null while loading. */
export function useInlineSvg(src: string | undefined, o: SvgOverrides): string | null {
  const raw = useSvgMarkup(src);
  if (!raw) return null;
  return transformSvg(raw, o);
}

