import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  return (
    <>
      <AdminDirectory data={data} counters={counters || {}} />
      <AdminActivation data={data} />
      <AdminSupport initial={support || []} />
    </>
  );
}
