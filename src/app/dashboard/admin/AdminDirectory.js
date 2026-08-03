"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS, SPORT_EMOJI, sportLabel } from "@/lib/constants";
import { Card, Select, Label } from "@/components/ui";

export default function AdminDirectory({ data }) {
  const { totals, teams, coaches } = data;
  const [roleFilter, setRoleFilter] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendNotice, setSendNotice] = useState(null);
  const router = useRouter();

  // Keep the console live: soft-refresh the server data every 30s. Re-runs the
  // admin_overview fetch and reconciles in place, preserving filters and scroll.
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(id);
  }, [router]);

  const filtered = useMemo(() => {
    return coaches.filter((c) => {
      if (roleFilter === "owner" && !c.roles.includes("owner")) return false;
      if (roleFilter === "coach" && !c.roles.includes("coach")) return false;
      if (roleFilter === "none" && c.roles.length > 0) return false;
      if (sportFilter !== "all" && !c.sports.includes(sportFilter)) return false;
      if (statusFilter === "signed_up" && !c.signed_up) return false;
      if (statusFilter === "invited" && c.signed_up) return false;
      return true;
    });
  }, [coaches, roleFilter, sportFilter, statusFilter]);

  // Recipients: the coaches you've checked in the table — or, with nothing
  // checked, everyone matching the filters.
  const recipients = useMemo(() => {
    const inView = selected.size > 0 ? filtered.filter((c) => selected.has(c.email)) : filtered;
    return inView;
  }, [filtered, selected]);

  const emails = recipients.map((c) => c.email);
  const mailto = `mailto:?bcc=${emails.join(",")}${subject ? `&subject=${encodeURIComponent(subject)}` : ""}`;

  function toggleCoach(email) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.email));

  function toggleAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((c) => next.delete(c.email));
      else filtered.forEach((c) => next.add(c.email));
      return next;
    });
  }

  // Send through the app (Resend, noreply@my-teamsports.com) — one personalized
  // email per coach, replies come back to the signed-in admin.
  async function sendFromApp() {
    if (sending || emails.length === 0 || !subject.trim() || !messageBody.trim()) return;
    const n = emails.length;
    if (!window.confirm(`Send this to ${n} coach${n === 1 ? "" : "es"} from noreply@my-teamsports.com?`)) return;
    setSending(true);
    setSendNotice(null);
    try {
      const res = await fetch("/api/admin/email-coaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails, subject: subject.trim(), message: messageBody.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendNotice({ ok: false, text: data.error || "Sending failed — nothing went out." });
      } else {
        setSendNotice({
          ok: true,
          text: `✓ Sent to ${data.sent} coach${data.sent === 1 ? "" : "es"} from noreply@my-teamsports.com — replies come straight to your inbox.`,
        });
        setMessageBody("");
      }
    } catch {
      setSendNotice({ ok: false, text: "Network error — try again." });
    }
    setSending(false);
  }

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
      <p className="text-slate-400 mb-8">Who&apos;s using My-Team Sports, and tools to reach them. <span className="text-slate-600">· live &mdash; refreshes every 30s</span></p>

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
              <option value="none">No team yet</option>
            </Select>
          </div>
          <div>
            <Label>Sport</Label>
            <Select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}>
              <option value="all">All sports</option>
              {SPORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.emoji + " " + s.label}</option>
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
          <Label>Subject</Label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={150}
            placeholder="News from My-Team Sports"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
          />
        </div>
        <div className="mb-4">
          <Label>Message</Label>
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            maxLength={5000}
            rows={6}
            placeholder='Write your message once — each coach gets their own email starting "Hi <first name>,"'
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
          />
        </div>
        <p className="text-sm text-slate-400 mb-3">
          {selected.size > 0 ? (
            <>
              Sending to the <span className="text-white font-semibold">{emails.length}</span> coach{emails.length === 1 ? "" : "es"} checked in the table below ·{" "}
              <button onClick={() => setSelected(new Set())} className="underline hover:text-white">
                clear selection
              </button>
            </>
          ) : (
            <>
              Sending to all <span className="text-white font-semibold">{emails.length}</span> coach{emails.length === 1 ? "" : "es"} matching the filters — or check boxes in the table below to pick individual coaches.
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={sendFromApp}
            disabled={sending || emails.length === 0 || !subject.trim() || !messageBody.trim()}
            className="bg-[var(--color-accent-green)] hover:bg-green-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? "Sending…" : `📨 Send to ${emails.length} coach${emails.length === 1 ? "" : "es"}`}
          </button>
          <a
            href={emails.length > 0 ? mailto : undefined}
            className={`border border-white/10 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all ${
              emails.length > 0
                ? "text-slate-300 hover:bg-white/5"
                : "text-slate-600 cursor-not-allowed"
            }`}
          >
            ✉️ Open in my email app
          </a>
          <button
            onClick={copyEmails}
            disabled={emails.length === 0}
            className="border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all disabled:opacity-40"
          >
            {copied ? "✓ Copied!" : "📋 Copy email list"}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Send delivers one email per coach from noreply@my-teamsports.com with a personal greeting — replies go to your address. The other two buttons are the old way (your own email app, everyone BCC&apos;d).
        </p>
        {sendNotice && (
          <p className={`text-sm mt-2 ${sendNotice.ok ? "text-green-400" : "text-red-400"}`}>{sendNotice.text}</p>
        )}
      </Card>

      {/* COACHES TABLE */}
      <h2 className="text-xl font-bold mb-4">COACHES ({filtered.length})</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] mb-10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-left">
            <tr>
              <th className="py-3 pl-4 pr-1 w-8">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAllFiltered}
                  title="Select all shown"
                  className="h-4 w-4 accent-[var(--color-accent-blue)] cursor-pointer"
                />
              </th>
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
                <td className="py-3 pl-4 pr-1">
                  <input
                    type="checkbox"
                    checked={selected.has(c.email)}
                    onChange={() => toggleCoach(c.email)}
                    className="h-4 w-4 accent-[var(--color-accent-blue)] cursor-pointer"
                  />
                </td>
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
