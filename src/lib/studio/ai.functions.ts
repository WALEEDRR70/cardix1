import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  /** data URL of the uploaded business card image */
  image: z.string().min(32),
  mime: z.string().default("image/png"),
  /** measured width/height of the uploaded image */
  aspect: z.number().positive().optional(),
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

/** A rectangle expressed in percentages of the card (0..100). */
export type AiRect = { x: number; y: number; w: number; h: number };

/** Precise composition grid measured from the scanned card. */
export type AiLayout = {
  /** page margin in % of the short edge */
  margin: number;
  textZone: AiRect;
  logoZone: AiRect;
  photoZone: AiRect | null;
  qrZone: AiRect;
  /** relative type sizes, 1 = base */
  typeScale: { name: number; title: number; company: number; body: number };
  /** optical alignment of the text block */
  textAlign: "left" | "center" | "right";
};

export type AiCardAnalysis = {
  style: string;
  industry: string;
  mood: string;
  fonts: { detected: string; suggested: string };
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
};


const SYSTEM = `You are a senior brand designer analysing a scanned business card.
You must IGNORE and NEVER reproduce any names, phone numbers, emails, websites, addresses,
social handles or personal data found on the card. Extract ONLY the visual identity and layout.
Return STRICT JSON, no markdown fences, matching exactly:
{
 "style": one of ["luxury","minimal","corporate","creative","technology","medical","legal","architecture","fashion","photography","finance","hospitality","modern","classic"],
 "industry": short english word,
 "mood": 3 words,
 "fonts": { "detected": string, "suggested": string },
 "palette": { "primary": hex, "secondary": hex, "accent": hex, "background": hex, "textOnBg": hex },
 "backgroundCss": a single CSS background value (gradient allowed) INSPIRED by the card but original, never a copy,
 "composition": one of ["left-rail","top-band","centered","diagonal","corner-arc","split"],
 "aspect": number = card width divided by height as it appears in the image,
 "orientation": "landscape" | "portrait" | "square",
 "direction": "rtl" if the card's main language is Arabic/Hebrew, else "ltr",
 "logoPosition": "left" | "center" | "right",
 "vectors": an ARRAY of 4 to 9 FREE-FORM vector drawings you compose yourself, like using a pen tool.
   Each item = { "name": short label, "d": SVG path data, "fill": hex or null, "stroke": hex or null,
   "strokeWidth": number 0.2-4, "opacity": 0-1, "blur": 0-30 }.
   Coordinates live on a 0..100 x 0..100 grid mapped onto the whole card.
   PRECISION RULES for "d":
     - use 2 decimals on every coordinate (e.g. 12.40, not 12), never integers-only sketches,
     - start with an absolute M, use C/S/Q/A for every curve, close filled shapes with Z,
     - keep every coordinate inside -5..105, never leave a path half finished,
     - align related paths to the same anchors so edges meet exactly (shared start/end points),
     - make the drawing follow the real geometry you SEE in the scan (angle of a diagonal, radius of an
       arc, thickness of a rail) rather than a generic decoration,
     - keep artwork out of "textZone" so type stays perfectly legible.
   Draw ORGANIC, ORIGINAL artwork: sweeping ribbons, arcs, waves, corner flourishes, diagonal blades,
   layered blobs. Do NOT trace text or logos.
 "layout": the MEASURED composition grid of the scan, all values in PERCENT of the card (0..100) with 1 decimal:
   { "margin": number 3-12 (safe margin), 
     "textZone": {"x","y","w","h"} rectangle holding name/title/contact block,
     "logoZone": {"x","y","w","h"} rectangle of the logo,
     "photoZone": {"x","y","w","h"} or null if the card shows no portrait,
     "qrZone": {"x","y","w","h"} square area free for a QR code,
     "typeScale": {"name":0.8-1.6,"title":0.6-1.2,"company":0.5-1.1,"body":0.5-1.0},
     "textAlign": "left" | "center" | "right" }
   Zones must NOT overlap each other and must stay inside the margins.
 "tagline": a generic services/slogan line describing the business WITHOUT any contact data, or null,
 "notes": one sentence on how to modernise the layout
}
Report the true orientation: a wide card MUST return "landscape" with aspect > 1.
Measure, do not guess: read distances off the image and keep zones proportional to what you see.
Improve the palette: raise contrast, refine harmony, keep the spirit of the original.`;



export const analyzeCardImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<AiCardAnalysis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const url = data.image.startsWith("data:")
      ? data.image
      : `data:${data.mime};base64,${data.image}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse this business card's visual identity only." },
              { type: "image_url", image_url: { url } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("RATE_LIMIT");
      if (res.status === 402) throw new Error("NO_CREDITS");
      throw new Error(`AI request failed [${res.status}]: ${body}`);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed: Partial<AiCardAnalysis>;
    try {
      parsed = JSON.parse(cleaned) as Partial<AiCardAnalysis>;
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      parsed = m ? (JSON.parse(m[0]) as Partial<AiCardAnalysis>) : {};
    }

    const p = parsed.palette ?? ({} as AiCardAnalysis["palette"]);
    return {
      style: parsed.style ?? "modern",
      industry: parsed.industry ?? "business",
      mood: parsed.mood ?? "premium confident clean",
      fonts: parsed.fonts ?? { detected: "Grotesque sans", suggested: "Inter / Plus Jakarta Sans" },
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
            .slice(0, 10)
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
      tagline: parsed.tagline ?? null,
      notes: parsed.notes ?? "Increase whitespace and strengthen the type hierarchy.",
    };

  });
