"use client";

import { useSyncExternalStore } from "react";

// Renders a stored timestamp in the viewer's own time zone. Server components
// run in UTC on Vercel, so formatting there shows a 6:00 PM Central game as
// 11:00 PM; this waits for the browser and formats with its clock instead.
// Nothing is rendered until then, so server HTML and the first client render
// match (no hydration mismatch).
const subscribe = () => () => {};
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

export default function LocalDateTime({ iso, date = true, time = true, dateOptions, timeOptions, separator = " · " }) {
  const mounted = useMounted();
  if (!mounted || !iso) return <span aria-hidden="true">&nbsp;</span>;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = [];
  if (date) parts.push(d.toLocaleDateString("en-US", dateOptions || { weekday: "short", month: "short", day: "numeric" }));
  if (time) parts.push(d.toLocaleTimeString("en-US", timeOptions || { hour: "numeric", minute: "2-digit" }));
  return <>{parts.join(separator)}</>;
}
