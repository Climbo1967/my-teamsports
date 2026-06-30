// Server-side Anthropic Claude call (REST, no SDK needed).
// Needs ANTHROPIC_API_KEY in the environment; returns { ok:false } gracefully if absent.
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function askClaude({ system, prompt, maxTokens = 1100 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: "The AI coach isn't configured yet." };
  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, error: `Anthropic ${res.status}: ${detail.slice(0, 300)}` };
    }
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}
