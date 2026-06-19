"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Invisible page-view pinger. Fires a single best-effort bump_counter RPC on
// mount. The count is write-only for the public — it can only be read back on
// the admin page (RLS blocks anon/coach reads of site_counter).
export default function ViewPing({ pageKey }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    try {
      const supabase = createClient();
      supabase.rpc("bump_counter", { p_key: pageKey }).then(
        () => {},
        () => {}
      );
    } catch {
      // Counting is best-effort and must never block or break the page.
    }
  }, [pageKey]);

  return null;
}
