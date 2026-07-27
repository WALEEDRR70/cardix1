import { createServerFn } from "@tanstack/react-start";
import { normalizeLayout, type AiLayout, type AiRect } from "./layout";
import { FONT_PAIR_KEYS, type FontPairKey } from "./fonts";
import { z } from "zod";

export type { AiLayout, AiRect };


const Input = z.object({
  /** data URL of the uploaded business card image (optional when a brief is given) */
  image: z.string().optional(),
  mime: z.string().default("image/png"),
  /** measured width/height of the uploaded image */
  aspect: z.number().positive().optional(),
  /** free-text art direction from the user (works with or without an image) */
  brief: z.string().max(600).optional(),
});



/** One free-hand vector stroke/shape drawn by the model on a 0..100 card grid. */
export type AiVector = {
  name: string;
  /** SVG path data in a 0..100 x 0..100 coordinate space covering the whole card */
  d: string;
  fill?: string | null;
  stroke?: string | null;
  strokeWidth?: number;
  opacity?: number;
  blur?: number;
};




export type AiTypography = {
  /** curated pairing key from src/lib/studio/fonts.ts */
  pair: FontPairKey;
  /** SMALL CAPS kicker above/below the name, or null */
  kicker: string | null;
  /** extra tracking (px @1000) applied to the name line */
  tracking: number;
  /** true = uppercase the name line */
  uppercaseName: boolean;
};

export type AiFinish = {
  /** subtle paper/noise texture strength 0..1 */
  grain: number;
  /** metallic sheen sweep across the artwork 0..1 */
  foil: number;
  /** soft ambient light bloom 0..1 */
  bloom: number;
  /** hairline frame inset in % (0 = none) */
  frame: number;
  /** thin divider rule under the name */
  rule: boolean;
};

export type AiCardAnalysis = {
  style: string;
  industry: string;
  mood: string;
  fonts: { detected: string; suggested: string };
  typography: AiTypography;
  finish: AiFinish;
  palette: { primary: string; secondary: string; accent: string; background: string; textOnBg: string };
  backgroundCss: string;
  composition: "left-rail" | "top-band" | "centered" | "diagonal" | "corner-arc" | "split";
  /** width / height of the original card (>1 = landscape) */
  aspect: number;
  orientation: "landscape" | "portrait" | "square";
  direction: "ltr" | "rtl";
  logoPosition: "left" | "center" | "right";
  /** free-form vector artwork the model draws itself (pen-tool style) */
  vectors: AiVector[];
  /** measured composition grid */
  layout: AiLayout;
  /** short services / slogan line detected on the card (no contact data) */
  tagline: string | null;
  notes: string;
  /** art-direction critique the designer can read */
  critique: string[];
};



