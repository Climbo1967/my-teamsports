"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui";

export default function AdminSupport({ initial }) {
  const supabase = createClient();
  const [items, setItems] = useState(initial || []);
  const [filter, setFilter] = useState("open");
  const [busyId, setBusyId] = useState(null);

  const shown = items.filter((i) => (filter === "all" ? true : i.status === filter));
  const openCount = items.filter((i) => i.status === "open").length;

  async function setStatus(item, status) {
    setBusyId(item.id);
    const { error } = await supabase.from("support_requests").update({ status }).eq("id", item.id);
    if (!error) setItems((arr) => arr.map((x) => (x.id === item.id ? { ...x, status } : x)));
    setBusyId(null);
  }

  return (
    <div className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">
          🛟 SUPPORT REQUESTS {openCount > 0 && <span className="text-sm text-orange-400">({openCount} open)</span>}
        </h2>
        <div className="flex gap-1 text-sm">
          {["open", "resolved", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg capitalize ${filter === f ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <Card><p className="text-slate-500 text-sm text-center py-4">No {filter === "all" ? "" : filter} requests.</p></Card>
      ) : (
        <div className="space-y-3">
          {shown.map((it) => (
            <Card key={it.id} className={it.status === "resolved" ? "opacity-60" : "border-orange-500/20"}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h4 className="font-bold text-white">{it.subject}</h4>
                  <p className="text-xs text-slate-500">
                    {it.coach_name ? it.coach_name + " · " : ""}{it.coach_email}{it.team_name ? " · " + it.team_name : ""}
                  </p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(it.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed mb-3">{it.message}</p>
              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href={`mailto:${it.coach_email}?subject=${encodeURIComponent("Re: " + it.subject)}`}
                  className="text-xs font-semibold text-[var(--color-accent-green)] hover:underline"
                >
                  ✉️ Reply by email
                </a>
                {it.status === "open" ? (
                  <button onClick={() => setStatus(it, "resolved")} disabled={busyId === it.id} className="text-xs text-slate-400 hover:text-white disabled:opacity-50">
                    {busyId === it.id ? "..." : "✓ Mark resolved"}
                  </button>
                ) : (
                  <button onClick={() => setStatus(it, "open")} disabled={busyId === it.id} className="text-xs text-slate-400 hover:text-white disabled:opacity-50">
                    Reopen
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
