"use client";

import Link from "next/link";
import { pingCounter } from "@/components/ViewPing";

// A next/link that bumps a site counter when clicked. Usable from server
// components (this file is the client boundary). Navigation is never delayed —
// the ping is fire-and-forget.
export default function CountedLink({ counterKey, onClick, ...props }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        pingCounter(counterKey);
        if (onClick) onClick(e);
      }}
    />
  );
}
