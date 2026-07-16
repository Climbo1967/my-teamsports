"use client";

import { useState } from "react";
import Link from "next/link";

const MENU_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export default function MobileMenu({ links = MENU_LINKS }) {
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
        <div className="absolute top-[70px] left-0 right-0 bg-[var(--color-navy)]/95 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors border-b border-white/5 last:border-b-0"
            >
              {l.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
