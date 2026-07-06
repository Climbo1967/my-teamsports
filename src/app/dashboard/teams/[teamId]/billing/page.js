"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, ErrorText, Spinner } from "@/components/ui";
import {
  PRODUCT_NAMES, currentSeasonYear, fmtUsd, priceFor, regularPriceFor, teamAccess,
} from "@/lib/pricing";

const dateFmt = (d) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function BillingPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const search = useSearchParams();
  const justPaid = search.get("status") === "success";
  const canceled = search.get("status") === "canceled";

  const [team, setTeam] = useState(null);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // 'season' | 'ai'

  const load = useCallback(async () => {
    const [{ data: t, error: err }, { data: pays }] = await Promise.all([
      supabase.from("teams")
        .select("id, name, paid_through, ai_paid_through, trial_ends_at, ai_enabled")
        .eq("id", teamId).single(),
      supabase.from("payments")
        .select("id, product, season_year, amount_cents, created_at")
        .eq("team_id", teamId).order("created_at", { ascending: false }),
    ]);
    if (err) setError(err.message);
    setTeam(t || null);
    setPayments(pays || []);
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // After Stripe redirects back, the webhook may land a few seconds later.
  useEffect(() => {
    if (!justPaid) return;
    const timer = setInterval(load, 4000);
    const stop = setTimeout(() => clearInterval(timer), 40000);
    return () => { clearInterval(timer); clearTimeout(stop); };
  }, [justPaid, load]);

  async function buy(product) {
    setBusy(product);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, product }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout.");
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setBusy(null);
    }
  }

  if (!team) return <Spinner />;

  const access = teamAccess(team);
  const year = currentSeasonYear();
  const seasonPrice = priceFor("season", year);
  const aiPrice = priceFor("ai", year);
  const halfOff = year === 2026;

  return (
    <div className="max-w-3xl space-y-6">
      {justPaid && (
        <Card className="border-green-500/40">
          <p className="text-[var(--color-accent-green)] font-semibold">✓ Payment received — thank you, Coach!</p>
          <p className="text-sm text-slate-400 mt-1">
            Your access updates automatically within a minute. This page refreshes itself.
          </p>
        </Card>
      )}
      {canceled && (
        <Card className="border-yellow-500/30">
          <p className="text-sm text-slate-300">Checkout canceled — no charge was made.</p>
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-lg mb-3">PLAN STATUS</h3>
        <div className="space-y-2 text-sm">
          {access.paid ? (
            <p className="text-slate-300">
              <span className="text-[var(--color-accent-green)] font-semibold">✓ Season Pass active</span>
              {" "}— covered through {dateFmt(access.paidThrough)}.
            </p>
          ) : access.trialActive ? (
            <p className="text-slate-300">
              <span className="text-yellow-400 font-semibold">Free trial</span>
              {" "}— ends {new Date(access.trialEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.
              Buy the Season Pass to keep coaching without interruption.
            </p>
          ) : (
            <p className="text-slate-300">
              <span className="text-red-400 font-semibold">Expired</span>
              {" "}— your team site is still live for parents, but coach tools are locked until renewal.
            </p>
          )}
          <p className="text-slate-300">
            {access.ai ? (
              <>
                <span className="text-[var(--color-accent-green)] font-semibold">✓ AI Assistant Coach active</span>
                {access.aiPaid
                  ? <> — through {dateFmt(access.aiPaidThrough)}.</>
                  : <> — complimentary preview.</>}
              </>
            ) : (
              <span className="text-slate-500">AI Assistant Coach not active.</span>
            )}
          </p>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-blue-500/25">
          <h4 className="font-bold mb-1">SEASON PASS — {year}</h4>
          <p className="text-3xl font-bold mb-1">
            {fmtUsd(seasonPrice)}
            {halfOff && (
              <span className="text-base font-normal text-slate-500 ml-2">
                <s>{fmtUsd(regularPriceFor("season"))}</s> · ½ off {year}
              </span>
            )}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            Everything: roster, schedule + RSVP, live scoring, stats, playbook, photos, game film,
            alerts. Covers through Dec 31, {year}. Parents always free.
          </p>
          <Button onClick={() => buy("season")} disabled={busy !== null}>
            {busy === "season" ? "Opening checkout..." : access.paid ? "EXTEND SEASON PASS" : "BUY SEASON PASS"}
          </Button>
        </Card>

        <Card className="border-purple-500/25">
          <h4 className="font-bold mb-1">AI ASSISTANT COACH — {year}</h4>
          <p className="text-3xl font-bold mb-1">
            {fmtUsd(aiPrice)}
            {halfOff && (
              <span className="text-base font-normal text-slate-500 ml-2">
                <s>{fmtUsd(regularPriceFor("ai"))}</s> · ½ off {year}
              </span>
            )}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            Coach&apos;s briefing, lineup advisor, and printable practice planner — built from your
            team&apos;s real stats. Add-on to the Season Pass.
          </p>
          <Button variant="green" onClick={() => buy("ai")} disabled={busy !== null}>
            {busy === "ai" ? "Opening checkout..." : "ADD AI COACH"}
          </Button>
        </Card>
      </div>

      <ErrorText>{error}</ErrorText>

      <Card>
        <h3 className="font-bold text-lg mb-3">PAYMENT HISTORY</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm bg-white/[0.03] rounded-lg px-3 py-2">
                <span className="text-white">
                  {PRODUCT_NAMES[p.product]} — {p.season_year} season
                </span>
                <span className="text-slate-400">
                  {fmtUsd(p.amount_cents)} ·{" "}
                  {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-600 mt-3">
          Receipts are emailed by Stripe at purchase. Questions? Use the Support tab.
        </p>
      </Card>
    </div>
  );
}
