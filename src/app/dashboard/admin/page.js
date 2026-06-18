import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDirectory from "./AdminDirectory";
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

  return (
    <>
      <AdminDirectory data={data} />
      <AdminSupport initial={support || []} />
    </>
  );
}
