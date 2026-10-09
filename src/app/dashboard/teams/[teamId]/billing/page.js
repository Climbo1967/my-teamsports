"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, ErrorText, Spinner } from "@/components/ui";
import {
  PRODUCT_NAMES, fmtUsd, passOffer, priceFor, regularPriceFor, teamAccess,
} from "@/lib/pricing";

const dateFmt = (d) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function BillingPage({ params }) {
  const { teamId } = use(params);
  const supabase = createClient();
  const search = useSearchParams();
  const router = useRouter();
  const justPaid = search.get("status") === "success";
  const canceled = search.get("status") === "canceled";
  const processing = search.get("status") === "processing";

  const [team, setTeam] = useState(null);
  const [league, setLeague] = useState(null); // team_league_info result; null for solo teams
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // 'season' | 'ai'
  const lastDates = useRef(null);

  const load = useCallback(async () => {
    const [{ data: t, error: err }, { data: pays }] = await Promise.all([
      supabase.from("teams")
        .select("id, name, paid_through, ai_paid_through, trial_ends_at, ai_trial_ends_at, ai_enabled, league_id")
        .eq("id", teamId).single(),
      supabase.from("payments")
        .select("id, product, season_year, amount_cents, created_at")
        .eq("team_id", teamId).order("created_at", { ascending: false }),
    ]);
    if (err) setError(err.message);
    setTeam(t || null);
    setPayments(pays || []);
    // The lock on the other tabs is decided by the server layout, which does
    // not re-render on its own. When a payment lands (webhook a few seconds
    // after Stripe sends the coach back), refresh so the tabs unlock without
    // a hard reload.
    if (t) {
      const dates = `${t.paid_through}|${t.ai_paid_through}|${t.ai_enabled}`;
      if (lastDates.current !== null && lastDates.current !== dates) router.refresh();
      lastDates.current = dates;
    }
    if (t?.league_id) {
      const { data: info } = await supabase.rpc("team_league_info", { p_team_id: teamId });
      setLeague(info || null);
    } else {
      setLeague(null);
    }
  }, [teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Back from Stripe on iOS restores this page from the back-forward cache
  // with "Opening checkout…" still showing and the buttons disabled.
  useEffect(() => {
    const onShow = (e) => { if (e.persisted) { setBusy(null); load(); } };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [load]);

  // After Stripe redirects back, the webhook may land a few seconds later.
  useEffect(() => {
    if (!justPaid && !processing) return;
    const timer = setInterval(load, 4000);
    const stop = setTimeout(() => clearInterval(timer), 40000);
    return () => { clearInterval(timer); clearTimeout(stop); };
  }, [justPaid, processing, load]);

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

  const access = teamAccess(team, new Date(), league);
  // What is on sale right now (same rule the checkout route applies).
  const offer = passOffer();
  const year = offer.priceYear;
  const seasonPrice = priceFor("season", year);
  const aiPrice = priceFor("ai", year);
  const halfOff = year === 2026;
  const coversLine = offer.lateYear
    ? `Buy now and it covers the rest of ${offer.priceYear} and all of ${offer.passYear} (through Dec 31, ${offer.passYear}).`
    : `Covers through Dec 31, ${offer.passYear}.`;
  // Already covered to the end of what is on sale: nothing more to buy yet.
  const seasonCovered = !!(team.paid_through && team.paid_through >= offer.endDate);
  const aiCovered = !!(team.ai_paid_through && team.ai_paid_through >= offer.endDate);

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
      {processing && (
        <Card className="border-yellow-500/30">
          <p className="text-sm text-slate-300">
            Payment is processing — your access unlocks automatically as soon as it completes.
            This page refreshes itself.
          </p>
        </Card>
      )}

      <Card>
        <h3 className="font-bold text-lg mb-3">PLAN STATUS</h3>
        <div className="space-y-2 text-sm">
          {access.leagueActive ? (
            <p className="text-slate-300">
              <span className="text-[var(--color-accent-green)] font-semibold">✓ Covered by {access.leagueName}</span>
              {" "}— {access.schoolName ? `${access.schoolName}'s school plan` : "league plan"} covers this team through {dateFmt(access.leaguePaidThrough)}. Nothing to buy for coaching tools.
            </p>
          ) : access.paid ? (
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
                  : access.aiTrialActive
                    ? <> — <span className="text-yellow-400">free trial</span>, ends {new Date(access.aiTrialEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Add it below to keep it after the trial.</>
                    : <> — complimentary.</>}
              </>
            ) : (
              <span className="text-slate-500">AI Assistant Coach not active — the free trial has ended.</span>
            )}
          </p>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* League-covered teams never see the Season Pass offer — the school/league already paid. */}
        {!access.leagueActive && (
        <Card className="border-blue-500/25">
          <h4 className="font-bold mb-1">SEASON PASS</h4>
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
            alerts. {coversLine} One payment, not a subscription. Parents always free.
          </p>
          {seasonCovered ? (
            <p className="text-sm text-[var(--color-accent-green)] font-semibold">✓ You&apos;re covered through {dateFmt(team.paid_through)}. Nothing to buy.</p>
          ) : (
            <Button onClick={() => buy("season")} disabled={busy !== null}>
              {busy === "season" ? "Opening checkout..." : access.paid ? "EXTEND SEASON PASS" : "BUY SEASON PASS"}
            </Button>
          )}
        </Card>
        )}

        <Card className="border-purple-500/25">
          <h4 className="font-bold mb-1">AI ASSISTANT COACH</h4>
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
            team&apos;s real stats. Add-on to the Season Pass. {coversLine}
          </p>
          {aiCovered ? (
            <p className="text-sm text-[var(--color-accent-green)] font-semibold">✓ You&apos;re covered through {dateFmt(team.ai_paid_through)}. Nothing to buy.</p>
          ) : (
            <Button variant="green" onClick={() => buy("ai")} disabled={busy !== null}>
              {busy === "ai" ? "Opening checkout..." : access.aiPaid ? "EXTEND AI COACH" : "ADD AI COACH"}
            </Button>
          )}
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
                  {PRODUCT_NAMES[p.product]} — through Dec 31, {p.season_year}
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
