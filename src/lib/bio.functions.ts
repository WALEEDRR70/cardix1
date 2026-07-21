import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const generateBio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      name: z.string().default(""),
      title: z.string().optional().default(""),
      company: z.string().optional().default(""),
      lang: z.enum(["en", "ar"]).default("en"),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const langInstr = data.lang === "ar" ? "Reply in Arabic." : "Reply in English.";
    const prompt = `Write a polished, elegant professional bio in 2 short sentences (max 220 characters). ${langInstr}
Name: ${data.name || "N/A"}
Title: ${data.title || "N/A"}
Company: ${data.company || "N/A"}
Return only the bio text, no quotes, no preamble.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You write concise, refined professional bios for business cards." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error(`AI error: ${await res.text()}`);
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    return { bio: text.trim().replace(/^["']|["']$/g, "") };
  });
