"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function DashMenu({ isAdmin, email }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex items-center justify-center w-9 h-9 -mr-1 text-xl text-slate-300 hover:text-white transition-colors"
      >
        {open ? "✕" : "☰"}
      </button>
      {open ? (
        <div className="absolute top-[70px] left-0 right-0 z-50 bg-[var(--color-navy-mid)]/95 backdrop-blur-xl border-b border-white/5 px-6 py-2 flex flex-col">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors border-b border-white/5"
          >
            🏠 My Teams
          </Link>
          {isAdmin ? (
            <Link
              href="/dashboard/admin"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors border-b border-white/5"
            >
              🛡️ Admin
            </Link>
          ) : null}
          <div className="py-3 text-xs text-slate-500 border-b border-white/5">{email}</div>
          <div className="py-3">
            <LogoutButton />
          </div>
        </div>
      ) : null}
    </div>
  );
}
