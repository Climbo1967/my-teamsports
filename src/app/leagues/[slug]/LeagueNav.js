"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "", label: "Home" },
  { slug: "schedule", label: "Schedule" },
  { slug: "standings", label: "Standings" },
];

export default function LeagueNav({ leagueSlug }) {
  const pathname = usePathname();
  const base = `/leagues/${leagueSlug}`;
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/5 px-4 sm:px-6" aria-label="League sections">
      {TABS.map((t) => {
        const href = t.slug ? `${base}/${t.slug}` : base;
        const active = t.slug ? pathname.startsWith(href) : pathname === base;
        return (
          <Link
            key={t.slug}
            href={href}
            className={`whitespace-nowrap px-4 py-3 text-sm font-semibold tracking-wide border-b-2 -mb-px transition-colors ${
              active
                ? "border-[var(--color-accent-blue)] text-white"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {t.label.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
