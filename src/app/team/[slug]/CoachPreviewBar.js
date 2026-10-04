import Link from "next/link";

// Shown above the public team site when the viewer is the signed-in coach who
// got in without a passcode. Tells them what they're looking at and hands them
// the two things parents need.
export default function CoachPreviewBar({ teamId, passcode }) {
  return (
    <div className="bg-[var(--color-accent-blue)]/15 border-b border-[var(--color-accent-blue)]/30 px-4 py-3">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
        <p className="text-slate-200">
          <span className="mr-1.5">👀</span>
          <span className="font-semibold text-white">Coach preview.</span>{" "}
          This is your team site as parents see it. They get in with passcode{" "}
          <span className="font-mono font-bold tracking-widest text-white">{passcode}</span>.
        </p>
        <Link
          href={`/dashboard/teams/${teamId}`}
          className="font-semibold text-[var(--color-accent-blue)] hover:underline whitespace-nowrap"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
