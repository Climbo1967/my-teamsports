const SECTIONS = [
  { id: "getting-started", label: "Getting started" },
  { id: "roster", label: "Roster" },
  { id: "schedule", label: "Schedule, results & stats" },
  { id: "rsvps", label: "RSVPs" },
  { id: "scorekeeper", label: "The Scorekeeper (live scoring)" },
  { id: "scouting", label: "Scouting & insights" },
  { id: "ai-coach", label: "AI Assistant Coach" },
  { id: "playbook", label: "Playbook (the Play Board)" },
  { id: "message-board", label: "Message Board & announcements" },
  { id: "alerts", label: "Game-day alerts (push)" },
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
              <Step><strong>Create a team</strong> from the dashboard with the green &quot;Create a team&quot; button &mdash; it takes about a minute (name, sport, season, and a team color). Right after it&apos;s created you can upload your logo on the &quot;your team is live&quot; screen, or add it later in Settings.</Step>
              <Step><strong>Share your team</strong> by giving parents two things: the team link (my-teamsports.com/team/your-team) and the passcode. Both are shown on your dashboard card and in Settings.</Step>
              <Step><strong>View public site</strong> (top-right of any team) opens exactly what parents see.</Step>
            </ul>
            <p className="text-slate-400">
              The tabs across the top of a team are: Overview, Roster, Schedule, Scorekeeper, Scouting, AI Coach, Playbook, Message Board, Coach&apos;s Notes, Photos, Game Film, Support, Manual, and Settings. Each one is covered below.
            </p>
          </Section>

          <Section id="roster" title="Roster">
            <p>Build your team&apos;s player list. Parents see the roster (and per-player stats) on the public site.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Add each player with a name and jersey number; position is optional and matched to your sport.</Step>
              <Step>Edit or remove a player anytime &mdash; changes appear on the public site immediately.</Step>
              <Step>Use the <strong>↑ / ↓ arrows</strong> on each player to set the order they appear on your team site (otherwise they fall back to name order).</Step>
              <Step>The roster powers the Scorekeeper lineup, stats, and RSVP player picker, so keep it current.</Step>
            </ul>
          </Section>

          <Section id="schedule" title="Schedule, results & stats">
            <p>The Schedule tab is your season calendar and your stat book.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Add games and events</strong> with opponent, date, time, and location. Any note you add to an event shows on your own schedule row and on the public site.</Step>
              <Step><strong>Record a result</strong> on a finished game with the <strong>Win / Loss / Tie</strong> buttons and the &quot;us&quot; and &quot;them&quot; score boxes. Your win-loss record is calculated automatically and shown on the public header &mdash; no more typing free text that might not count.</Step>
              <Step><strong>Enter stats</strong> per player per game in the stat grid. The columns match your sport (batting stats for baseball, points / goals / TDs for other sports, and so on). Season totals and averages build up automatically.</Step>
            </ul>
            <p className="text-slate-400">
              Tip: if you score games live with the Scorekeeper, many stats fill in for you (see below). If a game was scored live and you open its stat grid, you&apos;ll see an amber note &mdash; hand-editing a column the live scorer manages (like hits) can be replaced the next time you re-score that game. Columns the scorer doesn&apos;t track, like <strong>Runs (R)</strong>, stay yours to enter and are safe.
            </p>
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
              Score games live from your phone. What you see depends on the sport. While a game is in progress, a &quot;LIVE NOW&quot; banner appears on your public team page so parents who can&apos;t make it can follow along, and opted-in parents get a push alert when the game starts and when it ends.
            </p>
            <p className="font-semibold text-white">Baseball &amp; softball (at-bat scoring):</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Build your lineup, choose home or away, and start the game.</Step>
              <Step>Call each pitch (Ball / Strike / Foul) &mdash; walks and strikeouts are counted for you.</Step>
              <Step>Tap the outcome of each at-bat (single, double, home run, groundout, and so on). For balls in play, tap where the ball went on the field and add RBIs &mdash; this feeds your spray charts.</Step>
              <Step>Track your pitcher&apos;s pitch count, strikeouts, walks, hits, and runs in the pitching panel.</Step>
              <Step>Made a mistake? Use <strong>↩ Undo</strong> in the batting panel to take back the last at-bat, or the undo on the pitching panel to take back the last pitch or play &mdash; the count, outs, inning, score, and stats all snap back.</Step>
              <Step>Hit &quot;End game&quot; to finalize the score and write the result to your schedule.</Step>
            </ul>
            <p className="font-semibold text-white">Basketball, soccer, hockey, football, flag football, volleyball (scoreboard):</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Start the game clock; it counts down by period (quarter, half, set, and so on) for your sport.</Step>
              <Step>Tap the scoring buttons (for example +2 / +3 in basketball, Goal in soccer, TD in football). You&apos;re asked to credit a player only when it earns a season stat &mdash; basketball prompts on every basket, football / flag only on a touchdown (a field goal, extra point, or 2-point play just adds the points).</Step>
              <Step>Use Undo for mistakes, adjust the clock or period if needed, and End game to finalize.</Step>
            </ul>
            <p className="text-slate-400">
              Only one game shows as live on your public page at a time &mdash; if you start a second while one is still going, you&apos;ll be warned that the new one takes over the banner. (The Scorekeeper isn&apos;t available for the &quot;Other&quot; sport.)
            </p>
          </Section>

          <Section id="scouting" title="Scouting & insights">
            <p>The Scouting tab turns the data you capture while scoring into coaching insights. It is most powerful for baseball and softball.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Spray charts</strong> show where each batter hits the ball, with a plain-English read of their tendencies once you have enough at-bats.</Step>
              <Step><strong>Pitching</strong> shows season lines per pitcher (innings, strikeouts, walks, hits, runs).</Step>
              <Step><strong>Recommended batting order</strong> suggests a lineup based on on-base and slugging numbers &mdash; a starting point you can adjust.</Step>
            </ul>
            <p className="text-slate-400">Want the same thinking in plain English, plus a lineup and a practice plan? See the AI Assistant Coach below.</p>
          </Section>

          <Section id="ai-coach" title="AI Assistant Coach">
            <p>
              An assistant coach that actually knows your team. It reads your real roster, record, recent results, and player stats, then gives you three tools. Everything it produces is a starting point &mdash; use your own coaching judgment.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Coach&apos;s Briefing</strong> (any sport) &mdash; one tap gives you a snapshot of the season, what&apos;s working, what to work on, players to watch, and a focus for your next practice.</Step>
              <Step><strong>Lineup Advisor</strong> (baseball &amp; softball) &mdash; builds a batting order from your real at-bats, with each player&apos;s AVG / OBP / SLG / OPS and the reasoning behind the order.</Step>
              <Step><strong>Practice Planner</strong> (any sport) &mdash; pick a length (45 / 60 / 75 / 90 minutes) and a focus, and it lays out a timed practice from warm-up to cool-down that you can print or save as a PDF.</Step>
            </ul>
            <p className="text-slate-400">
              The AI Coach is a premium feature that&apos;s free to preview for the 2026 season. If it&apos;s turned off for your team you&apos;ll see a preview card; if you have access, the quality of its advice grows as you log more games and stats.
            </p>
          </Section>

          <Section id="playbook" title="Playbook (the Play Board)">
            <p>
              Draw up plays on a real dry-erase-style board, right from your phone, and keep your whole playbook in one place.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step><strong>Draw a play:</strong> tap to place players and pieces on a field made for your sport, then drag to draw the movement. Every real sport has its own board &mdash; football and flag (gridiron), soccer (pitch), basketball (half-court), hockey (rink), volleyball (court and net), and baseball / softball (diamond).</Step>
              <Step><strong>Organize:</strong> file each play under a category that fits your sport (for example Offense / Defense / Special Teams for football, or Set Piece for soccer), and reorder plays with the ↑ / ↓ arrows. Category filter chips appear once you have plays in more than one category.</Step>
              <Step><strong>Share or keep private:</strong> each play has an &quot;On team site / Hidden&quot; toggle. Plays are visible to your team by default so players can study them; flip any play to Hidden to keep it off the public site.</Step>
              <Step><strong>Print:</strong> print a single play or your full playbook as clean sheets for practice or the sideline.</Step>
            </ul>
            <p className="text-slate-400">The Play Board is available for every sport except &quot;Other.&quot;</p>
          </Section>

          <Section id="message-board" title="Message Board & announcements">
            <p>Post updates the whole team sees, and reach families by email and push in one tap.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Write an announcement (optional title plus a message). It appears at the top of your public team page.</Step>
              <Step>Pin important posts to keep them at the top.</Step>
              <Step><strong>Posting and notifying are separate.</strong> After you post, tap <strong>&quot;📣 Notify team (email + app alerts)&quot;</strong> to send that post to subscribed families&apos; inboxes and push it to any device that opted in. The button then shows &quot;Notified&quot; with the date, so you can see at a glance what&apos;s already gone out and never double-send.</Step>
              <Step>The <strong>Subscribers</strong> card shows everyone who&apos;s opted in to email, and you can remove any subscriber. Emails go out from My-Team Sports and replies come back to you.</Step>
            </ul>
          </Section>

          <Section id="alerts" title="Game-day alerts (push)">
            <p>
              Parents can get free push notifications on their phone &mdash; still no app store and no account.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>On the public team page, a parent taps <strong>&quot;🔔 Get game alerts&quot;</strong> under the team header to turn on notifications for that team, on that device.</Step>
              <Step>Once opted in, they get an alert when you send an announcement (via &quot;Notify team&quot;), when a game starts and ends, and when you add, move, or cancel an upcoming event &mdash; for every sport.</Step>
              <Step><strong>Schedule alerts are automatic.</strong> Adding, changing, or canceling an upcoming event on your Schedule tab notifies opted-in devices about 25 seconds after you stop editing &mdash; several quick edits get bundled into one alert. Recording a result on a past game never sends an alert.</Step>
              <Step><strong>Parents choose what they get.</strong> Under &quot;Alerts on&quot; on the team page there are checkboxes for Announcements, Game scores, and Schedule changes &mdash; per device, all on by default.</Step>
              <Step><strong>iPhone / iPad note:</strong> Apple only allows push from an installed web app. Parents on iOS need to tap Share → &quot;Add to Home Screen,&quot; open the site from that new icon, and then tap &quot;Get game alerts.&quot; Android, and Chrome / Edge / Firefox on a computer, work straight from the browser. (The button shows this hint automatically on iPhones.)</Step>
            </ul>
          </Section>

          <Section id="notes" title="Coach's Notes">
            <p>Share practice plans, reminders, and game prep with your team. <strong>Coach&apos;s Notes are published on your public team page</strong>, so parents and players see them alongside announcements &mdash; the note editor shows a &quot;Visible to parents&quot; reminder, so keep anything private (like opponent scouting) out of here.</p>
          </Section>

          <Section id="photos" title="Photos">
            <p>Build a team gallery.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Upload photos from the Photos tab; they appear in the public gallery with a lightbox view.</Step>
              <Step>Parents can submit photos from the public site using the team passcode, so you are not the only one feeding the gallery. A parent can remove a photo they uploaded (from the lightbox, using the passcode); photos you upload as coach stay coach-managed.</Step>
            </ul>
          </Section>

          <Section id="film" title="Game Film">
            <p>Share video without hosting it yourself.</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <Step>Paste a YouTube or Vimeo link with a title and game date; it embeds on the public site for the team to watch.</Step>
              <Step>Use <strong>Edit</strong> on any video to fix its title, link, or game date &mdash; no need to delete and re-add.</Step>
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
              <Step><strong>Logo &amp; team color</strong> &mdash; upload a team logo and set the accent color used across your public site.</Step>
              <Step><strong>Passcode</strong> &mdash; view it, or regenerate it if it has been shared too widely (parents will need the new one).</Step>
              <Step><strong>Sport</strong> &mdash; you can change it, but if the team already has stats you&apos;ll be asked to confirm, since stats are tied to the old sport.</Step>
              <Step><strong>Staff</strong> &mdash; invite assistant coaches by email (they get access when they sign up with that address). Owners can also promote an assistant to head coach or step a head coach down to assistant &mdash; you just can&apos;t change your own role.</Step>
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
              <Step><strong>Game-day alerts:</strong> tap &quot;🔔 Get game alerts&quot; under the team name to get a push notification for announcements, live game starts and finals, and schedule changes. Use the checkboxes under &quot;Alerts on&quot; to pick which of those this device gets. On an iPhone, add the site to your Home Screen first, then turn alerts on from that icon.</Step>
              <Step><strong>RSVPs:</strong> pick your player and mark Going / Maybe / Not going for each game so the coach knows the numbers.</Step>
              <Step><strong>Photos:</strong> add your own game-day photos to the team gallery using the passcode &mdash; and you can remove one you added.</Step>
              <Step><strong>Email updates:</strong> subscribe with your email to get the coach&apos;s announcements in your inbox. Addresses stay private, and every email has an unsubscribe link if you ever want to stop.</Step>
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
