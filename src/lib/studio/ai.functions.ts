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

/** A measured content region on the analysed card, in 0..100 percentages. */
export type AiBlockRole =
  | "logo" | "photo" | "name" | "title" | "company" | "tagline"
  | "phone" | "email" | "website" | "address" | "qr" | "cta" | "custom";

export type AiBlock = {
  role: AiBlockRole;
  /** normalised box on a 0..100 x 0..100 card grid */
  x: number; y: number; w: number; h: number;
  align?: "left" | "center" | "right";
  /** cap height of the text as a % of the card's short edge */
  sizePct?: number;
  weight?: number;
  color?: string | null;
  letterSpacing?: number;
  uppercase?: boolean;
};

/** A flat background surface (band, rail, panel) measured on the card. */
export type AiSurface = {
  name: string;
  x: number; y: number; w: number; h: number;
  shape: "rect" | "ellipse";
  fill?: string | null;
  gradient?: string | null;
  radius?: number;
  opacity?: number;
  blur?: number;
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
  /** measured layout of every content region on the scanned card */
  blocks: AiBlock[];
  /** measured flat colour surfaces behind the content */
  surfaces: AiSurface[];
  /** margins of the printed content area, in % of the card */
  margins: { top: number; right: number; bottom: number; left: number };
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
 "vectors": an ARRAY of 3 to 8 FREE-FORM vector drawings you compose yourself, like using a pen tool.
   Each item = { "name": short label, "d": SVG path data, "fill": hex or null, "stroke": hex or null,
   "strokeWidth": number 0.2-4, "opacity": 0-1, "blur": 0-30 }.
   Coordinates live on a 0..100 x 0..100 grid mapped onto the whole card, so use decimals freely.
   Draw ORGANIC, ORIGINAL artwork inspired by the scan: sweeping curves (C/Q/S commands), ribbons,
   arcs, waves, corner flourishes, diagonal blades, layered blobs. Do NOT limit yourself to rectangles
   or circles, do NOT trace text or logos, and keep the drawing behind the content area so the text stays readable.
 "surfaces": ARRAY (0-6) of the FLAT colour areas printed behind the content (bands, rails, panels,
   corner blocks, photo plates). Measure each one on the 0..100 grid:
   { "name": label, "x","y","w","h": numbers, "shape": "rect"|"ellipse", "fill": hex or null,
     "gradient": CSS gradient or null, "radius": 0-50 (% of the smaller side), "opacity": 0-1, "blur": 0-40 }.
 "margins": { "top","right","bottom","left" } = the printed safe area margins as % of the card,
 "blocks": ARRAY measuring EVERY content region you can see, in reading order. Be precise: read the real
   pixel position of each element in the image and convert it to the 0..100 grid. One item per region:
   { "role": one of ["logo","photo","name","title","company","tagline","phone","email","website","address","qr","cta","custom"],
     "x","y","w","h": the bounding box on the 0..100 grid,
     "align": "left"|"center"|"right" (how the text sits inside its box),
     "sizePct": the text cap height as a % of the card's SHORT edge (e.g. 6 for a big name, 2.6 for contact lines),
     "weight": 300-900, "color": hex of that text, "letterSpacing": -2..12, "uppercase": true|false }.
   Include a block only if that element really exists on the card; never invent a QR if none is printed,
   but DO add one "qr" block in free space if the card has none. Never copy the actual text content.
 "tagline": a generic services/slogan line describing the business WITHOUT any contact data, or null,
 "notes": one sentence on how to modernise the layout
}
Measure, do not guess: boxes must not overlap each other, must stay inside 0..100, and must reproduce the
true proportions and alignment of the scan so the rebuilt card looks like the original at a glance.
Report the true orientation: a wide card MUST return "landscape" with aspect > 1.
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
