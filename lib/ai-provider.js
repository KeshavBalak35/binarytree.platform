const API_ENDPOINT = "https://apifreellm.com/api/v1/chat";
const DEFAULT_TIMEOUT_MS = 38000;
const FREE_TIER_COOLDOWN_MS = 20000;

let nextRequestAt = 0;

export class AIProviderError extends Error {
  constructor(message, code, status = 500) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
    this.status = status;
  }
}

export function isAIConfigured() {
  return Boolean(process.env.APIFREELLM_API_KEY?.trim());
}

export async function generateAIText(message, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const apiKey = process.env.APIFREELLM_API_KEY?.trim();
  if (!apiKey) throw new AIProviderError("AI is not configured.", "not_configured", 503);

  const now = Date.now();
  if (now < nextRequestAt) {
    throw new AIProviderError("The AI service is cooling down.", "rate_limited", 429);
  }
  nextRequestAt = now + FREE_TIER_COOLDOWN_MS;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        message: String(message || "").slice(0, 60000),
        model: process.env.APIFREELLM_MODEL || "apifreellm",
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {}

    if (response.status === 429) {
      throw new AIProviderError("The AI service is rate limited.", "rate_limited", 429);
    }
    if (response.status === 401) {
      throw new AIProviderError("The AI credential was rejected.", "unauthorized", 401);
    }
    if (!response.ok || payload?.success === false) {
      throw new AIProviderError("The AI service returned an error.", "provider_error", response.status || 502);
    }

    const text = String(payload?.response || "").trim();
    if (!text) throw new AIProviderError("The AI service returned an empty response.", "empty_response", 502);

    return {
      text,
      tier: payload?.tier || null,
      features: payload?.features || null,
    };
  } catch (error) {
    if (error instanceof AIProviderError) throw error;
    if (error?.name === "AbortError") throw new AIProviderError("The AI request timed out.", "timeout", 504);
    throw new AIProviderError("The AI service is unavailable.", "unavailable", 503);
  } finally {
    clearTimeout(timeout);
  }
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