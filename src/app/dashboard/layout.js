import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export const metadata = {
  title: "Coach Dashboard | My-Team Sports",
};

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-navy)]">
      <nav className="bg-[var(--color-navy-mid)] border-b border-white/5 px-6 h-[70px] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent-blue)] to-blue-700 rounded-xl flex items-center justify-center">⚾</div>
          <span className="font-[family-name:var(--font-oswald)] font-bold text-lg tracking-wide text-white">
            MY-TEAM <span className="text-[var(--color-accent-blue)]">SPORTS</span>
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <span className="hidden sm:block text-sm text-slate-400">{user.email}</span>
          <LogoutButton />
        </div>
      </nav>
      <main className="max-w-[1100px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