const SYSTEM = `You are the art director of a world-class identity studio, composing a business card
at the level of Pentagram / Base Design work. When a scan is provided you must IGNORE and NEVER
reproduce any names, phone numbers, emails, websites, addresses, social handles or personal data
on it — extract ONLY the visual identity, geometry and craft, then RAISE it: better contrast,
better rhythm, better hierarchy, more restraint.
Return STRICT JSON, no markdown fences, matching exactly:
{
 "style": one of ["luxury","minimal","corporate","creative","technology","medical","legal","architecture","fashion","photography","finance","hospitality","modern","classic"],
 "industry": short english word,
 "mood": 3 words,
 "fonts": { "detected": string, "suggested": string },
 "typography": {
    "pair": one of ["grotesk","editorial","serif-luxe","geometric","technical","humanist","display","mono"] — the pairing that best carries the brand,
    "kicker": a 1-3 word SMALL-CAPS label (e.g. "STUDIO", "EST. 2016", the discipline) or null,
    "tracking": number -1.5..3 extra letter-spacing for the name line,
    "uppercaseName": boolean
 },
 "finish": {
    "grain": 0..1 paper/noise texture strength,
    "foil": 0..1 metallic sheen sweep over the artwork,
    "bloom": 0..1 ambient light bloom,
    "frame": 0..6 hairline frame inset in percent (0 = no frame),
    "rule": boolean — a thin divider rule under the name
 },
 "palette": { "primary": hex, "secondary": hex, "accent": hex, "background": hex, "textOnBg": hex },
 "backgroundCss": a single CSS background value (gradient allowed) INSPIRED by the card but original, never a copy,
 "composition": one of ["left-rail","top-band","centered","diagonal","corner-arc","split"],
 "aspect": number = card width divided by height as it appears in the image,
 "orientation": "landscape" | "portrait" | "square",
 "direction": "rtl" if the card's main language is Arabic/Hebrew, else "ltr",
 "logoPosition": "left" | "center" | "right",
 "vectors": an ARRAY of 5 to 10 FREE-FORM vector drawings you compose yourself, like using a pen tool.
   Each item = { "name": short label, "d": SVG path data, "fill": hex or null, "stroke": hex or null,
   "strokeWidth": number 0.2-4, "opacity": 0-1, "blur": 0-30 }.
   Coordinates live on a 0..100 x 0..100 grid mapped onto the whole card.
   PRECISION RULES for "d":
     - use 2 decimals on every coordinate (e.g. 12.40, not 12), never integers-only sketches,
     - start with an absolute M, use C/S/Q/A for every curve, close filled shapes with Z,
     - keep every coordinate inside -5..105, never leave a path half finished,
     - align related paths to the same anchors so edges meet exactly (shared start/end points),
     - build the artwork in LAYERS that belong together: a base mass, one or two echo curves offset
       by a constant distance, then a thin highlight line following the same curvature,
     - respect an optical hierarchy: one dominant gesture, the rest supporting and quieter,
     - follow the real geometry you SEE in the scan (angle of a diagonal, radius of an arc,
       thickness of a rail) rather than generic decoration,
     - keep artwork out of "textZone" so type stays perfectly legible.
   Draw ORGANIC, ORIGINAL artwork: sweeping ribbons, arcs, waves, corner flourishes, diagonal blades,
   layered blobs. Do NOT trace text or logos.
 "layout": the MEASURED composition grid, all values in PERCENT of the card (0..100) with 1 decimal:
   { "margin": number 3-12 (safe margin),
     "textZone": {"x","y","w","h"} rectangle holding name/title/contact block,
     "logoZone": {"x","y","w","h"} rectangle of the logo,
     "photoZone": {"x","y","w","h"} or null if the card shows no portrait,
     "qrZone": {"x","y","w","h"} square area free for a QR code,
     "typeScale": {"name":0.8-1.6,"title":0.6-1.2,"company":0.5-1.1,"body":0.5-1.0},
     "textAlign": "left" | "center" | "right" }
   Zones must NOT overlap each other and must stay inside the margins.
   Compose on a 12-column grid: snap zone edges to column boundaries so everything aligns.
 "tagline": a generic services/slogan line describing the business WITHOUT any contact data, or null,
 "notes": one sentence on how to modernise the layout,
 "critique": an ARRAY of 2-4 short art-direction observations (what was weak, what you fixed)
}
Report the true orientation: a wide card MUST return "landscape" with aspect > 1.
Measure, do not guess: read distances off the image and keep zones proportional to what you see.
Palette law: "textOnBg" must reach at least 7:1 contrast against "background", and "accent"
at least 3.5:1. Refine harmony, keep the spirit of the original, never ship muddy colors.`;


const MODELS = ["google/gemini-3.1-pro-preview", "google/gemini-3.6-flash"];

async function askGateway(key: string, content: unknown): Promise<string> {
  let lastErr: Error | null = null;
  for (const model of MODELS) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.ok) {
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return json.choices?.[0]?.message?.content ?? "";
    }
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("NO_CREDITS");
    lastErr = new Error(`AI request failed [${res.status}]: ${await res.text()}`);
  }
  throw lastErr ?? new Error("AI request failed");
}

