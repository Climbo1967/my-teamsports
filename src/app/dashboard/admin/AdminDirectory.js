"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS, SPORT_EMOJI, sportLabel } from "@/lib/constants";
import { Card, Select, Label } from "@/components/ui";
import { FILL_INS, fillTemplate, tokensUsed } from "@/lib/coachEmailPlan";

const KIND_LABELS = { welcome: "Welcome", trial_ending: "Trial ending", trial_ended: "Trial ended", admin: "From you" };

// emailMeta: { [email]: { greeting, values, missing, optOut } } for every coach
// with an account, or null when the email log isn't set up (sending is then off).
// emailLog: the most recent emails the app sent to coaches.
// children: panels the page wants directly under the summary tiles and above
// the Email Coaches card (activation funnel, AI Coach use, support requests).
export default function AdminDirectory({ data, counters = {}, emailMeta = null, emailLog = [], children = null }) {
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
  const messageRef = useRef(null);
  const router = useRouter();

  // Put a fill-in where the cursor is (or at the end), then put the cursor
  // back right after it so typing carries on naturally.
  function insertFillIn(token) {
    const el = messageRef.current;
    const start = el ? el.selectionStart : messageBody.length;
    const end = el ? el.selectionEnd : messageBody.length;
    setMessageBody(messageBody.slice(0, start) + token + messageBody.slice(end));
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  }

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

  // Who actually gets it: coaches who unsubscribed are always left out, and so
  // is anyone invited but not signed up yet (no account = no unsubscribe link).
  const metaFor = (email) => (emailMeta ? emailMeta[email] : undefined);
  const sendable = emailMeta ? recipients.filter((c) => metaFor(c.email) && !metaFor(c.email).optOut) : recipients;
  const optedOutCount = emailMeta ? recipients.filter((c) => metaFor(c.email)?.optOut).length : 0;
  const noAccountCount = emailMeta ? recipients.filter((c) => !metaFor(c.email)).length : 0;

  // Fill-ins: what the first coach will actually read, and who falls back to
  // generic wording because they have no team or no trial date.
  const used = tokensUsed(`${subject} ${messageBody}`);
  const first = sendable[0] ? metaFor(sendable[0].email) : null;
  const preview = first && messageBody.trim() ? `Hi ${first.greeting},\n\n${fillTemplate(messageBody, first.values)}` : "";
  const generic = emailMeta && used.length > 0
    ? sendable.filter((c) => used.some((t) => metaFor(c.email).missing.includes(t)))
    : [];

  const emails = sendable.map((c) => c.email);
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
    if (sending || !emailMeta || emails.length === 0 || !subject.trim() || !messageBody.trim()) return;
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
        const left = [
          data.optedOut ? `${data.optedOut} unsubscribed` : "",
          data.noAccount ? `${data.noAccount} without an account` : "",
        ].filter(Boolean).join(", ");
        setSendNotice({
          ok: true,
          text: `✓ Sent to ${data.sent} coach${data.sent === 1 ? "" : "es"} from noreply@my-teamsports.com — replies come straight to your inbox.${left ? ` Left out: ${left}.` : ""}`,
        });
        setMessageBody("");
        router.refresh(); // pull the new rows into the sent log below
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
    // The two share actions — the only real "value" signals in onboarding.
    // Counted since 2026-09-29; coach previews of their own site are excluded
    // from "Team-site views" above, so that one stays parents-only.
    { label: "Invite copied", value: fmt(counters.invite_copied), icon: "📋" },
    { label: "Coach viewed own site", value: fmt(counters.team_site_viewed), icon: "👀" },
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

      {/* ACTIVATION FUNNEL, AI COACH USE, SUPPORT REQUESTS (passed in by the page) */}
      {children}

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
            ref={messageRef}
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            maxLength={5000}
            rows={6}
            placeholder='Write your message once — each coach gets their own email starting "Hi <first name>,"'
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)]"
          />
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-slate-500">Fill-ins (tap to add, each coach gets their own):</span>
            {FILL_INS.filter((f) => f.token !== "{first_name}").map((f) => (
              <button
                key={f.token}
                type="button"
                onClick={() => insertFillIn(f.token)}
                title={f.label}
                className="text-xs font-mono text-slate-300 bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1 hover:bg-white/[0.08] transition-colors"
              >
                {f.token}
              </button>
            ))}
          </div>
        </div>
        {preview && (
          <div className="mb-4 rounded-lg border border-white/[0.08] bg-black/20 px-4 py-3">
            <p className="text-xs text-slate-500 mb-2 break-words"><span className="uppercase tracking-widest">Preview</span> &middot; as {sendable[0].email} will read it</p>
            <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">{preview}</p>
          </div>
        )}
        {generic.length > 0 && (
          <p className="text-sm text-yellow-400 mb-3">
            {generic.length} coach{generic.length === 1 ? "" : "es"} will get generic wording for a fill-in (no team or no trial date on file):{" "}
            <span className="text-slate-400">{generic.map((c) => c.email).join(", ")}</span>
          </p>
        )}
        {!emailMeta && (
          <p className="text-sm text-yellow-400 mb-3">
            Sending from the app is off: the email log isn&apos;t set up on the database yet.
          </p>
        )}
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
          {(optedOutCount > 0 || noAccountCount > 0) && (
            <span className="block text-xs text-slate-500 mt-1">
              Left out: {[optedOutCount ? `${optedOutCount} unsubscribed` : "", noAccountCount ? `${noAccountCount} invited, no account yet` : ""].filter(Boolean).join(" · ")}
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={sendFromApp}
            disabled={sending || !emailMeta || emails.length === 0 || !subject.trim() || !messageBody.trim()}
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
          Send delivers one email per coach from noreply@my-teamsports.com with a personal greeting and an unsubscribe link — replies go to your address. The green button needs a subject and a message. The other two buttons are the old way (your own email app, everyone BCC&apos;d).
        </p>
        {sendNotice && (
          <p className={`text-sm mt-2 ${sendNotice.ok ? "text-green-400" : "text-red-400"}`}>{sendNotice.text}</p>
        )}
      </Card>

      {/* SENT LOG */}
      <h2 className="text-xl font-bold mb-1">EMAILS SENT TO COACHES ({emailLog.length})</h2>
      <p className="text-sm text-slate-500 mb-4">Everything the app has sent: the automatic welcome and trial emails, and what you send from here. Newest first.</p>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] mb-10 max-h-96 overflow-y-auto">
        {emailLog.length === 0 ? (
          <p className="text-sm text-slate-500 px-4 py-6">Nothing sent yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left sticky top-0">
              <tr>
                <th className="py-3 px-4 text-slate-400 font-medium">When</th>
                <th className="py-3 px-4 text-slate-400 font-medium">To</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Type</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Subject</th>
                <th className="py-3 px-4 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {emailLog.map((e) => (
                <tr key={e.id} className="border-t border-white/[0.05]">
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} CT
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{e.email}</td>
                  <td className="py-2.5 px-4 text-slate-300 whitespace-nowrap">{KIND_LABELS[e.kind] || e.kind}</td>
                  <td className="py-2.5 px-4 text-slate-300">{e.subject}</td>
                  <td className={`py-2.5 px-4 whitespace-nowrap ${e.status === "failed" ? "text-red-400" : e.status === "sent" ? "text-green-400" : "text-slate-400"}`}>
                    {e.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                  <p className="text-white font-medium">
                    {c.full_name || "—"}
                    {metaFor(c.email)?.optOut && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-red-400 border border-red-400/30 rounded px-1.5 py-0.5">Unsubscribed</span>
                    )}
                  </p>
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
