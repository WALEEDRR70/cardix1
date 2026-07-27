// Turns an AI analysis into fully editable Studio documents (never a flat image).
// The layout is proportional and follows the ORIENTATION of the analysed card:
// a landscape scan produces a landscape template, a portrait scan a portrait one.
import { node, type StudioDoc, type StudioNode } from "./types";
import { defaultLayout } from "./layout";
import { pairForStyle } from "./fonts";
import { accentOn, alpha, darken, inkOn, isLight, lighten, mix, mutedOn } from "./color";
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
  const { primary, secondary } = a.palette;
  const { w: W, h: H } = canvasFromAspect(a.aspect ?? 0.64);
  const landscape = W >= H;
  const rtl = a.direction === "rtl";
  const L = a.layout ?? defaultLayout(landscape, rtl);
  const type = a.typography ?? { pair: "grotesk", kicker: null, tracking: 0, uppercaseName: false };
  const finish = a.finish ?? { grain: 0.18, foil: 0.25, bloom: 0.3, frame: 0, rule: true };
  const pair = pairForStyle(a.style, type.pair);

  // percent -> pixel helpers (rounded to a 2px optical grid for crisp edges)
  const gx = (p: number) => Math.round((p / 100) * W);
  const gy = (p: number) => Math.round((p / 100) * H);
  const snap2 = (v: number) => Math.round(v / 2) * 2;

  const PAD = snap2(gx(L.margin) * 0.5 + gy(L.margin) * 0.5);

  // ---- contrast-safe surface + ink system -------------------------------
  const light = key === "light";
  const bg = light ? mix("#ffffff", a.palette.background, 0.06) : a.palette.background;
  const fg = light ? inkOn(bg, "#141020") : inkOn(bg, a.palette.textOnBg);
  const muted = mutedOn(bg, primary);
  const accent = accentOn(bg, a.palette.accent);
  const brand = accentOn(bg, primary);
  const hair = alpha(fg, 0.16);

  const s = Math.min(W, H) / 1000; // type scale relative to the short edge
  const px = (n: number) => Math.max(1, Math.round(n * (landscape ? H : W) / (landscape ? 650 : 640)));

  // content column comes straight from the measured text zone
  const colX = snap2(gx(L.textZone.x));
  const colW = snap2(gx(L.textZone.w));
  const colY = snap2(gy(L.textZone.y));
  const colH = snap2(gy(L.textZone.h));
  const align = L.textAlign;

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
      name, text: value, x, y: snap2(y), w, h,
      style: { fontFamily: pair.body, fontSize: px(20), lineHeight: 1.25, align, ...style },
    }));
  };


  // ---- free-form AI artwork (pen-tool paths drawn by the model) ----
  const vectors = a.vectors ?? [];
  // each variation reinterprets the same drawing with its own paint
  const paint: Record<VariationKey, { fill?: string; stroke?: string; op: number; blur: number }> = {
    minimal: { stroke: brand, op: 0.5, blur: 0 },
    luxury: { fill: alpha(accent, 0.2), stroke: accent, op: 0.92, blur: 0 },
    glass: { fill: alpha(brand, 0.14), stroke: alpha(accent, 0.6), op: 0.85, blur: 6 },
    corporate: { fill: alpha(secondary, 0.85), stroke: brand, op: 1, blur: 0 },
    executive: { fill: alpha(brand, 0.34), stroke: accent, op: 0.9, blur: 0 },
    creative: { fill: alpha(accent, 0.34), stroke: brand, op: 1, blur: 2 },
    modern: { fill: alpha(brand, 0.27), stroke: secondary, op: 0.95, blur: 0 },
    dark: { fill: alpha(brand, 0.2), stroke: alpha(accent, 0.55), op: 0.82, blur: 4 },
    light: { fill: alpha(brand, 0.12), stroke: brand, op: 0.8, blur: 0 },
    premium: { fill: alpha(accent, 0.18), stroke: accent, op: 0.95, blur: 1 },
  };

  // ambient bloom sits under everything so artwork reads with depth
  if (finish.bloom > 0.05) {
    push(node("shape", {
      name: "Ambient bloom",
      x: rtl ? -W * 0.18 : W * 0.42, y: -H * 0.16, w: W * 0.86, h: W * 0.86, shape: "ellipse",
      opacity: 0.35 + finish.bloom * 0.5,
      style: { gradient: `radial-gradient(circle, ${alpha(brand, 0.45)}, transparent 68%)` },
    }));
  }

  if (vectors.length) {
    const pnt = paint[key];
    vectors.forEach((v, i) => {
      push(node("path", {
        name: v.name || `Artwork ${i + 1}`,
        x: 0, y: 0, w: W, h: H,
        path: v.d,
        opacity: (v.opacity ?? 0.9) * pnt.op,
        style: {
          fill: v.fill ?? pnt.fill ?? "transparent",
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
  switch (vectors.length ? "__none" : key) {
    case "minimal":
      push(node("line", { name: "Rule", x: colX, y: Math.round(H * 0.42), w: px(120), h: 3, style: { fill: brand, radius: 3 } }));
      break;
    case "luxury":
      push(node("shape", { name: "Glow", x: -W * 0.2, y: -H * 0.18, w: W * 0.8, h: W * 0.8, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${alpha(accent, 0.33)}, transparent 70%)` } }));
      push(node("line", { name: "Gold rule", x: colX, y: Math.round(H * 0.44), w: colW, h: 1, style: { fill: accent } }));
      break;
    case "glass":
      push(node("shape", { name: "Aura", x: W * 0.1, y: H * 0.06, w: W * 0.8, h: H * 0.42, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${alpha(brand, 0.4)}, transparent 70%)` } }));
      push(node("shape", { name: "Glass panel", x: PAD * 0.7, y: Math.round(H * 0.42), w: W - PAD * 1.4, h: Math.round(H * 0.5), shape: "rect", style: { fill: alpha(fg, 0.07), blur: 18, radius: 32, borderWidth: 1, borderColor: alpha(fg, 0.2) } }));
      break;
    case "corporate":
      push(node("shape", { name: "Header band", x: 0, y: 0, w: W, h: bandH, shape: "rect", style: { fill: secondary, radius: 0 } }));
      push(node("line", { name: "Accent bar", x: 0, y: bandH, w: W, h: 6, style: { fill: brand, radius: 0 } }));
      break;
    case "executive":
      push(node("shape", {
        name: "Side rail",
        x: rtl ? W - px(26) : 0, y: 0, w: px(26), h: H, shape: "rect",
        style: { gradient: `linear-gradient(180deg, ${brand}, ${accent})`, radius: 0 },
      }));
      break;
    case "creative":
      push(node("shape", { name: "Blob A", x: -W * 0.2, y: H * 0.55, w: W * 0.65, h: W * 0.65, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${alpha(brand, 0.47)}, transparent 70%)` } }));
      push(node("shape", { name: "Blob B", x: W * 0.55, y: -H * 0.12, w: W * 0.6, h: W * 0.6, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${alpha(accent, 0.4)}, transparent 70%)` } }));
      break;
    case "modern":
      push(node("shape", { name: "Arc", x: rtl ? -W * 0.2 : W - W * 0.42, y: -H * 0.14, w: W * 0.62, h: W * 0.62, shape: "ellipse", style: { gradient: `linear-gradient(135deg, ${brand}, ${secondary})` } }));
      break;
    case "dark":
      push(node("shape", { name: "Vignette", x: 0, y: 0, w: W, h: H, shape: "rect", style: { gradient: `radial-gradient(120% 80% at 20% 0%, ${alpha(brand, 0.2)}, transparent 60%)`, radius: 0 } }));
      break;
    case "light":
      push(node("shape", { name: "Tint", x: 0, y: 0, w: W, h: Math.round(H * 0.34), shape: "rect", style: { gradient: `linear-gradient(160deg, ${alpha(brand, 0.13)}, transparent)`, radius: 0 } }));
      break;
    case "premium":
      push(node("shape", { name: "Frame", x: 24, y: 24, w: W - 48, h: H - 48, shape: "rect", style: { fill: "transparent", borderWidth: 1, borderColor: alpha(accent, 0.53), radius: 28 } }));
      push(node("shape", { name: "Halo", x: W * 0.25, y: -H * 0.18, w: W * 0.7, h: W * 0.7, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${alpha(accent, 0.27)}, transparent 70%)` } }));
      break;
  }

  // ---- print finishes: foil sweep, hairline frame, paper grain ----------
  if (finish.foil > 0.05) {
    push(node("shape", {
      name: "Foil sweep",
      x: -W * 0.1, y: 0, w: W * 1.2, h: H, shape: "rect", rot: 0,
      opacity: 0.18 + finish.foil * 0.35,
      style: {
        gradient: `linear-gradient(102deg, transparent 28%, ${alpha(lighten(accent, 0.35), 0.55)} 46%, ${alpha("#ffffff", 0.32)} 51%, transparent 68%)`,
        radius: 0,
      },
    }));
  }

  if (finish.frame > 0.1) {
    const inset = snap2(Math.round((finish.frame / 100) * Math.min(W, H)));
    push(node("shape", {
      name: "Hairline frame",
      x: inset, y: inset, w: W - inset * 2, h: H - inset * 2, shape: "rect",
      style: { fill: "transparent", borderWidth: 1, borderColor: alpha(accent, 0.55), radius: 8 },
    }));
  }

  if (finish.grain > 0.04) {
    push(node("shape", {
      name: "Paper grain",
      x: 0, y: 0, w: W, h: H, shape: "rect",
      opacity: 0.06 + finish.grain * 0.14,
      style: {
        gradient:
          `repeating-linear-gradient(45deg, ${alpha(fg, 0.22)} 0 1px, transparent 1px 3px),` +
          `repeating-linear-gradient(-45deg, ${alpha(fg, 0.14)} 0 1px, transparent 1px 4px)`,
        radius: 0,
      },
    }));
  }

  // ---- identity layer, placed on the measured grid (all editable) ----
  const logoCentered = a.logoPosition === "center";
  const logoW = snap2(gx(L.logoZone.w));
  const logoH = snap2(gy(L.logoZone.h));
  push(node("image", {
    name: "Logo",
    imageSource: "logo",
    x: logoCentered ? snap2((W - logoW) / 2) : snap2(gx(L.logoZone.x)),
    y: snap2(gy(L.logoZone.y)),
    w: logoW, h: logoH,
    style: { radius: 10 },
  }));

  if (L.photoZone) {
    const photo = snap2(Math.min(gx(L.photoZone.w), gy(L.photoZone.h)));
    push(node("image", {
      name: "Photo",
      imageSource: "employee",
      x: snap2(gx(L.photoZone.x)),
      y: snap2(gy(L.photoZone.y)),
      w: photo, h: photo,
      style: { radius: 999, borderWidth: 2, borderColor: alpha(brand, 0.53) },
    }));
  }

  // ---- typography on a single baseline rhythm inside the text zone ----
  const ts = L.typeScale;
  const nameSize = px(42 * ts.name);
  const titleSize = px(21 * ts.title);
  const compSize = px(19 * ts.company);
  const bodySize = px(17 * ts.body);
  const kickSize = Math.max(px(11), Math.round(bodySize * 0.72));
  const step = Math.max(4, Math.round(px(8)));           // baseline unit
  const gap = (n: number) => n * step;                    // spacing stays on the rhythm

  let y = colY;
  const lineH = (size: number) => snap2(Math.round(size * 1.28));

  if (type.kicker) {
    text("Kicker", type.kicker.toUpperCase(), y, {
      fontFamily: pair.body, fontSize: kickSize, fontWeight: 600,
      color: accent, letterSpacing: Math.max(1.5, kickSize * 0.22), h: lineH(kickSize),
    });
    y += lineH(kickSize) + gap(0.5);
  }

  text("Name", "{{Employee Name}}", y, {
    fontFamily: pair.heading,
    fontSize: nameSize,
    fontWeight: pair.weight,
    color: fg,
    textTransform: type.uppercaseName ? "uppercase" : "none",
    letterSpacing: pair.tracking + (type.tracking ?? 0) + (type.uppercaseName ? 1.2 : 0),
    h: lineH(nameSize),
  });

  y += lineH(nameSize) + gap(0.75);

  if (finish.rule) {
    push(node("line", {
      name: "Divider",
      x: align === "center" ? snap2(colX + colW / 2 - px(56)) : align === "right" ? colX + colW - px(112) : colX,
      y: snap2(y - gap(0.35)), w: px(112), h: 2,
      style: { fill: accent, radius: 2 },
    }));
    y += gap(0.5);
  }

  text("Job title", "{{Job Title}}", y, { fontSize: titleSize, fontWeight: 600, color: brand, letterSpacing: 0.4, h: lineH(titleSize) });
  y += lineH(titleSize) + gap(0.4);
  text("Company", "{{Company}}", y, { fontSize: compSize, color: muted, h: lineH(compSize) });
  y += lineH(compSize);

  if (a.tagline) {
    y += gap(0.6);
    text("Tagline", a.tagline, y, { fontSize: bodySize * 0.92, color: muted, h: lineH(bodySize) });
    y += lineH(bodySize);
  }

  // contact block: kept together and pinned to the bottom of the text zone when it fits
  const contactLine = lineH(bodySize) + gap(0.35);
  const contactBlock = contactLine * 3;
  const zoneBottom = colY + colH;
  y = Math.max(y + gap(1.2), Math.min(y + gap(1.2), zoneBottom - contactBlock));

  text("Phone", "{{Phone}}", y, { fontSize: bodySize, color: muted, h: lineH(bodySize) });
  text("Email", "{{Email}}", y + contactLine, { fontSize: bodySize, color: muted, h: lineH(bodySize) });
  text("Website", "{{Website}}", y + contactLine * 2, { fontSize: bodySize, color: muted, h: lineH(bodySize) });

  // QR: exactly the measured square zone, kept perfectly square and inside the card
  const qr = snap2(Math.min(gx(L.qrZone.w), gy(L.qrZone.h)));
  const qrX = Math.min(Math.max(snap2(gx(L.qrZone.x)), PAD), W - PAD - qr);
  const qrY = Math.min(Math.max(snap2(gy(L.qrZone.y)), PAD), H - PAD - qr);
  push(node("qr", {
    name: "QR",
    x: qrX, y: qrY, w: qr, h: qr,
    style: {
      fill: isLight(bg) ? "#ffffff" : lighten(bg, 0.94),
      radius: Math.round(qr * 0.08),
      padding: Math.round(qr * 0.06),
      borderWidth: 1,
      borderColor: hair,
    },
  }));

  const btnW = snap2(Math.min(colW, px(260)));
  const btnH = snap2(px(56));
  push(node("button", {
    name: "Save contact",
    text: "Save contact",
    x: align === "center" ? snap2((W - btnW) / 2) : align === "right" ? colX + colW - btnW : colX,
    y: H - PAD - btnH,
    w: btnW, h: btnH,
    style: {
      fontFamily: pair.body,
      gradient: key === "luxury" || key === "premium"
        ? `linear-gradient(135deg, ${accent}, ${brand})`
        : `linear-gradient(135deg, ${brand}, ${secondary})`,
      color: inkOn(brand, "#ffffff"),
      radius: 999, fontSize: px(17), fontWeight: 600, align: "center",
      shadow: `0 ${px(10)}px ${px(28)}px ${alpha(darken(brand, 0.4), 0.45)}`,
    },
  }));


  void s;

  return {
    version: 1,
    w: W,
    h: H,
    background: {
      color: bg,
      gradient: light
        ? `linear-gradient(160deg, ${lighten(bg, 0.6)}, ${mix(bg, primary, 0.08)})`
        : a.backgroundCss,
      image: null,
    },
    nodes,
  };
}
