"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Button, Card, ErrorText } from "@/components/ui";

export default function StaffCard({ teamId }) {
  const supabase = createClient();
  const [staff, setStaff] = useState(null);
  const [myId, setMyId] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [{ data: rows }, { data: { user } }] = await Promise.all([
      supabase.from("team_coaches").select("*").eq("team_id", teamId).order("created_at"),
      supabase.auth.getUser(),
    ]);
    setStaff(rows || []);
    setMyId(user?.id || null);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const isOwner = staff?.some((s) => s.user_id === myId && s.role === "owner");

  async function invite(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("team_coaches").insert({
      team_id: teamId,
      email: email.trim().toLowerCase(),
      role: "coach",
    });
    setBusy(false);
    if (err) {
      setError(err.code === "23505" ? "That email is already on the staff." : err.message);
      return;
    }
    setEmail("");
    load();
  }

  async function remove(member) {
    if (!confirm(`Remove ${member.email} from the coaching staff?`)) return;
    const { error: err } = await supabase.from("team_coaches").delete().eq("id", member.id);
    if (err) setError(err.message);
    load();
  }

  async function setRole(member, role) {
    const msg = role === "owner"
      ? `Make ${member.email} a head coach? They get full control, including deleting the team and managing staff.`
      : `Change ${member.email} to an assistant coach?`;
    if (!confirm(msg)) return;
    const { error: err } = await supabase.from("team_coaches").update({ role }).eq("id", member.id);
    if (err) { setError(err.message); return; }
    load();
  }

  if (!staff) return null;

  return (
    <Card>
      <h3 className="font-bold text-lg mb-1">COACHING STAFF</h3>
      <p className="text-sm text-slate-400 mb-4">
        Assistant coaches can manage everything except deleting the team or the staff list.
      </p>

      <ul className="space-y-2 mb-5">
        {staff.map((member) => (
          <li key={member.id} className="flex items-center justify-between bg-white/[0.04] rounded-lg px-4 py-2.5">
            <div>
              <span className="text-sm text-white">{member.email}</span>
              <span className={`ml-2 text-xs font-semibold uppercase tracking-wider ${member.role === "owner" ? "text-yellow-400" : "text-slate-500"}`}>
                {member.role === "owner" ? "Head Coach" : member.user_id ? "Assistant" : "Invited — not signed up yet"}
              </span>
            </div>
            {isOwner && member.user_id !== myId && (
              <div className="flex gap-3 items-center">
                {member.role === "owner" ? (
                  <button onClick={() => setRole(member, "coach")} className="text-xs text-slate-400 hover:text-white">Make assistant</button>
                ) : (
                  <>
                    {member.user_id && <button onClick={() => setRole(member, "owner")} className="text-xs text-slate-400 hover:text-white">Make head coach</button>}
                    <button onClick={() => remove(member)} className="text-xs text-red-400 hover:underline">Remove</button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={invite} className="flex gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="assistant@example.com"
            className="flex-1"
          />
          <Button type="submit" disabled={busy || !email.trim()}>
            {busy ? "Adding..." : "+ Invite coach"}
          </Button>
        </form>
      )}
      {isOwner && (
        <p className="text-xs text-slate-500 mt-2">
          They sign up at my-teamsports.com/signup with this exact email — the team appears on their dashboard automatically.
        </p>
      )}
      <div className="mt-3"><ErrorText>{error}</ErrorText></div>
    </Card>
  );
}
