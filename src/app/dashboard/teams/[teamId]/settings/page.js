"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadTeamImage } from "@/lib/upload";
import { SPORTS, DEFAULT_TEAM_COLOR } from "@/lib/constants";
import { Input, Select, Label, Button, Card, ColorPicker, ErrorText, Spinner } from "@/components/ui";
import StaffCard from "../StaffCard";

const PASSCODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function generatePasscode() {
  let code = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) code += PASSCODE_CHARS[b % PASSCODE_CHARS.length];
  return code;
}

export default function SettingsPage({ params }) {
  const { teamId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef(null);
  const [team, setTeam] = useState(null);
  const [name, setName] = useState("");
  const [sport, setSport] = useState("baseball");
  const [season, setSeason] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_TEAM_COLOR);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("teams").select("*").eq("id", teamId).single();
    if (data) {
      setTeam(data);
      setName(data.name);
      setSport(data.sport);
      setSeason(data.season || "");
      setLogoUrl(data.logo_url);
      setPrimaryColor(data.primary_color || DEFAULT_TEAM_COLOR);
    }
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function handleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadTeamImage(supabase, `${teamId}/logo`, file);
      setLogoUrl(url);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("teams").update({
      name: name.trim(),
      sport,
      season: season.trim() || null,
      logo_url: logoUrl,
      primary_color: primaryColor,
    }).eq("id", teamId);
    setBusy(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function regeneratePasscode() {
    if (!confirm("Generate a new passcode? The old one stops working immediately — you'll need to re-share with parents.")) return;
    const passcode = generatePasscode();
    const { error: err } = await supabase.from("teams").update({ passcode }).eq("id", teamId);
    if (err) { setError(err.message); return; }
    load();
    router.refresh();
  }

  async function deleteTeam() {
    const phrase = prompt(`This permanently deletes ${team.name} — roster, schedule, posts, and photos. Type the team name to confirm:`);
    if (phrase !== team.name) return;
    const { error: err } = await supabase.from("teams").delete().eq("id", teamId);
    if (err) { setError(err.message); return; }
    router.push("/dashboard");
    router.refresh();
  }

  if (!team) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h3 className="font-bold text-lg mb-4">TEAM DETAILS</h3>
        <form onSubmit={save} className="space-y-4">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/[0.05] border border-dashed border-white/20 flex items-center justify-center text-2xl">🛡️</div>
            )}
            <div>
              <Button type="button" variant="ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
                {logoUrl ? "Change logo" : "Upload team logo"}
              </Button>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl(null)} className="block text-xs text-red-400 hover:underline mt-1.5">
                  Remove logo
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
            </div>
          </div>

          <div>
            <Label>Team Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Sport</Label>
              <Select value={sport} onChange={(e) => setSport(e.target.value)}>
                {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Season</Label>
              <Input value={season} onChange={(e) => setSeason(e.target.value)} maxLength={40} placeholder="Spring 2026" />
            </div>
          </div>
          <div>
            <Label>Team color</Label>
            <ColorPicker value={primaryColor} onChange={setPrimaryColor} />
            <p className="text-xs text-slate-500 mt-1.5">Tints your public team page header.</p>
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" variant="green" disabled={busy || !name.trim()}>
            {saved ? "✓ Saved" : busy ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Card>

      <StaffCard teamId={teamId} />

      <Card>
        <h3 className="font-bold text-lg mb-1">PASSCODE</h3>
        <p className="text-sm text-slate-400 mb-4">
          Current passcode: <span className="font-mono font-bold text-white tracking-widest">{team.passcode}</span>
        </p>
        <Button variant="ghost" onClick={regeneratePasscode}>🔄 Generate new passcode</Button>
      </Card>

      <Card className="border-red-500/20">
        <h3 className="font-bold text-lg mb-1 text-red-400">DANGER ZONE</h3>
        <p className="text-sm text-slate-400 mb-4">Deleting the team removes everything — roster, schedule, posts, and photos. This cannot be undone.</p>
        <Button variant="danger" onClick={deleteTeam}>Delete this team</Button>
      </Card>
    </div>
  );
}
