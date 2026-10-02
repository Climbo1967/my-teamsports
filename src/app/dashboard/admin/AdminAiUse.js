import { Card } from "@/components/ui";

const when = (iso) =>
  iso
    ? `${new Date(iso).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} CT`
    : "—";
const day = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", year: "numeric" }) : null;

/**
 * AI Coach use, from the use log (ai_coach_events).
 * `summary` is the output of summarizeAiUse(), or null when the log table
 * isn't there yet. `truncated` means only the newest events were read.
 */
export default function AdminAiUse({ summary, truncated = false }) {
  if (!summary) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-1">AI COACH USE</h2>
        <p className="text-sm text-slate-500">The AI Coach use log isn&apos;t set up yet, so nothing is being counted.</p>
      </div>
    );
  }

  const { realTeams, since, tools, reach7, reachAll, byTeam } = summary;
  const cards = [
    { label: "Opened the AI Coach", d7: reach7.opened, all: reachAll.opened, tone: "text-white" },
    { label: "Used a tool", d7: reach7.used, all: reachAll.used, tone: "text-[var(--color-accent-green)]" },
    { label: "Opened, used nothing", d7: reach7.openedNoUse, all: reachAll.openedNoUse, tone: "text-amber-400" },
    { label: "Saw the locked card", d7: reach7.locked, all: reachAll.locked, tone: "text-red-400" },
  ];

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-1">AI COACH USE</h2>
      <p className="text-sm text-slate-500 mb-4">
        What real coaches did with the AI Coach, out of {realTeams} team{realTeams === 1 ? "" : "s"}.{" "}
        {since ? `Counting since ${day(since)}; nothing before that was recorded.` : "Nothing logged yet. Counting starts with the first coach who opens the AI Coach tab."}{" "}
        Your own and test accounts are left out.
        {truncated ? " Showing the most recent 20,000 events only." : ""}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <Card key={c.label} className="!p-4">
            <div className={`text-2xl font-bold ${c.tone}`}>{c.d7}</div>
            <div className="text-xs text-slate-400 mt-1">{c.label}</div>
            <div className="text-[11px] text-slate-500 mt-1">teams, last 7 days · {c.all} all time</div>
          </Card>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] mb-6">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left">
            <tr>
              <th className="py-3 px-4 text-slate-400 font-medium">Tool</th>
              <th className="py-3 px-4 text-slate-400 font-medium whitespace-nowrap">Uses, last 7 days</th>
              <th className="py-3 px-4 text-slate-400 font-medium whitespace-nowrap">Uses, all time</th>
              <th className="py-3 px-4 text-slate-400 font-medium whitespace-nowrap">Teams, all time</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.kind} className="border-t border-white/[0.05]">
                <td className="py-2.5 px-4 text-slate-300 whitespace-nowrap">{t.label}</td>
                <td className="py-2.5 px-4 text-slate-300">{t.d7}</td>
                <td className="py-2.5 px-4 text-slate-300">{t.all}</td>
                <td className="py-2.5 px-4 text-slate-300">{t.teamsAll}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] max-h-96 overflow-y-auto">
        {byTeam.length === 0 ? (
          <p className="text-sm text-slate-500 px-4 py-6">No real coach has opened the AI Coach since counting started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left sticky top-0">
              <tr>
                <th className="py-3 px-4 text-slate-400 font-medium">Team</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Coach</th>
                <th className="py-3 px-4 text-slate-400 font-medium whitespace-nowrap">Last opened</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Briefing</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Practice</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Lineup</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Chat</th>
                <th className="py-3 px-4 text-slate-400 font-medium whitespace-nowrap">Last use</th>
              </tr>
            </thead>
            <tbody>
              {byTeam.map((t) => (
                <tr key={t.teamId} className="border-t border-white/[0.05]">
                  <td className="py-2.5 px-4 text-slate-300 min-w-[140px]">{t.name}</td>
                  <td className="py-2.5 px-4 text-slate-400 min-w-[180px] break-all">{t.coachEmail}</td>
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                    {when(t.lastOpenedAt || t.lastLockedAt)}
                    {t.lastLockedAt && (!t.lastOpenedAt || t.lastLockedAt > t.lastOpenedAt) ? <span className="ml-2 text-[10px] uppercase tracking-wide bg-red-500/15 text-red-400 rounded px-1.5 py-0.5">Locked</span> : null}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{t.briefing}</td>
                  <td className="py-2.5 px-4 text-slate-300">{t.practice}</td>
                  <td className="py-2.5 px-4 text-slate-300">{t.lineup}</td>
                  <td className="py-2.5 px-4 text-slate-300">{t.chat}</td>
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">{when(t.lastUseAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
