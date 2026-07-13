// Commercial sport landing pages. One entry per sport → rendered by
// src/app/sports/[sport]/page.js. Slugs are the full URL segment
// (e.g. /sports/baseball-team-website). Accent class strings are written
// out in full so Tailwind's scanner keeps them.

export const SPORTS = [
  {
    slug: "baseball-team-website",
    sport: "Baseball",
    emoji: "⚾",
    accentText: "text-red-400",
    accentBorder: "border-red-500/30",
    accentBg: "bg-red-500/10",
    accentDot: "bg-red-500",
    titleTag: "Free Baseball Team Website — Roster, Live Scores & Stats",
    metaDescription:
      "Build a free youth baseball team website in 5 minutes — roster, live pitch-by-pitch scoring, batting stats, schedule with RSVPs, photos, and game film. Parents never download an app, make an account, or pay.",
    keywords: [
      "baseball team website",
      "free baseball team website",
      "youth baseball team website builder",
      "baseball team app for parents",
      "baseball team page",
    ],
    heroTitle: "BASEBALL TEAM",
    heroAccent: "WEBSITE",
    heroSub:
      "Give your youth baseball team a website parents actually open — roster, live scores, batting stats, photos, and game film. Live in five minutes. Parents never download an app, make an account, or pay a dime.",
    intro: [
      "Baseball has more to track than almost any youth sport — a batting order, a pitching rotation, who's on base, the score by inning. My-Team Sports puts all of it on one page your whole team shares, from the head coach to the grandparent following two states away.",
      "You score the game live from your phone and the runs, innings, and final post to your team page in real time. Season batting averages, ERAs, and your win-loss record compute themselves as you go — no spreadsheet, no math at midnight.",
    ],
    scoring: "runs, hits, and innings",
    positions: ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"],
    mockup: {
      team: "Riverside Raptors 12U",
      record: "7–2",
      live: "LIVE · Raptors 6, Hawks 4 · Top 5th",
      leaders: [
        { name: "Maya R.", line: ".480 on-base" },
        { name: "Jordan T.", line: "2.10 ERA" },
        { name: "Sam K.", line: "14 RBI" },
      ],
    },
    highlights: [
      "Live pitch-by-pitch scoring — runs, innings, and the final land on your team page as they happen.",
      "The batting order and pitching rotation, visible to players and parents before the first pitch.",
      "Season stats that compute themselves — AVG, OBP, ERA, RBI, and your win-loss record.",
      "The AI Assistant Coach builds your lineup from real on-base and power numbers (Coach add-on).",
    ],
    faqs: [
      {
        q: "Is the baseball team website really free?",
        a: "It's free for parents, always — they open your team link, type a passcode once, and they're in with no app and no account. Coaches start free, and the full season is half off for 2026.",
      },
      {
        q: "Can parents follow the game live if they can't make it?",
        a: "Yes. You score from your phone and the run, inning, and final post to the team page in real time, so anyone with the link follows along from the stands or from home.",
      },
      {
        q: "Does it track batting averages and ERAs?",
        a: "It does. Enter each game in a simple grid and season AVG, OBP, ERA, RBI, and your record are calculated automatically.",
      },
      {
        q: "Do parents need to download an app?",
        a: "No. It opens in any web browser on any phone, tablet, or computer. They can add it to their home screen for one-tap access, but there's no app store and no account to create.",
      },
    ],
    related: [
      { slug: "youth-baseball-practice-plan", title: "A Youth Baseball Practice Plan That Actually Runs on Time" },
      { slug: "ai-baseball-practice-plan-generator", title: "An AI Baseball Practice Plan Generator" },
      { slug: "how-to-keep-a-baseball-scorebook", title: "How to Keep a Baseball Scorebook" },
      { slug: "baseball-scorekeeping-app", title: "The Baseball Scorekeeping App Parents Can Follow Live" },
      { slug: "baseball-rainout-notifications", title: "Baseball Rainout Notifications the Whole Team Gets" },
    ],
  },

  {
    slug: "softball-team-website",
    sport: "Softball",
    emoji: "🥎",
    accentText: "text-yellow-400",
    accentBorder: "border-yellow-500/30",
    accentBg: "bg-yellow-500/10",
    accentDot: "bg-yellow-500",
    titleTag: "Free Softball Team Website — Roster, Live Scores & Stats",
    metaDescription:
      "Build a free youth softball team website in 5 minutes — roster, live scoring, batting stats, schedule with RSVPs, photos, and game film. Parents never download an app, make an account, or pay.",
    keywords: [
      "softball team website",
      "free softball team website",
      "youth softball team website builder",
      "softball team app for parents",
      "softball team page",
    ],
    heroTitle: "SOFTBALL TEAM",
    heroAccent: "WEBSITE",
    heroSub:
      "Give your youth softball team a website parents actually open — roster, live scores, batting stats, photos, and game film. Live in five minutes. Parents never download an app, make an account, or pay a dime.",
    intro: [
      "Softball season moves fast — a batting order, a circle rotation, base runners, the score by inning. My-Team Sports keeps all of it on one page your whole team shares, from the head coach to the grandparent following from out of town.",
      "You score the game live from your phone and the runs, innings, and final post to your team page in real time. Season averages, ERAs, and your record compute themselves as you go — no spreadsheet, no late-night math.",
    ],
    scoring: "runs, hits, and innings",
    positions: ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"],
    mockup: {
      team: "Valley Thunder 14U",
      record: "9–3",
      live: "LIVE · Thunder 5, Storm 3 · Bot 4th",
      leaders: [
        { name: "Ava P.", line: ".510 on-base" },
        { name: "Grace M.", line: "1.95 ERA" },
        { name: "Lily S.", line: "16 RBI" },
      ],
    },
    highlights: [
      "Live scoring — runs, innings, and the final land on your team page as they happen.",
      "The batting order and pitching circle, visible to players and parents before first pitch.",
      "Season stats that compute themselves — AVG, OBP, ERA, RBI, and your win-loss record.",
      "The AI Assistant Coach builds your lineup from real on-base and power numbers (Coach add-on).",
    ],
    faqs: [
      {
        q: "Is the softball team website really free?",
        a: "It's free for parents, always — they open your team link, type a passcode once, and they're in with no app and no account. Coaches start free, and the full season is half off for 2026.",
      },
      {
        q: "Can parents follow the game live?",
        a: "Yes. You score from your phone and the run, inning, and final update on the team page in real time, so anyone with the link follows along from anywhere.",
      },
      {
        q: "Does it track batting and pitching stats?",
        a: "It does. Enter each game in a simple grid and season AVG, OBP, ERA, RBI, and your record are calculated automatically.",
      },
      {
        q: "Do parents need to download an app?",
        a: "No. It opens in any web browser on any device, with no app store and no account. They can add it to their home screen for one-tap access.",
      },
    ],
    related: [
      { slug: "softball-scorekeeping-app", title: "The Softball Scorekeeping App Parents Can Follow Live" },
      { slug: "live-scorekeeping-every-sport", title: "Live Scorekeeping for Every Sport" },
      { slug: "ai-assistant-coach-for-youth-teams", title: "An AI Assistant Coach for Youth Teams" },
      { slug: "game-day-alerts-team-notifications", title: "Game-Day Alerts and Team Notifications" },
      { slug: "share-team-schedule-and-photos-without-an-app", title: "Share the Team Schedule and Photos Without an App" },
    ],
  },

  {
    slug: "basketball-team-website",
    sport: "Basketball",
    emoji: "🏀",
    accentText: "text-orange-400",
    accentBorder: "border-orange-500/30",
    accentBg: "bg-orange-500/10",
    accentDot: "bg-orange-500",
    titleTag: "Free Basketball Team Website — Roster, Live Scoreboard & Stats",
    metaDescription:
      "Build a free youth basketball team website in 5 minutes — roster, live scoreboard, points/rebounds/assists, schedule with RSVPs, photos, and saved plays. Parents never download an app, make an account, or pay.",
    keywords: [
      "basketball team website",
      "free basketball team website",
      "youth basketball team website builder",
      "basketball team app for parents",
      "basketball team page",
    ],
    heroTitle: "BASKETBALL TEAM",
    heroAccent: "WEBSITE",
    heroSub:
      "Give your youth basketball team a website parents actually open — roster, live scoreboard, stats, photos, and saved plays. Live in five minutes. Parents never download an app, make an account, or pay a dime.",
    intro: [
      "Between the schedule, the gym addresses, the rotation, and the scoreboard, a basketball season is a lot to keep straight. My-Team Sports puts all of it on one page your whole team shares — coaches, players, and every parent in the family.",
      "Run the live scoreboard from the bench and the score, quarter, and clock update on your team page in real time. Points, rebounds, and assists build into season stats automatically, and your saved plays live right on the team site for players to study.",
    ],
    scoring: "points, quarters, and the clock",
    positions: ["PG", "SG", "SF", "PF", "C"],
    mockup: {
      team: "Downtown Dragons 16U",
      record: "9–3",
      live: "LIVE · Dragons 41, Lions 38 · Q3 4:12",
      leaders: [
        { name: "Alex M.", line: "18.4 PPG" },
        { name: "Chris D.", line: "9.1 RPG" },
        { name: "Jordan P.", line: "6.2 APG" },
      ],
    },
    highlights: [
      "Live scoreboard — score, quarter, and clock update on your team page as the game happens.",
      "Season stats that compute themselves — points, rebounds, assists, and your win-loss record.",
      "Saved plays from the Coach's Play Board live on the team site for players to study.",
      "The AI Assistant Coach turns your real game data into a briefing and a printable practice plan (Coach add-on).",
    ],
    faqs: [
      {
        q: "Is the basketball team website really free?",
        a: "It's free for parents, always — they open your team link, type a passcode once, and they're in with no app and no account. Coaches start free, and the full season is half off for 2026.",
      },
      {
        q: "Can parents follow the game live if they're not in the gym?",
        a: "Yes. Run the scoreboard from the bench and the score, quarter, and clock update on the team page in real time for anyone with the link.",
      },
      {
        q: "Does it track points, rebounds, and assists?",
        a: "It does. Enter each game in a simple grid and season PPG, RPG, APG, and your record are calculated automatically.",
      },
      {
        q: "Can players see the plays?",
        a: "Yes. Plays you draw on the Coach's Play Board save to the team playbook, which players open right on the team site — no app, no account.",
      },
    ],
    related: [
      { slug: "basketball-rotation-chart", title: "A Basketball Rotation Chart That Keeps Minutes Fair" },
      { slug: "how-to-coach-youth-basketball", title: "How to Coach Youth Basketball" },
      { slug: "basketball-positions-explained", title: "Basketball Positions Explained for Youth Coaches" },
      { slug: "basketball-live-scoreboard-app", title: "The Basketball Live Scoreboard App Parents Can Follow" },
      { slug: "basketball-play-designer", title: "A Basketball Play Designer You Can Print" },
    ],
  },

  {
    slug: "soccer-team-website",
    sport: "Soccer",
    emoji: "⚽",
    accentText: "text-blue-400",
    accentBorder: "border-blue-500/30",
    accentBg: "bg-blue-500/10",
    accentDot: "bg-blue-500",
    titleTag: "Free Soccer Team Website — Roster, Live Scores & Formations",
    metaDescription:
      "Build a free youth soccer team website in 5 minutes — roster, live scores, schedule with RSVPs, photos, and formations from the Coach's Playbook. Parents never download an app, make an account, or pay.",
    keywords: [
      "soccer team website",
      "free soccer team website",
      "youth soccer team website builder",
      "soccer team app for parents",
      "soccer team page",
    ],
    heroTitle: "SOCCER TEAM",
    heroAccent: "WEBSITE",
    heroSub:
      "Give your youth soccer team a website parents actually open — roster, live scores, the schedule, photos, and Saturday's formation. Live in five minutes. Parents never download an app, make an account, or pay a dime.",
    intro: [
      "Kickoff times, field addresses, who's available Saturday, and this week's formation — a soccer season is a lot of moving parts. My-Team Sports puts all of it on one page your whole club shares, from the coach to the grandparent on the sideline.",
      "Post the score live from the touchline and it updates on your team page in real time. Goals, assists, and clean sheets build into season stats, and the formations you draw on the Coach's Playbook live right on the team site for players to see before warm-ups.",
    ],
    scoring: "goals and the run of play",
    positions: ["GK", "DF", "MF", "FW"],
    mockup: {
      team: "Eastside United 14U",
      record: "8–1–2",
      live: "LIVE · United 2, Rovers 1 · 68'",
      leaders: [
        { name: "Emma S.", line: "11 goals" },
        { name: "Liam O.", line: "7 assists" },
        { name: "Noah K.", line: "6 clean sheets" },
      ],
    },
    highlights: [
      "Live score from the touchline — updates on your team page as the match happens.",
      "Season stats that compute themselves — goals, assists, clean sheets, and your record.",
      "Set pieces and formations from the Coach's Playbook, on the team site for players to study.",
      "The AI Assistant Coach turns your results into a briefing and a printable practice plan (Coach add-on).",
    ],
    faqs: [
      {
        q: "Is the soccer team website really free?",
        a: "It's free for parents, always — they open your team link, type a passcode once, and they're in with no app and no account. Coaches start free, and the full season is half off for 2026.",
      },
      {
        q: "Can parents follow the match live?",
        a: "Yes. Post the score from the touchline and it updates on the team page in real time for anyone with the link.",
      },
      {
        q: "Can I share the formation with players?",
        a: "Yes. Draw formations and set pieces on the Coach's Playbook, save them to the team, and players open them right on the team site before warm-ups.",
      },
      {
        q: "Do parents need to download an app?",
        a: "No. It opens in any web browser on any device, with no app store and no account. They can add it to their home screen for one-tap access.",
      },
    ],
    related: [
      { slug: "soccer-lineup-formation-sheet", title: "A Soccer Lineup and Formation Sheet You Can Print" },
      { slug: "soccer-drills-for-beginners", title: "Soccer Drills for Beginners" },
      { slug: "soccer-positions-explained", title: "Soccer Positions Explained for Youth Coaches" },
      { slug: "how-to-coach-youth-soccer", title: "How to Coach Youth Soccer" },
      { slug: "ai-soccer-practice-planner", title: "An AI Soccer Practice Planner" },
    ],
  },

  {
    slug: "football-team-website",
    sport: "Football",
    emoji: "🏈",
    accentText: "text-green-400",
    accentBorder: "border-green-500/30",
    accentBg: "bg-green-500/10",
    accentDot: "bg-green-500",
    titleTag: "Free Football Team Website — Roster, Depth Chart & Playbook",
    metaDescription:
      "Build a free youth football team website in 5 minutes — roster, depth chart, live scores, schedule with RSVPs, photos, and a playbook you draw and print. Parents never download an app, make an account, or pay.",
    keywords: [
      "football team website",
      "free football team website",
      "youth football team website builder",
      "football team app for parents",
      "football team page",
    ],
    heroTitle: "FOOTBALL TEAM",
    heroAccent: "WEBSITE",
    heroSub:
      "Give your youth football team a website parents actually open — roster, depth chart, live scores, photos, and a playbook you draw and print. Live in five minutes. Parents never download an app, make an account, or pay a dime.",
    intro: [
      "A football roster is deep and the depth chart is deeper — offense, defense, special teams, and a playbook to go with it. My-Team Sports keeps all of it on one page your whole program shares, from coordinators to the grandparent in the stands.",
      "Post the score live and it updates on your team page in real time. Draw routes and formations on the Coach's Play Board, save them to your playbook, and print clean sheets for the sideline — then let players study the same plays on the team site.",
    ],
    scoring: "scores, quarters, and the clock",
    positions: ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB"],
    mockup: {
      team: "Northgate Chargers 12U",
      record: "6–2",
      live: "LIVE · Chargers 21, Eagles 14 · Q3",
      leaders: [
        { name: "Tyler B.", line: "1,240 pass yds" },
        { name: "Marcus W.", line: "820 rush yds" },
        { name: "Devin R.", line: "14 TD" },
      ],
    },
    highlights: [
      "Draw routes and formations on the Coach's Play Board, save your playbook, and print sideline sheets.",
      "Live score updates on your team page as the game happens.",
      "The depth chart and roster, organized by position and visible to your whole staff.",
      "The AI Assistant Coach turns your game data into a briefing and a printable practice plan (Coach add-on).",
    ],
    faqs: [
      {
        q: "Is the football team website really free?",
        a: "It's free for parents, always — they open your team link, type a passcode once, and they're in with no app and no account. Coaches start free, and the full season is half off for 2026.",
      },
      {
        q: "Can I build and print a playbook?",
        a: "Yes. Draw plays on the Coach's Play Board from your phone, save them to your team playbook, and print a single play or the full book for the sideline.",
      },
      {
        q: "Can players study the plays?",
        a: "Yes. Saved plays live on the team site, so players can study routes and assignments at home — no app, no account.",
      },
      {
        q: "Can parents follow the game live?",
        a: "Yes. Post the score and it updates on the team page in real time for anyone with the link.",
      },
    ],
    related: [
      { slug: "football-depth-chart-template", title: "A Football Depth Chart Template for Youth Coaches" },
      { slug: "football-roster-template", title: "A Youth Football Roster Template" },
      { slug: "football-positions-explained", title: "Football Positions Explained for Youth Coaches" },
      { slug: "how-to-coach-youth-football", title: "How to Coach Youth Football" },
      { slug: "football-coaching-app-playbook-ai-coach", title: "A Football Coaching App with a Playbook and AI Coach" },
    ],
  },

  {
    slug: "flag-football-team-website",
    sport: "Flag Football",
    emoji: "🚩",
    accentText: "text-emerald-400",
    accentBorder: "border-emerald-500/30",
    accentBg: "bg-emerald-500/10",
    accentDot: "bg-emerald-500",
    titleTag: "Free Flag Football Team Website — Roster, Playbook & Live Scores",
    metaDescription:
      "Build a free youth flag football team website in 5 minutes — roster, a play designer you can print, live scores, schedule with RSVPs, and photos. Parents never download an app, make an account, or pay.",
    keywords: [
      "flag football team website",
      "free flag football team website",
      "youth flag football team website builder",
      "flag football team app for parents",
      "flag football play designer",
    ],
    heroTitle: "FLAG FOOTBALL TEAM",
    heroAccent: "WEBSITE",
    heroSub:
      "Give your flag football team a website parents actually open — roster, a play designer you draw and print, live scores, and photos. Live in five minutes. Parents never download an app, make an account, or pay a dime.",
    intro: [
      "Flag football is all about the plays, and getting them from your head to a wristband to a seven-year-old is the real work. My-Team Sports gives you a play designer on your phone and a team page that holds the whole season — schedule, roster, scores, and photos.",
      "Draw routes on the Coach's Play Board, save your play sheet, and print it for the game. Post the score live and it updates on your team page in real time, and every play you save is right there for players to study before Saturday.",
    ],
    scoring: "scores and the clock",
    positions: ["QB", "C", "WR", "RB", "Rusher", "Safety"],
    mockup: {
      team: "Westside Wolves 12U",
      record: "5–1",
      live: "LIVE · Wolves 26, Bears 20 · Q4",
      leaders: [
        { name: "Cole R.", line: "9 pass TD" },
        { name: "Jaden M.", line: "7 rush TD" },
        { name: "Eli T.", line: "5 flags pulled/gm" },
      ],
    },
    highlights: [
      "A play designer on your phone — draw routes, save your play sheet, and print it for the game.",
      "Saved plays on the team site for players to study before Saturday.",
      "Live score updates on your team page as the game happens.",
      "The AI Assistant Coach turns your game data into a briefing and a printable practice plan (Coach add-on).",
    ],
    faqs: [
      {
        q: "Is the flag football team website really free?",
        a: "It's free for parents, always — they open your team link, type a passcode once, and they're in with no app and no account. Coaches start free, and the full season is half off for 2026.",
      },
      {
        q: "Can I design and print play sheets?",
        a: "Yes. Draw plays on the Coach's Play Board from your phone, save them, and print a single play or your full sheet for game day.",
      },
      {
        q: "Can players see the plays at home?",
        a: "Yes. Saved plays live on the team site, so players can study the routes before the game — no app, no account.",
      },
      {
        q: "Do parents need an app?",
        a: "No. It opens in any web browser on any device, with no app store and no account. They can add it to their home screen for one-tap access.",
      },
    ],
    related: [
      { slug: "flag-football-play-sheet-template", title: "A Flag Football Play Sheet Template" },
      { slug: "flag-football-play-designer", title: "A Flag Football Play Designer You Can Print" },
      { slug: "flag-football-positions-explained", title: "Flag Football Positions Explained" },
      { slug: "how-to-coach-youth-flag-football", title: "How to Coach Youth Flag Football" },
      { slug: "flag-football-drills-for-beginners", title: "Flag Football Drills for Beginners" },
    ],
  },

  {
    slug: "volleyball-team-website",
    sport: "Volleyball",
    emoji: "🏐",
    accentText: "text-purple-400",
    accentBorder: "border-purple-500/30",
    accentBg: "bg-purple-500/10",
    accentDot: "bg-purple-500",
    titleTag: "Free Volleyball Team Website — Roster, Rotations & Live Scores",
    metaDescription:
      "Build a free youth volleyball team website in 5 minutes — roster, rotations from the Coach's Playbook, live set scores, schedule with RSVPs, stats, and photos. Parents never download an app, make an account, or pay.",
    keywords: [
      "volleyball team website",
      "free volleyball team website",
      "youth volleyball team website builder",
      "volleyball team app for parents",
      "volleyball team page",
    ],
    heroTitle: "VOLLEYBALL TEAM",
    heroAccent: "WEBSITE",
    heroSub:
      "Give your youth volleyball team a website parents actually open — roster, rotations, live set scores, stats, and photos. Live in five minutes. Parents never download an app, make an account, or pay a dime.",
    intro: [
      "Match times, gym addresses, the rotation, and who's serving where — a volleyball season keeps you organized whether you like it or not. My-Team Sports puts all of it on one page your whole team shares, from the coach to the grandparent in the bleachers.",
      "Post set scores live and they update on your team page in real time. Kills, aces, and digs build into season stats, and the rotations you draw on the Coach's Playbook live right on the team site for players to study.",
    ],
    scoring: "points, sets, and rotations",
    positions: ["S", "OH", "MB", "OPP", "L/DS"],
    mockup: {
      team: "Summit Storm 15U",
      record: "10–4",
      live: "LIVE · Storm 21, Waves 18 · Set 3",
      leaders: [
        { name: "Ava L.", line: "142 kills" },
        { name: "Mia C.", line: "38 aces" },
        { name: "Sofia R.", line: "121 digs" },
      ],
    },
    highlights: [
      "Live set scores that update on your team page as the match happens.",
      "Season stats that compute themselves — kills, aces, digs, and your win-loss record.",
      "Rotations you draw on the Coach's Playbook, on the team site for players to study.",
      "The AI Assistant Coach turns your match data into a briefing and a printable practice plan (Coach add-on).",
    ],
    faqs: [
      {
        q: "Is the volleyball team website really free?",
        a: "It's free for parents, always — they open your team link, type a passcode once, and they're in with no app and no account. Coaches start free, and the full season is half off for 2026.",
      },
      {
        q: "Can parents follow the match live?",
        a: "Yes. Post set scores from the bench and they update on the team page in real time for anyone with the link.",
      },
      {
        q: "Does it track kills, aces, and digs?",
        a: "It does. Enter each match in a simple grid and season totals and your record are calculated automatically.",
      },
      {
        q: "Do parents need to download an app?",
        a: "No. It opens in any web browser on any device, with no app store and no account. They can add it to their home screen for one-tap access.",
      },
    ],
    related: [
      { slug: "live-scorekeeping-every-sport", title: "Live Scorekeeping for Every Sport" },
      { slug: "coachs-playbook-draw-and-print-plays", title: "The Coach's Playbook — Draw and Print Plays" },
      { slug: "ai-assistant-coach-for-youth-teams", title: "An AI Assistant Coach for Youth Teams" },
      { slug: "game-day-alerts-team-notifications", title: "Game-Day Alerts and Team Notifications" },
      { slug: "share-team-schedule-and-photos-without-an-app", title: "Share the Team Schedule and Photos Without an App" },
    ],
  },

  {
    slug: "hockey-team-website",
    sport: "Hockey",
    emoji: "🏒",
    accentText: "text-cyan-400",
    accentBorder: "border-cyan-500/30",
    accentBg: "bg-cyan-500/10",
    accentDot: "bg-cyan-500",
    titleTag: "Free Hockey Team Website — Roster, Live Scores & Stats",
    metaDescription:
      "Build a free youth hockey team website in 5 minutes — roster, live scores, goals/assists/saves, schedule with RSVPs, photos, and breakouts from the Coach's Playbook. Parents never download an app, make an account, or pay.",
    keywords: [
      "hockey team website",
      "free hockey team website",
      "youth hockey team website builder",
      "hockey team app for parents",
      "hockey team page",
    ],
    heroTitle: "HOCKEY TEAM",
    heroAccent: "WEBSITE",
    heroSub:
      "Give your youth hockey team a website parents actually open — roster, live scores, stats, photos, and breakouts you draw and print. Live in five minutes. Parents never download an app, make an account, or pay a dime.",
    intro: [
      "Early ice times, rink addresses, the lines, and the score by period — hockey families live by the schedule. My-Team Sports puts all of it on one page your whole team shares, from the coach to the grandparent who drove to the rink.",
      "Post the score live and it updates on your team page in real time. Goals, assists, and save percentages build into season stats, and the breakouts you draw on the Coach's Playbook live right on the team site for players to study.",
    ],
    scoring: "goals, periods, and the clock",
    positions: ["G", "LD", "RD", "LW", "C", "RW"],
    mockup: {
      team: "Lakeside Ice Hawks 14U",
      record: "11–5",
      live: "LIVE · Ice Hawks 3, Kings 2 · 2nd",
      leaders: [
        { name: "Jack M.", line: "22 goals" },
        { name: "Ryan T.", line: "19 assists" },
        { name: "Owen P.", line: ".915 save %" },
      ],
    },
    highlights: [
      "Live score updates on your team page as the game happens, period by period.",
      "Season stats that compute themselves — goals, assists, save percentage, and your record.",
      "Breakouts and set plays from the Coach's Playbook, on the team site for players to study.",
      "The AI Assistant Coach turns your game data into a briefing and a printable practice plan (Coach add-on).",
    ],
    faqs: [
      {
        q: "Is the hockey team website really free?",
        a: "It's free for parents, always — they open your team link, type a passcode once, and they're in with no app and no account. Coaches start free, and the full season is half off for 2026.",
      },
      {
        q: "Can parents follow the game live?",
        a: "Yes. Post the score and it updates on the team page in real time, period by period, for anyone with the link.",
      },
      {
        q: "Does it track goals, assists, and saves?",
        a: "It does. Enter each game in a simple grid and season totals, save percentage, and your record are calculated automatically.",
      },
      {
        q: "Do parents need to download an app?",
        a: "No. It opens in any web browser on any device, with no app store and no account. They can add it to their home screen for one-tap access.",
      },
    ],
    related: [
      { slug: "live-scorekeeping-every-sport", title: "Live Scorekeeping for Every Sport" },
      { slug: "coachs-playbook-draw-and-print-plays", title: "The Coach's Playbook — Draw and Print Plays" },
      { slug: "ai-assistant-coach-for-youth-teams", title: "An AI Assistant Coach for Youth Teams" },
      { slug: "game-day-alerts-team-notifications", title: "Game-Day Alerts and Team Notifications" },
      { slug: "share-team-schedule-and-photos-without-an-app", title: "Share the Team Schedule and Photos Without an App" },
    ],
  },
];

export function getAllSports() {
  return SPORTS;
}

export function getSport(slug) {
  return SPORTS.find((s) => s.slug === slug) || null;
}
