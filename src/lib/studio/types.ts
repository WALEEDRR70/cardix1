// Cardix Studio — document model for the visual business-card designer.
export type NodeType =
  | "text" | "image" | "shape" | "line" | "qr" | "icon" | "button" | "group";

export type ShapeKind = "rect" | "ellipse" | "triangle";

export type NodeStyle = {
  fill?: string;
  gradient?: string | null;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  align?: "left" | "center" | "right";
  radius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: string | null;
  glow?: string | null;
  blur?: number;
  padding?: number;
};

/** Where an image node takes its picture from. */
export type ImageSource = "upload" | "employee" | "logo";

export type StudioNode = {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  opacity: number;
  locked: boolean;
  hidden: boolean;
  text?: string;
  src?: string;
  imageSource?: ImageSource;
  icon?: string;
  shape?: ShapeKind;
  href?: string;
  style: NodeStyle;
  children?: StudioNode[];
};

export type StudioDoc = {
  version: 1;
  w: number;
  h: number;
  background: { color: string; gradient?: string | null; image?: string | null };
  nodes: StudioNode[];
};

/** Dynamic placeholders resolved when an employee card is rendered. */
export const PLACEHOLDERS = [
  "{{Employee Name}}", "{{Job Title}}", "{{Company}}", "{{Phone}}",
  "{{Email}}", "{{Website}}", "{{Address}}", "{{QR}}", "{{Logo}}", "{{Photo}}",
] as const;

export const SAMPLE_VALUES: Record<string, string> = {
  "{{Employee Name}}": "Sara Al-Amin",
  "{{Job Title}}": "Creative Director",
  "{{Company}}": "Cardixn",
  "{{Phone}}": "+971 50 000 0000",
  "{{Email}}": "hello@cardixn.com",
  "{{Website}}": "cardixn.com",
  "{{Address}}": "Dubai, UAE",
};

export function resolvePlaceholders(text: string, values?: Record<string, string>): string {
  return text.replace(/\{\{[^}]+\}\}/g, (m) => values?.[m] ?? SAMPLE_VALUES[m] ?? m);
}

/** Resolves the picture of an image node (employee photo / company logo / uploaded file). */
export function resolveImageSrc(
  n: { src?: string; imageSource?: ImageSource },
  values?: Record<string, string>,
): string | undefined {
  if (n.imageSource === "employee") return values?.["{{Photo}}"] || n.src || undefined;
  if (n.imageSource === "logo") return values?.["{{Logo}}"] || n.src || undefined;
  return n.src || undefined;
}

export const CARD_W = 640;
export const CARD_H = 1000;

/** Common card canvas sizes (px at 2x print-safe density). */
export const CARD_SIZES: { key: string; label: string; labelAr: string; w: number; h: number }[] = [
  { key: "portrait", label: "Portrait card", labelAr: "بطاقة عمودية", w: 640, h: 1000 },
  { key: "standard-v", label: "Standard 85×55 (V)", labelAr: "قياسي ٨٥×٥٥ (عمودي)", w: 650, h: 1004 },
  { key: "standard-h", label: "Standard 85×55 (H)", labelAr: "قياسي ٨٥×٥٥ (أفقي)", w: 1004, h: 650 },
  { key: "us", label: "US 3.5×2 in", labelAr: "أمريكي ٣.٥×٢ إنش", w: 1050, h: 600 },
  { key: "square", label: "Square", labelAr: "مربع", w: 800, h: 800 },
  { key: "story", label: "Story 9:16", labelAr: "ستوري ٩:١٦", w: 720, h: 1280 },
  { key: "badge", label: "Badge 54×86", labelAr: "بطاقة تعريف ٥٤×٨٦", w: 638, h: 1016 },
];


export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyDoc(primary = "#7c34ff", secondary = "#2c125a"): StudioDoc {
  return {
    version: 1,
    w: CARD_W,
    h: CARD_H,
    background: { color: "#0b0713", gradient: `linear-gradient(160deg, ${secondary}, #0b0713 60%)`, image: null },
    nodes: [
      node("shape", {
        name: "Accent", x: -120, y: -140, w: 460, h: 460, shape: "ellipse",
        style: { gradient: `radial-gradient(circle, ${primary}66, transparent 70%)`, radius: 999 },
      }),
      node("text", {
        name: "Name", x: 56, y: 520, w: 480, h: 64, text: "{{Employee Name}}",
        style: { color: "#ffffff", fontSize: 44, fontWeight: 700, align: "left", lineHeight: 1.1 },
      }),
      node("text", {
        name: "Title", x: 56, y: 592, w: 480, h: 40, text: "{{Job Title}} · {{Company}}",
        style: { color: "#c9c2d8", fontSize: 20, fontWeight: 400, align: "left", lineHeight: 1.3 },
      }),
      node("qr", { name: "QR", x: 56, y: 700, w: 160, h: 160, style: { radius: 20, fill: "#ffffff" } }),
    ],
  };
}

const DEFAULT_STYLE: Record<NodeType, NodeStyle> = {
  text: { color: "#ffffff", fontSize: 24, fontWeight: 500, align: "left", lineHeight: 1.3, letterSpacing: 0 },
  image: { radius: 16 },
  shape: { fill: "#7c34ff", radius: 24 },
  line: { fill: "#ffffff", radius: 8 },
  qr: { fill: "#ffffff", radius: 16, padding: 12 },
  icon: { color: "#ffffff" },
  button: { fill: "#7c34ff", color: "#ffffff", radius: 999, fontSize: 18, fontWeight: 600, align: "center" },
  group: {},
};

export function node(type: NodeType, patch: Partial<StudioNode> = {}): StudioNode {
  return {
    id: uid(),
    type,
    name: patch.name ?? type,
    x: patch.x ?? 80,
    y: patch.y ?? 80,
    w: patch.w ?? 220,
    h: patch.h ?? (type === "text" ? 48 : 120),
    rot: patch.rot ?? 0,
    opacity: patch.opacity ?? 1,
    locked: false,
    hidden: false,
    style: { ...DEFAULT_STYLE[type], ...(patch.style ?? {}) },
    ...(patch.text !== undefined ? { text: patch.text } : type === "text" ? { text: "Text" } : {}),
    ...(patch.src ? { src: patch.src } : {}),
    ...(patch.imageSource ? { imageSource: patch.imageSource } : {}),
    ...(patch.icon ? { icon: patch.icon } : {}),
    ...(patch.shape ? { shape: patch.shape } : {}),
    ...(patch.href ? { href: patch.href } : {}),
    ...(patch.children ? { children: patch.children } : {}),
  };
}

/** Flattens the tree into render/selection order (parents before children). */
export function flatten(nodes: StudioNode[], depth = 0): { node: StudioNode; depth: number }[] {
  const out: { node: StudioNode; depth: number }[] = [];
  for (const n of nodes) {
    out.push({ node: n, depth });
    if (n.children) out.push(...flatten(n.children, depth + 1));
  }
  return out;
}

export function findNode(nodes: StudioNode[], id: string): StudioNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findNode(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}
