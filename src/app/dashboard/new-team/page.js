"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ColorPicker } from "@/components/ui";
import { DEFAULT_TEAM_COLOR, SPORTS } from "@/lib/constants";
import { uploadTeamImage } from "@/lib/upload";

// Unambiguous characters only (no 0/O, 1/I/L)
const PASSCODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generatePasscode() {
  let code = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) code += PASSCODE_CHARS[b % PASSCODE_CHARS.length];
  return code;
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewTeamPage() {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("baseball");
  const [season, setSeason] = useState("Spring 2026");
  const [color, setColor] = useState(DEFAULT_TEAM_COLOR);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Your session expired. Please log in again.");
      setLoading(false);
      return;
    }

    const baseSlug = slugify(name);
    if (!baseSlug) {
      setError("Please enter a team name with letters or numbers.");
      setLoading(false);
      return;
    }

    const passcode = generatePasscode();

    // Try base slug, then add suffixes if taken
    let team = null;
    let lastError = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const slug =
        attempt === 0
          ? baseSlug
          : `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error: insertError } = await supabase
        .from("teams")
        .insert({ coach_id: user.id, name: name.trim(), sport, season, slug, passcode, primary_color: color })
        .select()
        .single();
      if (!insertError) {
        team = data;
        break;
      }
      lastError = insertError;
      if (insertError.code !== "23505") break; // not a duplicate-slug error
    }

    setLoading(false);

    if (!team) {
      setError(lastError?.message || "Something went wrong creating your team.");
      return;
    }

    setCreated(team);
  }

  async function handleLogo(file) {
    if (!file || !created) return;
    setLogoBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      // Store the private-bucket path; show the signed URL for preview.
      const { path, displayUrl } = await uploadTeamImage(supabase, `${created.id}/logo`, file);
      await supabase.from("teams").update({ logo_url: path }).eq("id", created.id);
      setLogoUrl(displayUrl);
    } catch (err) {
      setError(err.message);
    }
    setLogoBusy(false);
  }

  if (created) {
    const link = `my-teamsports.com/team/${created.slug}`;
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">YOUR TEAM IS LIVE!</h1>
        <p className="text-slate-400 mb-8">
          Text this link and passcode to your parents. They open it in any browser — no app, no accounts.
        </p>
        <div className="bg-white/[0.04] border border-green-500/25 rounded-2xl p-8 mb-8 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Team Link</p>
            <p className="text-lg text-[var(--color-accent-blue)] font-semibold break-all">{link}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Passcode</p>
            <p className="text-3xl font-mono font-bold tracking-[0.3em] text-white">{created.passcode}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`Join our team site! ${"https://" + link} — Passcode: ${created.passcode}`)}
            className="text-sm font-medium text-slate-400 hover:text-white border border-white/10 px-5 py-2.5 rounded-lg transition-colors"
          >
            📋 Copy invite message
          </button>
        </div>
        <div className="mb-8">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Team logo" className="w-20 h-20 rounded-xl object-cover border border-white/10 mx-auto mb-3" />
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleLogo(e.target.files?.[0])} className="hidden" />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleLogo(e.target.files?.[0])} className="hidden" />
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => cameraRef.current?.click()} disabled={logoBusy}
              className="text-sm font-medium text-slate-400 hover:text-white border border-white/10 px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
              📷 Take Photo
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={logoBusy}
              className="text-sm font-medium text-slate-400 hover:text-white border border-white/10 px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {logoBusy ? "Uploading..." : logoUrl ? "Change logo" : "🛡️ Add a team logo (optional)"}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        <div className="flex justify-center gap-4">
          <Link
            href={`/team/${created.slug}`}
            className="bg-[var(--color-accent-blue)] text-white font-[family-name:var(--font-oswald)] font-semibold tracking-wide px-7 py-3.5 rounded-xl hover:bg-blue-600 transition-all"
          >
            VIEW TEAM SITE
          </Link>
          <Link
            href="/dashboard"
            className="border border-white/10 text-slate-300 font-[family-name:var(--font-oswald)] font-semibold tracking-wide px-7 py-3.5 rounded-xl hover:bg-white/5 transition-all"
          >
            GO TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">CREATE YOUR TEAM</h1>
      <p className="text-slate-400 text-center mb-10">Pick your sport, name your team — you&apos;ll get a shareable link and passcode instantly.</p>

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">Sport</label>
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSport(s.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition-all ${
                  sport === s.value
                    ? "border-[var(--color-accent-blue)] bg-blue-500/10"
                    : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-xs text-slate-300">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Team Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            placeholder="Riverside Raptors 12U"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
          />
          {name && (
            <p className="text-xs text-slate-500 mt-1.5">
              Your link: my-teamsports.com/team/<span className="text-[var(--color-accent-blue)]">{slugify(name) || "..."}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Season</label>
          <input
            type="text"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            maxLength={40}
            placeholder="Spring 2026"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">Team Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-accent-green)] text-white font-[family-name:var(--font-oswald)] text-lg font-semibold tracking-wide py-4 rounded-xl hover:bg-green-500 transition-all disabled:opacity-50"
        >
          {loading ? "Creating..." : "CREATE TEAM"}
        </button>
      </form>
    </div>
  );
}
