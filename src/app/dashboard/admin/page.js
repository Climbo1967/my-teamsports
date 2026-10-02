import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { coachFillIns } from "@/lib/coachEmailPlan";
import { loadCoachSnapshot } from "@/lib/coachEmail";
import AdminDirectory from "./AdminDirectory";
import AdminActivation from "./AdminActivation";
import AdminSupport from "./AdminSupport";

export const metadata = { title: "Admin | My-Team Sports" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_overview");

  if (error || !data) {
    redirect("/dashboard");
  }

  const { data: support } = await supabase
    .from("support_requests")
    .select("*")
    .order("created_at", { ascending: false });

  // All site counters ({key: views}); admin-only RPC, null for anyone else.
  const { data: counters } = await supabase.rpc("admin_counters");

  // Email tools: per-coach fill-in values + opt-outs, and the sent log. Only
  // reached once admin_overview() has succeeded, i.e. the viewer IS an admin.
  // Null/empty when the email-log migration isn't applied — the card then
  // turns sending off rather than sending without an unsubscribe link.
  let emailMeta = null;
  let emailLog = [];
  const admin = createAdminClient();
  const snap = await loadCoachSnapshot(admin);
  if (snap.ok) {
    const now = new Date();
    const teamsByCoach = new Map();
    for (const t of snap.snapshot.teams) teamsByCoach.set(t.coach_id, [...(teamsByCoach.get(t.coach_id) || []), t]);
    emailMeta = {};
    for (const c of snap.snapshot.coaches) {
      if (!c.email || !c.unsub_token) continue;
      const fill = coachFillIns(c, teamsByCoach.get(c.id) || [], now);
      emailMeta[c.email] = { greeting: fill.greeting, values: fill.values, missing: fill.missing, optOut: !!c.opt_out };
    }
    const { data: log } = await admin
      .from("coach_emails")
      .select("id, email, kind, subject, status, created_at")
      .neq("status", "seeded")
      .order("created_at", { ascending: false })
      .limit(100);
    emailLog = log || [];
  }

  return (
    <>
      <AdminDirectory data={data} counters={counters || {}} emailMeta={emailMeta} emailLog={emailLog} />
      <AdminActivation data={data} />
      <AdminSupport initial={support || []} />
    </>
  );
}
