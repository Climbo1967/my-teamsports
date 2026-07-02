// Fire-and-forget web-push trigger for game start/final. Never blocks or breaks scoring.
export function notifyGame(payload) {
  try {
    fetch("/api/push/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true, // survive the navigation that follows End game
    }).catch(() => {});
  } catch (e) {
    /* ignore — alerts are best-effort */
  }
}

// ---- Push slice 3: schedule-change alerts with client-side digest batching ----
// Changes made within ~25s of each other are bundled into ONE notification.
// Flushes on timer, tab hide, or navigation (keepalive survives page changes).
const schedBuffers = new Map(); // teamId -> { changes: [], timer: null }

export function queueScheduleAlert(teamId, change) {
  if (!teamId || !change) return;
  let buf = schedBuffers.get(teamId);
  if (!buf) { buf = { changes: [], timer: null }; schedBuffers.set(teamId, buf); }
  buf.changes.push(change);
  if (buf.timer) clearTimeout(buf.timer);
  buf.timer = setTimeout(() => flushScheduleAlerts(teamId), 25_000);
}

export function flushScheduleAlerts(teamId) {
  const buf = schedBuffers.get(teamId);
  if (!buf || buf.changes.length === 0) return;
  const changes = buf.changes.splice(0, buf.changes.length);
  if (buf.timer) { clearTimeout(buf.timer); buf.timer = null; }
  try {
    fetch("/api/push/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, changes }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    /* ignore - alerts are best-effort */
  }
}

function flushAllScheduleAlerts() {
  for (const teamId of schedBuffers.keys()) flushScheduleAlerts(teamId);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushAllScheduleAlerts);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAllScheduleAlerts();
  });
}
