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
};

const PAINTED = "path,circle,ellipse,rect,polygon,polyline,line,g,text";

/** Rewrites the markup: applies fill / stroke overrides and makes it fill its box. */
export function transformSvg(markup: string, o: SvgOverrides): string {
  if (!markup || typeof window === "undefined") return markup;
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return "";
  doc.querySelectorAll("script,foreignObject").forEach((el) => el.remove());

  if (!svg.getAttribute("viewBox")) {
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) svg.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
  }
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const hasFill = o.fill !== undefined && o.fill !== null && o.fill !== "";
  const hasStroke = o.stroke !== undefined && o.stroke !== null && o.stroke !== "";
  const hasSW = o.strokeWidth !== undefined && o.strokeWidth !== null;

  if (hasFill || hasStroke || hasSW) {
    const nodes: Element[] = [svg, ...Array.from(svg.querySelectorAll(PAINTED))];
    for (const el of nodes) {
      const style = el.getAttribute("style");
      if (style) {
        el.setAttribute(
          "style",
          style
            .replace(/fill\s*:[^;]*;?/gi, hasFill ? "" : "$&")
            .replace(/stroke\s*:[^;]*;?/gi, hasStroke ? "" : "$&"),
        );
      }
      if (hasFill && el !== svg && el.tagName.toLowerCase() !== "g") {
        const cur = el.getAttribute("fill");
        if (cur !== "none") el.setAttribute("fill", o.fill as string);
      }
      if (hasFill && (el === svg || el.tagName.toLowerCase() === "g")) {
        if (el.getAttribute("fill") && el.getAttribute("fill") !== "none") el.setAttribute("fill", o.fill as string);
      }
      if (hasStroke && el !== svg) el.setAttribute("stroke", o.stroke as string);
      if (hasSW && el !== svg) el.setAttribute("stroke-width", String(o.strokeWidth));
    }
    if (hasFill && !svg.getAttribute("fill")) svg.setAttribute("fill", o.fill as string);
  }

  return new XMLSerializer().serializeToString(svg);
}

/** Returns the inline (and recolored) markup for an SVG url, or null while loading. */
export function useInlineSvg(src: string | undefined, o: SvgOverrides): string | null {
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

  if (!raw) return null;
  return transformSvg(raw, o);
}
