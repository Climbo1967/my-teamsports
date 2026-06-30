"use client";

import { TEAM_COLORS } from "@/lib/constants";

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors ${props.className || ""}`}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors resize-y ${props.className || ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors [&>option]:bg-[#132140] ${props.className || ""}`}
    />
  );
}

export function Label({ children }) {
  return <label className="block text-sm font-medium text-slate-400 mb-1.5">{children}</label>;
}

export function Button({ variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white",
    green: "bg-[var(--color-accent-green)] hover:bg-green-500 text-white",
    ghost: "border border-white/10 text-slate-300 hover:bg-white/5",
    danger: "border border-red-500/30 text-red-400 hover:bg-red-500/10",
  };
  return (
    <button
      {...props}
      className={`font-semibold text-sm px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}

export function Card({ className = "", children }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ icon, text }) {
  return (
    <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-2xl p-10 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-slate-500">{text}</p>
    </div>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="text-red-400 text-sm">{String(children)}</p>;
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-white/10 border-t-[var(--color-accent-blue)] rounded-full animate-spin" />
    </div>
  );
}

export function ColorPicker({ value, onChange }) {
  const current = value || "#3b82f6";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {TEAM_COLORS.map((c) => {
        const on = value && value.toLowerCase() === c.toLowerCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`Use color ${c}`}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${on ? "border-white scale-110" : "border-white/20 hover:border-white/50"}`}
            style={{ backgroundColor: c }}
          />
        );
      })}
      <label className="relative w-8 h-8 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer text-slate-300 text-sm" title="Custom color">
        +
        <input type="color" value={current} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
    </div>
  );
}
