"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function TeamTabs({ teamId }) {
  const pathname = usePathname();
  const base = `/dashboard/teams/${teamId}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/[0.08] -mx-2 px-2">
      {TABS.map((tab) => {
        const href = tab.slug ? `${base}/${tab.slug}` : base;
        const active = tab.slug
          ? pathname.startsWith(href)
          : pathname === base;
        return (
          <Link
            key={tab.label}
            href={href}
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
    </nav>
  );
}
