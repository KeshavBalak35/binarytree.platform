const API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODELS = ["openai/gpt-oss-20b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"];
const DEFAULT_TIMEOUT_MS = 25000;

export class AIProviderError extends Error {
  constructor(message, code, status = 500) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
    this.status = status;
  }
}

export function isAIConfigured() {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

function normalizedMessages(input) {
  if (!Array.isArray(input)) return [{ role: "user", content: String(input || "").slice(0, 60000) }];
  return input.slice(-10).map((message) => ({
    role: ["system", "assistant"].includes(message?.role) ? message.role : "user",
    content: String(message?.content || "").slice(0, 16000),
  })).filter((message) => message.content);
}

function configuredModels(models) {
  const requested = Array.isArray(models) ? models : [];
  return [...new Set([process.env.GROQ_MODEL?.trim(), ...requested, ...DEFAULT_MODELS].filter(Boolean))];
}

export async function generateAIText(message, { timeoutMs = DEFAULT_TIMEOUT_MS, maxCompletionTokens = 1800, temperature = 0.2, json = false, models = [] } = {}) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new AIProviderError("AI is not configured.", "not_configured", 503);

  let lastError;
  for (const model of configuredModels(models)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: normalizedMessages(message),
          max_completion_tokens: maxCompletionTokens,
          temperature,
          ...(json ? { response_format: { type: "json_object" } } : {}),
        }),
        cache: "no-store",
        signal: controller.signal,
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {}

      if (response.status === 401 || response.status === 403) throw new AIProviderError("The AI credential was rejected.", "unauthorized", response.status);
      if (response.status === 429) throw new AIProviderError("The AI model is rate limited.", "rate_limited", 429);
      if (!response.ok) throw new AIProviderError("The AI service returned an error.", "provider_error", response.status || 502);

      const text = String(payload?.choices?.[0]?.message?.content || "").trim();
      if (!text) throw new AIProviderError("The AI service returned an empty response.", "empty_response", 502);
      return { text, model: payload?.model || model, usage: payload?.usage || null };
    } catch (error) {
      lastError = error instanceof AIProviderError
        ? error
        : error?.name === "AbortError"
          ? new AIProviderError("The AI request timed out.", "timeout", 504)
          : new AIProviderError("The AI service is unavailable.", "unavailable", 503);
      if (lastError.code === "unauthorized") throw lastError;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError || new AIProviderError("The AI service is unavailable.", "unavailable", 503);
}

export function parseAIJson(text) {
  const cleaned = String(text || "").replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const objectStart = cleaned.indexOf("{");
  const arrayStart = cleaned.indexOf("[");
  const startsWithArray = arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart);
  const start = startsWithArray ? arrayStart : objectStart;
  const end = startsWithArray ? cleaned.lastIndexOf("]") : cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) throw new AIProviderError("AI returned invalid JSON.", "invalid_json", 502);
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new AIProviderError("AI returned invalid JSON.", "invalid_json", 502);
  }
}