import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planLifecycle } from "@/lib/coachEmailPlan";
import { deliverCoachEmail, loadCoachSnapshot } from "@/lib/coachEmail";

// Daily job (Vercel Cron, see vercel.json): sends the automatic coach emails —
// the welcome safety net, "your trial is ending" and "your trial has ended".
//
// Vercel calls this with `Authorization: Bearer <CRON_SECRET>`. Until that
// environment variable is set this route refuses every call, so nothing can be
// sent by accident. `?dry=1` returns the plan without sending anything.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Each item is a log insert, a Resend call and a log update (about 1 to 1.5 s)
// plus the spacing, so the cap is on elapsed time, not just count. Whatever is
// left is reported as deferred and goes out on the next run.
const MAX_PER_RUN = 30;         // ~25 fit in the budget at 1-1.5 s each; 60 was never reachable
const TIME_BUDGET_MS = 45_000;  // stop claiming new items after this; maxDuration is 60 s
const SPACING_MS = 600;         // Resend allows 2 requests/second

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const snap = await loadCoachSnapshot(admin);
  if (!snap.ok) return NextResponse.json({ ok: false, error: snap.error }, { status: 503 });

  const plan = planLifecycle(snap.snapshot, { now: new Date() });
  const summary = plan.map((item) => ({ kind: item.kind, to: item.coach.email, subject: item.subject, keys: item.keys }));

  if (new URL(request.url).searchParams.get("dry") === "1") {
    return NextResponse.json({ ok: true, dry: true, planned: plan.length, emails: summary });
  }

  const counts = { sent: 0, skipped: 0, failed: 0 };
  const errors = [];
  const batch = plan.slice(0, MAX_PER_RUN);
  const startedAt = Date.now();
  let done = 0;
  for (let i = 0; i < batch.length; i++) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;
    done = i + 1;
    const item = batch[i];
    const teamIds = [...new Set(item.events.flatMap((e) => e.team_ids))];
    const result = await deliverCoachEmail(admin, {
      coach: item.coach,
      kind: item.kind,
      keys: item.keys,
      subject: item.subject,
      heading: item.heading,
      body: item.body,
      teamId: teamIds.length === 1 ? teamIds[0] : null,
      meta: { source: "cron" },
    });
    counts[result.status] += 1;
    if (result.error) errors.push({ to: item.coach.email, status: result.status, error: String(result.error || "").slice(0, 200) });
    if (i < batch.length - 1) await sleep(SPACING_MS);
  }

  return NextResponse.json({ ok: true, planned: plan.length, deferred: plan.length - done, elapsedMs: Date.now() - startedAt, ...counts, errors });
}
