// Direct OpenAI API access using the project's own OPENAI_API_KEY.
type Content = string | Array<Record<string, unknown>>;
export type ChatMessage = { role: "system" | "user" | "assistant"; content: Content };

export async function openaiChat(opts: {
  model?: string;
  messages: ChatMessage[];
  json?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: opts.model ?? "gpt-4o",
      messages: opts.messages,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      ...(opts.maxTokens ? { max_tokens: opts.maxTokens } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 401) throw new Error("INVALID_KEY");
    if (res.status === 402 || /quota/i.test(body)) throw new Error("NO_CREDITS");
    throw new Error(`AI error [${res.status}]: ${body}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}
