"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, EmptyState, ErrorText, Input, Label, Select, Spinner } from "@/components/ui";
import { SPORTS } from "@/lib/constants";
import { LEAGUE_TZ, nowMs } from "@/lib/leagueFormat";
import ScheduleImport from "./ScheduleImport";
import ResultsTab from "./ResultsTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "teams", label: "Schools & Teams" },
  { key: "schedule", label: "Schedule" },
  { key: "results", label: "Results" },
  { key: "admins", label: "Admins" },
  { key: "settings", label: "Settings" },
];

const ROLE_RANK = { commissioner: 3, scheduler: 2, scorer: 1 };

export function fmtLocal(iso, opts = {}) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: LEAGUE_TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", ...opts,
  });
}

/**
 * League admin console. One RPC (get_league_admin) loads everything; every
 * write goes through a SECURITY DEFINER RPC that re-checks the caller's role.
 */
export default function LeagueConsole({ leagueId }) {
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");

  const load = useCallback(async () => {
    const { data: d, error: err } = await supabase.rpc("get_league_admin", { p_league_id: leagueId });
    if (err) { setError(err.message); setData(null); return; }
    setData(d);
  }, [supabase, leagueId]);

  useEffect(() => {
    let alive = true;
    supabase.rpc("get_league_admin", { p_league_id: leagueId }).then(({ data: d, error: err }) => {
      if (!alive) return;
      if (err) { setError(err.message); setData(null); } else setData(d);
    });
    return () => { alive = false; };
  }, [supabase, leagueId]);

  if (error) return <ErrorText>{error}</ErrorText>;
  if (!data) return <Spinner />;

  const role = data.role || (data.league ? "commissioner" : "scorer"); // site admins come through with no league_admins row
  const can = (min) => (ROLE_RANK[role] || 0) >= ROLE_RANK[min];
  const ctx = { supabase, data, reload: load, can, role };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-700/20 border border-white/10 flex items-center justify-center text-3xl">🏆</div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl md:text-3xl font-bold">{data.league.name.toUpperCase()}</h1>
          <p className="text-sm text-slate-500">
            You are <span className="text-slate-300 capitalize">{role}</span>
            {" · "}{data.teams.length} teams · {data.schools.length} schools · {data.games.length} games
          </p>
        </div>
        {data.league.is_public && (
          <Link href={`/leagues/${data.league.slug}`} target="_blank"
            className="text-sm font-medium text-[var(--color-accent-blue)] border border-blue-500/25 px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-colors">
            View public site ↗
          </Link>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/5 mb-8">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-semibold tracking-wide border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-[var(--color-accent-blue)] text-white" : "border-transparent text-slate-400 hover:text-white"}`}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab {...ctx} goTo={setTab} />}
      {tab === "teams" && <TeamsTab {...ctx} />}
      {tab === "schedule" && <ScheduleImport {...ctx} />}
      {tab === "results" && <ResultsTab {...ctx} />}
      {tab === "admins" && <AdminsTab {...ctx} />}
      {tab === "settings" && <SettingsTab {...ctx} />}
    </div>
  );
}

/* ----------------------------------------------------------------------- */

function OverviewTab({ data, goTo }) {
  const now = nowMs();
  const games = data.games;
  const unreported = games.filter((g) => g.status === "scheduled" && new Date(g.starts_at).getTime() < now - 3 * 3600e3);
  const week = games.filter((g) => { const t = new Date(g.starts_at).getTime(); return t >= now && t < now + 7 * 86400e3; });
  const awayReported = games.filter((g) => g.status === "final" && g.score_source === "away_scorer");
  const current = data.seasons.filter((s) => s.is_current);
  const teamName = (id) => data.teams.find((t) => t.id === id)?.name || "TBD";
  const school = (id) => data.schools.find((s) => s.id === data.teams.find((t) => t.id === id)?.school_id)?.short_name || "";
  const label = (id) => `${school(id)} ${teamName(id)}`.trim();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <h3 className="font-bold text-lg mb-3">SEASONS</h3>
        {data.seasons.length === 0 ? <p className="text-sm text-slate-500">No seasons yet — add one under Schools &amp; Teams.</p> : (
          <ul className="space-y-1 text-sm">
            {data.seasons.map((s) => (
              <li key={s.id} className="flex justify-between">
                <span className="text-white">{s.name} <span className="text-slate-500 capitalize">· {s.sport}</span></span>
                {s.is_current && <span className="text-xs text-[var(--color-accent-green)] font-semibold">CURRENT</span>}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-600 mt-3">{data.divisions.length} divisions across {current.length} current season{current.length === 1 ? "" : "s"}.</p>
      </Card>

      <Card className={unreported.length ? "border-yellow-500/30" : ""}>
        <h3 className="font-bold text-lg mb-3">NEEDS A SCORE</h3>
        {unreported.length === 0 ? <p className="text-sm text-slate-500">Every past game has a result. 👍</p> : (
          <>
            <ul className="space-y-1 text-sm">
              {unreported.slice(0, 6).map((g) => (
                <li key={g.id} className="text-slate-300">{fmtLocal(g.starts_at)} — {label(g.away_team_id)} at {label(g.home_team_id)}</li>
              ))}
            </ul>
            <button onClick={() => goTo("results")} className="mt-3 text-sm text-[var(--color-accent-blue)] hover:underline">
              Enter results ({unreported.length}) →
            </button>
          </>
        )}
        {awayReported.length > 0 && (
          <p className="text-xs text-yellow-400 mt-3">{awayReported.length} final{awayReported.length === 1 ? "" : "s"} reported by the away team only — worth a glance in Results.</p>
        )}
      </Card>

      <Card className="md:col-span-2">
        <h3 className="font-bold text-lg mb-3">NEXT 7 DAYS</h3>
        {week.length === 0 ? <p className="text-sm text-slate-500">Nothing scheduled this week.</p> : (
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {week.map((g) => (
              <div key={g.id} className="flex justify-between gap-3 py-1 border-b border-white/[0.04]">
                <span className="text-slate-500 shrink-0">{fmtLocal(g.starts_at, { weekday: "short" })}</span>
                <span className="text-slate-200 truncate">{label(g.away_team_id)} at {label(g.home_team_id)}</span>
                <span className="text-slate-600 shrink-0">{g.location || ""}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ----------------------------------------------------------------------- */

function TeamsTab({ supabase, data, reload, can }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const commissioner = can("commissioner");

  const currentSeason = data.seasons.find((s) => s.is_current) || data.seasons[0];
  const [seasonForm, setSeasonForm] = useState({ name: "", sport: "basketball", starts_on: "", ends_on: "", is_current: true });
  const [divForm, setDivForm] = useState({ season_id: currentSeason?.id || "", name: "" });
  const [schoolForm, setSchoolForm] = useState({ name: "", short_name: "", city: "" });
  const [teamForm, setTeamForm] = useState({ school_id: "", division_id: "", name: "", sport: currentSeason?.sport || "basketball", coach_email: "" });
  const [attachForm, setAttachForm] = useState({ slug: "", school_id: "", division_id: "" });

  async function run(fn) {
    setBusy(true); setError(null);
    try { await fn(); await reload(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const rpc = async (name, args) => { const { error: e } = await supabase.rpc(name, args); if (e) throw new Error(e.message); };

  const divisionsBySeason = (sid) => data.divisions.filter((d) => d.season_id === sid);
  const divLabel = (id) => { const d = data.divisions.find((x) => x.id === id); const s = d && data.seasons.find((x) => x.id === d.season_id); return d ? `${d.name}${s ? ` (${s.name})` : ""}` : "—"; };

  return (
    <div className="space-y-6">
      <ErrorText>{error}</ErrorText>

      <Card>
        <h3 className="font-bold text-lg mb-1">TEAMS ({data.teams.length})</h3>
        <p className="text-xs text-slate-500 mb-4">Each team gets its own site + passcode exactly like a solo team. Coaches you invite land on the team when they sign up with that email.</p>
        {data.teams.length === 0 ? <p className="text-sm text-slate-500">No teams yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/[0.06]">
                <th className="py-2 pr-3">Team</th><th className="py-2 pr-3">School</th><th className="py-2 pr-3">Division</th><th className="py-2 pr-3">Coaches</th><th className="py-2 pr-3">Passcode</th><th className="py-2">Roster</th>
              </tr></thead>
              <tbody>
                {data.teams.map((t) => {
                  const sc = data.schools.find((s) => s.id === t.school_id);
                  return (
                    <tr key={t.id} className="border-b border-white/[0.04]">
                      <td className="py-2 pr-3 text-white">
                        <Link href={`/team/${t.slug}`} target="_blank" className="hover:underline">{t.name}</Link>
                      </td>
                      <td className="py-2 pr-3 text-slate-300">{sc?.name || <span className="text-slate-600">—</span>}</td>
                      <td className="py-2 pr-3 text-slate-300">{divLabel(t.division_id)}</td>
                      <td className="py-2 pr-3 text-slate-400 text-xs">
                        {t.coaches.filter((c) => c.role !== "owner").map((c) => (
                          <span key={c.email} className={c.claimed ? "text-slate-300" : "text-yellow-400"} title={c.claimed ? "Signed up" : "Invited — not signed up yet"}>{c.email}{c.claimed ? "" : " (invited)"}</span>
                        ))}
                        {t.coaches.filter((c) => c.role !== "owner").length === 0 && <span className="text-slate-600">none yet</span>}
                      </td>
                      <td className="py-2 pr-3 font-mono text-slate-300 tracking-widest">{t.passcode}</td>
                      <td className="py-2 text-slate-400">{t.players}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {commissioner && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold mb-3">ADD A TEAM</h3>
            <div className="space-y-3">
              <div><Label>School</Label>
                <Select value={teamForm.school_id} onChange={(e) => setTeamForm({ ...teamForm, school_id: e.target.value })}>
                  <option value="">— none —</option>
                  {data.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select></div>
              <div><Label>Division</Label>
                <Select value={teamForm.division_id} onChange={(e) => setTeamForm({ ...teamForm, division_id: e.target.value })}>
                  <option value="">— none —</option>
                  {data.divisions.map((d) => <option key={d.id} value={d.id}>{divLabel(d.id)}</option>)}
                </Select></div>
              <div><Label>Team name</Label><Input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Varsity Boys" maxLength={60} /></div>
              <div><Label>Sport</Label>
                <Select value={teamForm.sport} onChange={(e) => setTeamForm({ ...teamForm, sport: e.target.value })}>
                  {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select></div>
              <div><Label>Coach email (optional)</Label><Input type="email" value={teamForm.coach_email} onChange={(e) => setTeamForm({ ...teamForm, coach_email: e.target.value })} placeholder="coach@school.org" /></div>
              <Button disabled={busy || !teamForm.name.trim()} onClick={() => run(async () => {
                await rpc("league_create_team", { p_league_id: data.league.id, p_school_id: teamForm.school_id || null, p_division_id: teamForm.division_id || null, p_name: teamForm.name, p_sport: teamForm.sport, p_coach_email: teamForm.coach_email || null });
                setTeamForm({ ...teamForm, name: "", coach_email: "" });
              })}>ADD TEAM</Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold mb-3">ADD A SCHOOL</h3>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} placeholder="St. Mark's Academy" maxLength={80} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Short name</Label><Input value={schoolForm.short_name} onChange={(e) => setSchoolForm({ ...schoolForm, short_name: e.target.value })} placeholder="St. Mark's" maxLength={40} /></div>
                  <div><Label>City</Label><Input value={schoolForm.city} onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })} placeholder="Austin" maxLength={60} /></div>
                </div>
                <Button variant="ghost" disabled={busy || !schoolForm.name.trim()} onClick={() => run(async () => {
                  await rpc("league_create_school", { p_league_id: data.league.id, p_name: schoolForm.name, p_short_name: schoolForm.short_name, p_city: schoolForm.city });
                  setSchoolForm({ name: "", short_name: "", city: "" });
                })}>ADD SCHOOL</Button>
              </div>
              {data.schools.length > 0 && (
                <p className="text-xs text-slate-500 mt-3">{data.schools.map((s) => s.name).join(" · ")}</p>
              )}
            </Card>

            <Card>
              <h3 className="font-bold mb-3">SEASONS &amp; DIVISIONS</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Season name</Label><Input value={seasonForm.name} onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })} placeholder="2026-27 Basketball" /></div>
                  <div><Label>Sport</Label>
                    <Select value={seasonForm.sport} onChange={(e) => setSeasonForm({ ...seasonForm, sport: e.target.value })}>
                      {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select></div>
                  <div><Label>Starts</Label><Input type="date" value={seasonForm.starts_on} onChange={(e) => setSeasonForm({ ...seasonForm, starts_on: e.target.value })} /></div>
                  <div><Label>Ends</Label><Input type="date" value={seasonForm.ends_on} onChange={(e) => setSeasonForm({ ...seasonForm, ends_on: e.target.value })} /></div>
                </div>
                <Button variant="ghost" disabled={busy || !seasonForm.name.trim()} onClick={() => run(async () => {
                  await rpc("league_create_season", { p_league_id: data.league.id, p_name: seasonForm.name, p_sport: seasonForm.sport, p_starts_on: seasonForm.starts_on || null, p_ends_on: seasonForm.ends_on || null, p_is_current: true });
                  setSeasonForm({ ...seasonForm, name: "" });
                })}>ADD SEASON (becomes current)</Button>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end pt-2 border-t border-white/[0.06]">
                  <div><Label>Season</Label>
                    <Select value={divForm.season_id} onChange={(e) => setDivForm({ ...divForm, season_id: e.target.value })}>
                      <option value="">—</option>
                      {data.seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select></div>
                  <div><Label>Division</Label><Input value={divForm.name} onChange={(e) => setDivForm({ ...divForm, name: e.target.value })} placeholder="Varsity Boys" /></div>
                  <Button variant="ghost" disabled={busy || !divForm.season_id || !divForm.name.trim()} onClick={() => run(async () => {
                    await rpc("league_create_division", { p_season_id: divForm.season_id, p_name: divForm.name, p_sort_order: divisionsBySeason(divForm.season_id).length + 1 });
                    setDivForm({ ...divForm, name: "" });
                  })}>ADD</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {can("scheduler") && (
        <Card>
          <h3 className="font-bold mb-1">ATTACH AN EXISTING TEAM</h3>
          <p className="text-xs text-slate-500 mb-3">A coach already on My-Team Sports? Enter their team link (the part after /team/) to bring that team into the league. Their site, roster and passcode stay exactly as they are.</p>
          <div className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <div><Label>Team link</Label><Input value={attachForm.slug} onChange={(e) => setAttachForm({ ...attachForm, slug: e.target.value })} placeholder="eastside-eagles-12u" /></div>
            <div><Label>School</Label>
              <Select value={attachForm.school_id} onChange={(e) => setAttachForm({ ...attachForm, school_id: e.target.value })}>
                <option value="">— none —</option>
                {data.schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select></div>
            <div><Label>Division</Label>
              <Select value={attachForm.division_id} onChange={(e) => setAttachForm({ ...attachForm, division_id: e.target.value })}>
                <option value="">— none —</option>
                {data.divisions.map((d) => <option key={d.id} value={d.id}>{divLabel(d.id)}</option>)}
              </Select></div>
            <Button variant="ghost" disabled={busy || !attachForm.slug.trim()} onClick={() => run(async () => {
              await rpc("league_attach_team", { p_league_id: data.league.id, p_team_slug: attachForm.slug, p_school_id: attachForm.school_id || null, p_division_id: attachForm.division_id || null });
              setAttachForm({ slug: "", school_id: "", division_id: "" });
            })}>ATTACH</Button>
          </div>
        </Card>
      )}

      {!commissioner && <p className="text-xs text-slate-600">Only a commissioner can add schools, seasons, divisions and teams.</p>}
    </div>
  );
}

/* ----------------------------------------------------------------------- */

function AdminsTab({ supabase, data, reload, can }) {
  const [form, setForm] = useState({ email: "", role: "scorer" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h3 className="font-bold text-lg mb-3">LEAGUE ADMINS</h3>
        <ul className="space-y-2 text-sm">
          {data.admins.map((a) => (
            <li key={a.id} className="flex justify-between gap-3">
              <span className="text-white">{a.email}{!a.claimed && <span className="text-yellow-400 text-xs ml-2">(hasn&apos;t signed up yet)</span>}</span>
              <span className="text-slate-400 capitalize">{a.role}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-600 mt-4">
          <b>Commissioner</b> — everything. <b>Scheduler</b> — schedule, reschedules, attach teams, results. <b>Scorer</b> — enter and lock results only.
          Admins never see rosters or coach notes; they see team names and league games.
        </p>
      </Card>
      {can("commissioner") && (
        <Card>
          <h3 className="font-bold mb-3">ADD AN ADMIN</h3>
          <ErrorText>{error}</ErrorText>
          <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ad@school.org" /></div>
            <div><Label>Role</Label>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="scorer">Scorer</option><option value="scheduler">Scheduler</option><option value="commissioner">Commissioner</option>
              </Select></div>
            <Button disabled={busy || !form.email.includes("@")} onClick={async () => {
              setBusy(true); setError(null);
              const { error: e } = await supabase.rpc("league_add_admin", { p_league_id: data.league.id, p_email: form.email, p_role: form.role });
              if (e) setError(e.message); else { setForm({ email: "", role: "scorer" }); await reload(); }
              setBusy(false);
            }}>ADD</Button>
          </div>
          <p className="text-xs text-slate-500 mt-3">They log in (or sign up) with that email and the league appears under 🏆 Leagues. No email is sent yet — tell them.</p>
        </Card>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------- */

function SettingsTab({ supabase, data, reload, can }) {
  const l = data.league;
  const [form, setForm] = useState({ name: l.name, short_name: l.short_name || "", primary_color: l.primary_color || "#3b82f6", website: l.website || "", contact_email: l.contact_email || "", is_public: !!l.is_public });
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!can("commissioner")) return <EmptyState icon="🔒" text="Only a commissioner can change league settings." />;
  return (
    <Card className="max-w-2xl">
      <h3 className="font-bold text-lg mb-4">LEAGUE SETTINGS</h3>
      <div className="space-y-3">
        <div><Label>League name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Short name</Label><Input value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} maxLength={30} /></div>
          <div><Label>Accent color</Label><Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-11 p-1" /></div>
        </div>
        <div><Label>League website (optional)</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" /></div>
        <div><Label>Contact email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />
          Public league site at my-teamsports.com/leagues/{l.slug} (schedule, results, standings — never rosters)
        </label>
        <ErrorText>{error}</ErrorText>
        <div className="flex items-center gap-3">
          <Button disabled={busy} onClick={async () => {
            setBusy(true); setError(null); setSaved(false);
            const { error: e } = await supabase.rpc("league_update_settings", { p_league_id: l.id, p_name: form.name, p_short_name: form.short_name, p_primary_color: form.primary_color, p_website: form.website, p_contact_email: form.contact_email, p_is_public: form.is_public });
            if (e) setError(e.message); else { setSaved(true); await reload(); }
            setBusy(false);
          }}>SAVE</Button>
          {saved && <span className="text-sm text-[var(--color-accent-green)]">Saved.</span>}
        </div>
        <p className="text-xs text-slate-600">Plan: {l.plan} · League fee paid through {l.paid_through || "—"}. Billing is handled by invoice for now.</p>
      </div>
    </Card>
  );
}
