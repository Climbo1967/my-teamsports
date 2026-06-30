const SECTIONS = [
  { id: "getting-started", label: "Getting started" },
  { id: "roster", label: "Roster" },
  { id: "schedule", label: "Schedule, results & stats" },
  { id: "rsvps", label: "RSVPs" },
  { id: "scorekeeper", label: "The Scorekeeper (live scoring)" },
  { id: "scouting", label: "Scouting & insights" },
  { id: "message-board", label: "Message Board & email" },
  { id: "notes", label: "Coach's Notes" },
  { id: "photos", label: "Photos" },
  { id: "film", label: "Game Film" },
  { id: "support", label: "Support" },
  { id: "settings", label: "Settings & staff" },
  { id: "parents", label: "For parents" },
];

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-slate-300 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Step({ children }) {
  return <li className="text-slate-300">{children}</li>;
}

export const metadata = { title: "Manual | My-Team Sports" };

export default function ManualPage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">📖 INSTRUCTIONS MANUAL</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Everything your team site can do, start to finish. New here? Read &quot;Getting started&quot; first, then jump to any feature.
        </p>
      </div>

      <div className="grid lg:grid-cols-[230px_1fr] gap-8">
        {/* Table of contents */}
        <aside className="lg:sticky lg:top-6 self-start">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Contents</p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-sm text-slate-400 hover:text-white py-1 transition-colors">
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="space-y-10 min-w-0">
          <Section id="getting-started" title="Getting started">
            <p>
              My-Team Sports gives your team a clean public website that parents reach with a link and a 6-character passcode &mdash; no app to download, no accounts, no cost to families. You manage everything from this dashboard; parents only ever see the public team page.
            </p>
            <p className="font-semibold text-white">The basics:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Your dashboard</strong> lists every team you run. Click a team to manage it; use the tabs across the top to move between features.</Step>
              <Step><strong>Create a team</strong> from the dashboard with the green &quot;Create a team&quot; button &mdash; it takes about a minute (name, sport, season).</Step>
              <Step><strong>Share your team</strong> by giving parents two things: the team link (my-teamsports.com/team/your-team) and the passcode. Both are shown on your dashboard card and in Settings.</Step>
              <Step><strong>View public site</strong> (top-right of any team) opens exactly what parents see.</Step>
            </ul>
          </Section>

          <Section id="roster" title="Roster">
            <p>Build your team&apos;s player list. Parents see the roster (and per-player stats) on the public site.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Add each player with a name and jersey number; position is optional and matched to your sport.</Step>
              <Step>Edit or remove a player anytime &mdash; changes appear on the public site immediately.</Step>
              <Step>The roster powers the Scorekeeper lineup, stats, and RSVP player picker, so keep it current.</Step>
            </ul>
          </Section>

          <Section id="schedule" title="Schedule, results & stats">
            <p>The Schedule tab is your season calendar and your stat book.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Add games and events</strong> with opponent, date, time, and location.</Step>
              <Step><strong>Record a result</strong> (for example &quot;W 7-3&quot;) on a finished game. Your win-loss record is calculated automatically and shown on the public header.</Step>
              <Step><strong>Enter stats</strong> per player per game in the stat grid. The columns match your sport (batting stats for baseball, points/rebounds/assists for basketball, and so on). Season totals and averages build up automatically.</Step>
            </ul>
            <p className="text-slate-400">Tip: if you score games live with the Scorekeeper, many stats fill in for you &mdash; see below.</p>
          </Section>

          <Section id="rsvps" title="RSVPs">
            <p>Parents can RSVP to games without an account.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>On the public site, a parent picks their player and marks Going / Maybe / Not going for each event.</Step>
              <Step>You see the responses on the Schedule tab, so you know your numbers before game day.</Step>
            </ul>
          </Section>

          <Section id="scorekeeper" title="The Scorekeeper (live scoring)">
            <p>
              Score games live from your phone. What you see depends on the sport. While a game is in progress, a &quot;LIVE NOW&quot; banner appears on your public team page so parents who can&apos;t make it can follow along.
            </p>
            <p className="font-semibold text-white">Baseball &amp; softball (at-bat scoring):</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Build your lineup, choose home or away, and start the game.</Step>
              <Step>Call each pitch (Ball / Strike / Foul) &mdash; walks and strikeouts are counted for you.</Step>
              <Step>Tap the outcome of each at-bat (single, double, home run, groundout, and so on). For balls in play, tap where the ball went on the field and add RBIs &mdash; this feeds your spray charts.</Step>
              <Step>Track your pitcher&apos;s pitch count, strikeouts, walks, hits, and runs in the pitching panel.</Step>
              <Step>Hit &quot;End game&quot; to finalize the score and write the result to your schedule.</Step>
            </ul>
            <p className="font-semibold text-white">Basketball, soccer, hockey, football, flag football, volleyball (scoreboard):</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Start the game clock; it counts down by period (quarter, half, set, and so on) for your sport.</Step>
              <Step>Tap the scoring buttons (for example +2 / +3 in basketball, Goal in soccer, TD in football). When you score, you can credit the player so their season stats update.</Step>
              <Step>Use Undo for mistakes, adjust the clock or period if needed, and End game to finalize.</Step>
            </ul>
          </Section>

          <Section id="scouting" title="Scouting & insights">
            <p>The Scouting tab turns the data you capture while scoring into coaching insights. It is most powerful for baseball and softball.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Spray charts</strong> show where each batter hits the ball, with a plain-English read of their tendencies once you have enough at-bats.</Step>
              <Step><strong>Pitching</strong> shows season lines per pitcher (innings, strikeouts, walks, hits, runs).</Step>
              <Step><strong>Recommended batting order</strong> suggests a lineup based on on-base and slugging numbers &mdash; a starting point you can adjust.</Step>
            </ul>
          </Section>

          <Section id="message-board" title="Message Board & email">
            <p>Post updates the whole team sees, and email them to families who opted in.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Write an announcement (optional title plus a message). It appears at the top of your public team page.</Step>
              <Step>Pin important posts to keep them at the top.</Step>
              <Step>If parents have subscribed, click &quot;Email to N subscribers&quot; on a post to send it to their inboxes. It goes out from My-Team Sports, and replies come back to you.</Step>
            </ul>
          </Section>

          <Section id="notes" title="Coach's Notes">
            <p>Share practice plans, reminders, and game prep with your team. <strong>Coach&apos;s Notes are published on your public team page</strong>, so parents and players see them alongside announcements &mdash; keep anything private (like opponent scouting) out of here.</p>
          </Section>

          <Section id="photos" title="Photos">
            <p>Build a team gallery.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Upload photos from the Photos tab; they appear in the public gallery with a lightbox view.</Step>
              <Step>Parents can submit photos from the public site using the team passcode, so you are not the only one feeding the gallery.</Step>
            </ul>
          </Section>

          <Section id="film" title="Game Film">
            <p>Share video without hosting it yourself.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Paste a YouTube or Vimeo link with a title and game date; it embeds on the public site for the team to watch.</Step>
            </ul>
          </Section>

          <Section id="support" title="Support">
            <p>
              Stuck, found a bug, or have an idea? Open the Support tab, write what is going on, and send it. It goes straight to the My-Team Sports team and we reply by email to your account address. We read every one.
            </p>
          </Section>

          <Section id="settings" title="Settings & staff">
            <p>Manage the team itself from Settings.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Logo</strong> &mdash; upload a team logo shown across your site.</Step>
              <Step><strong>Passcode</strong> &mdash; view it, or regenerate it if it has been shared too widely (parents will need the new one).</Step>
              <Step><strong>Staff</strong> &mdash; invite assistant coaches by email. They get access when they sign up with that address.</Step>
              <Step><strong>Delete team</strong> &mdash; permanently removes the team and its data. This cannot be undone.</Step>
            </ul>
          </Section>

          <Section id="parents" title="For parents">
            <p className="text-slate-300">
              Share this part with your families &mdash; it is everything a parent needs, and they never need an account or an app.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Getting in:</strong> open the team link your coach shares and enter the 6-character passcode once. Your device remembers it for about six months.</Step>
              <Step><strong>Following games live:</strong> when the coach is scoring a game, a &quot;LIVE NOW&quot; banner shows the current score right on the team page.</Step>
              <Step><strong>RSVPs:</strong> pick your player and mark Going / Maybe / Not going for each game so the coach knows the numbers.</Step>
              <Step><strong>Photos:</strong> add your own game-day photos to the team gallery using the passcode.</Step>
              <Step><strong>Email updates:</strong> subscribe with your email to get the coach&apos;s announcements in your inbox. Addresses stay private.</Step>
              <Step><strong>Cost:</strong> nothing. Parents never pay and never download anything.</Step>
            </ul>
          </Section>

          <p className="text-xs text-slate-500 border-t border-white/[0.06] pt-6">
            Can&apos;t find what you need? Use the Support tab and we&apos;ll help.
          </p>
        </article>
      </div>
    </div>
  );
}
