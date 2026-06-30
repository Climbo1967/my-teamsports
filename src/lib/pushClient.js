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
