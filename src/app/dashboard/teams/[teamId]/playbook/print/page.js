"use client";

// Printable play sheets. One play per page, ink-friendly "paper" board.
//  - /playbook/print           -> the whole playbook
//  - /playbook/print?id=<play> -> a single play sheet
// Auto-opens the print dialog once the plays have rendered.

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PlayField from "@/components/PlayField";
import { sportLabel } from "@/lib/constants";

const PRINT_CSS = `
  @page { size: portrait; margin: 14mm; }
  .sheet { page-break-after: always; break-after: page; }
  .sheet:last-child { page-break-after: auto; break-after: auto; }
  @media print {
    .no-print { display: none !important; }
    html, body { background: #fff !important; }
    body * { visibility: hidden !important; }
    #pb-print, #pb-print * { visibility: visible !important; }
    #pb-print { position: absolute; left: 0; top: 0; width: 100%; }
    .sheet { box-shadow: none !important; border: none !important; }
  }
`;

export default function PlaybookPrintPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const [team, setTeam] = useState(null);
  const [plays, setPlays] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    (async () => {
      const { data: t } = await supabase.from("teams").select("name, sport, season").eq("id", teamId).single();
      let q = supabase.from("plays").select("*").eq("team_id", teamId).order("sort_order").order("created_at");
      if (id) q = supabase.from("plays").select("*").eq("id", id);
      const { data: rows, error: err } = await q;
      setTeam(t || {});
      if (err) setError(err.message);
      setPlays(rows || []);
    })();
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps


  if (plays === null) return <div style={{ padding: 40, fontFamily: "system-ui", color: "#333" }}>Loading playbook…</div>;

  return (
    <div id="pb-print" style={{ background: "#fff", color: "#111", minHeight: "100vh" }}>
      <style>{PRINT_CSS}</style>

      <div className="no-print" style={{ position: "sticky", top: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 20px", background: "#0f1b33", color: "#fff" }}>
        <strong>{plays.length === 1 ? "Play sheet" : `Playbook — ${plays.length} plays`}</strong>
        <span style={{ display: "flex", gap: 10 }}>
          <button onClick={() => window.print()} style={btn}>🖨 Print / Save PDF</button>
          <button onClick={() => window.close()} style={{ ...btn, background: "transparent", border: "1px solid rgba(255,255,255,.3)" }}>Close</button>
        </span>
      </div>

      {error && <p style={{ color: "#b91c1c", padding: 20 }}>{error}</p>}
      {plays.length === 0 && <p style={{ padding: 40, fontFamily: "system-ui" }}>No plays to print yet.</p>}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px" }}>
        {plays.map((p) => (
          <div key={p.id} className="sheet" style={{ padding: "8px 0 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid #111", paddingBottom: 6, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  {p.category}{p.formation ? ` · ${p.formation}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "#555" }}>
                <div style={{ fontWeight: 700, color: "#111" }}>{(team?.name || "").toUpperCase()}</div>
                <div>{sportLabel(team?.sport || "football")} playbook</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ width: 420, maxWidth: "62%", border: "1px solid #cbd5cf", borderRadius: 8, overflow: "hidden" }}>
                <PlayField diagram={p.diagram} theme="paper" sport={team?.sport} style={{ display: "block", width: "100%" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#666", marginBottom: 6 }}>Coaching notes</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{p.notes || "—"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btn = { background: "#2f6bff", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
