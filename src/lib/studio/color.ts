// Tiny color utilities used by the AI designer to keep every generated card
// contrast-safe and harmonically consistent.

export function hex(v: string | null | undefined, fallback = "#000000"): string {
  if (!v) return fallback;
  const s = v.trim();
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (!m) return fallback;
  const h = m[1];
  return "#" + (h.length === 3 ? h.split("").map((c) => c + c).join("") : h).toLowerCase();
}

export function rgb(v: string): [number, number, number] {
  const h = hex(v).slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lin(c: number) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

export function luminance(v: string): number {
  const [r, g, b] = rgb(v);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * Math.min(1, Math.max(0, t)));
  return (
    "#" + [m(r1, r2), m(g1, g2), m(b1, b2)].map((n) => n.toString(16).padStart(2, "0")).join("")
  );
}

export const lighten = (c: string, t: number) => mix(c, "#ffffff", t);
export const darken = (c: string, t: number) => mix(c, "#000000", t);

/** Adds an alpha channel to a hex color (0..1). */
export function alpha(c: string, a: number): string {
  return hex(c) + Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, "0");
}

export const isLight = (c: string) => luminance(c) > 0.45;

/** Best readable ink for a surface, biased toward the brand palette. */
export function inkOn(surface: string, preferred?: string | null): string {
  if (preferred && contrast(preferred, surface) >= 4.5) return hex(preferred);
  return isLight(surface) ? "#12101a" : "#ffffff";
}

/** Muted secondary ink that still passes a comfortable ~3:1 contrast. */
export function mutedOn(surface: string, tintWith?: string): string {
  const base = isLight(surface) ? darken(surface, 0.62) : lighten(surface, 0.66);
  const tinted = tintWith ? mix(base, tintWith, 0.14) : base;
  return contrast(tinted, surface) >= 3 ? tinted : inkOn(surface);
}

/** Pushes an accent until it reads clearly on the given surface. */
export function accentOn(surface: string, accentColor: string): string {
  let c = hex(accentColor, "#7c34ff");
  let guard = 0;
  while (contrast(c, surface) < 3.4 && guard++ < 12) {
    c = isLight(surface) ? darken(c, 0.12) : lighten(c, 0.12);
  }
  return c;
}
