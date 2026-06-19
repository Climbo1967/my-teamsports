"use client";

import { useMemo, useState } from "react";
import { SPORT_EMOJI, sportLabel } from "@/lib/constants";
import { Card, Select, Label } from "@/components/ui";

export default function AdminDirectory({ data }) {
  const { totals, teams, coaches } = data;
  const [roleFilter, setRoleFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState("");

  const sports = useMemo(
    () => [...new Set(teams.map((t) => t.sport))].sort(),
    [teams]
  );

  const filtered = useMemo(() => {
    return coaches.filter((c) => {
      if (roleFilter === "owner" && !c.roles.includes("owner")) return false;
      if (roleFilter === "coach" && !c.roles.includes("coach")) return false;
      if (sportFilter !== "all" && !c.sports.includes(sportFilter)) return false;
      if (statusFilter === "signed_up" && !c.signed_up) return false;
      if (statusFilter === "invited" && c.signed_up) return false;
      return true;
    });
  }, [coaches, roleFilter, sportFilter, statusFilter]);

  const emails = filtered.map((c) => c.email);
  const mailto = `mailto:?bcc=${emails.join(",")}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`;

  async function copyEmails() {
    await navigator.clipboard.writeText(emails.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fmt = (n) => Number(n || 0).toLocaleString();

  const summary = [
    { label: "Coaches", value: totals.coaches, icon: "🧢" },
    { label: "Teams", value: totals.teams, icon: "🏟️" },
    { label: "Players", value: totals.players, icon: "📋" },
    { label: "Events", value: totals.events, icon: "📅" },
    { label: "Photos", value: totals.photos, icon: "📸" },
    { label: "Subscribers", value: totals.subscribers, icon: "🔔" },
    { label: "Homepage views", value: fmt(totals.homepage_views), icon: "🏠" },
    { label: "Team-site views", value: fmt(totals.team_views), icon: "👁️" },
  ];

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-1">ADMIN</h1>
      <p className="text-slate-400 mb-8">Who&apos;s using My-Team Sports, and tools to reach them.</p>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {summary.map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="font-[family-name:var(--font-oswald)] text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* COACH DIRECTORY + EMAIL TOOLS */}
      <Card className="mb-10">
        <h2 className="text-xl font-bold mb-4">📣 EMAIL COACHES</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Role</Label>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All coaches</option>
              <option value="owner">Head coaches only</option>
              <option value="coach">Assistant coaches only</option>
            </Select>
          </div>
          <div>
            <Label>Sport</Label>
            <Select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}>
              <option value="all">All sports</option>
              {sports.map((s) => (
                <option key={s} value={s} className="capitalize">{(SPORT_EMOJI[s] || "🏆") + " " + sportLabel(s)}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="signed_up">Signed up</option>
              <option value="invited">Invited, not signed up</option>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <Label>Subject (optional)</Label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={150}
            placeholder="News from My-Team Sports"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={emails.length > 0 ? mailto : undefined}
            className={`font-semibold text-sm px-5 py-2.5 rounded-lg transition-all ${
              emails.length > 0
                ? "bg-[var(--color-accent-green)] hover:bg-green-500 text-white"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            ✉️ Email {emails.length} coach{emails.length === 1 ? "" : "es"}
          </a>
          <button
            onClick={copyEmails}
            disabled={emails.length === 0}
            className="border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all disabled:opacity-40"
          >
            {copied ? "✓ Copied!" : "📋 Copy email list"}
          </button>
          <span className="text-xs text-slate-500">Opens your email app with everyone BCC&apos;d — addresses stay private.</span>
        </div>
      </Card>

      {/* COACHES TABLE */}
      <h2 className="text-xl font-bold mb-4">COACHES ({filtered.length})</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] mb-10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left">
            <tr>
              <th className="py-3 px-4 text-slate-400 font-medium">Coach</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Role</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Teams</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Last sign-in</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.email} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                <td className="py-3 px-4">
                  <p className="text-white font-medium">{c.full_name || "—"}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </td>
                <td className="py-3 px-4">
                  {!c.signed_up ? (
                    <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Invited</span>
                  ) : c.roles.includes("owner") ? (
                    <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Head Coach</span>
                  ) : c.roles.includes("coach") ? (
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assistant</span>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">No team yet</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {c.teams.length > 0 ? (
                    c.teams.map((t, i) => (
                      <span key={t}>
                        {i > 0 && ", "}
                        <span className="whitespace-nowrap">
                          {(SPORT_EMOJI[c.sports[i]] || "") + " "}{t}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {c.last_sign_in_at
                    ? new Date(c.last_sign_in_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </td>
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {c.joined_at
                    ? new Date(c.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TEAMS TABLE */}
      <h2 className="text-xl font-bold mb-4">TEAMS ({teams.length})</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left">
            <tr>
              <th className="py-3 px-4 text-slate-400 font-medium">Team</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Sport</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Players</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Coaches</th>
              <th className="py-3 px-4 text-slate-400 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id} className="border-t border-white/[0.05] hover:bg-white/[0.02]">
                <td className="py-3 px-4">
                  <a href={`/team/${t.slug}`} target="_blank" className="text-white font-medium hover:text-[var(--color-accent-blue)]">
                    {t.name}
                  </a>
                  {t.season && <p className="text-xs text-slate-500">{t.season}</p>}
                </td>
                <td className="py-3 px-4 text-slate-300 capitalize">{(SPORT_EMOJI[t.sport] || "🏆") + " " + sportLabel(t.sport)}</td>
                <td className="py-3 px-4 text-slate-300">{t.players}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{t.coach_emails.join(", ")}</td>
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
