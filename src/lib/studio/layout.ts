// Composition grid used by the AI designer: precise, percent-based zones (0..100).

export type AiRect = { x: number; y: number; w: number; h: number };

export type AiLayout = {
  /** page margin in % of the card */
  margin: number;
  textZone: AiRect;
  logoZone: AiRect;
  photoZone: AiRect | null;
  qrZone: AiRect;
  /** relative type sizes, 1 = base */
  typeScale: { name: number; title: number; company: number; body: number };
  textAlign: "left" | "center" | "right";
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const num = (v: unknown, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

function rect(v: unknown, fallback: AiRect): AiRect {
  const r = (v ?? {}) as Partial<AiRect>;
  const x = clamp(num(r.x, fallback.x), 0, 98);
  const y = clamp(num(r.y, fallback.y), 0, 98);
  return {
    x,
    y,
    w: clamp(num(r.w, fallback.w), 2, 100 - x),
    h: clamp(num(r.h, fallback.h), 2, 100 - y),
  };
}

/** Sensible measured-looking defaults per orientation and reading direction. */
export function defaultLayout(landscape: boolean, rtl: boolean): AiLayout {
  const m = landscape ? 6 : 7.5;
  return landscape
    ? {
        margin: m,
        textZone: { x: rtl ? 44 : m, y: 28, w: 50 - m, h: 58 },
        logoZone: { x: rtl ? m : 70, y: m, w: 24, h: 12 },
        photoZone: null,
        qrZone: { x: rtl ? m : 68, y: 34, w: 26, h: 43 },
        typeScale: { name: 1, title: 0.85, company: 0.8, body: 0.72 },
        textAlign: rtl ? "right" : "left",
      }
    : {
        margin: m,
        textZone: { x: m, y: 46, w: 100 - m * 2, h: 36 },
        logoZone: { x: rtl ? m : 60, y: m, w: 32, h: 12 },
        photoZone: { x: rtl ? 66 : m, y: 15, w: 26, h: 18 },
        qrZone: { x: rtl ? m : 66, y: 76, w: 26, h: 18 },
        typeScale: { name: 1, title: 0.82, company: 0.78, body: 0.7 },
        textAlign: rtl ? "right" : "left",
      };
}

/** Validates and repairs a layout returned by the model. */
export function normalizeLayout(v: unknown, landscape: boolean, rtl: boolean): AiLayout {
  const d = defaultLayout(landscape, rtl);
  const l = (v ?? {}) as Partial<AiLayout>;
  const ts = (l.typeScale ?? {}) as Partial<AiLayout["typeScale"]>;
  const photo = l.photoZone === null ? null : l.photoZone ? rect(l.photoZone, d.photoZone ?? { x: 8, y: 15, w: 24, h: 18 }) : d.photoZone;
  return {
    margin: clamp(num(l.margin, d.margin), 2, 14),
    textZone: rect(l.textZone, d.textZone),
    logoZone: rect(l.logoZone, d.logoZone),
    photoZone: photo,
    qrZone: rect(l.qrZone, d.qrZone),
    typeScale: {
      name: clamp(num(ts.name, d.typeScale.name), 0.6, 1.8),
      title: clamp(num(ts.title, d.typeScale.title), 0.5, 1.4),
      company: clamp(num(ts.company, d.typeScale.company), 0.45, 1.3),
      body: clamp(num(ts.body, d.typeScale.body), 0.4, 1.1),
    },
    textAlign:
      l.textAlign === "center" || l.textAlign === "right" || l.textAlign === "left"
        ? l.textAlign
        : d.textAlign,
  };
}
