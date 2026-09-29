"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Best-effort counter bump. Write-only for the public — counts can only be read
// back on the admin page. Never throws, never blocks. Keys must be in the
// allowlist inside the bump_counter RPC (see migrations/…_counters_share_clicks.sql).
export function pingCounter(key) {
  try {
    const supabase = createClient();
    supabase.rpc("bump_counter", { p_key: key }).then(
      () => {},
      () => {}
    );
  } catch {
    // Counting must never break the page.
  }
}

// Invisible page-view pinger. Fires once on mount.
export default function ViewPing({ pageKey }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    pingCounter(pageKey);
  }, [pageKey]);

  return null;
}
