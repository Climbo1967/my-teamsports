import { authorizeMonitor, monitorRpc, intParam } from "@/lib/monitor";

// GET /api/monitor/coach — AI Coach chat activity. Scope 'coach'.
//   ?since_hours=24  window (1..336)      ?limit=10  chats (1..50)
//   ?content=1       include messages (newest 40 per chat, flagged when cut)
//   ?chat_id=<team_id>:<coach_id>   one chat, whole, content included
// Default is metadata only (who, which team, how many messages, when):
// transcripts carry kids' names from rosters, so content is opt-in per call.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await authorizeMonitor(request, "coach");
  if (!auth.supabase) return auth;
  const url = new URL(request.url);
  const chatId = (url.searchParams.get("chat_id") || "").trim() || null;
  const content = /^(1|true|yes)$/i.test(url.searchParams.get("content") || "");
  return monitorRpc(auth.supabase, "monitor_coach_chats", {
    p_since_hours: intParam(url, "since_hours", 24, 1, 336),
    p_limit: intParam(url, "limit", 10, 1, 50),
    p_chat: chatId,
    p_content: content,
  });
}
