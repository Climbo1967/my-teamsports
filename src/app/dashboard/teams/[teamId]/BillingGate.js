"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Renew gate for expired teams. Lock model: coach dashboard only —
 * the public team site never locks. The billing tab stays reachable
 * so the coach can actually pay.
 */
export default function BillingGate({ teamId, expired, children }) {
  const pathname = usePathname();
  const onBillingPage = pathname.includes(`/dashboard/teams/${teamId}/billing`);

  if (!expired || onBillingPage) return children;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-40" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center pt-10">
        <div className="bg-[var(--color-navy-mid,#101d33)] border border-white/[0.12] rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold mb-2">SEASON PASS EXPIRED</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            Your team site is still live for parents — nothing was taken down. Renew the Season
            Pass to unlock coaching tools: roster, schedule, scoring, playbook, and alerts.
          </p>
          <Link
            href={`/dashboard/teams/${teamId}/billing`}
            className="inline-block bg-[var(--color-accent-blue)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide px-8 py-3 rounded-xl hover:bg-blue-600 transition-all"
          >
            RENEW SEASON PASS →
          </Link>
        </div>
      </div>
    </div>
  );
}
