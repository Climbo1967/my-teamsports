import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDirectory from "./AdminDirectory";

export const metadata = { title: "Admin | My-Team Sports" };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_overview");

  if (error || !data) {
    redirect("/dashboard");
  }

  return <AdminDirectory data={data} />;
}
