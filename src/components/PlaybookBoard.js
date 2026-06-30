"use client";

// Interactive coach's whiteboard for football / flag football.
//  - Tap a player tool, then tap the field to drop O / X / QB / etc.
//  - Pick a line tool (Route / Block / Motion / Pen) and DRAG to draw.
//  - Select mode: drag players to reposition, tap to select, Delete to remove.
//  - Undo and Clear. Output is a normalized diagram JSON (see lib/playbook).

import { useCallback, useEffect, useRef, useState } from "react";
import {
  VB, LINE_TOOLS, TOKENS, PALETTE, TOKEN_R, LINE_W,
  polyStr, normalizeDiagram, uid, clamp01, tokenToolsForSport, fieldForSport,
} from "@/lib/playbook";
import { FieldBackdrop, TokenMark, LineMark, TextMark } from "@/components/PlayField";

const TOOL_LABEL = {
  select: "Move", erase: "Erase", text: "Text",
  route: "Route", block: "Block", motion: "Motion", pen: "Pen",
};

export default function PlaybookBoard({ initial, onChange, sport }) {
  const tokenTools = tokenToolsForSport(sport);
  const field = fieldForSport(sport);
  const [dia, setDia] = useState(() => normalizeDiagram(initial));
  const [tool, setTool] = useState("o");
  const [color, setColor] = useState("#ffe14d");
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null); // { tool, color, pts:[{x,y}] }

  const svgRef = useRef(null);
  const histRef = useRef([]);
  const dragRef = useRef(null);

  // expose latest diagram to parent
  useEffect(() => { if (onChange) onChange(dia); }, [dia]); // eslint-disable-line react-hooks/exhaustive-deps

  const pushHistory = useCallback(() => {
    histRef.current.push(dia);
    if (histRef.current.length > 80) histRef.current.shift();
  }, [dia]);

  const undo = useCallback(() => {
    setDia((prev) => {
      const p = histRef.current.pop();
      return p !== undefined ? p : prev;
    });
    setSelected(null);
    setDraft(null);
  }, []);

  const clearBoard = useCallback(() => {
    if (!confirm("Clear the board? This removes everything currently on it.")) return;
    pushHistory();
    setDia((d) => ({ ...d, tokens: [], lines: [], texts: [] }));
    setSelected(null);
  }, [pushHistory]);

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    pushHistory();
    setDia((d) => ({
      ...d,
      tokens: d.tokens.filter((t) => t.id !== selected),
      lines: d.lines.filter((l) => l.id !== selected),
      texts: d.texts.filter((t) => t.id !== selected),
    }));
    setSelected(null);
  }, [selected, pushHistory]);

  function toNorm(e) {
    const r = svgRef.current.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - r.left) / r.width),
      y: clamp01((e.clientY - r.top) / r.height),
    };
  }

  function pickTool(tk) {
    setTool(tk);
    setSelected(null);
    setDraft(null);
    if (LINE_TOOLS[tk]) setColor(LINE_TOOLS[tk].color);
  }

  // ----- background pointer handlers (placing tokens / drawing lines) -----
  function onDown(e) {
    const n = toNorm(e);

    if (tool === "select" || tool === "erase") { setSelected(null); return; }

    if (tokenTools.includes(tool)) {
      pushHistory();
      const id = uid("t");
      setDia((d) => ({ ...d, tokens: [...d.tokens, { id, kind: tool, x: n.x, y: n.y }] }));
      setSelected(id);
      return;
    }

    if (tool === "text") {
      const s = (typeof window !== "undefined") ? window.prompt("Label text:") : null;
      if (s && s.trim()) {
        pushHistory();
        setDia((d) => ({ ...d, texts: [...d.texts, { id: uid("x"), x: n.x, y: n.y, text: s.trim(), color, size: 34 }] }));
      }
      return;
    }

    if (LINE_TOOLS[tool]) {
      setDraft({ tool, color, pts: [n] });
      try { svgRef.current.setPointerCapture(e.pointerId); } catch {}
    }
  }

  function onMove(e) {
    if (dragRef.current) {
      const n = toNorm(e);
      const { kind, id, ox, oy } = dragRef.current;
      const x = clamp01(n.x + ox), y = clamp01(n.y + oy);
      const key = kind === "token" ? "tokens" : "texts";
      setDia((d) => ({ ...d, [key]: d[key].map((el) => (el.id === id ? { ...el, x, y } : el)) }));
      return;
    }
    if (draft) {
      const n = toNorm(e);
      setDraft((dr) => {
        if (!dr) return dr;
        const last = dr.pts[dr.pts.length - 1];
        if (Math.hypot(n.x - last.x, n.y - last.y) < 0.006) return dr;
        return { ...dr, pts: [...dr.pts, n] };
      });
    }
  }

  function onUp() {
    if (dragRef.current) { dragRef.current = null; return; }
    if (draft) {
      const dr = draft;
      setDraft(null);
      if (dr.pts.length >= 2) {
        pushHistory();
        setDia((d) => ({ ...d, lines: [...d.lines, { id: uid("l"), tool: dr.tool, color: dr.color, pts: dr.pts }] }));
      }
    }
  }

  // ----- element handlers -----
  function tokenDown(e, t) {
    if (tool === "select") {
      e.stopPropagation();
      setSelected(t.id);
      const n = toNorm(e);
      dragRef.current = { kind: "token", id: t.id, ox: t.x - n.x, oy: t.y - n.y };
      pushHistory();
      try { svgRef.current.setPointerCapture(e.pointerId); } catch {}
    } else if (tool === "erase") {
      e.stopPropagation();
      pushHistory();
      setDia((d) => ({ ...d, tokens: d.tokens.filter((x) => x.id !== t.id) }));
    }
    // else: let it bubble so a new token/line starts here
  }

  function tokenEdit(e, t) {
    const base = TOKENS[t.kind] || TOKENS.o;
    if (["x", "ball", "cone", "soccerball"].includes(base.shape)) return;
    e.stopPropagation();
    const s = window.prompt("Player label:", t.label != null ? t.label : base.label);
    if (s === null) return;
    pushHistory();
    setDia((d) => ({ ...d, tokens: d.tokens.map((x) => (x.id === t.id ? { ...x, label: s } : x)) }));
  }

  function textDown(e, t) {
    if (tool === "select") {
      e.stopPropagation();
      setSelected(t.id);
      const n = toNorm(e);
      dragRef.current = { kind: "text", id: t.id, ox: t.x - n.x, oy: t.y - n.y };
      pushHistory();
      try { svgRef.current.setPointerCapture(e.pointerId); } catch {}
    } else if (tool === "erase") {
      e.stopPropagation();
      pushHistory();
      setDia((d) => ({ ...d, texts: d.texts.filter((x) => x.id !== t.id) }));
    }
  }

  function textEdit(e, t) {
    e.stopPropagation();
    const s = window.prompt("Edit text (blank to delete):", t.text);
    if (s === null) return;
    pushHistory();
    setDia((d) => {
      if (!s.trim()) return { ...d, texts: d.texts.filter((x) => x.id !== t.id) };
      return { ...d, texts: d.texts.map((x) => (x.id === t.id ? { ...x, text: s.trim() } : x)) };
    });
  }

  function lineDown(e, l) {
    if (tool === "select") { e.stopPropagation(); setSelected(l.id); }
    else if (tool === "erase") {
      e.stopPropagation();
      pushHistory();
      setDia((d) => ({ ...d, lines: d.lines.filter((x) => x.id !== l.id) }));
    }
  }

  // keyboard: delete / undo / escape
  useEffect(() => {
    function onKey(e) {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selected) { e.preventDefault(); deleteSelected(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
      else if (e.key === "Escape") { setSelected(null); setDraft(null); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, deleteSelected, undo]);

  const count = dia.tokens.length + dia.lines.length + dia.texts.length;

  return (
    <div className="select-none">
      {/* ---- toolbar ---- */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 mb-3 space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <ToolBtn active={tool === "select"} onClick={() => pickTool("select")} title="Move / select (drag players)">✋ Move</ToolBtn>
          <ToolBtn active={tool === "erase"} onClick={() => pickTool("erase")} title="Tap an item to delete it">🧽 Erase</ToolBtn>
          <Divider />
          {tokenTools.map((tk) => (
            <ToolBtn key={tk} active={tool === tk} onClick={() => pickTool(tk)} title={`Place ${TOKENS[tk].label || "ball"}`}>
              <TokenChip kind={tk} />
            </ToolBtn>
          ))}
          <Divider />
          {Object.keys(LINE_TOOLS).map((tk) => (
            <ToolBtn key={tk} active={tool === tk} onClick={() => pickTool(tk)} title={`Draw a ${TOOL_LABEL[tk].toLowerCase()} — drag on the board`}>
              {tk === "route" ? "↗ Route" : tk === "block" ? "⊤ Block" : tk === "motion" ? "⇢ Motion" : "✎ Pen"}
            </ToolBtn>
          ))}
          <Divider />
          <ToolBtn active={tool === "text"} onClick={() => pickTool("text")} title="Tap the board to add a label">🅣 Text</ToolBtn>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 mr-0.5">Pen color</span>
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={c}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110" : "border-white/25"}`}
              style={{ background: c }}
            />
          ))}
          <div className="flex-1" />
          <button onClick={deleteSelected} disabled={!selected} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
          <button onClick={undo} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5">↶ Undo</button>
          <button onClick={clearBoard} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5">Clear</button>
        </div>
      </div>

      {/* ---- the board ---- */}
      <div className="mx-auto" style={{ width: "100%", maxWidth: 540, aspectRatio: `${VB.w} / ${VB.h}` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          className="rounded-xl border border-white/10 shadow-xl"
          style={{ touchAction: "none", cursor: tool === "select" ? "default" : tool === "erase" ? "not-allowed" : "crosshair" }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
        >
          <FieldBackdrop theme="turf" los={dia.los} field={field} />

          {/* lines */}
          {dia.lines.map((l) => (
            <g key={l.id} onPointerDown={(e) => lineDown(e, l)} style={{ cursor: tool === "select" || tool === "erase" ? "pointer" : "inherit" }}>
              <polyline points={polyStr(l.pts)} fill="none" stroke="transparent" strokeWidth="30" strokeLinecap="round" />
              {selected === l.id && <polyline points={polyStr(l.pts)} fill="none" stroke="#38bdf8" strokeOpacity="0.55" strokeWidth={LINE_W + 12} strokeLinecap="round" strokeLinejoin="round" />}
              <LineMark line={l} />
            </g>
          ))}

          {/* draft line being drawn */}
          {draft && draft.pts.length >= 2 && <LineMark line={draft} />}

          {/* tokens */}
          {dia.tokens.map((t) => {
            const [cx, cy] = [t.x * VB.w, t.y * VB.h];
            return (
              <g key={t.id} onPointerDown={(e) => tokenDown(e, t)} onDoubleClick={(e) => tokenEdit(e, t)} style={{ cursor: tool === "select" ? "grab" : "inherit" }}>
                {selected === t.id && <circle cx={cx} cy={cy} r={TOKEN_R + 9} fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="6 5" />}
                <TokenMark t={t} />
              </g>
            );
          })}

          {/* text */}
          {dia.texts.map((t) => {
            const [cx, cy] = [t.x * VB.w, t.y * VB.h];
            const w = Math.max(40, (t.text.length * (t.size || 34) * 0.6));
            return (
              <g key={t.id} onPointerDown={(e) => textDown(e, t)} onDoubleClick={(e) => textEdit(e, t)} style={{ cursor: tool === "select" ? "grab" : "inherit" }}>
                {selected === t.id && <rect x={cx - w / 2} y={cy - (t.size || 34) * 0.7} width={w} height={(t.size || 34) * 1.4} fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 5" rx="4" />}
                <TextMark t={t} />
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-center text-xs text-slate-500 mt-2">
        {tool === "select" ? "Drag players to move • double-tap a player or label to rename • Delete key removes the selected item"
          : tool === "erase" ? "Tap any player, line, or label to erase it"
          : tokenTools.includes(tool) ? `Tap the field to drop a ${TOKENS[tool].label || "marker"} • switch to Move to drag it`
          : tool === "text" ? "Tap the field to add a label"
          : "Drag on the board to draw — release to finish"}
        {count > 0 ? ` • ${count} item${count === 1 ? "" : "s"} on board` : ""}
      </p>
    </div>
  );
}

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
        active ? "bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white" : "bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/30"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-white/10 mx-0.5" />;
}

// tiny inline preview of a token kind for the toolbar button
function TokenChip({ kind }) {
  const t = TOKENS[kind];
  if (t.shape === "x") return <span style={{ color: t.color }}>✕</span>;
  if (t.shape === "ball") return <span>🏈</span>;
  if (t.shape === "soccerball") return <span>⚽</span>;
  if (t.shape === "basketball") return <span>🏀</span>;
  if (t.shape === "cone") return <span>🔶</span>;
  return (
    <span className="inline-flex items-center justify-center align-middle" style={{ width: 16, height: 16, borderRadius: t.shape === "square" ? 3 : "50%", background: t.color, color: t.text, fontSize: 9, fontWeight: 800, lineHeight: "16px" }}>
      {t.label}
    </span>
  );
}
