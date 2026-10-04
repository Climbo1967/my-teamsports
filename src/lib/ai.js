// Server-side Anthropic Claude call (REST, no SDK needed).
// Needs ANTHROPIC_API_KEY in the environment; returns { ok:false } gracefully if absent.
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

// What the coach reads when the call fails. The provider's own response
// (status, JSON body) goes to the server log only — coaches were seeing raw
// text like `Anthropic 529: {"type":"error",...}` on screen.
export const AI_BUSY_MSG = "The AI coach is busy right now. Give it a minute and try again.";
const AI_FAILED_MSG = "The AI coach couldn't answer. Try again in a minute.";
const AI_SETUP_MSG = "The AI coach isn't set up correctly right now. Ron has been notified by the error log.";

function friendlyError(status, detail) {
  console.error(`[ai] Anthropic ${status}: ${String(detail || "").slice(0, 500)}`);
  if (status === 429 || status === 529 || status === 503) return AI_BUSY_MSG;
  if (status === 401 || status === 403 || status === 404 || status === 400) return AI_SETUP_MSG;
  return AI_FAILED_MSG;
}

async function callAnthropic(body) {
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
      body: JSON.stringify({ model: AI_MODEL, ...body }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: friendlyError(res.status, detail) };
    }
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!text) {
      console.error(`[ai] empty reply, stop_reason=${data.stop_reason || "?"}`);
      return { ok: false, error: AI_FAILED_MSG };
    }
    return { ok: true, text };
  } catch (e) {
    console.error(`[ai] request failed: ${String(e?.message || e).slice(0, 300)}`);
    return { ok: false, error: AI_FAILED_MSG };
  }
}

export async function askClaude({ system, prompt, maxTokens = 1100 }) {
  return callAnthropic({ max_tokens: maxTokens, system, messages: [{ role: "user", content: prompt }] });
}

// Multi-turn variant for the AI Coach Chat: takes prior conversation turns
// instead of a single prompt. Same key, model, and error behavior as askClaude.
export async function askClaudeChat({ system, messages, maxTokens = 700 }) {
  return callAnthropic({ max_tokens: maxTokens, system, messages });
}
