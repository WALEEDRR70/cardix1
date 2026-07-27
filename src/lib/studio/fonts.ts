// Curated designer type system for the AI card designer.
// Every family here is loaded in src/routes/__root.tsx.

export type FontPairKey =
  | "grotesk" | "editorial" | "serif-luxe" | "geometric" | "technical"
  | "humanist" | "display" | "mono";

export type FontPair = {
  key: FontPairKey;
  heading: string;
  body: string;
  /** default letter-spacing (px at 1000px card) for the name line */
  tracking: number;
  /** heading weight */
  weight: number;
};

const AR = `"IBM Plex Sans Arabic"`;

export const FONT_PAIRS: Record<FontPairKey, FontPair> = {
  grotesk: { key: "grotesk", heading: `"Space Grotesk", ${AR}, sans-serif`, body: `"Manrope", ${AR}, sans-serif`, tracking: -0.6, weight: 700 },
  editorial: { key: "editorial", heading: `"Instrument Serif", ${AR}, serif`, body: `"Inter", ${AR}, sans-serif`, tracking: 0, weight: 400 },
  "serif-luxe": { key: "serif-luxe", heading: `"Cormorant Garamond", ${AR}, serif`, body: `"Manrope", ${AR}, sans-serif`, tracking: 1.2, weight: 600 },
  geometric: { key: "geometric", heading: `"Sora", ${AR}, sans-serif`, body: `"DM Sans", ${AR}, sans-serif`, tracking: -0.4, weight: 700 },
  technical: { key: "technical", heading: `"Archivo", ${AR}, sans-serif`, body: `"Inter", ${AR}, sans-serif`, tracking: -0.2, weight: 700 },
  humanist: { key: "humanist", heading: `"Inter", ${AR}, sans-serif`, body: `"Inter", ${AR}, sans-serif`, tracking: -0.3, weight: 700 },
  display: { key: "display", heading: `"Syne", ${AR}, sans-serif`, body: `"DM Sans", ${AR}, sans-serif`, tracking: -0.8, weight: 800 },
  mono: { key: "mono", heading: `"JetBrains Mono", ${AR}, monospace`, body: `"Inter", ${AR}, sans-serif`, tracking: -0.5, weight: 700 },
};

export const FONT_PAIR_KEYS = Object.keys(FONT_PAIRS) as FontPairKey[];

/** Falls back to a pairing that suits the detected design style. */
export function pairForStyle(style: string, requested?: string | null): FontPair {
  if (requested && requested in FONT_PAIRS) return FONT_PAIRS[requested as FontPairKey];
  const map: Record<string, FontPairKey> = {
    luxury: "serif-luxe", classic: "editorial", fashion: "editorial", photography: "editorial",
    legal: "editorial", finance: "humanist", corporate: "humanist", medical: "humanist",
    technology: "technical", architecture: "geometric", modern: "geometric",
    creative: "display", hospitality: "serif-luxe", minimal: "grotesk",
  };
  return FONT_PAIRS[map[style] ?? "grotesk"];
}
