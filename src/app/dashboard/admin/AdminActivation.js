"use client";

import { Card } from "@/components/ui";

/**
 * Activation funnel. ACTIVATED means a coach has a real roster — an empty team
 * is a dead team. The wizard completes at 1 player so nobody typing them in one
 * at a time gets blocked, but the internal bar is 3+.
 *
 * "Team, no roster" is the drop-off to attack — that is exactly the step the
 * Getting Started wizard exists to close.
 */
export default function AdminActivation({ data }) {
  const a = data?.activation;
  if (!a) return null;

  const signups = Number(a.signups || 0);
  const pct = (n) => (signups ? Math.round((Number(n || 0) / signups) * 100) : 0);

  const steps = [
    { label: "Signed up", value: a.signups, tone: "text-white" },
    { label: "Created a team", value: a.team_created, tone: "text-white" },
    { label: "Added a roster (1+)", value: a.roster_1plus, tone: "text-[var(--color-accent-blue)]" },
    { label: "Real roster (3+)", value: a.roster_3plus, tone: "text-[var(--color-accent-green)]" },
  ];

  const sources = Array.isArray(a.by_source) ? a.by_source : [];
  const dist = a.step_distribution || {};

  return (
    <Card className="mb-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="text-lg font-semibold text-white">Activation Funnel</h2>
        <p className="text-xs text-slate-500">
          Activated = a coach with 3 or more players on a roster
        </p>
      </div>

      <div className="space-y-2.5 mt-5">
        {steps.map((s) => (
          <div key={s.label}>
            <div className="flex items-baseline justify-between text-sm mb-1">
              <span className="text-slate-400">{s.label}</span>
              <span className={`font-semibold ${s.tone}`}>
                {Number(s.value || 0).toLocaleString()}
                <span className="text-slate-500 font-normal ml-2">{pct(s.value)}%</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-green)]"
                style={{ width: `${pct(s.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <Stat
          label="Team, no roster"
          value={a.stuck_no_roster}
          hint="The drop-off to attack"
          alert
        />
        <Stat label="Never created a team" value={a.never_started} />
        <Stat label="Skipped the wizard" value={a.skipped} />
        <Stat label="Step 0 / 2" value={`${dist["0"] || 0} / ${dist["2"] || 0}`} />
      </div>

      {sources.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Signup source
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Campaign</th>
                  <th className="py-2 pr-4 font-medium text-right">Signups</th>
                  <th className="py-2 font-medium text-right">Activated</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s, i) => (
                  <tr key={i} className="border-t border-white/[0.06]">
                    <td className="py-2 pr-4 text-slate-300">{s.source}</td>
                    <td className="py-2 pr-4 text-slate-500">{s.campaign || "—"}</td>
                    <td className="py-2 pr-4 text-right text-white">{s.signups}</td>
                    <td className="py-2 text-right text-[var(--color-accent-green)]">
                      {s.activated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Source is captured at sign-up. Accounts created before that shipped
            show as direct/unknown.
          </p>
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, hint, alert = false }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 border ${
        alert
          ? "bg-amber-500/[0.06] border-amber-500/25"
          : "bg-white/[0.03] border-white/[0.06]"
      }`}
    >
      <p className={`text-xl font-bold ${alert ? "text-amber-300" : "text-white"}`}>
        {typeof value === "number" ? value.toLocaleString() : value ?? 0}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      {hint && <p className="text-[11px] text-slate-600 mt-0.5">{hint}</p>}
    </div>
  );
}
