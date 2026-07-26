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
    const { openaiChat } = await import("@/lib/ai/openai.server");

    const langInstr = data.lang === "ar" ? "Reply in Arabic." : "Reply in English.";
    const prompt = `Write a polished, elegant professional bio in 2 short sentences (max 220 characters). ${langInstr}
Name: ${data.name || "N/A"}
Title: ${data.title || "N/A"}
Company: ${data.company || "N/A"}
Return only the bio text, no quotes, no preamble.`;

    const text = await openaiChat({
      model: "gpt-4o-mini",
      maxTokens: 300,
      messages: [
        { role: "system", content: "You write concise, refined professional bios for business cards." },
        { role: "user", content: prompt },
      ],
    });
    return { bio: text.trim().replace(/^["']|["']$/g, "") };
  });
