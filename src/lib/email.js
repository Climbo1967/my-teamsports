// Server-side email via Resend's REST API (no SDK dependency needed).
// All My-Team Sports mail goes out through the verified my-teamsports.com domain
// (matches the site — mismatched senders were landing in spam).
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const MAIL_FROM = "My-Team Sports <noreply@my-teamsports.com>";
export const SUPPORT_INBOX = "support@2bcreations.com";

export async function sendEmail({ to, bcc, subject, html, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Email is not configured yet." };

  const toList = Array.isArray(to) ? to : to ? [to] : [];
  const payload = { from: MAIL_FROM, subject };
  if (toList.length) payload.to = toList;
  if (bcc && bcc.length) payload.bcc = bcc;
  if (html) payload.html = html;
  if (text) payload.text = text;
  if (replyTo) payload.reply_to = replyTo;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${detail.slice(0, 300)}` };
    }
    const data = await res.json();
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

// Send up to 100 individual emails in ONE Resend API call (the /emails/batch
// endpoint). Used when each recipient needs their own personalized copy —
// looping sendEmail() would trip Resend's 2-requests/second limit and risk
// serverless timeouts. Each message: { to, subject, html, text, replyTo },
// plus optional `from` to override the default sender display name (must
// still be an address on the verified my-teamsports.com domain).
export async function sendEmailBatch(messages) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Email is not configured yet." };
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Nothing to send." };
  }
  if (messages.length > 100) {
    return { ok: false, error: "Batch too large — 100 emails max per call." };
  }

  const payload = messages.map((m) => {
    const item = { from: m.from || MAIL_FROM, to: Array.isArray(m.to) ? m.to : [m.to], subject: m.subject };
    if (m.html) item.html = m.html;
    if (m.text) item.text = m.text;
    if (m.replyTo) item.reply_to = m.replyTo;
    return item;
  });

  try {
    const res = await fetch(`${RESEND_ENDPOINT}/batch`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${detail.slice(0, 300)}` };
    }
    const data = await res.json();
    return { ok: true, ids: (data?.data || []).map((d) => d.id) };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

// Wrap plain text into a simple branded HTML email.
export function basicHtml({ heading, body, footer, unsubscribeUrl }) {
  const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paras = String(body || "")
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6;color:#0f172a;">${esc(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0a0e1a;padding:20px 28px;">
      <span style="color:#fff;font-weight:700;font-size:18px;letter-spacing:.5px;">MY-TEAM <span style="color:#2563eb;">SPORTS</span></span>
    </div>
    <div style="padding:28px;">
      ${heading ? `<h1 style="margin:0 0 16px;font-size:20px;color:#0f172a;">${esc(heading)}</h1>` : ""}
      ${paras}
    </div>
    ${footer || unsubscribeUrl ? `<div style="padding:16px 28px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">${esc(footer || "")}${unsubscribeUrl ? `<div style="margin-top:8px;"><a href="${esc(unsubscribeUrl)}" style="color:#64748b;text-decoration:underline;">Unsubscribe from these emails</a></div>` : ""}</div>` : ""}
  </div>
</body></html>`;
}
