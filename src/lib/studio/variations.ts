// Turns an AI analysis into fully editable Studio documents (never a flat image).
// The layout is proportional and follows the ORIENTATION of the analysed card:
// a landscape scan produces a landscape template, a portrait scan a portrait one.
import { node, type StudioDoc, type StudioNode } from "./types";
import type { AiCardAnalysis } from "./ai.functions";

export type VariationKey =
  | "minimal" | "luxury" | "glass" | "corporate" | "executive"
  | "creative" | "modern" | "dark" | "light" | "premium";

export const VARIATIONS: { key: VariationKey; en: string; ar: string }[] = [
  { key: "minimal", en: "Minimal", ar: "بسيط" },
  { key: "luxury", en: "Luxury", ar: "فاخر" },
  { key: "glass", en: "Glass", ar: "زجاجي" },
  { key: "corporate", en: "Corporate", ar: "مؤسسي" },
  { key: "executive", en: "Executive", ar: "تنفيذي" },
  { key: "creative", en: "Creative", ar: "إبداعي" },
  { key: "modern", en: "Modern", ar: "عصري" },
  { key: "dark", en: "Dark", ar: "داكن" },
  { key: "light", en: "Light", ar: "فاتح" },
  { key: "premium", en: "Premium", ar: "مميز" },
];

/** Canvas size that keeps the aspect ratio of the uploaded card. */
export function canvasFromAspect(aspect: number): { w: number; h: number } {
  const a = Number.isFinite(aspect) && aspect > 0.2 && aspect < 5 ? aspect : 0.64;
  const LONG = 1050;
  return a >= 1
    ? { w: LONG, h: Math.round(LONG / a) }
    : { w: Math.round(LONG * a), h: LONG };
}

