"use client";

import { useState } from "react";
import { inviteMessage } from "@/lib/constants";

export default function CopyInviteButton({ team }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(inviteMessage(team));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="bg-[var(--color-accent-green)] hover:bg-green-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all"
    >
      {copied ? "✓ Copied!" : "📋 Copy invite message"}
    </button>
  );
}
