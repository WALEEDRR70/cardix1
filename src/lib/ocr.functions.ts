import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ExtractedCard = z.object({
  name: z.string().default(""),
  title: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

export const scanBusinessCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ imageDataUrl: z.string().min(20) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { openaiChat } = await import("@/lib/ai/openai.server");

    const text = await openaiChat({
      model: "gpt-4o",
      json: true,
      maxTokens: 1000,
      messages: [
        {
          role: "system",
          content:
            "You extract business card details from an image. Return ONLY valid JSON matching the schema. Use null for missing fields. Never invent data.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Extract the person\'s contact details from this business card. Respond with JSON: {"name":"","title":null,"company":null,"phone":null,"whatsapp":null,"email":null,"website":null,"address":null,"bio":null}',
            },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }
    return ExtractedCard.parse(parsed);
  });