/** Builds an editable document for one variation, driven by the extracted identity. */
export function buildVariation(a: AiCardAnalysis, key: VariationKey): StudioDoc {
  const { primary, secondary, accent, background, textOnBg } = a.palette;
  const { w: W, h: H } = canvasFromAspect(a.aspect ?? 0.64);
  const landscape = W >= H;
  const rtl = a.direction === "rtl";

  const PAD = Math.round(Math.min(W, H) * 0.075);
  const light = key === "light";
  const bg = light ? "#f6f4fb" : background;
  const fg = light ? "#141020" : textOnBg;
  const muted = light ? "#5d5670" : "#c9c2d8";
  const s = Math.min(W, H) / 1000; // type scale relative to the short edge
  const px = (n: number) => Math.max(1, Math.round(n * (landscape ? H : W) / (landscape ? 650 : 640)));

  // content column: on landscape the text sits on one half, QR on the other
  const colW = landscape ? Math.round(W * 0.52) : W - PAD * 2;
  const colX = rtl && landscape ? W - PAD - colW : PAD;

  const nodes: StudioNode[] = [];
  const push = (n: StudioNode) => nodes.push(n);

  const text = (
    name: string,
    value: string,
    y: number,
    opts: Partial<StudioNode["style"]> & { x?: number; w?: number; h?: number } = {},
  ) => {
    const { x = colX, w = colW, h = px(40), ...style } = opts;
    push(node("text", {
      name, text: value, x, y, w, h,
      style: { fontSize: px(20), lineHeight: 1.3, align: rtl ? "right" : "left", ...style },
    }));
  };

  // normalised (0..100) -> canvas helpers
  const PX = (v: number) => Math.round((v / 100) * W);
  const PY = (v: number) => Math.round((v / 100) * H);
  const short = Math.min(W, H);
  const blocks = a.blocks ?? [];
  const block = (role: string) => blocks.find((b) => b.role === role);
  const useMap = blocks.length >= 3;

  // ---- measured colour surfaces from the scan (bands, rails, panels) ----
  for (const sf of a.surfaces ?? []) {
    push(node("shape", {
      name: sf.name,
      x: PX(sf.x), y: PY(sf.y), w: PX(sf.w), h: PY(sf.h),
      shape: sf.shape === "ellipse" ? "ellipse" : "rect",
      opacity: sf.opacity ?? 1,
      style: {
        fill: light ? `${primary}14` : (sf.fill ?? "transparent"),
        gradient: sf.gradient ?? null,
        radius: Math.round(((sf.radius ?? 0) / 100) * short),
        blur: sf.blur ?? 0,
      },
    }));
  }

  // ---- free-form AI artwork (pen-tool paths drawn by the model) ----

  const vectors = a.vectors ?? [];
  // each variation reinterprets the same drawing with its own paint
  const paint: Record<VariationKey, { fill?: string; stroke?: string; op: number; blur: number }> = {
    minimal: { stroke: primary, op: 0.55, blur: 0 },
    luxury: { fill: `${accent}33`, stroke: accent, op: 0.9, blur: 0 },
    glass: { fill: `${primary}22`, stroke: `${accent}99`, op: 0.85, blur: 6 },
    corporate: { fill: `${secondary}cc`, stroke: primary, op: 1, blur: 0 },
    executive: { fill: `${primary}55`, stroke: accent, op: 0.9, blur: 0 },
    creative: { fill: `${accent}55`, stroke: primary, op: 1, blur: 2 },
    modern: { fill: `${primary}44`, stroke: secondary, op: 0.95, blur: 0 },
    dark: { fill: `${primary}33`, stroke: `${accent}88`, op: 0.8, blur: 4 },
    light: { fill: `${primary}1f`, stroke: primary, op: 0.8, blur: 0 },
    premium: { fill: `${accent}2e`, stroke: accent, op: 0.95, blur: 1 },
  };

  if (vectors.length) {
    const pnt = paint[key];
    // content boxes the artwork must not cover (text, photo, logo, qr)
    const guard = blocks.filter((b) => b.role !== "custom");
    vectors.forEach((v, i) => {
      const bb = pathBBox(v.d);
      // how much of the readable content this drawing would sit on top of
      const hit = bb
        ? guard.reduce((m, b) => Math.max(m, overlapRatio(bb, b)), 0)
        : 0;
      const heavy = hit > 0.28;
      push(node("path", {
        name: v.name || `Artwork ${i + 1}`,
        x: 0, y: 0, w: W, h: H,
        path: v.d,
        opacity: (v.opacity ?? 0.9) * pnt.op * (heavy ? 0.35 : 1),
        style: {
          // never paint a solid blob over the content area — keep it as a light outline
          fill: heavy ? "transparent" : (v.fill ?? pnt.fill ?? "transparent"),
          stroke: v.stroke ?? pnt.stroke ?? null,
          strokeWidth: Math.max(1, Math.round((v.strokeWidth ?? 1.2) * (Math.min(W, H) / 100) * 0.9)),
          blur: (v.blur ?? 0) + pnt.blur,
          cap: "round",
        },
      }));
    });
  }


  // ---- decorative layer, unique per variation (fallback when the model drew nothing) ----
  const bandH = landscape ? Math.round(H * 0.28) : Math.round(H * 0.3);
  switch (vectors.length || useMap ? "__none" : key) {
    case "minimal":
      push(node("line", { name: "Rule", x: colX, y: Math.round(H * 0.42), w: px(120), h: 3, style: { fill: primary, radius: 3 } }));
      break;
    case "luxury":
      push(node("shape", { name: "Glow", x: -W * 0.2, y: -H * 0.18, w: W * 0.8, h: W * 0.8, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${accent}55, transparent 70%)` } }));
      push(node("line", { name: "Gold rule", x: colX, y: Math.round(H * 0.44), w: colW, h: 1, style: { fill: accent } }));
      break;
    case "glass":
      push(node("shape", { name: "Aura", x: W * 0.1, y: H * 0.06, w: W * 0.8, h: H * 0.42, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${primary}66, transparent 70%)` } }));
      push(node("shape", { name: "Glass panel", x: PAD * 0.7, y: Math.round(H * 0.42), w: W - PAD * 1.4, h: Math.round(H * 0.5), shape: "rect", style: { fill: "#ffffff14", blur: 18, radius: 32, borderWidth: 1, borderColor: "#ffffff33" } }));
      break;
    case "corporate":
      push(node("shape", { name: "Header band", x: 0, y: 0, w: W, h: bandH, shape: "rect", style: { fill: secondary, radius: 0 } }));
      push(node("line", { name: "Accent bar", x: 0, y: bandH, w: W, h: 6, style: { fill: primary, radius: 0 } }));
      break;
    case "executive":
      push(node("shape", {
        name: "Side rail",
        x: rtl ? W - px(26) : 0, y: 0, w: px(26), h: H, shape: "rect",
        style: { gradient: `linear-gradient(180deg, ${primary}, ${accent})`, radius: 0 },
      }));
      break;
    case "creative":
      push(node("shape", { name: "Blob A", x: -W * 0.2, y: H * 0.55, w: W * 0.65, h: W * 0.65, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${primary}77, transparent 70%)` } }));
      push(node("shape", { name: "Blob B", x: W * 0.55, y: -H * 0.12, w: W * 0.6, h: W * 0.6, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${accent}66, transparent 70%)` } }));
      break;
    case "modern":
      push(node("shape", { name: "Arc", x: rtl ? -W * 0.2 : W - W * 0.42, y: -H * 0.14, w: W * 0.62, h: W * 0.62, shape: "ellipse", style: { gradient: `linear-gradient(135deg, ${primary}, ${secondary})` } }));
      break;
    case "dark":
      push(node("shape", { name: "Vignette", x: 0, y: 0, w: W, h: H, shape: "rect", style: { gradient: `radial-gradient(120% 80% at 20% 0%, ${primary}33, transparent 60%)`, radius: 0 } }));
      break;
    case "light":
      push(node("shape", { name: "Tint", x: 0, y: 0, w: W, h: Math.round(H * 0.34), shape: "rect", style: { gradient: `linear-gradient(160deg, ${primary}22, transparent)`, radius: 0 } }));
      break;
    case "premium":
      push(node("shape", { name: "Frame", x: 24, y: 24, w: W - 48, h: H - 48, shape: "rect", style: { fill: "transparent", borderWidth: 1, borderColor: `${accent}88`, radius: 28 } }));
      push(node("shape", { name: "Halo", x: W * 0.25, y: -H * 0.18, w: W * 0.7, h: W * 0.7, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${accent}44, transparent 70%)` } }));
      break;
  }

  // ---- precise layer: rebuild the exact geometry measured on the scan ----
  if (useMap) {
    const VALUE: Record<string, string> = {
      name: "{{Employee Name}}",
      title: "{{Job Title}}",
      company: "{{Company}}",
      tagline: a.tagline ?? "{{Company}}",
      phone: "{{Phone}}",
      email: "{{Email}}",
      website: "{{Website}}",
      address: "{{Address}}",
    };
    const LABEL: Record<string, string> = {
      name: "Name", title: "Job title", company: "Company", tagline: "Tagline",
      phone: "Phone", email: "Email", website: "Website", address: "Address",
    };
    const tone = (role: string) =>
      role === "name" ? fg : role === "title" ? primary : muted;

    // sample copy used only to size the type so real content never overflows its box
    const SAMPLE: Record<string, string> = {
      name: "Sara Al-Amin", title: "Creative Director", company: "Cardixn",
      tagline: a.tagline ?? "Cardixn", phone: "+971 50 000 0000",
      email: "hello@cardixn.com", website: "cardixn.com", address: "Dubai, UAE",
    };

    type Placed = { x: number; y: number; w: number; h: number };
    const placedText: Placed[] = [];

    const textBlocks = blocks
      .filter((b) => VALUE[b.role] !== undefined)
      .sort((p, q) => p.y - q.y);
    const others = blocks.filter((b) => VALUE[b.role] === undefined);

    for (const b of others) {
      const bx = PX(b.x), by = PY(b.y), bw = Math.max(4, PX(b.w)), bh = Math.max(4, PY(b.h));

      if (b.role === "logo") {
        push(node("image", { name: "Logo", imageSource: "logo", x: bx, y: by, w: bw, h: bh, style: { radius: Math.round(short * 0.012) } }));
        continue;
      }
      if (b.role === "photo") {
        const round = Math.abs(bw - bh) / Math.max(bw, bh) < 0.15;
        const side = round ? Math.round((bw + bh) / 2) : 0;
        push(node("image", {
          name: "Photo", imageSource: "employee", x: bx, y: by,
          w: side || bw, h: side || bh,
          style: { radius: round ? 999 : Math.round(short * 0.02), borderWidth: 2, borderColor: `${primary}88` },
        }));
        continue;
      }
      if (b.role === "qr") {
        const side = Math.max(bw, bh);
        push(node("qr", { name: "QR", x: bx, y: by, w: side, h: side, style: { fill: "#ffffff", radius: Math.round(short * 0.02), padding: Math.round(side * 0.08) } }));
        continue;
      }
      if (b.role === "cta") {
        push(node("button", {
          name: "Save contact", text: "Save contact", x: bx, y: by, w: bw, h: bh,
          style: {
            gradient: key === "luxury" || key === "premium"
              ? `linear-gradient(135deg, ${accent}, ${primary})`
              : `linear-gradient(135deg, ${primary}, ${secondary})`,
            color: "#ffffff", radius: 999, fontSize: Math.round(bh * 0.36), fontWeight: 600, align: "center",
          },
        }));
      }
    }

    for (const b of textBlocks) {
      const bx = PX(b.x), bw = Math.max(4, PX(b.w));
      let by = PY(b.y);
      const bh = Math.max(4, PY(b.h));
      const align = b.align ?? (rtl ? "right" : "left");

      // fit the type inside its measured box: never taller than the box,
      // never wider than the column (approx. 0.55em per character)
      const chars = Math.max(6, (SAMPLE[b.role] ?? "").length);
      const raw = ((b.sizePct ?? 3) / 100) * short * 1.35;
      const size = Math.max(9, Math.round(Math.min(raw, bh * 0.82, bw / (chars * 0.55))));
      const h = Math.max(bh, Math.round(size * 1.3));

      // push the line down when it would collide with an already placed line
      for (const p of placedText) {
        const overlapX = bx < p.x + p.w && p.x < bx + bw;
        const overlapY = by < p.y + p.h && p.y < by + h;
        if (overlapX && overlapY) by = p.y + p.h + Math.round(short * 0.012);
      }
      by = Math.min(by, H - h - Math.round(short * 0.02));
      placedText.push({ x: bx, y: by, w: bw, h });

      push(node("text", {
        name: LABEL[b.role] ?? b.role,
        text: VALUE[b.role] ?? "",
        x: bx, y: by, w: bw, h,
        style: {
          fontSize: size,
          fontWeight: b.weight ?? (b.role === "name" ? 700 : b.role === "title" ? 600 : 400),
          color: light ? (b.role === "name" ? fg : muted) : (b.color ?? tone(b.role)),
          letterSpacing: b.letterSpacing ?? 0,
          lineHeight: 1.2,
          align,
        },
      }));
    }


    // guarantee the essentials exist even if the scan had none
    if (!block("qr")) {
      const side = Math.round(short * (landscape ? 0.34 : 0.24));
      push(node("qr", {
        name: "QR",
        x: rtl ? PAD : W - PAD - side,
        y: H - PAD - side,
        w: side, h: side,
        style: { fill: "#ffffff", radius: Math.round(short * 0.02), padding: Math.round(side * 0.08) },
      }));
    }
    if (!block("logo")) {
      const lw = Math.round(W * (landscape ? 0.18 : 0.24));
      push(node("image", { name: "Logo", imageSource: "logo", x: rtl ? PAD : W - PAD - lw, y: PAD, w: lw, h: Math.round(lw * 0.4), style: { radius: 10 } }));
    }

    void s;
    return {
      version: 1,
      w: W,
      h: H,
      background: {
        color: bg,
        gradient: light ? "linear-gradient(160deg,#ffffff,#eee9f7)" : a.backgroundCss,
        image: null,
      },
      nodes,
    };
  }

  // ---- identity layer (placeholders, always editable) ----
  const logoW = Math.round(W * (landscape ? 0.2 : 0.26));
  const logoH = Math.round(logoW * 0.4);
  const logoCentered = a.logoPosition === "center";
  push(node("image", {
    name: "Logo",
    imageSource: "logo",
    x: logoCentered ? Math.round((W - logoW) / 2) : rtl ? PAD : W - PAD - logoW,
    y: PAD,
    w: logoW, h: logoH,
    style: { radius: 10 },
  }));

  const photo = Math.round(Math.min(W, H) * 0.17);
  push(node("image", {
    name: "Photo",
    imageSource: "employee",
    x: rtl ? W - PAD - photo : PAD,
    y: Math.round(H * (landscape ? 0.3 : 0.14)),
    w: photo, h: photo,
    style: { radius: 999, borderWidth: 2, borderColor: `${primary}88` },
  }));

  // headline block
  let y = Math.round(H * (landscape ? 0.34 : 0.5));
  text("Name", "{{Employee Name}}", y, { fontSize: px(44), fontWeight: 700, color: fg, h: px(60) });
  y += px(66);
  text("Job title", "{{Job Title}}", y, { fontSize: px(21), fontWeight: 600, color: primary, h: px(32) });
  y += px(38);
  text("Company", "{{Company}}", y, { fontSize: px(19), color: muted, h: px(30) });

  // tagline / services line detected on the original card
  if (a.tagline) {
    y += px(36);
    text("Tagline", a.tagline, y, { fontSize: px(15), color: muted, h: px(28) });
  }

  y += px(52);
  text("Phone", "{{Phone}}", y, { fontSize: px(17), color: muted, h: px(26) });
  text("Email", "{{Email}}", y + px(32), { fontSize: px(17), color: muted, h: px(26) });
  text("Website", "{{Website}}", y + px(64), { fontSize: px(17), color: muted, h: px(26) });

  // QR: opposite side of the content column on landscape, bottom corner on portrait
  const qr = Math.round(Math.min(W, H) * (landscape ? 0.55 : 0.24));
  push(node("qr", {
    name: "QR",
    x: landscape
      ? (rtl ? PAD : W - PAD - qr)
      : (rtl ? PAD : W - PAD - qr),
    y: landscape ? Math.round((H - qr) / 2) : H - PAD - qr,
    w: qr, h: qr,
    style: { fill: "#ffffff", radius: 18, padding: 12 },
  }));

  const btnW = Math.round(Math.min(W * 0.42, px(260)));
  push(node("button", {
    name: "Save contact",
    text: "Save contact",
    x: rtl && !landscape ? W - PAD - btnW : colX,
    y: H - PAD - px(58),
    w: btnW, h: px(58),
    style: {
      gradient: key === "luxury" || key === "premium"
        ? `linear-gradient(135deg, ${accent}, ${primary})`
        : `linear-gradient(135deg, ${primary}, ${secondary})`,
      color: "#ffffff", radius: 999, fontSize: px(17), fontWeight: 600, align: "center",
    },
  }));

  void s;

  return {
    version: 1,
    w: W,
    h: H,
    background: {
      color: bg,
      gradient: light ? "linear-gradient(160deg,#ffffff,#eee9f7)" : a.backgroundCss,
      image: null,
    },
    nodes,
  };
}

/** Rough bounding box of an SVG path on the 0..100 grid (numbers only, good enough for hit tests). */
function pathBBox(d: string): { x: number; y: number; w: number; h: number } | null {
  const nums = d.match(/-?\d*\.?\d+(?:e-?\d+)?/gi)?.map(Number) ?? [];
  if (nums.length < 4) return null;
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) { xs.push(nums[i]); ys.push(nums[i + 1]); }
  const x1 = Math.min(...xs), x2 = Math.max(...xs);
  const y1 = Math.min(...ys), y2 = Math.max(...ys);
  if (![x1, x2, y1, y2].every(Number.isFinite)) return null;
  return { x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1) };
}

/** Share of box `b` covered by box `a`, both on the 0..100 grid. */
function overlapRatio(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): number {
  const area = Math.max(1e-6, b.w * b.h);
  const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return (ox * oy) / area;
}
