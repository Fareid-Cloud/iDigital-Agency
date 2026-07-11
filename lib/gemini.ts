/**
 * Minimal server-side Gemini client (Google AI Studio free tier).
 * Set GEMINI_API_KEY in the environment. All helpers return null when the
 * key is missing or the call fails, so callers can fall back gracefully.
 */

const MODEL = "gemini-2.5-flash";
const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

type GeminiPart = { text: string };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

async function callGemini(body: Record<string, unknown>): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(`${BASE}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) {
      console.error("Gemini error:", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: GeminiPart) => p.text ?? "")
        .join("");
    return text?.trim() || null;
  } catch (err) {
    console.error("Gemini request failed:", err);
    return null;
  }
}

/** One-shot prompt that must return strict JSON (uses responseMimeType). */
export async function geminiJSON<T>(
  prompt: string,
  system?: string
): Promise<T | null> {
  const text = await callGemini({
    ...(system
      ? { system_instruction: { parts: [{ text: system }] } }
      : {}),
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });
  if (!text) return null;
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as T;
  } catch {
    return null;
  }
}

/** Multi-turn chat. History roles: "user" | "model". */
export async function geminiChat(
  history: GeminiContent[],
  system: string
): Promise<string | null> {
  return callGemini({
    system_instruction: { parts: [{ text: system }] },
    contents: history,
    generationConfig: { temperature: 0.85, maxOutputTokens: 1024 },
  });
}

export type { GeminiContent };
