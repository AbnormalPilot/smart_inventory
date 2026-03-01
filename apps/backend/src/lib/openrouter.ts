const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Primary model for streaming chat */
const PRIMARY_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free";

/** Pool of free models — used in parallel for headlines / batch work */
export const MODEL_POOL = [
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "stepfun/step-3.5-flash:free",
  "arcee-ai/trinity-large-preview:free",
  "arcee-ai/trinity-mini:free",
] as const;

export type ModelId = (typeof MODEL_POOL)[number];

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3001",
    "X-Title": "Smart Inventory AI",
  };
}

/**
 * Stream a chat completion from OpenRouter (uses primary model).
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
    headers: headers(apiKey),
    body: JSON.stringify({
      model: PRIMARY_MODEL,
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
 * Non-streaming completion with a specific model.
 */
export async function completeChatWithModel(
  model: string,
  messages: ChatMessage[],
  maxTokens = 200
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return "OPENROUTER_API_KEY not set.";

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
  });

  if (!res.ok) {
    return `OpenRouter error (${res.status})`;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "No response from AI.";
}

/**
 * Non-streaming completion using primary model (backward compat).
 */
export async function completeChat(
  messages: ChatMessage[]
): Promise<string> {
  return completeChatWithModel(PRIMARY_MODEL, messages);
}

/**
 * Fire multiple completions in parallel across different models.
 * Returns results in same order as the tasks array.
 * Each failed call returns null instead of throwing.
 */
export async function parallelComplete(
  tasks: Array<{ model: string; messages: ChatMessage[]; maxTokens?: number }>
): Promise<Array<string | null>> {
  return Promise.all(
    tasks.map(async (t) => {
      try {
        return await completeChatWithModel(t.model, t.messages, t.maxTokens ?? 200);
      } catch {
        return null;
      }
    })
  );
}
