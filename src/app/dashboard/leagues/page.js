import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui";

export const metadata = { title: "My Leagues | My-Team Sports" };

const ROLE_LABEL = { commissioner: "Commissioner", scheduler: "Scheduler", scorer: "Scorer" };

export default async function LeaguesPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_leagues");
  const leagues = Array.isArray(data) ? data : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">MY LEAGUES</h1>
        <p className="text-slate-400 mt-1">Leagues you help run. Schedules, results and standings for every team in them.</p>
      </div>
      {leagues.length === 0 ? (
        <EmptyState icon="🏆" text="You're not an admin of any league yet. Ask your commissioner to add your email." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leagues.map((l) => (
            <div key={l.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-amber-400/25 transition-all">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{l.name}</h2>
                  <p className="text-sm text-slate-500">{ROLE_LABEL[l.role] || l.role} · {l.is_public ? "public site" : "private"}</p>
                </div>
                <span className="text-2xl">🏆</span>
              </div>
              <div className="flex gap-3">
                <Link href={`/dashboard/leagues/${l.id}`} className="bg-[var(--color-accent-blue)] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-all">
                  Manage league
                </Link>
                {l.is_public && (
                  <Link href={`/leagues/${l.slug}`} target="_blank" className="text-sm font-medium text-[var(--color-accent-blue)] hover:underline px-2 py-2">
                    Public site ↗
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
