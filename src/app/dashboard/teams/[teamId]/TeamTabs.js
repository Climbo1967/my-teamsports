"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TABS = [
  { slug: "", label: "Overview", icon: "🏟️" },
  { slug: "roster", label: "Roster", icon: "📋" },
  { slug: "schedule", label: "Schedule", icon: "📅" },
  { slug: "scorekeeper", label: "Scorekeeper", icon: "⚾" },
  { slug: "scouting", label: "Scouting", icon: "📈" },
  { slug: "ai-coach", label: "AI Coach", icon: "🧠" },
  { slug: "playbook", label: "Playbook", icon: "✏️" },
  { slug: "announcements", label: "Message Board", icon: "💬" },
  { slug: "notes", label: "Coach's Notes", icon: "📝" },
  { slug: "photos", label: "Photos", icon: "📸" },
  { slug: "videos", label: "Game Film", icon: "🎬" },
  { slug: "billing", label: "Billing", icon: "💳" },
  { slug: "support", label: "Support", icon: "🛟" },
  { slug: "manual", label: "Manual", icon: "📖" },
  { slug: "settings", label: "Settings", icon: "⚙️" },
];

export default function TeamTabs({ teamId, showBoard = false }) {
  const pathname = usePathname();
  const base = `/dashboard/teams/${teamId}`;
  const activeRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep the active tab visible — without this, deep tabs (Manual, Settings)
  // render with the highlight scrolled off-screen, especially on phones.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  // Ships dark: the board tab only exists once the team's flag is flipped.
  const tabs = showBoard
    ? TABS.flatMap((t) => (t.slug === "announcements" ? [t, { slug: "board", label: "Team Board", icon: "🗣️" }] : [t]))
    : TABS;

  const hrefFor = (tab) => (tab.slug ? `${base}/${tab.slug}` : base);
  const isActive = (tab) => (tab.slug ? pathname.startsWith(hrefFor(tab)) : pathname === base);

  return (
    <nav className="relative border-b border-white/[0.08] -mx-2">
      <div className="flex items-stretch">
        {/* The scroller: only this clips, so the ☰ panel below can escape it. */}
        <div className="flex-1 min-w-0 flex gap-1 overflow-x-auto px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.label}
                href={hrefFor(tab)}
                ref={active ? activeRef : null}
                onClick={() => setMenuOpen(false)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-[var(--color-accent-blue)] text-white"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* 16 tabs never fit: ~3 on a phone, ~11 on a 1280px laptop, and the
            scrollbar is hidden — so the rest are invisible at EVERY width.
            The button stays visible everywhere on purpose. */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close team menu" : "Open team menu"}
          className="flex items-center justify-center w-11 shrink-0 self-stretch text-xl text-slate-300 hover:text-white transition-colors border-l border-white/[0.08]"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen ? (
        <div className="absolute top-full left-0 right-0 z-40 bg-[var(--color-navy-mid)] border-x border-b border-white/[0.08] rounded-b-xl shadow-2xl shadow-black/50 p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 max-h-[70vh] overflow-y-auto">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <Link
                key={tab.label}
                href={hrefFor(tab)}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-500/15 text-white border border-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </nav>
  );
}