const clamp01 = (v: unknown, d: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : d;


export const analyzeCardImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AiCardAnalysis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    if (!data.image && !data.brief) throw new Error("Provide an image or a brief");

    const parts: unknown[] = [
      {
        type: "text",
        text: data.image
          ? `Analyse this business card's visual identity only, then art-direct a superior version.${data.brief ? `\nClient direction: ${data.brief}` : ""}`
          : `No scan is provided. Art-direct an original premium business card from this brief: ${data.brief}`,
      },
    ];
    if (data.image) {
      const url = data.image.startsWith("data:")
        ? data.image
        : `data:${data.mime};base64,${data.image}`;
      parts.push({ type: "image_url", image_url: { url } });
    }

    const raw = await askGateway(key, parts);
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed: Partial<AiCardAnalysis>;
    try {
      parsed = JSON.parse(cleaned) as Partial<AiCardAnalysis>;
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      parsed = m ? (JSON.parse(m[0]) as Partial<AiCardAnalysis>) : {};
    }

    const p = parsed.palette ?? ({} as AiCardAnalysis["palette"]);
    const t = (parsed.typography ?? {}) as Partial<AiTypography>;
    const f = (parsed.finish ?? {}) as Partial<AiFinish>;
    const style = parsed.style ?? "modern";

    return {
      style,
      industry: parsed.industry ?? "business",
      mood: parsed.mood ?? "premium confident clean",
      fonts: parsed.fonts ?? { detected: "Grotesque sans", suggested: "Space Grotesk / Manrope" },
      typography: {
        pair: (FONT_PAIR_KEYS as string[]).includes(String(t.pair)) ? (t.pair as FontPairKey) : "grotesk",
        kicker: typeof t.kicker === "string" && t.kicker.trim() ? t.kicker.trim().slice(0, 24) : null,
        tracking: typeof t.tracking === "number" ? Math.min(3, Math.max(-1.5, t.tracking)) : 0,
        uppercaseName: t.uppercaseName === true,
      },
      finish: {
        grain: clamp01(f.grain, 0.18),
        foil: clamp01(f.foil, 0.25),
        bloom: clamp01(f.bloom, 0.3),
        frame: typeof f.frame === "number" ? Math.min(6, Math.max(0, f.frame)) : 0,
        rule: f.rule !== false,
      },
      palette: {
        primary: p.primary ?? "#7c34ff",
        secondary: p.secondary ?? "#2c125a",
        accent: p.accent ?? "#d9c07a",
        background: p.background ?? "#0b0713",
        textOnBg: p.textOnBg ?? "#ffffff",
      },
      backgroundCss: parsed.backgroundCss ?? "linear-gradient(160deg,#2c125a,#0b0713 60%)",
      composition: parsed.composition ?? "left-rail",
      // the measured aspect from the browser always wins over the model's guess
      aspect: data.aspect ?? (typeof parsed.aspect === "number" ? parsed.aspect : 0.64),
      orientation:
        (data.aspect ?? parsed.aspect ?? 0.64) > 1.05
          ? "landscape"
          : (data.aspect ?? parsed.aspect ?? 0.64) < 0.95
            ? "portrait"
            : "square",
      direction: parsed.direction === "rtl" ? "rtl" : "ltr",
      logoPosition: parsed.logoPosition ?? "right",
      vectors: Array.isArray(parsed.vectors)
        ? (parsed.vectors as AiVector[])
            .filter((v) => v && typeof v.d === "string" && /^[Mm]/.test(v.d.trim()))
            .slice(0, 12)
            .map((v, i) => ({
              name: v.name || `Vector ${i + 1}`,
              d: v.d.trim(),
              fill: v.fill ?? null,
              stroke: v.stroke ?? null,
              strokeWidth: typeof v.strokeWidth === "number" ? v.strokeWidth : 1.2,
              opacity: typeof v.opacity === "number" ? Math.min(1, Math.max(0.05, v.opacity)) : 0.9,
              blur: typeof v.blur === "number" ? v.blur : 0,
            }))
        : [],
      layout: normalizeLayout(
        parsed.layout,
        (data.aspect ?? parsed.aspect ?? 0.64) >= 1,
        parsed.direction === "rtl",
      ),
      tagline: parsed.tagline ?? null,
      notes: parsed.notes ?? "Increase whitespace and strengthen the type hierarchy.",
      critique: Array.isArray(parsed.critique)
        ? parsed.critique.filter((c) => typeof c === "string").slice(0, 4)
        : [],
    };
  });

