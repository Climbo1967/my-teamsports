"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadTeamImage } from "@/lib/upload";
import { signMediaUrl } from "@/lib/media";
import { SPORTS, DEFAULT_TEAM_COLOR } from "@/lib/constants";
import { Input, Select, Label, Button, Card, ColorPicker, ErrorText, Spinner } from "@/components/ui";
import StaffCard from "../StaffCard";
import PasscodeManager from "@/components/PasscodeManager";

export default function SettingsPage({ params }) {
  const { teamId } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [team, setTeam] = useState(null);
  const [name, setName] = useState("");
  const [sport, setSport] = useState("baseball");
  const [season, setSeason] = useState("");
  const [logoPath, setLogoPath] = useState(null); // stored in teams.logo_url
  const [logoUrl, setLogoUrl] = useState(null); // signed URL for display
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
      // logo_url stores a private-bucket path; keep the path for saving and
      // a signed URL for display.
      setLogoPath(data.logo_url);
      setLogoUrl(await signMediaUrl(supabase, data.logo_url));
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
      const { path, displayUrl } = await uploadTeamImage(supabase, `${teamId}/logo`, file);
      setLogoPath(path);
      setLogoUrl(displayUrl);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function save(e) {
    e.preventDefault();
    setError(null);
    if (sport !== team.sport) {
      const [{ count: statCount }, { count: playCount }] = await Promise.all([
        supabase.from("stats").select("id", { count: "exact", head: true }).eq("team_id", teamId),
        supabase.from("plays").select("id", { count: "exact", head: true }).eq("team_id", teamId),
      ]);
      const warnings = [];
      if ((statCount || 0) > 0) warnings.push("recorded stats stay labeled with the old sport's columns, so they may stop showing on the team site");
      if ((playCount || 0) > 0) warnings.push("playbook plays keep their old field diagram and categories until you edit and re-file them");
      if (warnings.length && !confirm(`Heads up: changing this team's sport means ${warnings.join(", and ")}. Change it anyway?`)) {
        return;
      }
    }
    setBusy(true);
    const { error: err } = await supabase.from("teams").update({
      name: name.trim(),
      sport,
      season: season.trim() || null,
      logo_url: logoPath,
      primary_color: primaryColor,
    }).eq("id", teamId);
    setBusy(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => cameraRef.current?.click()} disabled={busy}>
                  📷 Take Photo
                </Button>
                <Button type="button" variant="ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
                  {logoUrl ? "Change logo" : "Upload team logo"}
                </Button>
              </div>
              {logoUrl && (
                <button type="button" onClick={() => { setLogoPath(null); setLogoUrl(null); }} className="block text-xs text-red-400 hover:underline mt-1.5">
                  Remove logo
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleLogo} className="hidden" />
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
          Parents use this with your team link. Generate a random code or make your own — 8 letters/numbers.
        </p>
        <PasscodeManager teamId={teamId} passcode={team.passcode} onChanged={load} />
      </Card>

      <Card className="border-red-500/20">
        <h3 className="font-bold text-lg mb-1 text-red-400">DANGER ZONE</h3>
        <p className="text-sm text-slate-400 mb-4">Deleting the team removes everything — roster, schedule, posts, and photos. This cannot be undone.</p>
        <Button variant="danger" onClick={deleteTeam}>Delete this team</Button>
      </Card>
    </div>
  );
}
