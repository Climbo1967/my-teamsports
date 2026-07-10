// Blog posts for My-Team Sports.
// To add a post: copy an object below and edit it. `body` is an array of blocks:
//   { h2: "Heading" } | { h3: "Subheading" } | { p: "Paragraph text" }
//   { ul: ["item", ...] } | { ol: ["step", ...] }
//   { table: { headers: ["A","B"], rows: [["1","2"], ...] } }
//   { download: { href: "/downloads/file.pdf", label: "...", note: "..." } }
// Optional post fields: `related` (array of { href, label, note }) and
// `faqs` (array of { q, a }) — faqs also emit FAQ rich-result schema automatically.
// Newest posts show first automatically (sorted by `date`).

export const posts = [
  {
    slug: "football-practice-plan-template",
    title: "Football Practice Plan Template: A 90-Minute Youth Practice (Free Printable)",
    description:
      "A free football practice plan template for youth coaches — a printable PDF plus a proven 90-minute structure with warm-up, tackling, unit work, and team install.",
    excerpt:
      "Grab the free printable and a proven 90-minute structure — warm-up, tackling, unit work, and team install — that keeps twenty-plus kids moving.",
    tag: "Coaching",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "6 min read",
    keywords: ["football practice plan template", "youth football practice plan", "football practice schedule", "youth football drills"],
    body: [
      { p: "A good football practice is not about doing more — it is about a plan that keeps twenty-plus kids moving, teaches contact safely, and gets your plays installed before Saturday. This free template breaks a 90-minute session into time-boxed blocks you can print, hand to your assistants, and run without standing around wondering what is next." },
      { download: { href: "/downloads/football-practice-plan.pdf", label: "Football Practice Plan Template (printable PDF)", note: "Free. No email required. Print it or edit it for your team." } },
      { h2: "What is in the plan" },
      { p: "The template scripts a full session from warm-up to team talk. Here is the structure it follows for a typical youth team:" },
      { table: { headers: ["Time", "Block", "Focus"], rows: [
        ["0:00–0:10", "Dynamic warm-up", "Form running and movement prep — no static stretching before contact"],
        ["0:10–0:25", "Individual / position", "Stances, starts, and footwork, split by position group"],
        ["0:25–0:35", "Tackling circuit", "Heads-up shoulder tackling: fit, drive, wrap — bags before live"],
        ["0:35–0:55", "Unit work", "OL vs DL run fits; QB, RB, and WR routes and handoffs; DB backpedal"],
        ["0:55–1:15", "Team offense", "Walk-through, then live reps of four to six installed plays"],
        ["1:15–1:25", "Team defense / ST", "Alignment, gap responsibility, one special-teams look"],
        ["1:25–1:30", "Team talk", "One coaching takeaway plus the next-game reminder"],
      ] } },
      { h2: "Adjust the plan to your point in the season" },
      { p: "Early season, spend more of your unit and team blocks installing your base offense and teaching fits — keep the playbook small and get it clean. Midseason, shift that time to situational reps: third-and-short, goal line, and two-minute. Late season and playoffs, trim installation almost entirely and polish the handful of plays you run best plus special teams, which decides more youth games than people expect." },
      { h2: "How to run it well" },
      { ul: [
        "Keep everyone moving — small groups and stations so nobody waits in line more than a minute.",
        "Script your reps before you arrive. This sheet is your script.",
        "Teach tackling every practice, always starting on bags or fit-and-freeze before any live contact.",
        "End on a high note with something competitive, then one clear takeaway.",
      ] },
      { h2: "Safety first" },
      { p: "Youth football is safe when contact is taught properly. Use a heads-up, shoulder-tackling progression, enforce water breaks roughly every 20 minutes, and check helmet and pad fit before every contact period. If you run your team on My-Team Sports, the AI practice planner can turn a quick note like ninety minutes to fix tackling and tempo into a fresh station-by-station plan in seconds." },
    ],
    related: [
      { href: "/blog/football-positions-explained", label: "Football Positions Explained", note: "Every position, plain English" },
      { href: "/blog/football-depth-chart-template", label: "Football Depth Chart Template", note: "Offense, defense, special teams" },
      { href: "/blog/how-to-coach-youth-football", label: "How to Coach Youth Football", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "How long should a youth football practice be?", a: "For most youth ages, 90 minutes is the sweet spot — long enough to warm up, teach tackling, work units, and run team offense without losing focus or risking heat fatigue. Younger or early-season teams can run 75 minutes." },
      { q: "How many plays should I install for a youth team?", a: "Fewer than you think. A handful of running plays and two or three pass plays, executed cleanly from a base formation, beats a thick playbook run sloppily. Add plays only once the current ones are automatic." },
      { q: "How do I keep every player involved during practice?", a: "Run position groups and stations with small numbers instead of whole-team lines. Posting the plan ahead of time in the free My-Team Sports app lets your assistants run their station without extra explaining." },
      { q: "When can we start live tackling?", a: "Start every tackling teach on bags and with fit-and-freeze reps to groove technique, then progress to controlled live work once players show safe, heads-up form. Never open a practice cold with full live tackling." },
    ],
  },
  {
    slug: "football-positions-explained",
    title: "Football Positions Explained: Offense, Defense & Special Teams",
    description:
      "Every football position on offense, defense, and special teams explained in plain language — plus youth coaching tips on which players to put where.",
    excerpt:
      "QB to nose tackle, in plain English — what every position does, and a coach's guide to which kids tend to fit where.",
    tag: "Coaching",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "6 min read",
    keywords: ["football positions explained", "football positions chart", "youth football positions", "football positions for beginners"],
    body: [
      { p: "Whether you are a new coach setting a lineup or a parent trying to follow the game, football's positions can look like alphabet soup. Here is every position on offense, defense, and special teams in plain language — plus, for coaches, a quick guide to which kids tend to fit where." },
      { download: { href: "/downloads/football-depth-chart.pdf", label: "Football Depth Chart Template (printable PDF)", note: "A blank chart to assign your own players by position." } },
      { h2: "Offense" },
      { p: "The offense's job is to move the ball and score. The quarterback (QB) takes the snap and runs the play — put your smartest, most composed player here, not necessarily your best athlete. The running back (RB) carries the ball and blocks, so this wants a strong, decisive runner. A fullback (FB), when used, is a lead blocker and short-yardage runner. Wide receivers (WR) catch passes and need speed and reliable hands. The tight end (TE) is a hybrid who both blocks and catches. Up front, the offensive line — the center (C) who snaps the ball, two guards, and two tackles — protects the quarterback and opens running lanes. Linemen should be your bigger, tougher kids who do not mind contact; footwork matters more than size at the youth level." },
      { h2: "Defense" },
      { p: "The defense's job is to stop the offense and get the ball back. The defensive line — ends on the edges and tackles or a nose tackle inside — attacks the line of scrimmage. Behind them, linebackers are the defense's engine: they tackle, cover, and blitz, so put active, instinctive kids here. In the back, the secondary — cornerbacks on the outside and safeties in the middle — covers receivers and is your last line of defense, so speed and open-field tackling matter most." },
      { h2: "Special teams" },
      { p: "Special teams cover kicks and punts and win more youth games than most coaches expect. Key roles are the kicker, punter, long snapper, and kick or punt returners. Do not treat these as afterthoughts — a reliable snapper and a returner who catches cleanly are quietly some of your most valuable players." },
      { h2: "How to assign youth players" },
      { p: "Start with body type and temperament, then refine by skill. Bigger, physical kids go to the lines; quick, coordinated kids go to skill positions and linebacker; your most composed decision-maker goes to quarterback. Give everyone a real position and rotate early in the season so you discover fits you did not expect — plenty of standout linebackers started the year at guard." },
    ],
    related: [
      { href: "/blog/football-practice-plan-template", label: "Football Practice Plan Template", note: "Free printable 90-minute plan" },
      { href: "/blog/football-depth-chart-template", label: "Football Depth Chart Template", note: "Set your starters and backups" },
      { href: "/blog/how-to-coach-youth-football", label: "How to Coach Youth Football", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "What are the football positions by number?", a: "Unlike baseball, football positions are not numbered one through nine. Jersey numbers loosely follow ranges — linemen wear 50 to 79, receivers and backs wear lower numbers — but positions are known by name and abbreviation, not a fixed number." },
      { q: "What is the easiest position for a beginner?", a: "Many new players start at running back, tight end, or on the defensive line, where responsibilities are more contained. Quarterback and cornerback ask the most of a beginner because of decision-making and open-field coverage." },
      { q: "How many players are on the field in youth football?", a: "It varies by league. Many youth programs play 11-on-11, but plenty use 9-on-9 or smaller to fit roster sizes and development goals — check your league's rules." },
    ],
  },
  {
    slug: "football-depth-chart-template",
    title: "Football Depth Chart Template (Free Printable PDF)",
    description:
      "A free printable football depth chart template for offense, defense, and special teams, with first, second, and third string — editable and ready for game day.",
    excerpt:
      "Your game-day map: who starts, who backs them up, and where players go when someone is out. Free printable for all three units.",
    tag: "Coaching",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "4 min read",
    keywords: ["football depth chart template", "football depth chart printable", "youth football depth chart", "football lineup template"],
    body: [
      { p: "A depth chart is your game-day map: who starts, who backs them up, and where players go when someone is out. This free template lays out offense, defense, and special teams with first, second, and third string so you are never scrambling on the sideline." },
      { download: { href: "/downloads/football-depth-chart.pdf", label: "Football Depth Chart Template (printable PDF)", note: "Offense, defense, and special teams on one page." } },
      { h2: "What is in it" },
      { p: "Three sections — offense, defense, and special teams — each with every standard position and columns for first, second, and third string. Print it for your clipboard, or build and update it online so your assistants always see the current version." },
      { h2: "How to fill it out" },
      { p: "Set your starters first, then assign backups by the positions you are most likely to need mid-game. Cross-train intentionally: your best athletes should know two spots so an injury or a hot day does not leave a hole. Revisit the chart weekly — youth rosters change fast as kids develop, and the Week 1 depth chart rarely survives to Week 6." },
    ],
    related: [
      { href: "/blog/football-positions-explained", label: "Football Positions Explained", note: "Every position, plain English" },
      { href: "/blog/football-practice-plan-template", label: "Football Practice Plan Template", note: "Free printable 90-minute plan" },
      { href: "/blog/football-roster-template", label: "Football Roster Template", note: "Free printable roster" },
    ],
    faqs: [
      { q: "What is a football depth chart?", a: "It is a chart listing each position and the players ranked behind it — starter, then backups. Coaches use it to plan substitutions, manage playing time, and adjust quickly when someone is unavailable." },
      { q: "How is a depth chart different from a lineup?", a: "A lineup is who is on the field for a given play; a depth chart is the full ranked roster by position, including backups. The lineup comes off the depth chart." },
    ],
  },
  {
    slug: "football-roster-template",
    title: "Football Roster Template (Free Printable)",
    description:
      "A free printable football roster template with jersey numbers, positions, and parent contacts — download the PDF or build a live roster online in minutes.",
    excerpt:
      "Players, numbers, positions, and emergency contacts on one page you can keep in your bag. Free printable, plus a live option.",
    tag: "Coaching",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "4 min read",
    keywords: ["football roster template", "football team roster printable", "youth football roster", "football roster sheet"],
    body: [
      { p: "Before the first practice you need one thing organized above all else: who is on your team and how to reach their parents. This free football roster template keeps players, jersey numbers, positions, and emergency contacts on a single page you can keep in your bag." },
      { download: { href: "/downloads/football-roster.pdf", label: "Football Roster Template (printable PDF)", note: "Numbers, positions, and parent contacts on one page." } },
      { h2: "What is on it" },
      { p: "Columns for jersey number, player name, position, grade or age, parent or guardian, phone, and an emergency contact — everything you need on the sideline in a pinch. Print a copy for your clipboard and one for each assistant." },
      { h2: "Why a live roster beats paper" },
      { p: "Paper is great for game day, but contact info changes and kids get added or moved. A live roster in the free My-Team Sports app keeps everyone's info current, lets parents update their own details, and ties into your schedule and availability so you always know who is coming." },
    ],
    related: [
      { href: "/blog/football-depth-chart-template", label: "Football Depth Chart Template", note: "Set your starters and backups" },
      { href: "/blog/football-practice-plan-template", label: "Football Practice Plan Template", note: "Free printable 90-minute plan" },
      { href: "/blog/how-to-coach-youth-football", label: "How to Coach Youth Football", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "What information should a football roster include?", a: "At minimum: player name, jersey number, position, and a parent contact plus an emergency number. Grade or age helps with league eligibility and grouping." },
      { q: "How many players do you need for a youth football team?", a: "It depends on your league's format, such as 9-on-9 or 11-on-11. Most programs carry several substitutes beyond the starters, so many youth teams roster around 16 to 25." },
    ],
  },
  {
    slug: "how-to-coach-youth-football",
    title: "How to Coach Youth Football: A First-Timer's Guide",
    description:
      "New to coaching football? A step-by-step first-season guide to safety, practice planning, positions, installing plays, playing time, and managing parents.",
    excerpt:
      "You do not need to have played in the NFL. Keep kids safe, teach a few things well, and make it fun enough that they come back next year.",
    tag: "Coaching",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "6 min read",
    keywords: ["how to coach youth football", "coaching youth football", "first time football coach", "youth football coaching tips"],
    body: [
      { p: "Coaching youth football for the first time is equal parts exciting and overwhelming. The good news: you do not need to have played in the NFL. You need to keep kids safe, teach a few things well, and make it fun enough that they come back next year. Here is how to run a first season you will both be proud of." },
      { h2: "Start with safety and certification" },
      { p: "Before you teach a single play, get comfortable with contact safety. USA Football's Heads Up program teaches proper tackling and is required by many leagues — it is the single best afternoon you will spend. Learn to teach shoulder tackling on bags, manage heat and hydration, and check equipment fit." },
      { h2: "Keep it simple" },
      { p: "The most common rookie-coach mistake is installing too much. Pick a base offensive formation, a handful of running plays, and two or three pass plays — then run them until they are automatic. On defense, teach alignment and gap responsibility before anything fancy. Simple and clean beats complex and sloppy every Saturday." },
      { h2: "Teach fundamentals every practice" },
      { p: "Stance, starts, footwork, and tackling technique should appear in every single practice, not just week one. Use a practice plan template to time-box these so they do not get squeezed out by scrimmage time." },
      { h2: "Give everyone a role and manage playing time" },
      { p: "Assign every kid a real position, cross-train your athletes, and be deliberate about playing time — few things sour a season faster than a parent who feels their kid never plays. Tracking minutes and positions keeps it fair and keeps the sideline drama down." },
      { h2: "Communicate with parents early and often" },
      { p: "Set expectations before the season: the schedule, what to bring, and your philosophy on playing time and development. Most parent friction comes from a lack of information, not real disagreement. A team app that pushes schedules and reminders automatically saves you a hundred text messages." },
      { h2: "Run your first practice" },
      { p: "Show up with a written plan. Start with names and a fun movement warm-up, teach one tackling progression, install one or two plays, and end with a competitive game. Then hand out the schedule and you are off." },
    ],
    related: [
      { href: "/blog/football-practice-plan-template", label: "Football Practice Plan Template", note: "Free printable 90-minute plan" },
      { href: "/blog/football-positions-explained", label: "Football Positions Explained", note: "Every position, plain English" },
      { href: "/blog/football-depth-chart-template", label: "Football Depth Chart Template", note: "Offense, defense, special teams" },
    ],
    faqs: [
      { q: "Do I need experience to coach youth football?", a: "No. Most youth coaches are parents or volunteers. What matters is a willingness to learn contact safety, a simple plan, and patience. Complete a Heads Up or your league's certification and lean on templates for structure." },
      { q: "What is the most important thing to teach first?", a: "Safe tackling and blocking fundamentals. Technique keeps kids safe and is the foundation everything else is built on — teach it before scheme." },
      { q: "How do I handle playing-time complaints?", a: "Set expectations up front and track playing time so it is demonstrably fair. When a parent has a concern, having actual data on positions and minutes turns an argument into a conversation." },
    ],
  },
  {
    slug: "football-coaching-app-playbook-ai-coach",
    title: "Coaching Football This Season? Your Playbook, Practices, and Game Day in One App",
    description:
      "From little league to high school, run your football team on My-Team Sports — design plays on a digital gridiron, get AI game briefings and practice plans, track stats and film, and keep families in the loop. No app for parents, free to watch.",
    excerpt:
      "Little league to varsity: draw plays on a digital gridiron, get AI briefings and practice plans, and keep every family in the loop — all in one place.",
    tag: "Football",
    date: "2026-07-08",
    updated: "2026-07-08",
    readingTime: "6 min read",
    keywords: ["youth football coaching app", "football playbook app", "football practice plan", "high school football team website"],
    body: [
      { p: "Football season is almost here. Whether you coach eight-year-olds in rec ball, a middle school squad, or a Friday-night varsity team, the off-field work — the playbook, the practice plan, the schedule, the parent texts — eats the time you would rather spend coaching. My-Team Sports puts all of it in one place, with no app for families to download and no paywall for parents to watch their own kid." },
      { h2: "Build and share your playbook on a real gridiron" },
      { p: "The Coach's Playbook is a digital dry-erase board drawn on a football field. Drop your eleven (or seven for flag), draw routes, blocking, and motion, name the play, and save it to your team's playbook. Reorder plays into your install order, and mark each one visible to players or keep it hidden while you are still installing it. When it is time, print clean play sheets for the binder or the sideline." },
      { ul: [
        "Little league and rec: a simple set of run and pass plays the kids can actually remember.",
        "Junior high: install your base offense and defense, and let players study the plays on the team site between practices.",
        "High school: organize a full playbook by formation and situation, keep your best stuff hidden from public view, and print call sheets for game night.",
      ]},
      { h2: "Let the AI Assistant Coach handle the prep" },
      { p: "The AI Assistant Coach reads your roster, results, and stats and gives you a straight-talking game briefing — what is working, what to drill, and who to watch. Then the practice planner turns a quick note like 'I have 90 minutes and need to fix tackling and tempo' into a timed, station-by-station plan you can print and run. It works for tackle and flag, at every level." },
      { h2: "One team site your families actually use" },
      { p: "Every team gets a site with the roster, the schedule with RSVPs so you know who is at practice, game film from a YouTube or Vimeo link, season stats, and your win-loss record. Families open one link with a passcode — no app store, no account, and never a fee to watch their own player." },
      { h2: "Game day, handled" },
      { ul: [
        "Post the score and result, and your record badge updates across the whole site.",
        "Game-day alerts push kickoff, the final, and any schedule or field change straight to families' phones — no group-text chaos.",
        "Lightning delay or a field change an hour before kickoff? One tap and everyone knows.",
      ]},
      { h2: "Get set up before two-a-days" },
      { p: "Pick football or flag, name your team, and share the passcode. Five minutes and your staff, players, and parents are on the same page for the season. Create your team on My-Team Sports, turn on the AI Assistant Coach, and start building your playbook today." },
    ],
  },
  {
    slug: "ai-assistant-coach-for-youth-teams",
    title: "Meet the AI Assistant Coach: Briefings, Lineups, and Practice Plans in Seconds",
    description:
      "My-Team Sports includes an AI Assistant Coach that writes game briefings, suggests lineups, and builds full practice plans for any youth sport.",
    excerpt:
      "Game briefings, lineup suggestions, and a full practice plan — generated in seconds. Meet the assistant coach that never misses a practice.",
    tag: "Features",
    date: "2026-07-08",
    updated: "2026-07-08",
    readingTime: "5 min read",
    keywords: ["AI coaching assistant", "youth sports lineup generator", "AI practice plan generator", "baseball lineup helper"],
    body: [
      { p: "Most youth coaches are volunteers with day jobs. The AI Assistant Coach, built right into My-Team Sports, takes the busywork off your plate so your time goes to actually coaching the kids." },
      { h2: "Three tools, one tap" },
      { ul: [
        "Game briefings — a quick, plain-English rundown before each game: what to focus on, what to watch for, and a reminder of your game plan. Works for every sport.",
        "Lineup advisor — for baseball and softball, get a suggested batting order and field positions from your roster, so you are not scribbling a lineup in the parking lot.",
        "Practice planner — tell it how long you have and what you want to work on, and it builds a station-by-station practice plan for any sport in seconds.",
      ]},
      { h2: "How to turn it on" },
      { p: "The AI Assistant Coach is a per-team feature you switch on from your coach dashboard. Once it is enabled, the tools appear right where you manage the roster and schedule — no separate app or login." },
      { h2: "Who it helps most" },
      { ul: [
        "First-time and volunteer coaches who want a second set of eyes.",
        "Coaches juggling more than one team or more than one sport.",
        "Anyone who is short on prep time between work and the field.",
      ]},
      { p: "Spin up your team on My-Team Sports, turn on the assistant coach, and let it handle the prep while you handle the dugout." },
    ],
  },
  {
    slug: "live-scorekeeping-every-sport",
    title: "Live Scorekeeping for Every Sport — and Parents Watch in Real Time",
    description:
      "Keep score on your phone and My-Team Sports updates the team page live — full play-by-play for baseball and softball, plus a universal scoreboard for basketball, soccer, football, hockey, and volleyball.",
    excerpt:
      "Tap the score in from the dugout; grandparents three states away watch it update live. Play-by-play for baseball and softball, a clock-and-score board for everything else.",
    tag: "Features",
    date: "2026-07-07",
    updated: "2026-07-07",
    readingTime: "5 min read",
    keywords: ["live scorekeeping app", "youth baseball scorekeeper", "live game score for parents", "team scoreboard app"],
    body: [
      { p: "Half the family can never make it to every game. Live scorekeeping means they do not have to miss it — you keep score on your phone, and the team page updates in real time for everyone watching from home." },
      { h2: "How it works" },
      { p: "Open the game on your phone and tap as the action happens. The score, the inning or clock, and the key plays push straight to your team's page. No separate scoreboard app, and no entering everything twice." },
      { h2: "Baseball and softball: full play-by-play" },
      { p: "Track balls, strikes, and outs, move runners around the bases, follow the batter at the plate, and let player stats build themselves as the game goes." },
      { h2: "Every other sport: a live scoreboard" },
      { p: "For basketball, soccer, football, flag football, hockey, and volleyball, a universal scoreboard keeps the score, the period or quarter, and the game clock — live for parents in the stands and at home." },
      { h2: "Why families love it" },
      { ul: [
        "Grandparents and relatives far away can follow along in real time.",
        "Working parents stuck at the office still catch the game.",
        "You end up with a clean record of every game, not a smudged notebook.",
      ]},
      { p: "It is all built into your My-Team Sports team page — nothing extra to install for you or for the parents following along." },
    ],
  },
  {
    slug: "coachs-playbook-draw-and-print-plays",
    title: "The Coach's Playbook: Draw Up Plays on a Dry-Erase Board, Then Print Them",
    description:
      "Design plays on a digital dry-erase board built for your sport — football, flag, soccer, basketball, hockey, volleyball, and more — save them to your team, and print clean sheets for game day.",
    excerpt:
      "A digital dry-erase board for every field and court. Draw the play, save it to your team, print a clean sheet for the sideline.",
    tag: "Features",
    date: "2026-07-05",
    updated: "2026-07-05",
    readingTime: "4 min read",
    keywords: ["youth football playbook", "flag football plays", "digital play designer", "coach playbook app"],
    body: [
      { p: "Coaching a play used to mean a laminated card and a lot of squinting. The Coach's Playbook gives you a digital dry-erase board for your sport, so you can design plays, save them, and hand players something clean to follow." },
      { h2: "Draw it on the right field" },
      { p: "The board matches your sport: football and flag get a gridiron, soccer gets a pitch, basketball a court, hockey a rink, volleyball a court, and baseball and softball a diamond. Place your players, draw routes and movement, and name the play." },
      { h2: "Save, organize, and control who sees it" },
      { ul: [
        "Save plays to your team so they are there every game.",
        "Reorder them into the sequence you want.",
        "Mark each play visible to the team, or keep it hidden while you are still working on it.",
      ]},
      { h2: "Print clean sheets for game day" },
      { p: "When it is go time, print your plays as clean sheets for the sideline or the team binder — no more redrawing the same play on a whiteboard every week." },
      { p: "The Playbook is part of every team on My-Team Sports, across all the sports it supports." },
    ],
  },
  {
    slug: "game-day-alerts-team-notifications",
    title: "Never Miss a Game Update: Game-Day Alerts for Your Whole Team",
    description:
      "Send instant notifications for announcements, game start and final scores, and last-minute schedule changes — straight to every family's phone, with no app store download and no group-text chaos.",
    excerpt:
      "Rainout at 5 p.m.? One tap and every family knows. Announcements, game start and final, and schedule changes — pushed straight to phones.",
    tag: "Features",
    date: "2026-07-04",
    updated: "2026-07-04",
    readingTime: "4 min read",
    keywords: ["team notification app", "game day reminders", "youth sports schedule change alerts", "team announcement app"],
    body: [
      { p: "It is 5 p.m., the field just flooded, and the game is off. With a group text you are left hoping everyone sees it in time. With game-day alerts, one tap notifies every family instantly." },
      { h2: "What gets pushed" },
      { ul: [
        "Announcements you post to the team.",
        "Game start and final scores, so families know when to tune in and how it ended.",
        "Schedule changes — reschedules, cancellations, and location changes — the moment you make them.",
      ]},
      { h2: "Each family controls their own alerts" },
      { p: "Notifications are per device, so every parent chooses what they want to hear about. Nobody gets buried, and nobody misses the update that matters." },
      { h2: "No app store required" },
      { p: "Alerts work through the web — families tap once to turn them on, with nothing to download from an app store. On iPhones they add the team to the home screen first, which takes only a few seconds." },
      { p: "It is all part of your My-Team Sports team page — the same place your roster, schedule, and scores already live." },
    ],
  },
  {
    slug: "youth-baseball-practice-plan",
    title: "A 90-Minute Youth Baseball Practice Plan (Free Template)",
    description:
      "A ready-to-run 90-minute youth baseball practice plan for coaches — warm-up, fundamental stations, and a game-speed finish you can reuse every week.",
    excerpt:
      "Steal our 90-minute template — warm-up, stations, and a game-speed finish that keeps a dozen kids moving and nobody standing in line.",
    tag: "Coaching",
    date: "2026-07-06",
    updated: "2026-07-06",
    readingTime: "6 min read",
    keywords: ["youth baseball practice plan", "baseball practice schedule", "youth baseball drills", "little league practice plan"],
    body: [
      { p: "The difference between a practice that develops players and one that just burns 90 minutes is structure. When kids rotate through short, focused stations, they get more reps, stay engaged, and spend less time standing in line waiting for a turn. Here is a simple, repeatable plan you can run every week." },
      { h2: "Before you start" },
      { p: "Show up with a plan written on an index card or your phone, and recruit one or two parent helpers to run stations. With helpers you can split the team into small groups and triple the number of reps each kid gets." },
      { h2: "The 90-minute plan" },
      { ol: [
        "Warm-up and dynamic stretch (10 min): light jog, arm circles, high knees, and a few short sprints. Loose bodies throw harder and get hurt less.",
        "Throwing progression (10 min): partners start close and step back after every five clean throws. Emphasize footwork and hitting a target, not raw velocity.",
        "Fundamental stations (30 min): split into three groups and rotate every 10 minutes — fielding ground balls, catching fly balls, and hitting off a tee or soft toss.",
        "Team defense (20 min): walk through situations at game speed — who covers which base, where the throw goes, and who backs up the play.",
        "Situational scrimmage (15 min): runners on base, live at-bats, real decisions. This is where practice starts to look like a game.",
        "Wrap-up (5 min): one thing the team did well, one thing to work on, and a reminder of the next game or practice time.",
      ]},
      { h2: "Coaching tips that make it stick" },
      { ul: [
        "Give one cue at a time. Kids can fix one thing, not five.",
        "Reps beat lectures. If a group is standing and listening for more than a minute, shorten it.",
        "End on something fun and competitive — a relay, a home-run derby, or a fielding challenge.",
        "Jot down who struggled with what, so next week's plan targets it.",
      ]},
      { h2: "Track it so it compounds" },
      { p: "Practice pays off fastest when you can see progress. Logging simple stats and notes across a season shows which players are trending up and where the team keeps breaking down. If you run your team on My-Team Sports, the roster, schedule, and stats live in one place — and the AI practice planner can generate a fresh plan for any sport in seconds." },
    ],
  },
  {
    slug: "how-to-keep-a-baseball-scorebook",
    title: "How to Keep a Baseball Scorebook: A Beginner's Guide for Team Parents",
    description:
      "Learn how to keep a baseball scorebook step by step — position numbers, the basic symbols, and tracking hits and outs — so any parent can score a youth game with confidence.",
    excerpt:
      "Position numbers, the basic symbols, and how to track a half-inning — everything a first-time scorekeeper needs, minus the jargon.",
    tag: "Scorekeeping",
    date: "2026-07-02",
    updated: "2026-07-02",
    readingTime: "7 min read",
    keywords: ["how to keep a baseball scorebook", "how to score a baseball game", "baseball scorekeeping for beginners", "youth baseball scorekeeping"],
    body: [
      { p: "Keeping the book looks intimidating from the stands, but the basics come down to a handful of numbers and symbols. Once you learn them, you can score any youth game and give your coach a reliable record of what happened. Here is everything a first-time scorekeeper needs." },
      { h2: "First, learn the position numbers" },
      { p: "Every defensive position has a number. Scorekeeping uses these numbers instead of names, so a ground out to the shortstop is written the same way every time." },
      { ul: [
        "1 — Pitcher", "2 — Catcher", "3 — First base", "4 — Second base", "5 — Third base",
        "6 — Shortstop", "7 — Left field", "8 — Center field", "9 — Right field",
      ]},
      { h2: "The scorebook grid" },
      { p: "Each row is a batter and each column is an inning. The small diamond in every box represents the bases. As a runner advances, you trace their path around the diamond, filling it in completely when they score." },
      { h2: "The symbols you will use most" },
      { ul: [
        "K — strikeout swinging; a backwards K means a called strike three.",
        "BB — base on balls (a walk).",
        "1B, 2B, 3B, HR — single, double, triple, home run.",
        "F8 — fly out to center field (position 8).",
        "6-3 — ground out, shortstop to first base.",
      ]},
      { h2: "Scoring a half-inning, step by step" },
      { ol: [
        "Write each batter in order as they come up.",
        "In their box, record the result — a hit, a walk, or how they made an out.",
        "Trace base runners around the diamond as later batters move them along.",
        "Fill in the diamond when a runner scores, and note who drove them in.",
        "Mark three outs, then draw a line — that half-inning is done.",
      ]},
      { h2: "Common beginner mistakes" },
      { ul: [
        "Forgetting to advance existing runners when a new batter gets a hit.",
        "Mixing up who gets credit for a run batted in.",
        "Not marking outs clearly, so you lose track of the inning.",
      ]},
      { h2: "Or skip the pencil entirely" },
      { p: "Paper scorebooks work, but they smudge, get lost, and are easy to fall behind on. A digital scorekeeper tracks the game tap by tap, rolls up stats automatically, and lets parents who could not make it follow along live. My-Team Sports includes live scorekeeping for baseball and softball, plus a universal scoreboard for other sports, so the book, the stats, and the live game all update in one place." },
    ],
  },
  {
    slug: "share-team-schedule-and-photos-without-an-app",
    title: "The Easiest Way to Share Your Team's Schedule and Photos (No App Required)",
    description:
      "Tired of group texts and app downloads? Here is how to share your youth team's schedule, roster, and photos with every parent using one simple link.",
    excerpt:
      "Group texts lose the photos and bury the schedule. Here is a simpler system every parent can use with one link — no app, no logins.",
    tag: "Team Management",
    date: "2026-06-28",
    updated: "2026-06-28",
    readingTime: "5 min read",
    keywords: ["share team schedule with parents", "team communication app", "youth sports team website", "share team photos with parents"],
    body: [
      { p: "If your team runs on a group text, you already know the problems: the schedule scrolls away in a sea of thumbs-up replies, photos get compressed into mush, and the one parent who muted the thread misses every update. There is a simpler way to keep everyone on the same page." },
      { h2: "What parents actually need" },
      { ul: [
        "The schedule, with times, locations, and any last-minute changes.",
        "The roster and who to contact.",
        "Photos and highlights they can actually download.",
        "A heads-up when a game is rained out or moved.",
      ]},
      { h2: "The problem with group texts and apps" },
      { p: "Group texts were never meant to be a system of record. Important details get buried, and there is no single place to check. Dedicated apps fix that but create a new problem: every parent, grandparent, and babysitter has to download software and create an account just to see when the next game is." },
      { h2: "The one-link approach" },
      { p: "The simplest system is a single team page everyone opens with one link. The schedule lives in one place, photos stay full quality, and anyone with the link can see it without installing anything. You update it once, and everyone has the latest." },
      { h2: "How to set it up" },
      { ol: [
        "Create a team page and add your schedule and roster.",
        "Set a simple passcode so only your team families can get in.",
        "Share the link and passcode once in your existing group chat.",
        "Post photos and announcements to the page instead of the text thread.",
      ]},
      { h2: "Keep it private" },
      { p: "You do not want your kids' roster and game locations on the open internet. Choose a tool that gates the page behind a passcode you control, so the information stays with your team families and no one else." },
      { h2: "Do it in five minutes" },
      { p: "This is exactly what My-Team Sports was built for: a passcode-protected team website with the schedule, roster, stats, photos, and game film in one place — no app to download and no account for parents to create. Grandparents three states away open one link and see everything." },
    ],
  },
];

export function getAllPosts() {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPost(slug) {
  return posts.find((p) => p.slug === slug) || null;
}
