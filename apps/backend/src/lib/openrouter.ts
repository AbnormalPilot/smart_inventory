const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-4-maverick:free";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Stream a chat completion from OpenRouter.
 * Calls `onToken` for each text chunk and `onDone` with the full assembled text.
 */
export async function streamChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  onDone: (fullText: string) => void
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const msg = "OPENROUTER_API_KEY not set — cannot call AI.";
    onToken(msg);
    onDone(msg);
    return;
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "Smart Inventory AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
      max_tokens: 1024,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "Unknown error");
    const msg = `OpenRouter error (${res.status}): ${errText}`;
    onToken(msg);
    onDone(msg);
    return;
  }

  let full = "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          full += content;
          onToken(content);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  onDone(full);
}

/**
 * Non-streaming single completion (used for forecast insights).
 */
export async function completeChat(
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return "OPENROUTER_API_KEY not set.";

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "Smart Inventory AI",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
    return `OpenRouter error (${res.status})`;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "No response from AI.";
}
