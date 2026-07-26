// Turns an AI analysis into fully editable Studio documents (never a flat image).
import { CARD_H, CARD_W, node, type StudioDoc, type StudioNode } from "./types";
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

const PAD = 56;

function textNode(name: string, text: string, y: number, opts: Partial<StudioNode["style"]> & { x?: number; w?: number; h?: number } = {}): StudioNode {
  const { x = PAD, w = CARD_W - PAD * 2, h = 56, ...style } = opts;
  return node("text", { name, text, x, y, w, h, style: { fontSize: 22, lineHeight: 1.3, ...style } });
}

/** Builds an editable document for one variation, driven by the extracted identity. */
export function buildVariation(a: AiCardAnalysis, key: VariationKey): StudioDoc {
  const { primary, secondary, accent, background, textOnBg } = a.palette;
  const light = key === "light";
  const bg = light ? "#f6f4fb" : background;
  const fg = light ? "#141020" : textOnBg;
  const muted = light ? "#5d5670" : "#c9c2d8";

  const nodes: StudioNode[] = [];
  const push = (n: StudioNode) => nodes.push(n);

  // ---- decorative layer, unique per variation ----
  switch (key) {
    case "minimal":
      push(node("line", { name: "Rule", x: PAD, y: 470, w: 120, h: 3, style: { fill: primary, radius: 3 } }));
      break;
    case "luxury":
      push(node("shape", { name: "Glow", x: -140, y: -160, w: 520, h: 520, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${accent}55, transparent 70%)` } }));
      push(node("line", { name: "Gold rule", x: PAD, y: 480, w: CARD_W - PAD * 2, h: 1, style: { fill: accent } }));
      break;
    case "glass":
      push(node("shape", { name: "Aura", x: 60, y: 60, w: 520, h: 420, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${primary}66, transparent 70%)` } }));
      push(node("shape", { name: "Glass panel", x: 40, y: 430, w: CARD_W - 80, h: 500, shape: "rect", style: { fill: "#ffffff14", blur: 18, radius: 32, borderWidth: 1, borderColor: "#ffffff33" } }));
      break;
    case "corporate":
      push(node("shape", { name: "Header band", x: 0, y: 0, w: CARD_W, h: 300, shape: "rect", style: { fill: secondary, radius: 0 } }));
      push(node("line", { name: "Accent bar", x: 0, y: 300, w: CARD_W, h: 6, style: { fill: primary, radius: 0 } }));
      break;
    case "executive":
      push(node("shape", { name: "Side rail", x: 0, y: 0, w: 26, h: CARD_H, shape: "rect", style: { gradient: `linear-gradient(180deg, ${primary}, ${accent})`, radius: 0 } }));
      break;
    case "creative":
      push(node("shape", { name: "Blob A", x: -120, y: 520, w: 420, h: 420, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${primary}77, transparent 70%)` } }));
      push(node("shape", { name: "Blob B", x: 320, y: -100, w: 420, h: 420, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${accent}66, transparent 70%)` } }));
      push(node("shape", { name: "Chip", x: PAD, y: 420, w: 120, h: 40, shape: "rect", style: { fill: `${primary}33`, radius: 999 } }));
      break;
    case "modern":
      push(node("shape", { name: "Arc", x: CARD_W - 260, y: -120, w: 420, h: 420, shape: "ellipse", style: { gradient: `linear-gradient(135deg, ${primary}, ${secondary})` } }));
      break;
    case "dark":
      push(node("shape", { name: "Vignette", x: 0, y: 0, w: CARD_W, h: CARD_H, shape: "rect", style: { gradient: `radial-gradient(120% 80% at 20% 0%, ${primary}33, transparent 60%)`, radius: 0 } }));
      break;
    case "light":
      push(node("shape", { name: "Tint", x: 0, y: 0, w: CARD_W, h: 340, shape: "rect", style: { gradient: `linear-gradient(160deg, ${primary}22, transparent)`, radius: 0 } }));
      break;
    case "premium":
      push(node("shape", { name: "Frame", x: 24, y: 24, w: CARD_W - 48, h: CARD_H - 48, shape: "rect", style: { fill: "transparent", borderWidth: 1, borderColor: `${accent}88`, radius: 28 } }));
      push(node("shape", { name: "Halo", x: 140, y: -180, w: 460, h: 460, shape: "ellipse", style: { gradient: `radial-gradient(circle, ${accent}44, transparent 70%)` } }));
      break;
  }

  // ---- identity layer (placeholders, always editable) ----
  const photoY = key === "corporate" ? 150 : 120;
  push(node("image", {
    name: "Photo",
    x: key === "creative" ? CARD_W - 220 : PAD,
    y: photoY,
    w: 160, h: 160,
    style: { radius: 999, borderWidth: 2, borderColor: `${primary}88` },
  }));
  push(node("image", { name: "Logo", x: CARD_W - PAD - 130, y: PAD, w: 130, h: 52, style: { radius: 10 } }));

  const baseY = key === "corporate" ? 360 : 520;
  push(textNode("Name", "{{Employee Name}}", baseY, { fontSize: 46, fontWeight: 700, color: fg, h: 64 }));
  push(textNode("Job title", "{{Job Title}}", baseY + 70, { fontSize: 22, color: primary, fontWeight: 600, h: 34 }));
  push(textNode("Company", "{{Company}}", baseY + 108, { fontSize: 20, color: muted, h: 32 }));

  const contactY = baseY + 170;
  push(textNode("Phone", "{{Phone}}", contactY, { fontSize: 18, color: muted, h: 28 }));
  push(textNode("Email", "{{Email}}", contactY + 34, { fontSize: 18, color: muted, h: 28 }));
  push(textNode("Website", "{{Website}}", contactY + 68, { fontSize: 18, color: muted, h: 28 }));

  push(node("qr", {
    name: "QR",
    x: CARD_W - PAD - 150,
    y: CARD_H - PAD - 150,
    w: 150, h: 150,
    style: { fill: light ? "#ffffff" : "#ffffff", radius: 18, padding: 12 },
  }));
  push(node("button", {
    name: "Save contact",
    text: "Save contact",
    x: PAD, y: CARD_H - PAD - 66, w: 260, h: 60,
    style: {
      gradient: key === "luxury" || key === "premium"
        ? `linear-gradient(135deg, ${accent}, ${primary})`
        : `linear-gradient(135deg, ${primary}, ${secondary})`,
      color: "#ffffff", radius: 999, fontSize: 18, fontWeight: 600, align: "center",
    },
  }));

  return {
    version: 1,
    w: CARD_W,
    h: CARD_H,
    background: {
      color: bg,
      gradient: light ? "linear-gradient(160deg,#ffffff,#eee9f7)" : a.backgroundCss,
      image: null,
    },
    nodes,
  };
}
