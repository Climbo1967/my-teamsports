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
    slug: "hockey-line-chart-template",
    title: "Hockey Line Chart Template (Free Printable PDF)",
    description:
      "A free printable youth hockey line chart template — four forward lines, three defensive pairs, and goalies on one sheet you can fill in before you get to the rink.",
    excerpt:
      "Four forward lines, three D pairs, and your goalies on one page — set the lines at the kitchen table, not in the locker room.",
    tag: "Hockey",
    date: "2026-08-07",
    updated: "2026-08-07",
    readingTime: "4 min read",
    keywords: ["hockey line chart template", "printable hockey line chart", "youth hockey lines sheet", "hockey line up sheet pdf", "hockey forward lines template"],
    body: [
      { p: "Every hockey coach builds the same sheet before every game, and most of them build it twice — once on a napkin at home and again on the locker room whiteboard because the napkin is in a coat pocket. This free printable line chart gives you four forward lines, three defensive pairs, and your goalies on one page, so the lines you thought about on Tuesday are the lines you actually roll on Saturday." },
      { download: { href: "/downloads/hockey-line-chart.pdf", label: "Hockey Line Chart Template (printable PDF)", note: "Four forward lines, three D pairs, two goalies, plus special teams and notes. Free, no email required." } },
      { h2: "What is on the sheet" },
      { p: "Four forward lines with a left wing, center, and right wing on each; three defensive pairs; and two goalie slots. Underneath there is room for a power play unit, a penalty kill unit, and notes — because the questions that actually cost you a game are \"who is out there down a goal with a minute left?\" and \"who takes the draw in our own end?\", and those get answered before warmups or not at all." },
      { h2: "Building lines for a youth team" },
      { p: "Resist the urge to stack a super line. At the youth level a top-heavy roster loses games in the second and third periods, because the fourth line you never developed has to play anyway. The version that holds up is balanced: spread your strongest skaters so every line has someone who can carry the puck out of the zone, and pair a steadier defender with a rangier one rather than putting both of your best on the same shift." },
      { p: "Centers matter more than wings at this age. A center who backchecks and can win a draw makes the other two players on that line look better, so start by picking your four centers, then build wings around them." },
      { h2: "Roll your lines, do not match them" },
      { p: "Line matching — chasing the other team's best players with your own — is a habit borrowed from watching pro hockey, and it is close to useless in youth leagues. It burns your top players out by the third period, it visibly benches everyone else, and it teaches your fourth line that they are there to fill time. Roll the lines in order and change every forty-five seconds or so. Short shifts and predictable rotation give you fresher legs late and far fewer parent conversations in the lobby." },
      { p: "If your league carries a minimum-play rule, the line chart is the document that proves you met it. Fill it in before the game and it is a plan; fill it in after, and it is a reconstruction." },
      { h2: "When the paper sheet meets a live one" },
      { p: "Paper is right for the bench boards, but it cannot tell the parent who could not get to the rink what the score is. If you run your team on My-Team Sports, your roster, schedule with rink addresses and RSVPs, and the live score by period all live on one page your whole team shares with a single link — and you can draw and print your breakouts and faceoff plays from the Coach's Playbook. Print this chart as the bench copy." },
    ],
    related: [
      { href: "/blog/hockey-shift-chart-template", label: "Hockey Shift Chart Template", note: "Track ice time period by period" },
      { href: "/blog/hockey-practice-plan-template", label: "60-Minute Hockey Practice Plan", note: "Station-based, free printable" },
      { href: "/sports/hockey-team-website", label: "Hockey Team Website", note: "Roster, live scores, and stats in one link" },
    ],
    faqs: [
      { q: "How do you make a hockey line chart?", a: "List four forward lines with a center and two wings each, then three defensive pairs and your goalies. Add a power play and penalty kill unit underneath. Fill it in before the game so line changes during play are a rotation, not a decision." },
      { q: "How many lines does a youth hockey team run?", a: "Most youth teams dress twelve to fifteen skaters, which is three or four forward lines and two or three defensive pairs. With three lines you are changing more often; with four, shifts are shorter and legs stay fresher into the third period." },
      { q: "Should a youth hockey coach match lines?", a: "Generally no. Rolling lines in a fixed order keeps ice time even, keeps players fresh, and develops your whole roster. Line matching concentrates minutes on a few players and stalls the development of everyone else." },
      { q: "How long should a youth hockey shift be?", a: "About forty to sixty seconds. Shorter shifts mean harder skating, quicker recovery on the bench, and more even ice time across the roster than long shifts do." },
    ],
  },
  {
    slug: "hockey-shift-chart-template",
    title: "Hockey Shift Chart Template (Free Printable PDF)",
    description:
      "A free printable hockey shift chart for tracking ice time period by period — see who is getting short-changed before a parent tells you.",
    excerpt:
      "A shift-by-shift grid for all three periods, so equal ice time is something you can prove instead of something you hope.",
    tag: "Hockey",
    date: "2026-08-07",
    updated: "2026-08-07",
    readingTime: "4 min read",
    keywords: ["hockey shift chart template", "printable hockey ice time tracker", "youth hockey ice time sheet", "hockey shift tracker pdf", "equal ice time hockey"],
    body: [
      { p: "Ask any youth hockey coach whether ice time is even across the roster and they will say yes. Ask them to prove it and the conversation changes. This free printable shift chart is the proof: a grid where a parent or assistant marks each player's shifts through all three periods, so at the buzzer you know exactly who played and who did not." },
      { download: { href: "/downloads/hockey-shift-chart.pdf", label: "Hockey Shift Chart Template (printable PDF)", note: "Roster down the side, shift boxes across three periods, running totals. Free, no email required." } },
      { h2: "What is on the sheet" },
      { p: "Every player down the left side, with a row of shift boxes for each period and a totals column at the far right. One person on the bench — an assistant, a parent, a sibling old enough to pay attention — puts a tick in the box each time a player goes over the boards. That is the whole system. It takes no hockey knowledge to run, which is exactly why it gets run consistently." },
      { h2: "Why the tally beats your memory" },
      { p: "Ice time drifts without anyone intending it. A line gets a power play, then the shift right after, then the coach leaves them out because the puck is in the offensive zone and a change feels risky. Three of those in a period and one line has played half again as much as another, and nobody on the bench noticed — least of all the coach, who was watching the puck." },
      { p: "The chart makes the drift visible while you can still fix it. Glance at the totals between the second and third period and you know who to double-shift and who to sit for a rotation, before the game ends and the math becomes an argument." },
      { h2: "Reading it after the game" },
      { p: "Two numbers matter. The gap between your most-played and least-played skater tells you whether the rotation held: inside three or four shifts is a well-run bench, anything past six or seven and a kid on your team knows they are being benched even if you have not said so. The second is the trend across periods — if the spread widens in the third, you are shortening the bench under pressure, which is the single most common habit that drives families out of youth hockey." },
      { h2: "From the clipboard to the team page" },
      { p: "The chart lives on the bench, but the season lives somewhere else. If you run your team on My-Team Sports, the roster, the schedule with rink addresses and RSVPs, the live score by period, and your season stats all sit on one page that parents open with a link and a passcode — no app, no account, and no charge to them ever. Print this sheet for the bench and let the site handle everything after the handshake line." },
    ],
    related: [
      { href: "/blog/hockey-line-chart-template", label: "Hockey Line Chart Template", note: "Four lines, three D pairs, one page" },
      { href: "/blog/hockey-practice-plan-template", label: "60-Minute Hockey Practice Plan", note: "Station-based, free printable" },
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "The same equal-minutes idea, on a court" },
    ],
    faqs: [
      { q: "How do you track ice time in youth hockey?", a: "The simplest reliable method is a paper shift chart: list the roster down one side and tick a box each time a player goes over the boards, with a column per period. It needs no hockey knowledge to run, so an assistant or a parent can keep it every game." },
      { q: "How much ice time should a youth hockey player get?", a: "At the developmental levels the goal is roughly even shifts across all skaters. A practical benchmark is keeping the gap between your most-played and least-played skater inside three or four shifts per game." },
      { q: "What is a fair way to handle a shortened bench?", a: "Decide before the game rather than in the third period. If you plan to shorten the bench in a specific situation — a late penalty kill, for example — say so to the team beforehand so it reads as a role, not a benching." },
      { q: "Does a shift chart work for house league and travel teams?", a: "Yes. House leagues often carry a minimum-play rule the chart documents directly, and travel teams use it to catch the ice-time drift that happens when special teams and momentum start driving line changes." },
    ],
  },
  {
    slug: "hockey-practice-plan-template",
    title: "60-Minute Hockey Practice Plan Template (Free Printable PDF)",
    description:
      "A free printable 60-minute youth hockey practice plan template built around stations and small-area games, so a full sheet of ice never has twenty kids standing in one line.",
    excerpt:
      "Ice is the most expensive hour in youth sports. This station-based template makes sure you use all of it.",
    tag: "Hockey",
    date: "2026-08-07",
    updated: "2026-08-07",
    readingTime: "5 min read",
    keywords: ["hockey practice plan template", "youth hockey practice plan pdf", "60 minute hockey practice plan", "printable hockey practice template", "hockey station practice plan"],
    body: [
      { p: "Ice is the most expensive hour in youth sports, and the classic drill — twenty kids in one line at the blue line, one skater going at a time — wastes most of it. This free printable plan is built the other way: the sheet is split into zones, small groups rotate through stations, and almost everybody is moving almost all the time." },
      { download: { href: "/downloads/hockey-practice-plan.pdf", label: "60-Minute Hockey Practice Plan Template (printable PDF)", note: "Timed blocks, three station boxes, small-area game, and a notes column. Free, no email required." } },
      { h2: "How the hour is laid out" },
      { p: "Five minutes of free skate and edges as players come on. Ten minutes of a full-ice warmup that touches the puck early rather than skating laps. Then the core: thirty minutes of three stations running at once in the three zones, groups rotating every ten minutes. Ten minutes of a small-area game to finish, and five minutes of a cool-down and a short talk while everyone can still hear you." },
      { p: "The plan has a blank column beside each block. Write the drill name and the one coaching point you actually intend to say — one, not four. A practice where every player hears the same single cue three times teaches more than one where they hear twelve different cues once." },
      { h2: "Why stations, not lines" },
      { p: "Running three stations in three zones roughly triples the repetitions each player gets in the same hour, and it solves the discipline problem at the same time — kids standing in a long line find something else to do, and it is rarely hockey. It also means one coach never has to hold the attention of the whole group; each coach owns a zone and a drill and can actually teach." },
      { p: "At the younger ages, cross-ice and half-ice work is not a compromise for lack of space; it is the point. A smaller surface puts the puck on every stick more often, forces quicker decisions, and produces more of the battles along the boards that actual games are made of." },
      { h2: "The small-area game is not the reward" },
      { p: "It is common to finish with a scrimmage and treat it as the fun part after the real work. Flip that. A three-on-three in one zone with a two-touch rule or no offside is where the skills from the stations get used under pressure, and it is the closest thing to a game your practice contains. Protect those ten minutes; cut a station before you cut them." },
      { h2: "Keeping the season straight" },
      { p: "One printed plan runs one practice. The rest of the season — who is coming, which rink, what time the ice actually starts, and what happened last game — is where hockey families lose track. If you run your team on My-Team Sports, the schedule with rink addresses and RSVPs, the roster, the live score by period, photos, and your breakouts drawn in the Coach's Playbook all sit on one page anyone on your team opens with a link. Parents never install an app, never make an account, and never pay." },
    ],
    related: [
      { href: "/blog/hockey-line-chart-template", label: "Hockey Line Chart Template", note: "Four lines, three D pairs, one page" },
      { href: "/blog/hockey-shift-chart-template", label: "Hockey Shift Chart Template", note: "Track ice time period by period" },
      { href: "/sports/hockey-team-website", label: "Hockey Team Website", note: "Roster, live scores, and stats in one link" },
    ],
    faqs: [
      { q: "How long should a youth hockey practice be?", a: "Most youth ice slots run fifty to sixty minutes. Plan the whole slot in timed blocks — a five-minute overrun at the start is five minutes stolen from the end, because the next team is already at the door." },
      { q: "What is a station-based hockey practice?", a: "The ice is divided into zones, each with its own coach and drill, and small groups rotate through on a timer. Every player gets far more repetitions than in a single-line full-ice drill, and each coach only has to manage a handful of kids at a time." },
      { q: "Why is cross-ice hockey used for younger players?", a: "A smaller playing surface puts the puck on each player's stick far more often, shortens the distance decisions have to be made in, and creates more puck battles. It develops skills faster than full ice at ages where players cannot yet cover the full sheet." },
      { q: "How many coaches do you need for a station practice?", a: "Three is comfortable — one per zone. Two works if one station is self-running, like a skills course players can cycle through without instruction. A parent volunteer can run a timer and rotate groups even without hockey experience." },
    ],
  },
  {
    slug: "baseball-lineup-card-template",
    title: "Baseball Lineup Card Template (Free Printable PDF)",
    description:
      "A free printable baseball lineup card template with batting order, defensive positions by inning, and a substitutes section — sized for youth and Little League game day.",
    excerpt:
      "Batting order, positions by inning, and subs on one card — set your lineup in the kitchen, not at the fence.",
    tag: "Baseball",
    date: "2026-08-04",
    updated: "2026-08-04",
    readingTime: "4 min read",
    keywords: ["baseball lineup card template", "printable baseball lineup card", "baseball batting order template", "youth baseball lineup card", "little league lineup card pdf"],
    body: [
      { p: "The lineup card is the one piece of paper every baseball coach touches every single game. This free printable gives you the batting order, each player's defensive position inning by inning, and a substitutes section on a single card — so the dugout question is never \"who's up?\" or \"where am I playing?\" again." },
      { download: { href: "/downloads/baseball-lineup-card.pdf", label: "Baseball Lineup Card Template (printable PDF)", note: "Batting order 1–12, positions for six innings, and a subs section. Free, no email required." } },
      { h2: "What is on the card" },
      { p: "Twelve batting slots (enough for a continuous order), a position box for each of six innings, and space for substitutes and notes. Print two copies — one for your dugout, one for the opposing coach or scorekeeper — and the pre-game exchange takes ten seconds." },
      { h2: "Setting a youth batting order" },
      { p: "Most youth and Little League programs bat a continuous order — every kid on the roster hits, and defense rotates separately. If your league uses a traditional nine-player order instead, the classic shape still works: contact hitters who get on base at the top, your best all-around hitter third, power in the fourth and fifth spots. At younger ages, resist over-engineering it; rotating the order across the season teaches more than optimizing it ever will." },
      { h2: "Plan the defense by inning, not by game" },
      { p: "The inning columns are the real coaching tool. Fill every inning before the game starts and you have already answered the hard questions: who sits when, who gets an infield inning, and whether your minimum-play rules are met — before a parent asks. A good rule of thumb is no player sits two innings in a row, and every player sees the infield at least once every couple of games." },
      { h2: "When the paper card meets a live one" },
      { p: "Paper is perfect for the dugout fence, but it can't tell you whether Saturday's lineup keeps everyone inside your league's playing-time rules. If you run your team on My-Team Sports, you can build the lineup online, keep score play by play from your phone, and let the AI lineup advisor suggest a batting order and defensive rotation from your roster — then print this card as the dugout copy." },
    ],
    related: [
      { href: "/blog/how-to-keep-a-baseball-scorebook", label: "How to Keep a Baseball Scorebook", note: "Score the game your lineup plays" },
      { href: "/blog/youth-baseball-practice-plan", label: "90-Minute Baseball Practice Plan", note: "Free reusable template" },
      { href: "/blog/baseball-scorekeeping-app", label: "Baseball Scorekeeping App", note: "Play-by-play scoring from your phone" },
    ],
    faqs: [
      { q: "How do you fill out a baseball lineup card?", a: "List the batting order top to bottom, add each player's starting defensive position, then fill the position boxes for later innings so substitutions are planned before the game. Note eligible substitutes at the bottom and give a copy to the opposing coach or scorekeeper." },
      { q: "What is a continuous batting order?", a: "Every player on the roster is in the batting order all game, even while sitting out on defense. Most youth and Little League divisions use it because it guarantees every kid hits and removes pinch-hitting complexity." },
      { q: "How many players should be in a youth baseball lineup?", a: "With a continuous order, everyone on the roster bats — commonly 10 to 12 players. Nine play defense at a time, so the inning-by-inning position boxes are where you plan fair rotation for the rest." },
    ],
  },
  {
    slug: "basketball-depth-chart-template",
    title: "Basketball Depth Chart Template (Free Printable PDF)",
    description:
      "A free printable basketball depth chart template with starters and backups for all five positions, plus a quarter-by-quarter rotation plan for managing playing time.",
    excerpt:
      "All five positions with starters and backups, plus a quarter-by-quarter rotation grid — your bench decisions made before tip-off.",
    tag: "Basketball",
    date: "2026-08-04",
    updated: "2026-08-04",
    readingTime: "4 min read",
    keywords: ["basketball depth chart template", "basketball depth chart printable", "basketball position chart", "youth basketball rotation plan", "basketball lineup template"],
    body: [
      { p: "A depth chart answers the question that decides close youth games: who comes in when a starter is tired, in foul trouble, or having a rough night. This free printable lays out starters, second string, and third string for all five positions, plus a quarter-by-quarter rotation grid — so your substitutions are decisions you already made, not sideline improvisation." },
      { download: { href: "/downloads/basketball-depth-chart.pdf", label: "Basketball Depth Chart Template (printable PDF)", note: "All five positions with three strings, a quarter-by-quarter rotation plan, and a notes section. Free, no email required." } },
      { h2: "What is in it" },
      { p: "The top grid ranks your roster by position — point guard through center, starter to third string. The bottom grid plans who is on the floor each quarter. Together they turn playing-time management from mental math into a piece of paper on your clipboard." },
      { h2: "How to build the chart" },
      { p: "Start with your point guards: at youth level, ball-handling is the scarcest skill, so know your second and third options before you need them. Then slot the rest by role rather than height alone — your best rebounder backs up the center spot even if she plays forward when both are in. Cross-train on purpose: every player should know two positions, because foul trouble never respects your chart." },
      { h2: "The rotation grid is the fairness tool" },
      { p: "Youth basketball's constant complaint is playing time, and the fix is planning it in ink. Fill the quarter grid before the game so every kid can see when they play. A simple pattern like equal halves — each player sits one full quarter, no one sits two — is easy to run from this sheet and easy to defend to a parent, because it's written down." },
      { h2: "Keep it current" },
      { p: "Rosters shift fast during a season; re-rank the chart every couple of weeks, not once in November. If you run your team on My-Team Sports, your roster and schedule already live online, the free live scoreboard keeps parents updated during games, and the printable rotation chart pairs with this one for equal-minutes tracking." },
    ],
    related: [
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Equal playing time, printable" },
      { href: "/blog/basketball-positions-explained", label: "Basketball Positions Explained", note: "All five spots, plain English" },
      { href: "/blog/basketball-practice-plan-template", label: "Basketball Practice Plan Template", note: "Free printable template" },
    ],
    faqs: [
      { q: "What is a depth chart in basketball?", a: "It is a chart listing all five positions with the players ranked behind each spot — starter, second string, third string. Coaches use it to plan substitutions, cover foul trouble, and manage playing time before the game starts." },
      { q: "How is a depth chart different from a rotation chart?", a: "The depth chart ranks who backs up whom at each position; the rotation chart schedules who is on the floor minute by minute or quarter by quarter. This template includes both — the ranking on top, a quarter-by-quarter plan below." },
      { q: "How do you manage playing time in youth basketball?", a: "Decide it before the game. Fill in the quarter-by-quarter grid so every player knows when they play, use a simple rule like no one sits two quarters in a row, and adjust the written plan — not your memory — when foul trouble forces a change." },
    ],
  },
  {
    slug: "softball-lineup-card-template",
    title: "Softball Lineup Card Template (Free Printable PDF)",
    description:
      "A free printable softball lineup card template with batting order, positions by inning, and DP/FLEX rows — ready for fastpitch and youth softball game day.",
    excerpt:
      "Batting order, positions by inning, and DP/FLEX rows on one printable card — built for fastpitch game day.",
    tag: "Softball",
    date: "2026-08-04",
    updated: "2026-08-04",
    readingTime: "4 min read",
    keywords: ["softball lineup card template", "printable softball lineup card", "fastpitch lineup card", "softball batting order template", "dp flex softball lineup"],
    body: [
      { p: "Softball lineup cards have one wrinkle baseball's don't: the DP/FLEX rule. This free printable handles it — batting order, defensive positions inning by inning, a substitutes section, and dedicated DP and FLEX rows so the one rule that confuses every new fastpitch coach is right there on the card instead of argued at the plate meeting." },
      { download: { href: "/downloads/softball-lineup-card.pdf", label: "Softball Lineup Card Template (printable PDF)", note: "Batting order 1–12, positions for six innings, subs section, and DP/FLEX rows. Free, no email required." } },
      { h2: "What is on the card" },
      { p: "Twelve batting slots for a continuous or traditional order, position boxes for six innings, DP and FLEX rows, and space for subs and notes. Print two copies and the pre-game card exchange is done in seconds." },
      { h2: "DP/FLEX in one paragraph" },
      { p: "The DP (designated player) bats but doesn't have to play defense; the FLEX plays defense but doesn't bat. They are linked: the FLEX can only enter the batting order in the DP's spot. Most coaches use it to get a big bat in the order for a defensive specialist — often the pitcher or catcher. Write both names on the card at the start; you can't add a DP/FLEX pair mid-game." },
      { h2: "Setting the order and the rotation" },
      { p: "In youth rec ball, a continuous order where everyone bats is the norm — fill all twelve slots and rotate defense separately. For tournament fastpitch, the classic shape holds: on-base speed at the top, your best hitter third, power behind her. Use the inning columns to plan defense before the game: no one sits twice in a row, everyone touches the infield across a couple of games, and your playing-time answers are already in ink when a parent asks." },
      { h2: "From paper card to live lineup" },
      { p: "The paper card runs the dugout; the season runs better online. With My-Team Sports you can build the lineup from your roster, score the game play by play from your phone, and let the AI lineup advisor suggest a batting order and rotation — then print this card as the copy that lives on the fence." },
    ],
    related: [
      { href: "/blog/baseball-lineup-card-template", label: "Baseball Lineup Card Template", note: "The baseball version of this card" },
      { href: "/blog/softball-scorekeeping-app", label: "Softball Scorekeeping App", note: "Play-by-play scoring from your phone" },
      { href: "/blog/live-scorekeeping-every-sport", label: "Live Scorekeeping", note: "Every sport, one scoreboard" },
    ],
    faqs: [
      { q: "What is the DP/FLEX rule in softball?", a: "The DP (designated player) hits but is not required to play defense, and the FLEX plays defense but does not bat. They are linked positions: the FLEX may only bat by taking the DP's spot in the order. You must declare both on the lineup card before the game — you cannot add the pair later." },
      { q: "How do you fill out a softball lineup card?", a: "List the batting order, each player's starting position, and your DP and FLEX if you use them. Fill the position boxes for later innings so rotation and playing-time rules are planned in advance, and note eligible substitutes at the bottom." },
      { q: "Does everyone bat in youth softball?", a: "Most youth rec leagues use a continuous batting order where the whole roster hits and defense rotates separately. Tournament fastpitch typically uses a nine-player order (ten with a DP), with listed substitutes — check your league or sanctioning body's rules." },
    ],
  },
  {
    "slug": "flag-football-positions-5v5",
    "title": "5v5 Flag Football Positions Explained (With Printable Cheat Sheet)",
    "description": "Every 5v5 flag football position explained — offense and defense roles, who should play where, and a free printable cheat sheet with a lineup card for game day.",
    "excerpt": "Who plays where in 5v5, what each spot actually does, and a printable lineup card so every kid knows their job before the snap.",
    "tag": "Flag Football",
    "date": "2026-08-03",
    "updated": "2026-08-03",
    "readingTime": "5 min read",
    "keywords": [
      "flag football positions 5v5",
      "5v5 flag football positions",
      "positions in flag football",
      "what are the 5 positions in flag football",
      "youth flag football positions",
      "flag football positions chart"
    ],
    "body": [
      {
        "p": "5v5 is the format most rec leagues actually play, and it doesn't work like 7-on-7 or tackle — there are no linemen, no tight ends, and every player is an eligible receiver. That changes what \"positions\" even means: they're roles for one play, not identities for a season. Here's what each spot does on both sides of the ball, and who to put where."
      },
      {
        "download": {
          "href": "/downloads/flag-football-5v5-positions.pdf",
          "label": "5v5 Flag Football Positions Cheat Sheet (printable PDF)",
          "note": "Offense and defense roles on one page, plus a blank lineup card for game day. Free, no email required."
        }
      },
      {
        "h2": "The five on offense"
      },
      {
        "table": {
          "headers": [
            "Position",
            "The job",
            "Put here"
          ],
          "rows": [
            [
              "Quarterback",
              "Takes the snap, reads the rush count, throws on time. Can't run past the line in most leagues until the ball is handed off.",
              "Your calmest decision-maker — not always your best athlete"
            ],
            [
              "Center",
              "Snaps, then releases into a short route. The most underused weapon in 5v5 — the checkdown is almost always open.",
              "A kid who wants touches but isn't fast yet"
            ],
            [
              "Receiver (x2)",
              "Runs the called route full speed even when the ball isn't coming. Decoys win flag games.",
              "Your fastest players"
            ],
            [
              "Running back / slot",
              "Motion, handoffs, swing passes — and picks up the rusher when you keep the QB throwing.",
              "Shifty over fast; good hands"
            ]
          ]
        }
      },
      {
        "h2": "The five on defense"
      },
      {
        "p": "Most 5v5 defenses come down to one rusher and four in coverage. The rusher starts seven yards off the ball (check your league) and comes hard every snap — pick a kid who loves the chase. Behind them, play two short defenders over the receivers and two deep safeties in a simple 2-2 shell. Man coverage teaches more but zone survives youth pick plays better; run zone until your team can call switches out loud. The one rule that saves touchdowns: nobody stands behind the deepest defender. Ever."
      },
      {
        "h2": "Rotate roles, not just kids"
      },
      {
        "p": "In tackle football, kids own a position. In 5v5, positions are cheap to rotate — and rotating them is how you find your actual quarterback by week four instead of guessing at practice one. Rotate by halves, not plays: a half at receiver, a half at rusher, and everyone learns why the other jobs matter. The cheat sheet's lineup card has slots for both halves so the rotation is decided before warmups, not argued during them."
      },
      {
        "h2": "Put the plan where parents can see it"
      },
      {
        "p": "Most sideline chaos is really a communication problem — who starts where, who subs when. If you run your team on My-Team Sports, your roster and schedule already live on one site parents open like an app, and the Coach's Playbook draws your flag plays on a proper field. Print the play sheet, clip the lineup card to it, and game day runs itself."
      }
    ],
    "related": [
      {
        "href": "/blog/flag-football-play-sheet-template",
        "label": "Flag Football Play Sheet",
        "note": "Ready-made 5v5 plays, printable"
      },
      {
        "href": "/blog/flag-football-drills-for-beginners",
        "label": "Flag Football Drills for Beginners",
        "note": "First-practice ready"
      },
      {
        "href": "/blog/how-to-coach-youth-flag-football",
        "label": "How to Coach Youth Flag Football",
        "note": "The season, start to finish"
      }
    ],
    "faqs": [
      {
        "q": "What are the 5 positions in 5v5 flag football?",
        "a": "On offense: quarterback, center, two receivers, and a running back or slot. On defense most teams play one rusher and four coverage players — two short, two deep. Every player is an eligible receiver in 5v5; there are no linemen."
      },
      {
        "q": "Does 5v5 flag football have linemen?",
        "a": "No. There are no offensive or defensive linemen in 5v5. The center snaps the ball and immediately becomes a receiver, and the defense rushes from a set-off distance (usually seven yards) instead of lining up on the ball."
      },
      {
        "q": "What position should my fastest player play?",
        "a": "Receiver on offense — speed stresses a youth defense more at receiver than anywhere else. On defense, put your fastest kid at deep safety, where recovery speed erases other mistakes."
      }
    ]
  },
  {
    "slug": "soccer-formations-by-age",
    "title": "Youth Soccer Formations by Age: 7v7, 9v9, and 11v11 (Printable)",
    "description": "The right soccer formation for every age group — 2-3-1 for 7v7, 3-2-3 for 9v9, 4-3-3 for 11v11 — with printable diagrams and why each shape teaches the game.",
    "excerpt": "One reliable shape per format — 7v7, 9v9, 11v11 — plus a printable diagram sheet, and why chasing adult formations backfires with young teams.",
    "tag": "Soccer",
    "date": "2026-08-03",
    "updated": "2026-08-03",
    "readingTime": "6 min read",
    "keywords": [
      "soccer formations",
      "youth soccer formations by age",
      "7v7 soccer formations",
      "9v9 soccer formations",
      "u8 soccer positions",
      "u10 soccer positions",
      "u12 soccer positions"
    ],
    "body": [
      {
        "p": "Youth soccer changes formats as kids grow — 7v7 around U8-U10, 9v9 at U11-U12, full 11v11 from U13 — and every format change resets the question of where everyone should play. The honest answer: at these ages the formation is a teaching tool, not a tactic. Pick one reliable shape per format, keep it all season, and spend your energy rotating kids through it."
      },
      {
        "download": {
          "href": "/downloads/soccer-formations-by-age.pdf",
          "label": "Soccer Formations by Age (printable PDF)",
          "note": "Diagrams for 2-3-1, 3-2-3, and 4-3-3 with each position's job in one line, plus a blank field for your own shape. Free, no email required."
        }
      },
      {
        "h2": "7v7 (U8–U10): play a 2-3-1"
      },
      {
        "p": "Two defenders, three across the middle, one striker. The 2-3-1 gives young players the two concepts that matter at this age — a teammate behind the ball and a teammate ahead of it — without asking anyone to understand offside traps. The wide midfielders do most of the running, so that's where restless legs go. Resist the 3-2-1 with a sweeper: it wins a few more games and teaches a lot less."
      },
      {
        "h2": "9v9 (U11–U12): play a 3-2-3"
      },
      {
        "p": "Three defenders, two central midfielders, three forwards. This is the bridge format — the 3-2-3 introduces real width in attack and asks the two central mids to make actual decisions: who presses, who covers. If your team gets overrun in midfield, a 3-3-2 is the safer version of the same idea. Either way, keep the back three flat and coach your defenders to step, not just drop."
      },
      {
        "h2": "11v11 (U13+): start from a 4-3-3"
      },
      {
        "p": "Four defenders, three midfielders, three forwards. The 4-3-3 is the easiest full-field shape to teach because every lane on the field belongs to someone, and it converts cleanly to the 4-4-2 or 4-2-3-1 they'll meet on older teams. Number the roles before you name kids: it's easier to say \"we need a 6 who wins the ball\" than to reshuffle personalities in midseason."
      },
      {
        "h2": "The age-to-format cheat table"
      },
      {
        "table": {
          "headers": [
            "Age group",
            "Format",
            "Formation",
            "Field players per kid concept"
          ],
          "rows": [
            [
              "U8–U10",
              "7v7",
              "2-3-1",
              "Behind the ball / ahead of the ball"
            ],
            [
              "U11–U12",
              "9v9",
              "3-2-3 (or 3-3-2)",
              "Width in attack, decisions in midfield"
            ],
            [
              "U13+",
              "11v11",
              "4-3-3",
              "Every lane owned, numbered roles"
            ]
          ]
        }
      },
      {
        "h2": "Put the lineup where everyone sees it"
      },
      {
        "p": "A formation only helps if the kids know where they're standing before the whistle. Pair the diagram sheet with a lineup that parents can see: on My-Team Sports your roster, schedule, and game-day lineup live on one team site parents open like an app — no group-text archaeology at 8am Saturday. Set the shape once, post the lineup, and coach the game instead of the sideline."
      }
    ],
    "related": [
      {
        "href": "/blog/soccer-lineup-formation-sheet",
        "label": "Soccer Lineup & Formation Sheet",
        "note": "Printable game-day sheet"
      },
      {
        "href": "/blog/soccer-positions-explained",
        "label": "Soccer Positions Explained",
        "note": "Every role in plain English"
      },
      {
        "href": "/blog/soccer-substitution-rotation-planner",
        "label": "Substitution Rotation Planner",
        "note": "Equal minutes, planned before kickoff"
      }
    ],
    "faqs": [
      {
        "q": "What is the best formation for 7v7 youth soccer?",
        "a": "A 2-3-1 — two defenders, three midfielders, one striker. It guarantees support behind the ball and a target ahead of it, which are the only two positional ideas most U8-U10 players are ready to use."
      },
      {
        "q": "What formation should a 9v9 team play?",
        "a": "Start with a 3-2-3. It adds real attacking width and asks the central midfielders to make genuine decisions. If you're getting overrun in the middle, a 3-3-2 trades a forward for another midfielder without changing the ideas underneath."
      },
      {
        "q": "Should young players have fixed positions?",
        "a": "No — fix the formation, rotate the kids. Keeping one shape all season gives the team stability while every player learns two or three roles inside it. Fixed positions before U13 mostly optimize for this Saturday at the cost of development."
      }
    ]
  },
  {
    "slug": "special-teams-depth-chart-template",
    "title": "Special Teams Depth Chart Template (Free Printable PDF)",
    "description": "Free printable special teams depth chart — kickoff, kick return, punt, punt return, and FG units on one sheet, with a starter and backup for every spot.",
    "excerpt": "All five kicking units on one printable sheet, a backup for every spot, and the five-minute Friday routine that prevents Saturday scrambles.",
    "tag": "Football",
    "date": "2026-08-03",
    "updated": "2026-08-03",
    "readingTime": "5 min read",
    "keywords": [
      "special teams depth chart template",
      "special teams football positions",
      "special teams depth chart",
      "kickoff return depth chart",
      "punt team depth chart",
      "football depth chart template"
    ],
    "body": [
      {
        "p": "Every coach has a depth chart for offense and defense. Almost nobody has one for special teams — which is why the punt team huddle is eleven kids looking at each other while you burn a timeout. Special teams is a third of the game and the phase where one missing kid does the most damage. This free template puts all five units on one printable sheet, with a starter and a backup for every spot."
      },
      {
        "download": {
          "href": "/downloads/special-teams-depth-chart.pdf",
          "label": "Special Teams Depth Chart Template (printable PDF)",
          "note": "Kickoff, kick return, punt, punt return, and FG/PAT units with starter + backup columns. Free, no email required."
        }
      },
      {
        "h2": "The five units, and the spot that breaks each one"
      },
      {
        "table": {
          "headers": [
            "Unit",
            "The spot that breaks it",
            "Coach it by"
          ],
          "rows": [
            [
              "Kickoff",
              "Contain — the widest lane runner",
              "\"Never let the ball outside you\""
            ],
            [
              "Kick return",
              "Front-line blockers who turn and chase the ball",
              "Block first, watch second"
            ],
            [
              "Punt",
              "The personal protector (last man before the punter)",
              "Count the rush out loud"
            ],
            [
              "Punt return",
              "The returner's fair-catch judgment",
              "Rep the fair catch signal every week"
            ],
            [
              "FG / PAT",
              "The wings — edge rushers come from there",
              "Inside foot back, never chase"
            ]
          ]
        }
      },
      {
        "h2": "Backups matter more here than anywhere"
      },
      {
        "p": "On offense, if your right guard is out you notice at practice. On special teams you notice when the punt snap sails past a kid who's never stood there. Fill the backup column for every single spot — even if the backup is \"same kid as kickoff L3\" — because the sheet's real job is answering \"who goes in?\" in the four seconds you actually have. Youth wrinkle: league minimum-play rules are easiest to satisfy on kicking units, so your backup column is also your playing-time ledger."
      },
      {
        "h2": "The five-minute Friday routine"
      },
      {
        "p": "Once a week, read each unit off the sheet out loud while the kids stand in their spots. That's it. Ten minutes of standing in the right place on Friday saves three timeouts on Saturday, and the sheet turns the drill from memory into roll call. Pair it with your offensive depth chart and roster sheet and the whole game-day binder is three pages."
      },
      {
        "h2": "Keep the chart with the roster"
      },
      {
        "p": "A depth chart drifts the moment a kid misses a week. If your roster lives on My-Team Sports, attendance and roster changes are already tracked on your team site — update the chart from real availability instead of memory, and post the week's units where parents can see who's starting where."
      }
    ],
    "related": [
      {
        "href": "/blog/football-depth-chart-template",
        "label": "Football Depth Chart Template",
        "note": "Offense and defense, printable"
      },
      {
        "href": "/blog/football-roster-template",
        "label": "Football Roster Template",
        "note": "The other page of the binder"
      },
      {
        "href": "/blog/football-positions-explained",
        "label": "Football Positions Explained",
        "note": "Every role in plain English"
      }
    ],
    "faqs": [
      {
        "q": "What positions are on special teams?",
        "a": "Across the five units: kicker, punter, long snapper, holder, returners, a personal protector on punt, wings and a shield on the block units, lane runners with contain responsibility on kickoff, and front-line blockers on returns. Most kids play a different role on each unit, which is exactly why a written chart matters."
      },
      {
        "q": "How do I build a special teams depth chart?",
        "a": "List all five units — kickoff, kick return, punt, punt return, FG/PAT — and assign a starter and backup to every spot before the season. Anchor the specialists first (snapper, kicker, punter, returner), fill lanes with your most reliable tacklers, and read the units out loud once a week so kids know their spots by feel."
      },
      {
        "q": "Do youth teams really need special teams depth charts?",
        "a": "More than varsity teams do. Youth rosters change week to week with absences, and minimum-play rules are easiest to satisfy on kicking units — the chart is how you handle both without burning game-day timeouts."
      }
    ]
  },
  {
    "slug": "football-practice-script-90-minutes",
    "title": "90-Minute Football Practice Script (Free Printable Template)",
    "description": "A complete 90-minute youth football practice script — every period timed and scripted, with a free printable template so practice runs on the clock, not on vibes.",
    "excerpt": "The difference between a plan and a script is the clock. Here's a full 90 minutes, period by period, plus a blank scripted template.",
    "tag": "Football",
    "date": "2026-08-03",
    "updated": "2026-08-03",
    "readingTime": "6 min read",
    "keywords": [
      "90 minute football practice plan",
      "football practice script",
      "football practice schedule template",
      "football practice script template",
      "youth football practice schedule",
      "middle school football practice plan"
    ],
    "body": [
      {
        "p": "A practice plan says what you want to teach. A practice script says what happens at minute 37. That difference is why college staffs script practice to the minute — and why youth practice, which has less time and shorter attention spans, needs a script even more. Here's a full 90 minutes, period by period, and a printable template to script your own."
      },
      {
        "download": {
          "href": "/downloads/football-practice-script-90.pdf",
          "label": "90-Minute Football Practice Script (printable PDF)",
          "note": "The scripted 90 on one page plus a blank period sheet for your own script. Free, no email required."
        }
      },
      {
        "h2": "The scripted 90"
      },
      {
        "table": {
          "headers": [
            "Clock",
            "Period",
            "What's happening"
          ],
          "rows": [
            [
              "0:00–0:10",
              "Dynamic warmup + ball",
              "Jog, skips, form starts — ball in hands by minute 4"
            ],
            [
              "0:10–0:25",
              "Individual (position) period",
              "Split by position group; one skill per group, not three"
            ],
            [
              "0:25–0:35",
              "Group period 1",
              "Blocking fits / route timing — halves of the offense together"
            ],
            [
              "0:35–0:50",
              "Team offense (scripted)",
              "10–12 plays written before practice, run in order"
            ],
            [
              "0:50–1:00",
              "Water + special teams",
              "One unit per practice off the depth chart, standing in spots"
            ],
            [
              "1:00–1:15",
              "Team defense",
              "Pursuit and alignment vs. scout looks, thud tempo"
            ],
            [
              "1:15–1:25",
              "Competitive period",
              "Best-on-best rep the kids look forward to all week"
            ],
            [
              "1:25–1:30",
              "Conditioning + break it down",
              "Short, sprint-based, always ends on time"
            ]
          ]
        }
      },
      {
        "h2": "Script the plays, not just the periods"
      },
      {
        "p": "The team-offense period is where scripting earns its keep: write the 10–12 plays before practice — in the order you'll run them, with the down-and-distance you're pretending — and run the script even when a play fails. Rep the fix tomorrow. Chasing a busted play with six unscripted do-overs is how a 15-minute period becomes 30 and steals your defensive time."
      },
      {
        "h2": "Tempo is the whole trick"
      },
      {
        "p": "Youth practices don't fail from bad drills; they fail from standing around. Three script rules fix most of it: no line deeper than four kids, every period ends on the horn even mid-drill, and water rides along with special teams instead of being its own dead period. If a drill needs long explanations, it's a film-night topic, not a practice period."
      },
      {
        "h2": "Plan the season, script the week"
      },
      {
        "p": "This pairs with our football practice plan template — the plan is your season-level menu of drills and teaching points; the script is this week's 90 minutes on a clock. Write the plan once, script each week from it. If you run your team on My-Team Sports, the AI practice planner drafts the plan side from your roster and sport, and practice times land on the team schedule parents already check."
      }
    ],
    "related": [
      {
        "href": "/blog/football-practice-plan-template",
        "label": "Football Practice Plan Template",
        "note": "The season-level menu this script draws from"
      },
      {
        "href": "/blog/football-play-wristband-template",
        "label": "Play Wristband Template",
        "note": "Call the scripted plays faster"
      },
      {
        "href": "/blog/how-to-coach-youth-football",
        "label": "How to Coach Youth Football",
        "note": "The season, start to finish"
      }
    ],
    "faqs": [
      {
        "q": "How long should a youth football practice be?",
        "a": "90 minutes is the sweet spot for most youth teams — long enough for individual, group, and team periods, short enough that tempo stays high. Under 10 years old, 75 minutes with the same structure works better than a slow 90."
      },
      {
        "q": "What's the difference between a practice plan and a practice script?",
        "a": "A plan lists what you want to teach — drills, emphases, install order. A script assigns it all to the clock: which period, which minute, which 12 offensive plays in which order. Plans set direction; scripts make practice actually end on time."
      },
      {
        "q": "How many plays should we run in a team period?",
        "a": "Script 10–12 plays for a 15-minute team period and run them in order. If a play breaks, note it and move on — the fix becomes tomorrow's script, not five unscripted repeats today."
      }
    ]
  },
  {
    "slug": "how-to-manage-a-youth-sports-team",
    "title": "How to Manage a Youth Sports Team (Without Losing Your Weeknights)",
    "description": "Sports team management, simplified: one home for schedule, roster, and updates — plus a free season checklist that gets a youth team organized in one evening.",
    "excerpt": "The job is really five jobs — schedule, roster, communication, playing time, game day. Here's the system, and a checklist to set it up in one evening.",
    "tag": "Team Management",
    "date": "2026-08-03",
    "updated": "2026-08-03",
    "readingTime": "6 min read",
    "keywords": [
      "sports team management",
      "how to manage a youth sports team",
      "sports team management website",
      "manage sports team online",
      "youth sports team management",
      "team sports app"
    ],
    "body": [
      {
        "p": "Nobody volunteers to manage a youth sports team. You volunteer to coach — and then discover the actual job is five jobs: keeper of the schedule, keeper of the roster, answerer of the same six questions, accountant of playing time, and game-day operations. The coaches who look effortlessly organized aren't working harder; they've stopped doing those five jobs by text message. Here's the system."
      },
      {
        "download": {
          "href": "/downloads/team-season-checklist.pdf",
          "label": "Season Setup Checklist (printable PDF)",
          "note": "Every setup task for a new season on one page — do it in one evening before the first practice. Free, no email required."
        }
      },
      {
        "h2": "Rule one: one home for everything"
      },
      {
        "p": "The failure mode of team management is fragmentation: schedule in one app, photos in a group text, roster in a spreadsheet, directions in last Tuesday's email. Every parent question you answer by text is a symptom of information having no home. Pick one place — a team site parents can open like an app — and enforce a one-line policy all season: \"it's on the team site.\" The first week feels repetitive. By week three the questions stop."
      },
      {
        "h2": "The five jobs, systemized"
      },
      {
        "table": {
          "headers": [
            "The job",
            "By text message",
            "With a system"
          ],
          "rows": [
            [
              "Schedule",
              "\"Wait, is practice moved?\" x 14 parents",
              "One schedule, updates push to everyone"
            ],
            [
              "Roster",
              "A spreadsheet only you can see",
              "Roster on the team site, always current"
            ],
            [
              "Communication",
              "Group text with 212 unread messages",
              "Announcements parents actually see"
            ],
            [
              "Playing time",
              "Mental math mid-game, complaints after",
              "Rotation planned and visible before kickoff"
            ],
            [
              "Game day",
              "\"What field? Who's scoring? Where's the lineup?\"",
              "Alerts, live score, lineup — all posted"
            ]
          ]
        }
      },
      {
        "h2": "What parents actually want"
      },
      {
        "p": "Parents don't want more messages — they want fewer surprises. Where and when, with changes pushed to their phone. Proof their kid is part of it: photos and fair minutes. And no homework: no app to install, no account to create, no thread to scroll. Meet those three and the sideline gets remarkably quiet."
      },
      {
        "h2": "What this looks like on My-Team Sports"
      },
      {
        "p": "This is exactly what My-Team Sports was built for: a coach account creates the team, and parents get a passcode-protected team site with the schedule, roster, photos, live scores, and game-day alerts — no app store, no parent accounts. The AI assistant coach drafts practice plans and pre-game briefings from your actual roster. Setup takes five minutes; the checklist above walks the rest of the season."
      }
    ],
    "related": [
      {
        "href": "/blog/share-team-schedule-and-photos-without-an-app",
        "label": "Schedule & Photos Without an App",
        "note": "How the parent side works"
      },
      {
        "href": "/blog/game-day-alerts-team-notifications",
        "label": "Game-Day Alerts",
        "note": "Rainouts and score updates, pushed"
      },
      {
        "href": "/blog/ai-assistant-coach-for-youth-teams",
        "label": "AI Assistant Coach",
        "note": "Briefings and practice plans from your roster"
      }
    ],
    "faqs": [
      {
        "q": "What's the best way to manage a youth sports team?",
        "a": "Put everything in one place parents can reach without installing anything — schedule, roster, announcements, photos, lineups — and enforce \"it's on the team site\" all season. Fragmentation across texts, emails, and spreadsheets is what makes the job feel like three jobs."
      },
      {
        "q": "Do parents need to download an app?",
        "a": "Not on My-Team Sports. Parents open the team site in their browser and can add it to their home screen like an app — no app store, no accounts. They enter the team passcode once and they're in for the season."
      },
      {
        "q": "How much does a team management site cost?",
        "a": "My-Team Sports is $15 for the 2026 season per team, or $20 with the AI assistant coach included. Parents always free, unlimited."
      }
    ]
  },
  {
    slug: "football-play-wristband-template",
    title: "Football Play Wristband Template (Free Printable Wrist Coach Inserts)",
    description:
      "Free printable football play wristband templates — pre-sized wrist coach insert cards for youth tackle and flag football, plus a numbering system that gets plays called in seconds.",
    excerpt:
      "Pre-sized insert cards that actually fit the wristband, a 12-play numbering system, and how to call plays without a huddle.",
    tag: "Football",
    date: "2026-08-03",
    updated: "2026-08-03",
    readingTime: "5 min read",
    keywords: ["football play wristband template", "qb wristband template", "printable football play wristband", "flag football wristband plays", "wrist coach insert template"],
    body: [
      { p: "A play wristband turns your loudest coaching problem — getting the play from the sideline into the huddle — into a two-word call. You yell a number, the quarterback reads the card, and your offense is lined up while the defense is still guessing. This free template gives you insert cards pre-sized to fit standard wrist coaches, so you can stop trying to make a spreadsheet print at exactly the right size." },
      { download: { href: "/downloads/football-play-wristband-template.pdf", label: "Football Play Wristband Template (printable PDF)", note: "Pre-sized insert cards in two sizes, a 12-play master sheet, and a numbering guide. Free, no email required." } },
      { h2: "Getting the size right (the part everyone fights with)" },
      { p: "Most youth wrist coaches take an insert around 4.5 by 2.5 inches for the standard three-window style, and smaller youth models run closer to 3.5 by 2.25. The template includes both sizes with cut lines. Print at 100% scale — turn off any \"fit to page\" option — cut inside the lines, and test one card before you cut a whole sheet. Card stock survives a season; paper survives a week. If your league allows it, a strip of clear packing tape works as poor man's lamination." },
      { h2: "A numbering system that kids can actually use" },
      { p: "Keep it to twelve plays. Number runs 1 through 6 and passes 7 through 12, or group by formation so the same column is always the same look. Youth players do not need a code the CIA couldn't break — they need the same twelve plays all season, called the same way every time. Add a color row only when you need a second signal, like flipping the play to the other side." },
      { h2: "Wristbands are a flag football cheat code" },
      { p: "No huddle means more plays per game, and more plays per game means more touches per kid — which is the whole point of flag. Put the wristband on every player, not just the quarterback, and your team can line up and snap in ten seconds. Most flag leagues allow them; check yours, then enjoy running twice the offense of the team across the field." },
      { h2: "Filling it in without losing your evenings" },
      { p: "Use the master sheet in the PDF to lock your twelve plays once — number, formation, play name, and when you'd call it. Then copying the cards is a five-minute job. If you run your team on My-Team Sports, the Coach's Playbook lets you draw the plays themselves on a proper field and print clean diagrams — your wristband calls the number, your printed playbook shows every kid their route." },
    ],
    related: [
      { href: "/blog/flag-football-play-sheet-template", label: "Flag Football Play Sheet", note: "Ready-made plays to put on the wristband" },
      { href: "/blog/football-practice-plan-template", label: "Football Practice Plan", note: "Free printable template" },
      { href: "/blog/coachs-playbook-draw-and-print-plays", label: "Coach's Playbook", note: "Draw and print your own plays" },
    ],
    faqs: [
      { q: "What size is a QB wristband insert?", a: "The common three-window adult wrist coach takes an insert around 4.5 x 2.5 inches; smaller youth models run about 3.5 x 2.25 inches. Sizes vary slightly by brand, so print one test card at 100% scale and check the fit before cutting a full sheet." },
      { q: "How many plays should a youth football wristband have?", a: "Twelve or fewer. Youth offenses run better with twelve plays everyone knows cold than thirty plays nobody remembers. Use numbers 1-6 for runs and 7-12 for passes so even the call teaches the kids what family the play belongs to." },
      { q: "Are play wristbands legal in flag football?", a: "Most youth flag leagues allow wristbands for every player, and huddle-free offense is one of the biggest advantages you can give a flag team. Check your league rules, then put a card on every wrist, not just the quarterback's." },
    ],
  },
  {
    slug: "soccer-substitution-rotation-planner",
    title: "Soccer Substitution Rotation Planner (Equal Playing Time, Free Printable)",
    description:
      "A free printable soccer substitution rotation planner for youth coaches — plan subs in waves, guarantee every kid fair minutes, and stop doing playing-time math mid-game.",
    excerpt:
      "Plan your subs before kickoff, sub in waves at set clock marks, and let the sheet do the equal-minutes math for you.",
    tag: "Soccer",
    date: "2026-08-03",
    updated: "2026-08-03",
    readingTime: "5 min read",
    keywords: ["soccer substitution rotation", "printable soccer substitution sheet", "equal playing time soccer", "soccer sub rotation chart", "youth soccer substitution planner"],
    body: [
      { p: "Every youth soccer coach has done it: it's the second half, you're trying to track the score, and somewhere in your head a spreadsheet is screaming that Maya has played 12 minutes and Jackson has played 40. The fix isn't better mental math — it's deciding the whole rotation before kickoff and subbing in waves. This free planner does the math part for you." },
      { download: { href: "/downloads/soccer-substitution-rotation-planner.pdf", label: "Soccer Substitution Rotation Planner (printable PDF)", note: "A rotation grid for any roster size plus pre-worked equal-time plans for 7v7, 9v9, and 11v11. Free, no email required." } },
      { h2: "The equal-minutes math, once" },
      { table: { headers: ["Format", "Typical game", "Roster", "Minutes per kid"], rows: [
        ["7v7 (U9-U10)", "50 min", "10 players", "35 min each"],
        ["9v9 (U11-U12)", "60 min", "12 players", "45 min each"],
        ["11v11 (U13+)", "70 min", "15 players", "~51 min each"],
      ] } },
      { p: "Total minutes on the field equals game length times players on the field. Divide by roster size and that's what fair looks like. The planner's pre-worked pages turn that number into actual sub waves so you never have to derive it on a sideline again." },
      { h2: "Sub in waves, not one at a time" },
      { p: "Pick your sub marks — say every 8 minutes in a 7v7 game — and change two or three players at once, decided in advance. Wave subbing means each stoppage is one glance at the sheet, kids know when their turn is coming so nobody droops on the bench, and no single player gets stranded on the field or the bench because you got busy coaching." },
      { h2: "Handle the goalkeeper on paper too" },
      { p: "Keeper is the position parents watch closest. Rotate it by half at the younger ages so more kids learn the position, and note it on the sheet — a keeper half counts as playing time, but track field minutes separately so your keeper isn't shortchanged on touches. At older competitive levels, a dedicated keeper is fine; just make the plan visible." },
      { h2: "Show the plan, kill the complaint" },
      { p: "Most playing-time drama comes from surprise, not the minutes themselves. When the rotation is planned and visible, parents see the fairness instead of auditing it from the sideline. If you run your team on My-Team Sports, your roster and schedule already live on your team site — post the rotation plan with the game and the question answers itself before it gets asked." },
    ],
    related: [
      { href: "/blog/soccer-lineup-formation-sheet", label: "Lineup & Formation Sheet", note: "Draw your shape for game day" },
      { href: "/blog/soccer-practice-plan-template", label: "Soccer Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/soccer-positions-explained", label: "Soccer Positions Explained", note: "A parent-friendly guide" },
    ],
    faqs: [
      { q: "How often should you substitute in youth soccer?", a: "In waves at set clock marks — every 7 to 10 minutes works for most youth games. Planned wave subs keep every kid moving, keep minutes fair automatically, and are far easier to run than reacting to whoever looks tired." },
      { q: "What is a fair amount of playing time in youth soccer?", a: "At recreational ages, aim for equal: game minutes times players on the field, divided by roster size. A 50-minute 7v7 game with 10 players means about 35 minutes each. Many leagues also set a minimum, commonly half the game." },
      { q: "Should the goalkeeper rotate in youth soccer?", a: "At younger ages, yes — rotating keeper by half lets more kids learn the position and keeps any one player from missing field development. Note keeper time on your rotation sheet so their field minutes stay fair too." },
    ],
  },
  {
    slug: "volleyball-rotation-explained",
    title: "Volleyball Rotation Explained (Beginner-Friendly, with Printable Sheet)",
    description:
      "Volleyball rotation explained in plain English — which way you rotate, when you rotate, the six zones, and the overlap rule, with a free printable rotation sheet and lineup card.",
    excerpt:
      "Which way, when, and why: the six zones, the overlap rule in plain words, and a printable sheet that keeps your lineup legal.",
    tag: "Volleyball",
    date: "2026-08-03",
    updated: "2026-08-03",
    readingTime: "6 min read",
    keywords: ["volleyball rotation explained", "volleyball rotations for beginners", "volleyball rotation sheet printable", "how does volleyball rotation work", "volleyball overlap rule"],
    body: [
      { p: "Nothing in youth sports confuses new coaches and parents faster than volleyball rotation. Six players, six zones, everyone sliding one spot at a mysterious moment, and a referee who somehow knows your lineup is illegal. Here is the whole system in plain English, plus a printable sheet with all six rotations drawn out." },
      { download: { href: "/downloads/volleyball-rotation-sheet.pdf", label: "Volleyball Rotation Sheet (printable PDF)", note: "All six rotations diagrammed, plus a serve-order lineup card. Free, no email required." } },
      { h2: "The two rules that run everything" },
      { p: "One: you rotate clockwise, one position, every time your team wins the serve back from the other team — called a side-out. Two: if your team keeps the serve, nobody moves; the same player keeps serving. That's it. Players do not rotate on every point, only when serve is regained." },
      { h2: "The six zones" },
      { table: { headers: ["Zone", "Where it is", "Who's usually there"], rows: [
        ["1", "Right back", "The server — every player serves from here as they rotate through"],
        ["2", "Right front", "Opposite or setter, strong blocking spot"],
        ["3", "Middle front", "Middle blocker, quick attacks"],
        ["4", "Left front", "Outside hitter, most sets go here"],
        ["5", "Left back", "Back-row defender"],
        ["6", "Middle back", "Deep defense, often the libero's home"],
      ] } },
      { p: "Rotation means moving 2 to 1, 1 to 6, 6 to 5, 5 to 4, 4 to 3, 3 to 2. The player who rotates into zone 1 becomes the new server. Write your serve order once and the whole match follows from it." },
      { h2: "The overlap rule, in plain words" },
      { p: "At the moment of serve, you must be in the right position relative to your neighbors — the zone 3 player can't be to the left of the zone 4 player, and a front-row player can't be behind their back-row neighbor. The instant the ball is served, everyone can go anywhere. Teach kids one cue: know who your neighbors are, stay on the correct side of them until the serve, then play volleyball." },
      { h2: "Keep it simple for beginners" },
      { p: "For a first-year team, skip specialized systems entirely: play where you stand, hit from wherever you rotate to, and just get the rotation order right. When your team is ready for a setter system, a 4-2 (setter always in the front row) is the gentlest step up. Save the 6-2 and 5-1 for when rotation itself is automatic. If you run your team on My-Team Sports, the live scoreboard covers volleyball — parents who can't make the gym follow the sets point by point from the team site." },
    ],
    related: [
      { href: "/blog/volleyball-practice-plan-template", label: "Volleyball Practice Plan", note: "Free 90-minute template" },
      { href: "/blog/live-scorekeeping-every-sport", label: "Live Scorekeeping", note: "Volleyball scores parents can follow live" },
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Fair minutes for hoops season" },
    ],
    faqs: [
      { q: "Which way do you rotate in volleyball?", a: "Clockwise. When your team wins the serve back, every player moves one zone clockwise — the right-front player rotates to right back and becomes the new server." },
      { q: "When do you rotate in volleyball?", a: "Only when your team wins the serve back from the opponent (a side-out). If your team keeps winning points while serving, nobody rotates and the same player keeps serving." },
      { q: "What is the overlap rule in volleyball?", a: "At the moment of serve, each player must be positioned correctly relative to their adjacent teammates — front-row players in front of their back-row neighbors, and left-to-right order preserved. Once the ball is served, players may move anywhere." },
    ],
  },
  {
    slug: "volleyball-practice-plan-template",
    title: "Volleyball Practice Plan: 90-Minute Template (Printable)",
    description:
      "A free volleyball practice plan template for youth and middle school coaches — a printable 90-minute session built on max ball touches, small groups, and game-like reps.",
    excerpt:
      "Max touches, small groups, and a wave scrimmage finish — a 90-minute plan you can run every week of the fall season.",
    tag: "Volleyball",
    date: "2026-08-03",
    updated: "2026-08-03",
    readingTime: "5 min read",
    keywords: ["volleyball practice plan template", "youth volleyball practice plan", "middle school volleyball practice plan", "volleyball drills for beginners"],
    body: [
      { p: "A youth volleyball practice lives or dies on one number: touches per kid. Twelve players watching one ball cross a net is not practice — it's an audience. This free template scripts a 90-minute session where every drill happens in groups of two or three, so your gym is full of volleyballs instead of full of lines." },
      { download: { href: "/downloads/volleyball-practice-plan.pdf", label: "Volleyball Practice Plan (printable PDF)", note: "A 90-minute, max-touches session template. Free, no email required." } },
      { h2: "The 90-minute structure" },
      { table: { headers: ["Time", "Block", "Focus"], rows: [
        ["0:00-0:10", "Dynamic warm-up + ball handling", "Jog, shuffle, arm circles — then every pair a ball, pass to self, set to self"],
        ["0:10-0:25", "Pepper (pass-set-hit in pairs)", "The classic — max touches on all three contacts, coach circulates on form"],
        ["0:25-0:40", "Serving ladder", "Start close, earn your way back — every make moves you a step toward the end line"],
        ["0:40-0:55", "Theme of the week", "One idea only: serve receive shape, hitting approach footwork, or free-ball transition"],
        ["0:55-1:15", "Wave scrimmage 3v3 or 4v4", "Short court, winners stay — triple the touches of 6v6"],
        ["1:15-1:25", "Serve + receive under pressure", "Game score situations: serving team needs 2, receiving team needs 1"],
        ["1:25-1:30", "Team talk", "One takeaway + next-match reminder"],
      ] } },
      { h2: "Why small-sided beats 6v6 in practice" },
      { p: "In a 3v3 on a short court, every player passes, sets, or hits on nearly every rally. In a 6v6, a beginner can hide for ten minutes without touching the ball. Save full 6v6 for the last weeks before matches and for teaching rotation — build the actual skills in threes." },
      { h2: "Serve like it's the whole game (because it nearly is)" },
      { p: "At youth level, the team that serves in wins. The serving ladder gives beginners early success close to the net and a built-in progression, and the pressure block at the end of practice makes serves feel like match points instead of warm-ups. Track makes out of ten each week — kids love watching their own number climb." },
      { h2: "One theme, every week" },
      { p: "Pick a single teaching point per practice — call the ball every time, beat the ball to the spot, three contacts every rally — and repeat it through the theme block and the scrimmage. If you run your team on My-Team Sports, the AI practice planner will generate a fresh volleyball session around any theme in seconds, and your schedule, roster, and game-day alerts already live on your team site." },
    ],
    related: [
      { href: "/blog/volleyball-rotation-explained", label: "Volleyball Rotation Explained", note: "The six zones and the overlap rule, plain English" },
      { href: "/blog/basketball-practice-plan-template", label: "Basketball Practice Plan", note: "The same max-touches idea for hoops" },
      { href: "/blog/ai-assistant-coach-for-youth-teams", label: "AI Assistant Coach", note: "Practice plans generated in seconds" },
    ],
    faqs: [
      { q: "How long should a youth volleyball practice be?", a: "60 to 90 minutes. Ninety works well for middle school ages if the session keeps moving — for younger beginners, a fast 60 to 75 minutes beats a slow 90 every time." },
      { q: "What are the best volleyball drills for beginners?", a: "Pepper (pass-set-hit in pairs), serving ladders, and small-sided 3v3 games on a short court. All three maximize touches per player, which is the single biggest driver of improvement for beginners." },
      { q: "How do you keep kids from standing in lines at volleyball practice?", a: "Cap every group at three players and run drills in waves across the court. If you see a line of more than three kids, split the drill — two mediocre stations beat one perfect line." },
    ],
  },
  {
    slug: "soccer-lineup-formation-sheet",
    title: "Soccer Lineup & Formation Sheet (Free Printable)",
    description:
      "A free printable soccer lineup sheet with a pitch to draw your formation, starters and subs lists, plus ready-made youth formations for 7v7, 9v9, and 11v11.",
    excerpt:
      "A pitch to draw your shape, starters and subs on one page, and ready-made 7v7, 9v9, and 11v11 formations on page two.",
    tag: "Soccer",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["soccer lineup sheet", "soccer formation sheet printable", "youth soccer formations", "7v7 soccer formation"],
    body: [
      { p: "Game day goes smoother when the lineup is decided in your kitchen, not on the touchline. This free printable gives you a pitch to draw your formation, numbered rows for starters and substitutes, and a second page with the three most-used youth formations ready to copy." },
      { download: { href: "/downloads/soccer-lineup-formation-sheet.pdf", label: "Soccer Lineup & Formation Sheet (printable PDF)", note: "Page 1: blank pitch + starters and subs. Page 2: 7v7, 9v9, and 11v11 formations. Free, no email required." } },
      { h2: "The three formations every youth coach should know" },
      { table: { headers: ["Format", "Formation", "Why it works"], rows: [
        ["7v7 (U9–U10)", "2-3-1", "A solid base of two defenders, a midfield three that sees lots of ball, one striker to chase everything"],
        ["9v9 (U11–U12)", "3-2-3", "Three at the back for security, two central engines, and wide attackers who stretch the field"],
        ["11v11 (U13+)", "4-3-3", "The classic: a back four, a midfield triangle, and a front three that presses"],
      ] } },
      { h2: "How to pick a shape for your team" },
      { p: "Count your reliable defenders first. If you have two kids who genuinely love defending, the 2-3-1 works; if you have one, play three at the back so no single mistake becomes a goal. Attack-minded rosters can flip the emphasis, but at youth level a stable back line buys your whole team confidence." },
      { h2: "Teach 'home base,' not chains" },
      { p: "A formation tells each player where home is — where they return when their run is over. It should never stop a fullback from joining an attack or a striker from tracking back. Walk your shape on the field once, name each position's home, and then let them play. The diagram on your clipboard is a map, not a cage." },
      { h2: "Plan your subs on the same page" },
      { p: "The substitutes section includes space for a sub plan — who comes on, for whom, and when. Deciding it before kickoff is how every kid gets fair minutes without you doing math mid-match. If you run your team on My-Team Sports, the Coach's Playbook also draws formations digitally on a proper pitch, and players can study them from the team site during the week." },
    ],
    related: [
      { href: "/blog/soccer-practice-plan-template", label: "Soccer Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/soccer-positions-explained", label: "Soccer Positions Explained", note: "A parent-friendly guide" },
      { href: "/blog/how-to-coach-youth-soccer", label: "How to Coach Youth Soccer", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "What is the best formation for 7v7 youth soccer?", a: "The 2-3-1 is the most common and most forgiving: two defenders, three midfielders, one striker. It keeps a solid base while putting most players in midfield, where they touch the ball constantly." },
      { q: "What formation should a 9v9 team play?", a: "The 3-2-3 is the popular choice — three defenders, two central midfielders, and three attackers. It is balanced, teaches wide play, and translates naturally to 11v11 shapes later." },
      { q: "Should young players stick to one position?", a: "No. Use the formation to organize the game, but rotate players through positions across the season. The ten-year-old fullback may be your future striker, and versatile players develop faster." },
    ],
  },
  {
    slug: "soccer-practice-plan-template",
    title: "Soccer Practice Plan: 75-Minute Template (Printable)",
    description:
      "A free soccer practice plan template for youth coaches — a printable 75-minute session built on ball mastery, small-sided games, and the no-laps, no-lines, no-lectures rule.",
    excerpt:
      "Balls out early, every kid dribbling in minute one, 3v3 instead of standing around — a 75-minute plan you can run every week.",
    tag: "Soccer",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["soccer practice plan", "youth soccer practice plan template", "soccer training session plan", "soccer practice drills"],
    body: [
      { p: "The best youth soccer practices follow a rule the pros' academies swear by: no laps, no lines, no lectures. Kids learn soccer with a ball at their feet, not waiting for a turn. This free template scripts a 75-minute session where the balls come out in minute one and never stop rolling." },
      { download: { href: "/downloads/soccer-practice-plan.pdf", label: "Soccer Practice Plan (printable PDF)", note: "A 75-minute, ball-rolling session. Free, no email required." } },
      { h2: "The 75-minute structure" },
      { table: { headers: ["Time", "Block", "Focus"], rows: [
        ["0:00–0:10", "Free play + warm-up", "Balls out as kids arrive — small games, then dynamic movement"],
        ["0:10–0:22", "Dribbling and 1v1 moves", "Every kid a ball: toe taps, cuts, one new move, then 1v1 to cones"],
        ["0:22–0:34", "Passing and receiving", "Pairs and triangles — firm passes, first touch out of the feet"],
        ["0:34–0:47", "Theme of the week", "One idea only: spacing, defending 1v1, or finishing"],
        ["0:47–1:07", "Small-sided games", "3v3 or 4v4 with two goals — maximum touches and decisions"],
        ["1:07–1:12", "Finishing game", "Shots on goal — every kid leaves having scored"],
        ["1:12–1:15", "Team talk", "One takeaway plus the next-game reminder"],
      ] } },
      { h2: "Start with free play, on purpose" },
      { p: "Kids arrive scattered over fifteen minutes. Instead of waiting, roll the balls out and let early arrivals play 2v2 to little goals. It doubles as a warm-up, it is the most soccer-like thing they will do all day, and practice effectively starts the moment the first kid shows up." },
      { h2: "Why small-sided games carry the session" },
      { p: "In a 3v3, each player gets ten times the touches of an 11v11 scrimmage — more dribbles, more passes, more decisions, more goals. It is also self-teaching: spacing problems are obvious when there are only six players. Save full-field play for game day; build players in small games." },
      { h2: "One theme per week" },
      { p: "Pick a single idea — spread out when we have the ball, pressure the ball when we lose it, finish low and hard — and thread it through the themed block and the small-sided games. A season of weekly themes beats a whiteboard of tactics kids cannot hold. If you run your team on My-Team Sports, the AI practice planner can generate a fresh themed session in seconds." },
    ],
    related: [
      { href: "/blog/soccer-lineup-formation-sheet", label: "Lineup & Formation Sheet", note: "Free printable with youth shapes" },
      { href: "/blog/soccer-drills-for-beginners", label: "Soccer Drills for Beginners", note: "Fun drills that teach" },
      { href: "/blog/how-to-coach-youth-soccer", label: "How to Coach Youth Soccer", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "How long should a youth soccer practice be?", a: "About 60 to 90 minutes depending on age — 75 minutes fits most youth teams. Younger kids do better with shorter, faster-moving sessions than with long ones." },
      { q: "What does 'no laps, no lines, no lectures' mean?", a: "It is the youth coaching rule that kids should never run without a ball, wait in long lines, or stand listening for extended stretches. Every minute with a ball rolling is a minute of actual soccer learning." },
      { q: "How many kids should be in a small-sided game?", a: "3v3 or 4v4 is the sweet spot for touches and decisions. If you have big numbers, run two or three games side by side rather than one big scrimmage." },
    ],
  },
  {
    slug: "soccer-positions-explained",
    title: "Soccer Positions Explained (A Parent-Friendly Guide)",
    description:
      "Every soccer position explained in plain language — goalkeeper, defenders, midfielders, and forwards — plus youth coaching tips on where to play each kid.",
    excerpt:
      "What a fullback actually does, why the striker keeps standing up front, and where your kid fits — soccer's positions in plain English.",
    tag: "Soccer",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["soccer positions explained", "youth soccer positions", "soccer positions for beginners", "what does a midfielder do"],
    body: [
      { p: "Watching your first youth soccer game, the positions can look like organized chaos — and sometimes it is just chaos. Here is what each position actually does, in plain language, plus a coach's guide to which kids tend to thrive where." },
      { h2: "Goalkeeper" },
      { p: "The only player who can use hands, and only inside the penalty area. Beyond shot-stopping, keepers organize the defense — they see the whole field and should be loud about it. Brave, focused kids do well here; at youth level, rotate the job so no one is 'stuck in goal' every week." },
      { h2: "Defenders" },
      { p: "Center backs are the wall in front of the goal: they win headers, block shots, and clear danger — calm, physical kids thrive here. Fullbacks defend the wide areas and, in the modern game, sprint forward to join attacks — they quietly run more than almost anyone. A defender's golden rule at youth level: no dribbling in front of your own goal; when in doubt, kick it out." },
      { h2: "Midfielders" },
      { p: "The engine room. Central midfielders connect defense and attack, touching the ball more than anyone — put your fittest, most involved players here. Wide midfielders or wingers hug the touchline, take on defenders, and deliver crosses. If a kid never stops running and always wants the ball, they are a midfielder." },
      { h2: "Forwards" },
      { p: "Strikers finish attacks: they hunt rebounds, run behind the defense, and shoot without hesitation. It is a role of confidence more than size — the kid who celebrates every goal like a World Cup final belongs up front. Modern forwards also start the defense, pressuring defenders the moment the ball is lost." },
      { h2: "Where should your kid play?" },
      { p: "Wherever they will touch the ball a lot — which for young players usually means midfield. Position labels matter far less than development: rotate kids through several spots each season, keep goalkeeping duty shared at young ages, and let enthusiasm, not size, guide the assignment. The tall eight-year-old center back may be a winger by twelve." },
    ],
    related: [
      { href: "/blog/soccer-lineup-formation-sheet", label: "Lineup & Formation Sheet", note: "Free printable with youth shapes" },
      { href: "/blog/soccer-practice-plan-template", label: "Soccer Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/soccer-drills-for-beginners", label: "Soccer Drills for Beginners", note: "Fun drills that teach" },
    ],
    faqs: [
      { q: "What position should a beginner play in soccer?", a: "Midfield or fullback — spots with lots of touches and forgiving mistakes. Avoid making a nervous beginner the permanent goalkeeper or lone striker; both roles concentrate pressure." },
      { q: "What is the difference between a fullback and a center back?", a: "Center backs defend the middle in front of the goal; fullbacks defend the wide areas and often push forward to support attacks. Center backs need strength and calm, fullbacks need engines." },
      { q: "Why do youth teams rotate the goalkeeper?", a: "At young ages, keeping one kid in goal stunts their field development and can make goalkeeping feel like a punishment. Rotating spreads the experience and often reveals a kid who genuinely loves it." },
    ],
  },
  {
    slug: "how-to-coach-youth-soccer",
    title: "How to Coach Youth Soccer: A First-Timer's Guide",
    description:
      "New to coaching soccer? A step-by-step first-season guide — practice structure, formations by age, playing time, game-day management, and working with parents.",
    excerpt:
      "You do not need a coaching license — you need moving practices, a simple shape, and a fair sub plan. A first season that works.",
    tag: "Soccer",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "6 min read",
    keywords: ["how to coach youth soccer", "coaching youth soccer", "first time soccer coach", "youth soccer coaching tips"],
    body: [
      { p: "Most youth soccer coaches are drafted at a parent meeting, not hired off a coaching ladder. The good news: a great first season does not require a license. It requires practices where kids constantly touch the ball, a simple game plan, and playing time handled before it becomes a problem. Here is the playbook." },
      { h2: "Build practices around touches" },
      { p: "The single best predictor of youth soccer development is touches on the ball. Run sessions on the no-laps, no-lines, no-lectures rule: every kid a ball for skills, small groups for passing, and 3v3 games instead of big scrimmages. A written plan like the 75-minute template keeps the session moving without you improvising." },
      { h2: "Keep tactics tiny" },
      { p: "For your first season, three ideas are enough: spread out when we have the ball, everyone defends when we lose it, and no dribbling in front of our own goal. Pick an age-appropriate formation — 2-3-1 for 7v7, 3-2-3 for 9v9 — teach every player where home is, and resist the urge to add more. Young teams lose to confusion far more often than to superior tactics." },
      { h2: "Handle playing time like a pro" },
      { p: "Decide your substitution plan before each game and write it on the lineup sheet. Most leagues require minimum minutes anyway, and a written rotation is the difference between a calm sideline and a season of hard feelings. Fair, planned, visible — that is the whole trick." },
      { h2: "Game day: coach less than you think" },
      { p: "Set the lineup, name the formation, give one focus point, and then let them play. Constant joystick-coaching from the touchline teaches kids to look at you instead of reading the game. Save your voice for encouragement and halftime — one adjustment, one thing they did well." },
      { h2: "Get parents on your side early" },
      { p: "A ten-minute preseason meeting prevents ninety percent of friction: your philosophy, the playing-time policy, the schedule, and how you will communicate. Then make the logistics automatic — a free team site on My-Team Sports pushes the schedule, RSVPs, and game updates to every family, which means the only thing left to discuss is soccer." },
      { h2: "Measure the season by who comes back" },
      { p: "Development is invisible week to week and unmistakable season to season. The real scoreboard for a first-year coach: how many kids sign up again next year. Fun practices, fair minutes, and a coach who knows every kid's name win that scoreboard every time." },
    ],
    related: [
      { href: "/blog/soccer-practice-plan-template", label: "Soccer Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/soccer-lineup-formation-sheet", label: "Lineup & Formation Sheet", note: "Free printable with youth shapes" },
      { href: "/blog/soccer-positions-explained", label: "Soccer Positions Explained", note: "A parent-friendly guide" },
    ],
    faqs: [
      { q: "Do I need a license to coach youth soccer?", a: "Most recreational leagues require only a background check and basic safety training. Free intro courses — like U.S. Soccer's grassroots modules — are worth an evening, but organization and enthusiasm matter more than credentials." },
      { q: "What formation should a new coach use?", a: "The standard for your format: 2-3-1 in 7v7, 3-2-3 in 9v9, 4-3-3 in 11v11. Pick one, teach where home is, and change nothing until the kids are comfortable." },
      { q: "How do I manage playing time in soccer?", a: "Plan substitutions before the game on your lineup sheet and track them across the season. Planned rotations feel fair because they are — and the paper trail ends most disputes before they start." },
    ],
  },
  {
    slug: "soccer-drills-for-beginners",
    title: "Soccer Drills for Beginners (Fun & Effective)",
    description:
      "Easy, fun soccer drills for beginners and young kids — dribbling, passing, first touch, and shooting with simple setups and the coaching cue that makes each work.",
    excerpt:
      "Sharks and minnows, red light green light, gates passing — the drills young kids beg for that quietly build real skills.",
    tag: "Soccer",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["soccer drills for beginners", "youth soccer drills", "fun soccer drills for kids", "soccer dribbling drills"],
    body: [
      { p: "Beginner soccer drills work when they hide the learning inside a game. Every drill here needs nothing but balls and cones, keeps every kid moving, and comes with the one coaching cue that makes it stick." },
      { h2: "Dribbling drills" },
      { p: "Sharks and minnows: minnows dribble across a grid while one or two sharks (no ball) try to kick their balls out; lose your ball and you become a shark. The all-time champion of dribbling drills. Cue: little touches — the ball should never be more than one step away." },
      { p: "Red light, green light: dribbling version of the classic. Green means go, red means stop the ball dead with the sole of the foot, yellow means slow toe taps on the ball. Cue: stop the ball, then look up." },
      { h2: "Passing drills" },
      { p: "Gates passing: scatter pairs of cones as small gates around the grid; pairs score a point each time they complete a pass through any gate, then find a new gate. Two minutes, count your score, try to beat it. Cue: pass with the inside of the foot, ankle locked, and follow through at your target." },
      { h2: "First-touch drills" },
      { p: "Traffic control: each kid with a ball dribbles in the grid; on your call of a number, they must touch the ball that many times then pass to a teammate and take their ball instead. Constant receiving under light chaos. Cue: cushion the ball out of your feet — first touch should set up the second." },
      { h2: "Shooting drills" },
      { p: "Rapid-fire goals: two small goals, two lines of two or three kids max, coach serves balls and players finish first-time or off one touch, alternating goals. Everyone shoots every 30 seconds. Cue: low and hard beats high and pretty — laces through the middle of the ball." },
      { h2: "Turn drills into a full practice" },
      { p: "Open with sharks and minnows, run gates passing and traffic control as your middle blocks, finish with rapid-fire goals and a 3v3 game. That is a complete session — and the free soccer practice plan template lays the structure out ready to print." },
    ],
    related: [
      { href: "/blog/soccer-practice-plan-template", label: "Soccer Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/how-to-coach-youth-soccer", label: "How to Coach Youth Soccer", note: "A first-timer's guide" },
      { href: "/blog/soccer-lineup-formation-sheet", label: "Lineup & Formation Sheet", note: "Free printable with youth shapes" },
    ],
    faqs: [
      { q: "What is the best soccer drill for 5 and 6 year olds?", a: "Sharks and minnows. It is a game they already know, every kid has a ball, and it teaches close control and shielding without a single instruction beyond the rules." },
      { q: "How do I teach passing to young kids?", a: "Use gates passing rather than static pairs. Moving to a new gate after each pass adds decision-making, and keeping score turns technique practice into a game kids attack." },
      { q: "Should beginners practice shooting with both feet?", a: "Yes — early. Alternate feet in shooting drills from the start. It feels clumsy for a couple of weeks and then becomes an advantage most players never develop." },
    ],
  },
  {
    slug: "basketball-rotation-chart",
    title: "Basketball Rotation Chart (Free Printable PDF)",
    description:
      "A free printable basketball rotation chart that makes equal playing time simple — split each quarter into two segments, mark who plays, and end minutes arguments.",
    excerpt:
      "Split each quarter in half, mark who plays each segment, and equal minutes becomes simple math instead of a halftime argument. Free printable.",
    tag: "Basketball",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["basketball rotation chart", "basketball substitution chart", "equal playing time basketball", "youth basketball playing time"],
    body: [
      { p: "Nothing generates more sideline tension in youth basketball than playing time. The fix is not a better memory — it is a rotation chart you fill out before the game. This free printable splits each quarter into two segments, so with ten players and eight segments, everyone plays four and the math defends itself." },
      { download: { href: "/downloads/basketball-rotation-chart.pdf", label: "Basketball Rotation Chart (printable PDF)", note: "Twelve player rows, eight game segments, a totals column. Free, no email required." } },
      { h2: "How it works" },
      { p: "Each quarter is split into a first half and a second half — roughly four minutes each in most youth leagues. Before the game, write in your roster and mark an X in the segments each player will play. The totals column on the right adds up each player's segments, so imbalances jump out before tip-off instead of after a parent counts minutes from the bleachers." },
      { h2: "The math for common roster sizes" },
      { table: { headers: ["Roster size", "Segments each", "How it splits"], rows: [
        ["8 players", "5 each", "40 player-segments across 8 segments of 5 on the floor"],
        ["10 players", "4 each", "Perfectly even — the easiest roster size to manage"],
        ["12 players", "3–4 each", "Eight players get 3, four get 4 — rotate who gets the extra each week"],
      ] } },
      { h2: "Sub at the segment breaks, not on the fly" },
      { p: "Plan your substitutions at the half-quarter marks and make them all at once. Mid-play tinkering is how coaches lose track of minutes, and it is also how the kid at the end of the bench gets forgotten. The chart turns substitutions from an in-game judgment call into a pre-game decision you already made calmly." },
      { h2: "When equal minutes is not the goal" },
      { p: "Older or more competitive teams often weight minutes by effort, practice attendance, or matchups — and that is fine. The chart still works: it just documents your plan. If a parent asks about playing time, you have the season's charts in hand, and the conversation becomes facts instead of feelings. If you run your team on My-Team Sports, you can also track minutes and stats over the season so the picture builds itself." },
    ],
    related: [
      { href: "/blog/basketball-practice-plan-template", label: "Basketball Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/basketball-positions-explained", label: "Basketball Positions Explained", note: "The 1 through 5, in plain English" },
      { href: "/blog/how-to-coach-youth-basketball", label: "How to Coach Youth Basketball", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "How do you give equal playing time in basketball?", a: "Split each quarter into two segments and plan substitutions on paper before the game. With ten players and eight segments, everyone plays four segments — equal minutes by design, not by memory." },
      { q: "How long is each rotation segment?", a: "Half a quarter. In leagues with 8-minute quarters that is about 4 minutes — long enough for players to settle in, short enough that sitting never feels endless." },
      { q: "What if players arrive late or foul out?", a: "Pencil, not pen. Shift the remaining segments at the next break and use the totals column to keep the redistribution fair. The chart absorbs surprises better than memory does." },
    ],
  },
  {
    slug: "basketball-practice-plan-template",
    title: "Basketball Practice Plan: 75-Minute Template (Printable)",
    description:
      "A free basketball practice plan template for youth coaches — a printable 75-minute session with ball handling, stations, defense, small-sided games, and free throws.",
    excerpt:
      "Every kid has a ball, no line longer than three deep, and 3v3 instead of standing around — a 75-minute plan you can run every week.",
    tag: "Basketball",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["basketball practice plan", "youth basketball practice plan template", "basketball practice schedule", "basketball practice drills"],
    body: [
      { p: "A youth basketball practice lives or dies on one number: how many touches each kid gets. Twelve players watching one shooter is a wasted gym. This free template scripts a 75-minute practice where every player has a ball in the first minute and nobody stands in a line longer than three deep." },
      { download: { href: "/downloads/basketball-practice-plan.pdf", label: "Basketball Practice Plan (printable PDF)", note: "A 75-minute, station-based session. Free, no email required." } },
      { h2: "The 75-minute structure" },
      { table: { headers: ["Time", "Block", "Focus"], rows: [
        ["0:00–0:08", "Warm-up + ball handling", "Every kid has a ball: dribble tag, stationary handles, cone weave"],
        ["0:08–0:20", "Skill stations (rotate 3x)", "Layups with both hands, form shooting close to the rim, passing pairs"],
        ["0:20–0:32", "Defense block", "Stance, slides, close-outs — run it as a mirror-drill competition"],
        ["0:32–0:45", "Concept of the week", "One idea only: spacing, give-and-go, or help defense"],
        ["0:45–1:05", "Small-sided games", "3v3 half court — more touches and decisions than 5v5"],
        ["1:05–1:12", "Free throws under fatigue", "Two shots each, team counts makes together"],
        ["1:12–1:15", "Team talk", "One takeaway plus the next-game reminder"],
      ] } },
      { h2: "Why 3v3 beats 5v5 at practice" },
      { p: "Small-sided games are the highest-value block of the practice. In 3v3, every player touches the ball on nearly every possession, spacing is easy to see, and there is nowhere to hide. Save 5v5 for teaching game-specific situations; build skills in 3v3." },
      { h2: "Teach one concept per week" },
      { p: "Kids do not absorb three new ideas in one practice. Pick a single concept — spacing, the give-and-go, help defense — walk through it, rep it live in the small-sided games, and repeat it next week from a new angle. A season of one-a-week concepts builds a smarter team than a binder of plays." },
      { h2: "Make free throws matter" },
      { p: "Shooting free throws relaxed and fresh teaches almost nothing, because games never ask for that. Put the free-throw block right after the scrimmage, when legs are heavy, and have the team count makes out loud. If you run your team on My-Team Sports, the AI practice planner can also generate a fresh session in seconds when you want variety." },
    ],
    related: [
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Equal minutes, printable" },
      { href: "/blog/basketball-drills-for-beginners", label: "Basketball Drills for Beginners", note: "Fun drills that teach" },
      { href: "/blog/how-to-coach-youth-basketball", label: "How to Coach Youth Basketball", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "How long should a youth basketball practice be?", a: "About 60 to 90 minutes depending on age. The 75-minute structure here fits most youth teams — long enough for stations, a concept, and games, short enough to keep full attention." },
      { q: "What should youth basketball practice focus on?", a: "Ball handling, layups with both hands, and defensive footwork — the skills every player uses every game. Concepts like spacing come one per week, and set plays can wait." },
      { q: "How many drills should one practice have?", a: "Five to seven short blocks beats two long ones. Change activities every 8 to 12 minutes and attention takes care of itself." },
    ],
  },
  {
    slug: "basketball-positions-explained",
    title: "Basketball Positions Explained: The 1 Through 5 Guide",
    description:
      "All five basketball positions explained in plain language — point guard through center, what each does, and youth coaching tips on where to play each kid.",
    excerpt:
      "What the numbers 1 through 5 actually mean, what each position does, and why young players should learn them all.",
    tag: "Basketball",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["basketball positions explained", "basketball positions 1-5", "youth basketball positions", "point guard shooting guard positions"],
    body: [
      { p: "When coaches call out \"the 2\" or \"our 4,\" they are using basketball's number system for positions. Here is what each number means, what the job actually is, and — for youth coaches — why you should hold the labels loosely." },
      { h2: "1 — Point guard" },
      { p: "The floor general. The point guard brings the ball up, starts the offense, and makes more decisions per game than anyone on the floor. Your best ball handler and calmest decision-maker plays here — not necessarily your best scorer." },
      { h2: "2 — Shooting guard" },
      { p: "Traditionally the best perimeter shooter, the 2 moves without the ball, spots up off screens, and is often a secondary ball handler. At youth level, this is a great spot for a confident scorer who is still developing point-guard handles." },
      { h2: "3 — Small forward" },
      { p: "The most versatile spot on the floor — the 3 attacks the rim, shoots from outside, defends multiple positions, and rebounds. Athletic all-arounders live here." },
      { h2: "4 — Power forward" },
      { p: "Historically a strong inside player who rebounds and scores near the basket. The modern 4 also steps out to shoot, but at youth level think of it simply: a physical player who embraces rebounding and interior defense." },
      { h2: "5 — Center" },
      { p: "Usually the tallest player: rim protection, rebounding, finishing close to the basket, and setting screens. Great youth centers are made by effort and positioning, not just height." },
      { h2: "Youth coaching: teach positions, not prisons" },
      { p: "At the youth level, position labels should describe today's lineup, not a kid's future. The eleven-year-old who is tallest now may be a guard in three years — and if they spent every practice camped in the paint, they will be behind. Rotate players through multiple spots in practice, and teach everyone to dribble, pass, and shoot. Use positions to organize the floor, not to limit development." },
    ],
    related: [
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Equal minutes, printable" },
      { href: "/blog/basketball-practice-plan-template", label: "Basketball Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/basketball-drills-for-beginners", label: "Basketball Drills for Beginners", note: "Fun drills that teach" },
    ],
    faqs: [
      { q: "What do the numbers 1-5 mean in basketball?", a: "They are shorthand for the five positions: 1 point guard, 2 shooting guard, 3 small forward, 4 power forward, 5 center. Coaches use numbers because they are faster to call than names." },
      { q: "What position should the tallest kid play?", a: "Often center today — but do not lock them in. Height rankings change fast in youth basketball, and every player needs guard skills eventually. Let the tall kid handle the ball in practice too." },
      { q: "What is the hardest position to learn?", a: "Point guard. It combines ball handling under pressure with constant decision-making. Give young point guards simple rules — push the ball, get us into the offense, take care of it — rather than a long list of reads." },
    ],
  },
  {
    slug: "how-to-coach-youth-basketball",
    title: "How to Coach Youth Basketball: A First-Timer's Guide",
    description:
      "New to coaching basketball? A step-by-step first-season guide — practice structure, skills to teach by age, playing time, defense rules, and managing parents.",
    excerpt:
      "Keep practices moving, teach skills over plays, and handle playing time before it handles you — a first season guide that works.",
    tag: "Basketball",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "6 min read",
    keywords: ["how to coach youth basketball", "coaching youth basketball", "first time basketball coach", "youth basketball coaching tips"],
    body: [
      { p: "Saying yes to coaching a youth basketball team is easy. Standing in a gym with twelve kids, one ball rack, and sixty minutes is where it gets real. Here is a first-season playbook that keeps kids improving, parents calm, and you sane." },
      { h2: "Win the practice, not the scrimmage" },
      { p: "Your job is maximizing touches. Structure practice in short stations so every kid is dribbling, passing, or shooting most of the time — a written plan like the 75-minute template keeps you honest. If you ever see six kids in a line, split the drill." },
      { h2: "Teach skills by age, not by playbook" },
      { p: "Through about age ten, almost everything is dribbling, passing, layups, and defensive footwork. From eleven to thirteen, layer in spacing, the give-and-go, screening, and help defense. Set plays earn minutes only after kids can execute the basics at game speed — a team that can dribble, pass, and space the floor beats a team with a playbook it cannot run." },
      { h2: "Keep defense simple and legal" },
      { p: "Many youth leagues restrict zones and pressing — read your rulebook first. Man-to-man is the best teacher anyway: it builds footwork, accountability, and basketball IQ. Teach stance, slides, and staying between your player and the basket before anything schematic." },
      { h2: "Decide playing time before the game" },
      { p: "Playing time is the number one source of youth basketball friction. Decide your policy, say it at the parent meeting, and plan substitutions on a rotation chart before each game. A written plan turns the hardest conversation in youth sports into a piece of paper you both look at." },
      { h2: "Run a parent meeting before the season" },
      { p: "Ten minutes before the first practice: your philosophy, the playing-time policy, the schedule, and how you will communicate. Most conflicts come from surprises, not disagreements. A team app that pushes the schedule and game updates automatically — like the free team sites on My-Team Sports — removes most surprises before they happen." },
      { h2: "Make it fun enough to come back" },
      { p: "The season goal for most youth teams is not a banner — it is twelve kids who want to play again next year. End practices with a competition they beg for, celebrate hustle plays as loudly as buckets, and keep your voice one they want to hear." },
    ],
    related: [
      { href: "/blog/basketball-practice-plan-template", label: "Basketball Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Equal minutes, printable" },
      { href: "/blog/basketball-positions-explained", label: "Basketball Positions Explained", note: "The 1 through 5, in plain English" },
    ],
    faqs: [
      { q: "Do I need to have played basketball to coach youth basketball?", a: "No. Organization beats experience at this level. A coach with a written practice plan, a fair rotation chart, and patience out-coaches a former player who wings it." },
      { q: "What defense should a youth team play?", a: "Man-to-man. It develops every defensive skill and is required by many youth leagues anyway. Save zones for older, more experienced teams." },
      { q: "How do I handle a parent upset about playing time?", a: "Set the policy at a preseason meeting, plan minutes on a rotation chart, and keep the charts. When the conversation comes, you will have a season of documented, planned rotations — facts calm what feelings inflame." },
    ],
  },
  {
    slug: "basketball-drills-for-beginners",
    title: "Basketball Drills for Beginners (Fun & Effective)",
    description:
      "Easy, fun basketball drills for beginners and young kids — ball handling, layups, passing, and defense with simple setups and the coaching cue that makes each work.",
    excerpt:
      "Dribble tag, red-light-green-light, form shooting from a knee — drills young kids love that quietly build real skills.",
    tag: "Basketball",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["basketball drills for beginners", "youth basketball drills", "fun basketball drills for kids", "basketball dribbling drills"],
    body: [
      { p: "Young players do not need complicated drills — they need hundreds of touches wrapped in games they enjoy. These are the beginner basketball drills that earn their practice time, each with the one coaching cue that makes it work." },
      { h2: "Ball-handling drills" },
      { p: "Dribble tag: everyone dribbles inside a marked area while trying to tag other players — get tagged or lose your dribble and you do three crossovers to re-enter. Cue: eyes up, feel the ball instead of watching it." },
      { p: "Red light, green light: the classic, but dribbling. Green means dribble forward, red means stop and protect the ball, yellow means crossovers in place. Cue: low dribble on the stop — knee height keeps the ball safe." },
      { h2: "Shooting drills" },
      { p: "Form shooting from a knee: each player takes soft one-hand shots from close range, starting from one knee to isolate the arm. Cue: finish with fingers in the rim — hold the follow-through until the ball lands." },
      { p: "Around-the-rim layups: lines of two or three max, alternating right-hand and left-hand layups from each side. Cue: outside hand, inside knee — right hand and right knee up on the right side, then mirror it." },
      { h2: "Passing drills" },
      { p: "Partner passing ladder: pairs complete ten chest passes, ten bounce passes, and ten one-handed push passes, stepping back after each set. Cue: thumbs down on the follow-through for chest passes; the target is always the partner's hands." },
      { h2: "Defense drills" },
      { p: "Mirror slides: pairs face each other in a channel; one slides side to side, the other mirrors. Whistle swaps the leader. Cue: no crossed feet — push off the trailing leg and stay in the stance." },
      { h2: "Build them into a practice" },
      { p: "String these together — ball handling to open, stations of shooting and passing, mirror slides for defense, then a 3v3 game — and you have a full session. The free basketball practice plan template lays that structure out ready to print." },
    ],
    related: [
      { href: "/blog/basketball-practice-plan-template", label: "Basketball Practice Plan", note: "Free 75-minute template" },
      { href: "/blog/how-to-coach-youth-basketball", label: "How to Coach Youth Basketball", note: "A first-timer's guide" },
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Equal minutes, printable" },
    ],
    faqs: [
      { q: "What is the best basketball drill for beginners?", a: "Dribble tag. It delivers hundreds of ball touches with eyes up, teaches ball protection under pressure, and kids ask to play it — which means maximum reps with zero nagging." },
      { q: "How do I teach a child to shoot with proper form?", a: "Start close to the rim with one-hand form shooting, even from one knee. Build the habit of a high follow-through before adding distance — range comes from legs later; form comes first." },
      { q: "Should beginners practice left-handed layups?", a: "Yes, from day one. Alternating hands feels awkward for a week and then becomes normal. Players who wait until they are older fight the habit for years." },
    ],
  },
  {
    slug: "flag-football-play-sheet-template",
    title: "Flag Football Play Sheet Template (Free Printable PDF)",
    description:
      "A free printable flag football play sheet with 8 play-diagram boxes plus cut-out wristband play cards sized for a QB wristband. Works for 5v5 and 7v7.",
    excerpt:
      "Draw your 8 plays, then cut out wristband cards your QB reads on the field. Free printable for 5v5 and 7v7 flag.",
    tag: "Flag Football",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["flag football play sheet template", "flag football wristband template", "flag football plays printable", "flag football play card"],
    body: [
      { p: "Nothing slows a flag football game down like a huddle where nobody remembers the play. The fix is a system the pros use in miniature: a play sheet where you draw your plays once, and wristband cards your quarterback reads on the field. Call \"twelve,\" the QB looks at slot 12, and the play runs. This free printable gives you both pieces." },
      { download: { href: "/downloads/flag-football-play-sheet.pdf", label: "Flag Football Play Sheet + Wristband Cards (printable PDF)", note: "Page 1: eight play-diagram boxes. Page 2: cut-out wristband inserts. Free, no email required." } },
      { h2: "How the two pages work together" },
      { p: "Page one has eight play boxes, each with a mini field, a marked line of scrimmage, and space for a play name and snap count. Draw your plays there — that sheet stays on your clipboard. Page two has wristband inserts sized to a standard youth QB wristband window, about 3.5 by 2.25 inches. Number the wristband slots to match your play sheet, cut along the dashed lines, and slide a card into your quarterback's wristband sleeve." },
      { h2: "Eight plays is plenty" },
      { p: "At the youth level, eight well-practiced plays beat twenty sloppy ones. A balanced starter set: two quick passes (a slant and an out), two medium routes (a corner and a crossing route), two runs or sweeps if your league allows them, one screen, and one deep shot for when you need it. Run every play from the same formation so the defense can't guess what's coming by how you line up." },
      { h2: "Coaching with the wristband" },
      { ul: [
        "Print a card for every QB and coach, so a substitution never means losing the play calls.",
        "Call plays by number only — it is faster and the other team learns nothing.",
        "Re-number the cards every few games if you play the same teams repeatedly.",
        "Keep a spare printed sheet in your bag; wristbands walk off with kids' gear constantly.",
      ] },
      { h2: "Or draw them digitally" },
      { p: "If you would rather skip the pencil, the Coach's Playbook in My-Team Sports gives you a digital field for flag football — drop your five or seven players, draw the routes, save the play to your team, and print clean sheets for game day. Players can even study the plays from the team site during the week." },
    ],
    related: [
      { href: "/blog/flag-football-practice-plan-template", label: "Flag Football Practice Plan", note: "Free 60-minute template" },
      { href: "/blog/flag-football-positions-explained", label: "Flag Football Positions", note: "5v5 and 7v7, explained" },
      { href: "/blog/flag-football-drills-for-beginners", label: "Flag Football Drills", note: "Fun drills for new players" },
    ],
    faqs: [
      { q: "What size is a QB wristband play card?", a: "Most youth quarterback wristbands have a window around 3.5 by 2.25 inches. The cards in this template are sized to fit that window — print, fill in, and cut along the dashed lines." },
      { q: "How many plays should a flag football team have?", a: "Around six to eight for most youth teams. Enough variety to attack short, medium, and deep, but few enough that every player knows their route on every call." },
      { q: "Does this work for 5v5 and 7v7?", a: "Yes. The play boxes are blank fields with a marked line of scrimmage, so you draw whatever formation your league uses — five players, seven, or anything else." },
    ],
  },
  {
    slug: "flag-football-practice-plan-template",
    title: "Flag Football Practice Plan: 60-Minute Template (Printable)",
    description:
      "A free flag football practice plan template — a printable PDF with a 60-minute structure built around flag pulling, catching, routes, and a play-calling scrimmage.",
    excerpt:
      "One hour, no standing in line: flag pulling, catching, routes, and a scrimmage where you call plays off the wristband. Free printable.",
    tag: "Flag Football",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["flag football practice plan", "youth flag football practice", "flag football practice template", "flag football drills practice"],
    body: [
      { p: "Flag football practices are shorter than tackle — usually an hour — and the sport lives on speed, catching, and flag pulling rather than contact. That changes what a good practice looks like: more touches, more games, zero standing around. This free template scripts a 60-minute session you can run every week." },
      { download: { href: "/downloads/flag-football-practice-plan.pdf", label: "Flag Football Practice Plan (printable PDF)", note: "A 60-minute, time-boxed session. Free, no email required." } },
      { h2: "The 60-minute structure" },
      { table: { headers: ["Time", "Block", "Focus"], rows: [
        ["0:00–0:08", "Dynamic warm-up", "Tag games double as warm-up — chasing is the sport"],
        ["0:08–0:18", "Flag-pulling circuit", "Partner pulls, mirror drill, open-field pulls — the number one flag skill"],
        ["0:18–0:30", "Throwing and catching", "Partner catch, then routes on air: slant, out, go"],
        ["0:30–0:40", "Routes and handoffs", "Run three or four routes against air, then add a shadow defender"],
        ["0:40–0:55", "Scrimmage with play calls", "Call plays from the wristband — live reps, everyone rotates"],
        ["0:55–1:00", "Team talk", "One takeaway, next-game reminder, team cheer"],
      ] } },
      { h2: "Why flag pulling comes before everything" },
      { p: "Most youth flag games are decided by missed flag pulls, not by offense. Ten focused minutes every practice — partner pulls, a mirror drill, then live open-field pulls — turns your defense from a chase scene into actual stops. Teach players to break down, square up, and grab cloth, not air." },
      { h2: "Make every drill a game" },
      { p: "Flag football kids are usually younger, and their attention follows fun. Turn drills into competitions: which pair completes ten catches first, who can pull the most flags in thirty seconds, which group scores on three straight route reps. Same skills, twice the effort." },
      { h2: "Finish with real play calls" },
      { p: "The scrimmage block is where your play sheet earns its keep. Call plays by number off the wristband cards, rotate every player through every position — including quarterback — and keep score so it matters. If you run your team on My-Team Sports, the AI practice planner can also generate a fresh flag session in seconds when you want to mix it up." },
    ],
    related: [
      { href: "/blog/flag-football-play-sheet-template", label: "Play Sheet & Wristband Template", note: "Draw plays, cut out QB cards" },
      { href: "/blog/flag-football-drills-for-beginners", label: "Flag Football Drills", note: "Fun drills for new players" },
      { href: "/blog/how-to-coach-youth-flag-football", label: "How to Coach Flag Football", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "How long should a flag football practice be?", a: "About 60 minutes for most youth ages. Flag rosters are small and the game is fast, so a crisp hour with everyone moving beats a long practice with lines." },
      { q: "What should I practice most in flag football?", a: "Flag pulling on defense and catching on offense. Those two skills decide most youth flag games — schemes matter far less than clean pulls and caught balls." },
      { q: "Should every kid play quarterback?", a: "Early in the season, yes — rotate everyone through QB in practice. You will find surprising arms, and every player learns how the play call works from the inside." },
    ],
  },
  {
    slug: "flag-football-positions-explained",
    title: "Flag Football Positions Explained (5v5 and 7v7)",
    description:
      "Every flag football position for 5v5 and 7v7 explained in plain language — offense, defense, and youth coaching tips on where to play each kid.",
    excerpt:
      "QB, center, rushers, and everyone in between — what each position does in 5v5 and 7v7 flag, and which kids fit where.",
    tag: "Flag Football",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["flag football positions", "5v5 flag football positions", "7v7 flag football positions", "youth flag football positions"],
    body: [
      { p: "Flag football strips the game down: no linemen crashing into each other, no special teams — just a handful of players who all touch the ball. But positions still matter, and where you put each kid changes everything. Here is what every spot does in the two most common formats, 5v5 and 7v7." },
      { h2: "5v5 offense" },
      { p: "The quarterback (QB) takes the snap and either throws or hands off — in most 5v5 leagues the QB cannot run past the line of scrimmage, so this spot needs your best decision-maker and thrower. The center (C) snaps the ball and immediately releases into a route, usually short over the middle. The remaining three are receivers (WR) — one or two wide, sometimes one in the backfield as a running back (RB) who takes handoffs and swing passes. Because everyone is eligible, every player runs routes on every play." },
      { h2: "5v5 defense" },
      { p: "Most 5v5 defenses play a 2-deep or 3-under zone. Two or three defenders cover short zones, one or two play deep safety, and — in leagues that allow it — one defender can rush the QB after starting seven yards off the line. The rusher's job is pressure, not violence: force a quick throw. Everyone else's job is the same: stay in your zone, watch the QB's eyes, and pull flags cleanly." },
      { h2: "7v7 additions" },
      { p: "With seven players you add a second true receiver or tight-end-style player on offense and gain real formation variety — trips, twins, and motion. On defense you typically run three deep and three or four underneath, plus an optional rusher. The reads are the same as 5v5; there are simply more bodies, so route spacing and zone discipline matter more." },
      { h2: "Where to put each kid" },
      { p: "Your calmest, most accurate thrower plays quarterback — arm strength matters less than decisions at this level. Reliable hands go to center, since that short middle route is the bail-out on every broken play. Your fastest players start at receiver and deep safety. Fearless, quick kids make great rushers. And rotate everyone early in the season: flag is the format where a kid discovers a position nobody predicted." },
    ],
    related: [
      { href: "/blog/flag-football-play-sheet-template", label: "Play Sheet & Wristband Template", note: "Draw plays, cut out QB cards" },
      { href: "/blog/flag-football-practice-plan-template", label: "Flag Football Practice Plan", note: "Free 60-minute template" },
      { href: "/blog/football-positions-explained", label: "Tackle Football Positions", note: "The full 11-on-11 version" },
    ],
    faqs: [
      { q: "What are the positions in 5v5 flag football?", a: "Offense: a quarterback, a center who snaps and runs routes, and three receivers (one often plays as a running back). Defense: zone defenders and safeties, plus an optional rusher in leagues that allow one." },
      { q: "Can the quarterback run in flag football?", a: "In most 5v5 leagues, no — the QB cannot cross the line of scrimmage on a run, though they can scramble behind it. Some 7v7 and local leagues differ, so check your rulebook." },
      { q: "What is the most important position in youth flag football?", a: "Quarterback touches the ball every play, but the center is quietly critical — a clean snap and a reliable short route bail out more broken plays than anything else." },
    ],
  },
  {
    slug: "how-to-coach-youth-flag-football",
    title: "How to Coach Youth Flag Football: A First-Timer's Guide",
    description:
      "New to coaching flag football? A step-by-step first-season guide — rules, practice structure, play calling, positions, and keeping five-year-olds to twelve-year-olds engaged.",
    excerpt:
      "No contact, small rosters, fast games — flag is the friendliest coaching gig in youth sports. Here is how to run a great first season.",
    tag: "Flag Football",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "6 min read",
    keywords: ["how to coach flag football", "coaching youth flag football", "first time flag football coach", "flag football coaching tips"],
    body: [
      { p: "Flag football is the fastest-growing youth sport in the country for a reason: no contact, small rosters, short practices, and every kid touches the ball. It is also the friendliest first coaching job in sports. Here is how to run a first season that has your team begging to come back." },
      { h2: "Learn your league's rules first" },
      { p: "Flag rules vary more than any other youth sport: 5v5 or 7v7, whether a rusher is allowed, whether the QB can run, no-run zones near the goal line, and how flag guarding is called. Read your league's rulebook before your first practice — half of new-coach frustration is coaching a rule the league does not use." },
      { h2: "Build practice around the two skills that decide games" },
      { p: "Youth flag games are won by catching the ball on offense and pulling flags on defense. Fancy plays lose to a team that simply completes passes and makes clean pulls. Give both skills dedicated time every single practice — a flag-pulling circuit and a catching block — before you touch scheme." },
      { h2: "Install a small set of plays with a wristband system" },
      { p: "Six to eight plays from one formation is plenty. Draw them on a play sheet, number them, and put wristband cards on your quarterback so play calls take five seconds instead of a full huddle debate. Kids execute what they can remember." },
      { h2: "Rotate everyone through everything" },
      { p: "Flag is the format for discovering players. Rotate every kid through quarterback, center, receiver, and rusher in practice, and spread game snaps fairly — small rosters make playing time visible, and parents notice. A fair rotation now also builds the versatile players who dominate later." },
      { h2: "Keep the energy up" },
      { p: "Most flag players are between five and twelve years old. Attention spans are short, so practices should feel like recess with structure: tag games as warm-ups, drills as competitions, and a scrimmage every week. If practice is fun, effort and skills follow." },
      { h2: "Get the season logistics off your plate" },
      { p: "Schedules, RSVPs, last-minute field changes, and team photos eat volunteer coaches alive. A free team site on My-Team Sports handles the schedule, roster, live scores, and parent notifications — and the Coach's Playbook draws flag plays on a proper field, so your whole system lives in one place." },
    ],
    related: [
      { href: "/blog/flag-football-practice-plan-template", label: "Flag Football Practice Plan", note: "Free 60-minute template" },
      { href: "/blog/flag-football-play-sheet-template", label: "Play Sheet & Wristband Template", note: "Draw plays, cut out QB cards" },
      { href: "/blog/flag-football-positions-explained", label: "Flag Football Positions", note: "5v5 and 7v7, explained" },
    ],
    faqs: [
      { q: "Do I need football experience to coach flag?", a: "No. Flag football is the most beginner-friendly coaching job in youth sports — no contact to manage, small rosters, and simple schemes. Learn your league's rules, bring a practice plan, and you are ahead of most first-year coaches." },
      { q: "What ages play flag football?", a: "Most youth leagues run from about age five through twelve or fourteen, and many high schools now field girls' flag football as a varsity sport. Check your local league for exact divisions." },
      { q: "How do I keep young kids focused at practice?", a: "Make everything a game. Tag for warm-ups, catching competitions, flag-pull contests, and a weekly scrimmage. Short blocks — eight to twelve minutes each — keep energy high for an hour." },
    ],
  },
  {
    slug: "flag-football-drills-for-beginners",
    title: "Flag Football Drills for Beginners (Fun & Simple)",
    description:
      "Easy, fun flag football drills for beginners and young kids — flag pulling, catching, and route running with simple setups and coaching cues.",
    excerpt:
      "Sharks and minnows, mirror pulls, route trees made simple — drills that teach the game while feeling like recess.",
    tag: "Flag Football",
    date: "2026-07-10",
    updated: "2026-07-10",
    readingTime: "5 min read",
    keywords: ["flag football drills for beginners", "youth flag football drills", "flag pulling drills", "fun flag football drills for kids"],
    body: [
      { p: "The best beginner flag football drills do not look like drills — they look like games that happen to teach flag pulling, catching, and routes. Here are the ones that earn their practice time, with the coaching cue that makes each one work." },
      { h2: "Flag-pulling drills" },
      { p: "Sharks and minnows: every minnow wears flags and runs across a marked zone; sharks pull flags, and pulled minnows become sharks. It is the single best flag-pulling drill ever invented, and kids will play it until dark. Cue: break down before you reach for the flag — feet stop chopping, knees bend, then grab cloth." },
      { p: "Mirror drill: two players face off in a five-yard channel; the runner shuffles side to side, the defender mirrors, and on the whistle the runner attacks — one pull attempt. Cue: watch the belt, not the eyes. Hips do not lie." },
      { h2: "Catching drills" },
      { p: "Rapid-fire catch: pairs stand ten feet apart and complete as many catches as they can in sixty seconds; drop and the count resets. Cue: thumbs together for high balls, pinkies together for low balls, and eyes follow the ball all the way in." },
      { p: "Tennis-ball tracking: for younger kids, swap in a tennis ball for ten throws. It shrinks the target, so the real football suddenly feels easy. Cue: catch with hands, not chest." },
      { h2: "Route-running drills" },
      { p: "Route tree lite: teach three routes only — the slant, the out, and the go. Set two cones, walk the route once, run it against air, then add a shadow defender. Cue: sell the fake with your shoulders, then cut hard off one foot. Once players run all three cleanly, combine them into plays on your play sheet." },
      { h2: "Turn drills into your practice plan" },
      { p: "String these together — warm-up tag, ten minutes of pulling, ten of catching, routes, then a scrimmage with play calls — and you have a complete session. The free flag football practice plan template lays that structure out ready to print." },
    ],
    related: [
      { href: "/blog/flag-football-practice-plan-template", label: "Flag Football Practice Plan", note: "Free 60-minute template" },
      { href: "/blog/flag-football-play-sheet-template", label: "Play Sheet & Wristband Template", note: "Draw plays, cut out QB cards" },
      { href: "/blog/how-to-coach-youth-flag-football", label: "How to Coach Flag Football", note: "A first-timer's guide" },
    ],
    faqs: [
      { q: "What is the best flag football drill for beginners?", a: "Sharks and minnows. It teaches flag pulling — the most important defensive skill — inside a game young kids genuinely love, so you get maximum reps with zero complaints." },
      { q: "How do I teach young kids to catch a football?", a: "Start close with soft throws, cue thumbs-together for high balls and pinkies-together for low ones, and use a tennis ball occasionally to sharpen tracking. Volume beats technique lectures at this age." },
      { q: "How many routes should beginners learn?", a: "Three: the slant, the out, and the go. They cover short, medium, and deep, and nearly every youth flag play is built from them." },
    ],
  },
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
  {
    slug: "baseball-scorekeeping-app",
    title: "Baseball Scorekeeping App: Score From the Dugout, Family Watches Live",
    description:
      "Keep the book on your phone — balls, strikes, outs, and runners — while My-Team Sports updates your team page live for every parent and grandparent who couldn't make the game.",
    excerpt:
      "Tap the game in pitch by pitch from the dugout. The team page updates live, stats build themselves, and grandma three states away sees every run.",
    tag: "Baseball",
    date: "2026-07-11",
    updated: "2026-07-11",
    readingTime: "5 min read",
    keywords: ["baseball scorekeeping app", "youth baseball scorekeeper", "live baseball score for parents", "baseball scorebook app"],
    body: [
      { p: "Every youth baseball team has a scorekeeper, and every scorekeeper knows the two classic endings: a paper book smudged beyond reading, or a scoring app so fussy the game gets ahead of you by the third inning. Meanwhile half the family — the parent stuck at work, the grandparents two states over — is texting 'what's the score?' There is a simpler way to do the whole job at once." },
      { h2: "Score the game the way you already think about it" },
      { p: "My-Team Sports gives baseball full play-by-play scoring on your phone: track balls, strikes, and outs, move runners around the bases, and follow each batter at the plate. You tap what happens as it happens — no double entry into a separate scoreboard, no deciphering pencil marks after the game." },
      { h2: "The team page updates live" },
      { p: "Everything you tap pushes straight to your team's page in real time — the score, the inning, and the key plays. Anyone with your team link can follow the game as it unfolds, which turns 'what's the score?' texts into 'great win!' texts." },
      { h2: "Stats build themselves" },
      { p: "Because you scored the game pitch by pitch, player stats accumulate on their own across the season. No spreadsheet on Sunday night, no arguing about who actually had two hits — the book is clean, digital, and permanent." },
      { h2: "Who this matters for" },
      { ul: [
        "The scorekeeper parent, who gets one job instead of three.",
        "Working parents who catch the game live from a desk.",
        "Grandparents and far-away family who never miss an at-bat.",
        "The coach, who gets a season of stats without lifting a pencil.",
      ]},
      { p: "Live scorekeeping is built into every team on My-Team Sports, right next to the schedule, roster, and photos — and parents never pay to watch their own kid. Set your team up in about five minutes, then hand the phone to your scorekeeper at the next game." },
    ],
    related: [
      { href: "/blog/how-to-keep-a-baseball-scorebook", label: "How to Keep a Baseball Scorebook", note: "The classic paper method, explained" },
      { href: "/blog/youth-baseball-practice-plan", label: "Youth Baseball Practice Plan", note: "A practice that keeps kids moving" },
      { href: "/blog/live-scorekeeping-every-sport", label: "Live Scorekeeping for Every Sport", note: "How it works across sports" },
    ],
    faqs: [
      { q: "Can parents watch the game score live?", a: "Yes. Everything the scorekeeper enters — score, inning, and key plays — updates the team page in real time, so any family member with the team link can follow along from anywhere." },
      { q: "Does the app track player stats?", a: "Yes. Because games are scored play by play, batting and fielding stats build automatically over the season — no separate spreadsheet needed." },
      { q: "Do parents need to download an app to follow the game?", a: "No. The live score is part of your team's web page. Families open one link with the team passcode — nothing to install and no account to create." },
    ],
  },
  {
    slug: "softball-scorekeeping-app",
    title: "Softball Scorekeeping App: Pitch-by-Pitch Scoring Parents Can Watch Live",
    description:
      "Score your softball games on your phone with full play-by-play — balls, strikes, outs, and runners — while families follow the game live on your team page.",
    excerpt:
      "Fastpitch or slowpitch, score it pitch by pitch from the bench. Stats build automatically and every family follows live with one link.",
    tag: "Softball",
    date: "2026-07-11",
    updated: "2026-07-11",
    readingTime: "5 min read",
    keywords: ["softball scorekeeping app", "fastpitch scorebook app", "live softball score for parents", "youth softball stats"],
    body: [
      { p: "Softball scorekeeping has all the complexity of baseball's — runners, counts, outs, substitutions — plus tournament weekends where you play four games in one day and nobody's paper book survives past pool play. If you are the team's book parent, your phone can do this job better." },
      { h2: "Full play-by-play, built for the diamond" },
      { p: "My-Team Sports scores softball with the same pitch-by-pitch engine as baseball: track balls, strikes, and outs, move runners around the bases, and follow each batter at the plate. Tap the game in as it happens and the book keeps itself." },
      { h2: "Families follow live" },
      { p: "The score, the inning, and the key plays push straight to your team page in real time. On tournament weekends that is a superpower — the families who stayed home for a sibling's game, the grandparents who cannot travel, and the parent shuttling between fields all see the same live game." },
      { h2: "A season of stats, no Sunday-night spreadsheet" },
      { p: "Scoring play by play means batting stats accumulate automatically across the season. When awards night comes, the numbers are already there — clean, complete, and free of pencil-smudge disputes." },
      { h2: "One page for the whole season" },
      { p: "The live score lives on the same passcode-protected team page as your schedule, roster, RSVPs, and photos. Families open one link; there is no app to download and no account to create, and parents never pay to follow their own kid. If you also want help with lineups, the AI Assistant Coach can suggest a batting order and field positions straight from your roster." },
    ],
    related: [
      { href: "/blog/live-scorekeeping-every-sport", label: "Live Scorekeeping for Every Sport", note: "How it works across sports" },
      { href: "/blog/ai-assistant-coach-for-youth-teams", label: "The AI Assistant Coach", note: "Briefings, lineups, and practice plans" },
      { href: "/blog/share-team-schedule-and-photos-without-an-app", label: "Share Schedule & Photos", note: "One link, no app" },
    ],
    faqs: [
      { q: "Does the app support fastpitch and slowpitch softball?", a: "Yes. The play-by-play scoring engine works for softball at any level — track the count, outs, and runners the same way regardless of pitch style." },
      { q: "Can it suggest a batting order?", a: "Yes — the optional AI Assistant Coach includes a lineup advisor for baseball and softball that suggests a batting order and field positions from your roster." },
      { q: "How do families follow the game?", a: "They open your team page with a link and passcode — the score updates live as the scorekeeper enters plays. No app store, no accounts, and it's always free for parents." },
    ],
  },
  {
    slug: "basketball-live-scoreboard-app",
    title: "A Live Basketball Scoreboard in Every Parent's Pocket",
    description:
      "Run a live scoreboard for your youth basketball games from your phone — score, quarter, and clock — so every family follows the game in real time on your team page.",
    excerpt:
      "Score, quarter, and clock — kept from the bench on a phone, watched live by every family who couldn't be in the gym.",
    tag: "Basketball",
    date: "2026-07-11",
    updated: "2026-07-11",
    readingTime: "4 min read",
    keywords: ["basketball scoreboard app", "live basketball score for parents", "youth basketball scorekeeping", "team scoreboard app"],
    body: [
      { p: "Youth basketball moves fast — four quarters gone in an hour, and if a family missed the game, they missed it. A live scoreboard changes that: one person on the bench keeps score on a phone, and everyone who couldn't be in the gym watches the game unfold in real time." },
      { h2: "Simple on purpose" },
      { p: "Basketball on My-Team Sports uses the universal live scoreboard: the score, the quarter, and the game clock, kept with a few taps from the bench. It is deliberately lighter than baseball-style play-by-play — a parent volunteer can run it the first time with zero training and still never fall behind the game." },
      { h2: "Live for everyone with the link" },
      { p: "The scoreboard pushes to your team's page in real time. The parent at work refreshes at the buzzer of every quarter; the grandparents who live too far to drive catch every lead change. When the final horn sounds, post the result and your team's record updates across the site." },
      { h2: "Part of the team page, not another app" },
      { ul: [
        "No separate scoreboard app to install — it is built into your team's web page.",
        "Families follow with one link and a passcode. No accounts, and always free for parents.",
        "The final score lands next to your schedule, roster, and photos — one home for the season.",
      ]},
      { p: "If you want game-day to run itself even further, pair the scoreboard with game-day alerts: families get a push when the game goes final, with the score attached. Set up your team on My-Team Sports in about five minutes and hand the scoreboard to a bench parent this weekend." },
    ],
    related: [
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Fair minutes, planned ahead" },
      { href: "/blog/game-day-alerts-team-notifications", label: "Game-Day Alerts", note: "Push updates to every family" },
      { href: "/blog/live-scorekeeping-every-sport", label: "Live Scorekeeping for Every Sport", note: "How it works across sports" },
    ],
    faqs: [
      { q: "Can parents watch the basketball score live from home?", a: "Yes. The scoreboard — score, quarter, and clock — updates your team page in real time for anyone with the team link and passcode." },
      { q: "Is it hard to keep the scoreboard during a fast game?", a: "No. It is a simple score-quarter-clock board designed to be run with a few taps, so a first-time volunteer can keep up without missing the action." },
      { q: "Do families need to download anything?", a: "No. The live scoreboard is part of the team's web page — one link, one passcode, nothing to install, and free for parents." },
    ],
  },
  {
    slug: "ai-soccer-practice-planner",
    title: "AI Soccer Practice Planner: A Themed Session in Seconds",
    description:
      "Tell the AI practice planner how long you have and what to work on — it builds a timed, station-by-station youth soccer session that follows the no-laps, no-lines, no-lectures rule.",
    excerpt:
      "\"75 minutes, work on spacing and first touch\" — and a full session comes back, timed block by block. Practice prep in the school pickup line.",
    tag: "Soccer",
    date: "2026-07-11",
    updated: "2026-07-11",
    readingTime: "5 min read",
    keywords: ["soccer practice plan generator", "AI soccer practice planner", "youth soccer practice plan app", "soccer training session builder"],
    body: [
      { p: "Every volunteer soccer coach knows the Tuesday-night scramble: practice is at six, work ran long, and the plan is a blank page. A good session takes real thought — warm-up flow, a theme, small-sided games that fit your numbers. The AI practice planner does that thinking in seconds, so you show up with a script instead of improvising." },
      { h2: "Describe the practice you need" },
      { p: "Tell it what you are working with, in plain words: 'I have 75 minutes and twelve U10s — we need to fix spacing and first touch.' The planner turns that into a timed, station-by-station session you can read from your phone or print for your clipboard." },
      { h2: "It plans the way good coaches plan" },
      { p: "The sessions follow the structure that development academies use for youth players: balls out early, every kid touching the ball in the first minutes, one theme threaded through the middle blocks, and small-sided games carrying the back half — no laps, no lines, no lectures. You stay in charge of the coaching; the planner just handles the architecture." },
      { h2: "A fresh plan every week, not the same one recycled" },
      { p: "Because you describe each week's need, the plan changes as your team does. Lost 3–0 because nobody spread out? Ask for a spacing session. Rainy week with half the roster? Ask for a 45-minute plan for eight players. It adjusts to the time, the numbers, and the theme every single time." },
      { h2: "Turn it on for your team" },
      { p: "The practice planner is part of the AI Assistant Coach on My-Team Sports — a per-team feature you switch on from the coach dashboard, where it joins game briefings before each match. Your roster, schedule, and team page are already there; the planner just removes the last piece of weekly homework. If you prefer to start with the classic method, grab the free printable 75-minute template and let the AI take over when the season gets busy." },
    ],
    related: [
      { href: "/blog/soccer-practice-plan-template", label: "Soccer Practice Plan Template", note: "The free printable 75-minute session" },
      { href: "/blog/soccer-drills-for-beginners", label: "Soccer Drills for Beginners", note: "Fun drills that teach" },
      { href: "/blog/ai-assistant-coach-for-youth-teams", label: "The AI Assistant Coach", note: "Briefings, lineups, and practice plans" },
    ],
    faqs: [
      { q: "How does an AI soccer practice planner work?", a: "You tell it your session length, roster size, and what you want to work on; it generates a timed, station-by-station plan built on youth-development principles like small-sided games and maximum touches." },
      { q: "Can I customize the generated practice plan?", a: "Yes — the plan is a starting script, and you ask for a different length, theme, or focus any time. Coaches adjust on the field as always; the planner saves the prep time, not the coaching." },
      { q: "Is the AI practice planner soccer-only?", a: "No. The same planner inside the AI Assistant Coach builds sessions for any sport your team plays on My-Team Sports — soccer, basketball, baseball, football, and more." },
    ],
  },
  {
    slug: "ai-basketball-practice-planner",
    title: "AI Basketball Practice Planner: Build Tonight's Practice in Seconds",
    description:
      "Tell the AI practice planner your gym time and focus — ball-handling, defense, spacing — and get a timed, station-by-station youth basketball practice you can run off your phone.",
    excerpt:
      "One hour of gym time, ten kids, need to fix ball-handling and free throws — and the plan comes back timed to the minute.",
    tag: "Basketball",
    date: "2026-07-11",
    updated: "2026-07-11",
    readingTime: "5 min read",
    keywords: ["basketball practice plan generator", "AI basketball practice planner", "youth basketball practice plan app", "basketball practice builder"],
    body: [
      { p: "Gym time is the scarcest resource in youth basketball. You get one hour, maybe two nights a week, and every minute a kid spends standing in line is a minute of court time your league paid for and nobody used. A tight plan is the difference — and the AI practice planner writes one in the time it takes to walk from the parking lot to the gym door." },
      { h2: "Say what you need, get a session back" },
      { p: "Tell the planner your time, your numbers, and your focus: 'one hour, ten kids, we need ball-handling and help defense.' It returns a station-by-station practice with times on every block — warm-up, skill stations, the teaching theme, and game-speed play to finish." },
      { h2: "Built for how kids actually learn basketball" },
      { p: "Good youth practices keep every kid with a ball as much as possible, teach one idea at a time, and end with small-sided play where the idea shows up in a real game. The planner structures sessions that way by default — stations instead of lines, reps instead of speeches — so your hour of gym time turns into an hour of actual basketball." },
      { h2: "Adapts to the week you are having" },
      { ul: [
        "Got blown out on the boards Saturday? Ask for a rebounding-heavy session.",
        "Only eight kids because of a school event? The plan resizes.",
        "Half court instead of full court this week? Tell it, and the stations fit the space.",
      ]},
      { h2: "Part of your team's home base" },
      { p: "The practice planner lives inside the AI Assistant Coach on My-Team Sports — flip it on from your coach dashboard and it appears next to your roster, schedule, and rotation planning. Before games it writes you a plain-English briefing too. Pair it with the printable rotation chart and your whole week — practice, minutes, game day — is planned before you leave the couch." },
    ],
    related: [
      { href: "/blog/basketball-practice-plan-template", label: "Basketball Practice Plan Template", note: "The free printable session" },
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Fair minutes, planned ahead" },
      { href: "/blog/ai-assistant-coach-for-youth-teams", label: "The AI Assistant Coach", note: "Briefings, lineups, and practice plans" },
    ],
    faqs: [
      { q: "How does the AI build a basketball practice plan?", a: "You give it your session length, roster size, and focus areas; it returns a timed, station-by-station plan that favors stations over lines and finishes with small-sided, game-speed play." },
      { q: "Can it plan for limited gym time or half court?", a: "Yes. Tell it the time and space you actually have — 45 minutes, half court, eight players — and the session is built to fit." },
      { q: "Does it replace coaching judgment?", a: "No. It writes the structure so you spend your energy teaching. You can regenerate or adjust any plan, and you run the floor as always." },
    ],
  },
  {
    slug: "ai-baseball-practice-plan-generator",
    title: "AI Baseball Practice Plans — and a Lineup Advisor for Game Day",
    description:
      "Generate station-by-station youth baseball practices in seconds, then let the AI lineup advisor suggest a batting order and field positions straight from your roster.",
    excerpt:
      "Practice plans built around stations, not lines — plus a lineup advisor that ends the parking-lot batting-order scribble.",
    tag: "Baseball",
    date: "2026-07-11",
    updated: "2026-07-11",
    readingTime: "5 min read",
    keywords: ["baseball practice plan generator", "AI baseball practice planner", "youth baseball lineup generator", "baseball batting order app"],
    body: [
      { p: "Baseball practice has a bad default: one kid batting, one coach pitching, and ten kids in the outfield studying dandelions. Breaking that pattern takes a stations plan — and writing a fresh one every week is exactly the homework that volunteer coaches never have time for. That is the job the AI practice planner does in seconds." },
      { h2: "Stations, not standing around" },
      { p: "Tell the planner your practice length, your roster size, and what needs work — 'ninety minutes, twelve kids, fix throwing accuracy and base running' — and it returns a timed, station-by-station session. Small groups rotate through hitting, fielding, and throwing work, so every kid gets ten times the reps of a one-line practice." },
      { h2: "The lineup advisor ends the parking-lot scribble" },
      { p: "Baseball and softball coaches get a second tool: the AI lineup advisor reads your roster and suggests a batting order and field positions for game day. You review it, drag what you disagree with, and post it — instead of scribbling nine names on a wrinkled index card while families watch you think." },
      { h2: "A briefing before every game" },
      { p: "The same AI Assistant Coach writes a plain-English game briefing from your roster, results, and stats: what has been working, what to drill next, and what to watch for today. It is the assistant coach who never misses a practice and never argues about the batting order." },
      { h2: "Turn it on in the dashboard" },
      { p: "The AI Assistant Coach is a per-team feature you enable from your My-Team Sports coach dashboard, where your roster, schedule, and live scorekeeping already live. Score your games pitch by pitch and the stats that feed those briefings build themselves. Start with the free printable practice plan if you like — the AI is there when the season speeds up." },
    ],
    related: [
      { href: "/blog/youth-baseball-practice-plan", label: "Youth Baseball Practice Plan", note: "The free printable stations plan" },
      { href: "/blog/baseball-scorekeeping-app", label: "Baseball Scorekeeping App", note: "Pitch-by-pitch, live for families" },
      { href: "/blog/ai-assistant-coach-for-youth-teams", label: "The AI Assistant Coach", note: "Briefings, lineups, and practice plans" },
    ],
    faqs: [
      { q: "Can AI really suggest a youth baseball lineup?", a: "Yes — the lineup advisor suggests a batting order and field positions from your roster. It is a suggestion, not a mandate: you adjust anything before posting, and you stay the manager." },
      { q: "What makes a good youth baseball practice plan?", a: "Small-group stations instead of one long line: kids rotate through hitting, fielding, and throwing so everyone gets constant reps. The AI planner builds sessions on that structure by default." },
      { q: "Do I need to track stats for the AI briefings to work?", a: "The briefings get sharper as results and stats accumulate — and if you use the built-in live scorekeeping, those stats build automatically as you score each game." },
    ],
  },
  {
    slug: "flag-football-play-designer",
    title: "Flag Football Play Designer: Draw, Save, and Print Your Plays",
    description:
      "Design flag football plays on a digital gridiron — drop your players, draw routes and motion, save plays to your team, and print clean sheets for game day.",
    excerpt:
      "Drop your five or seven, draw the routes, name the play, print the sheet. A digital dry-erase board that remembers everything.",
    tag: "Flag Football",
    date: "2026-07-11",
    updated: "2026-07-11",
    readingTime: "5 min read",
    keywords: ["flag football play designer", "flag football play maker", "flag football playbook app", "youth flag football plays"],
    body: [
      { p: "Flag football is a play-calling sport. With five or seven kids a side and no blocking to hide behind, the team whose receivers run real routes to real spots wins — which means the coach who can draw, teach, and remember plays has the edge. The Coach's Playbook turns that into a five-minute job instead of a laminated-card craft project." },
      { h2: "Draw on a real gridiron" },
      { p: "The play designer gives you a digital dry-erase board drawn on a football field. Drop your players — five or seven for flag — draw each route and motion, and name the play something the kids will remember. 'Trips Right Corner' beats 'that one where Ava goes deep.'" },
      { h2: "Your playbook, organized and controlled" },
      { ul: [
        "Save every play to your team, so the playbook is there all season.",
        "Reorder plays into your install order or your game-day call sheet sequence.",
        "Mark plays visible to the team so players study them from the team site during the week — or keep new ones hidden until you have taught them.",
      ]},
      { h2: "Print clean sheets for the sideline" },
      { p: "When it is time to coach, print your plays as clean sheets for a wristband insert, the sideline clipboard, or the team binder. No more redrawing the same play on a whiteboard every Saturday morning." },
      { h2: "Five plays are enough — make them count" },
      { p: "A youth flag team needs a handful of plays run well, not a binder run badly: a quick out, a crossing pattern, a corner shot, a sweep, and a trick play for the fourth quarter. Draw them once in the playbook, let the kids study them at home, and spend practice on the running, not the remembering. The Playbook comes with every team on My-Team Sports — the same page that holds your schedule, roster, and live scoreboard." },
    ],
    related: [
      { href: "/blog/flag-football-play-sheet-template", label: "Flag Football Play Sheet", note: "The free printable template" },
      { href: "/blog/flag-football-practice-plan-template", label: "Flag Football Practice Plan", note: "A session that teaches the routes" },
      { href: "/blog/coachs-playbook-draw-and-print-plays", label: "The Coach's Playbook", note: "How the play designer works" },
    ],
    faqs: [
      { q: "Can players see the plays at home?", a: "Yes — mark a play visible and players can study it on the team site during the week. Plays you are still installing can stay hidden until you are ready." },
      { q: "Does it work for 5v5 and 7v7 flag football?", a: "Yes. You place the players yourself on the gridiron, so any flag format works — 5v5, 7v7, or whatever your league runs." },
      { q: "Can I print my flag football plays?", a: "Yes. Print clean play sheets for the sideline, a binder, or wristband inserts — every play you have saved, in the order you set." },
    ],
  },
  {
    slug: "basketball-play-designer",
    title: "Free Basketball Play Designer: Draw & Print Plays Online",
    description:
      "Draw basketball plays free in your browser — no download. Sketch cuts, screens and drives on a real half-court, save your sets, and print clean bench sheets.",
    excerpt:
      "Sketch the give-and-go on a real court diagram, save it, and let the kids study it before practice. No whiteboard required.",
    tag: "Basketball",
    date: "2026-07-11",
    updated: "2026-08-03",
    readingTime: "4 min read",
    keywords: ["free basketball play designer","basketball play designer","draw basketball plays online","basketball playbook creator","basketball play maker","basketball play diagram","online basketball play creator","digital playbook basketball"],
    body: [
      { p: "Every youth basketball coach has drawn a beautiful play on a whiteboard, watched ten kids nod, and then watched the play evaporate the moment the ball went live. Kids remember plays they can look at more than plays they were shown once. That is the point of a play designer: draw it once, keep it, and let them see it again." },
      { h2: "Diagram on a real court" },
      { p: "The Coach's Playbook gives you a digital dry-erase board drawn on a basketball court. Place your five, sketch the cuts, screens, and passes, and name the set. Out-of-bounds plays, a simple motion entry, a press-break — each one becomes a saved diagram instead of a memory." },
      { h2: "Save it, order it, share it when ready" },
      { ul: [
        "Save plays to your team so the playbook survives the season (and the coach's phone upgrade).",
        "Reorder sets into the sequence you call them.",
        "Make a play visible for players to study from the team site, or keep it hidden until you have walked it through at practice.",
      ]},
      { h2: "Print for the bench" },
      { p: "Print clean sheets for the game binder or the bench clipboard. Timeouts are thirty seconds — pointing at a printed diagram beats sketching a new one while the ref counts you down." },
      { h2: "Keep the playbook youth-sized" },
      { p: "Three or four sets run crisply beat a dozen run vaguely: one half-court set, one baseline out-of-bounds play, one press-break, and something fun for the last minute of a blowout. Draw them in the Playbook, which comes with every team on My-Team Sports — alongside the live scoreboard, the schedule, and the AI practice planner that can build the session where you teach them." },
    ],
    related: [
      { href: "/blog/ai-basketball-practice-planner", label: "AI Basketball Practice Planner", note: "Build tonight's practice in seconds" },
      { href: "/blog/basketball-rotation-chart", label: "Basketball Rotation Chart", note: "Fair minutes, planned ahead" },
      { href: "/blog/coachs-playbook-draw-and-print-plays", label: "The Coach's Playbook", note: "How the play designer works" },
    ],
    faqs: [
      { q: "Can I diagram out-of-bounds plays?", a: "Yes — place your five anywhere on the court diagram, so baseline and sideline out-of-bounds sets work the same way as half-court plays." },
      { q: "Can players review plays between practices?", a: "Yes. Mark a set visible and players can study it on the team site during the week — repetition off the court makes the walkthrough on the court stick." },
      { q: "How many plays should a youth basketball team have?", a: "Three or four, run well: a half-court set, a baseline out-of-bounds play, a press-break, and one fun wrinkle. Add more only when those are automatic." },
    ],
  },
  {
    slug: "baseball-rainout-notifications",
    title: "Rained Out? Tell Every Baseball Family in One Tap",
    description:
      "Stop the rainout phone tree. Push instant schedule-change alerts — cancellations, reschedules, and field changes — straight to every baseball family's phone, no app required.",
    excerpt:
      "The field flooded at 4:45 and the game is at 6. One tap notifies every family — no phone tree, no 'we didn't see the text.'",
    tag: "Baseball",
    date: "2026-07-11",
    updated: "2026-07-11",
    readingTime: "4 min read",
    keywords: ["baseball rainout notification", "how to notify team of cancelled game", "youth baseball schedule change alerts", "team cancellation text"],
    body: [
      { p: "No sport gets cancelled like youth baseball. An hour of afternoon rain leaves the infield a pond, the league calls it at 4:45, and now you have until 6:00 to reach fourteen families — three of whom muted the group chat in April. Every baseball coach has run that phone tree. None of them misses it." },
      { h2: "One tap, every family" },
      { p: "With game-day alerts on your team page, a schedule change is one action: cancel, reschedule, or move the game, and every family gets a push notification on their phone the moment you make the change. Not a text that scrolls away — an alert, straight to the lock screen." },
      { h2: "What families get notified about" },
      { ul: [
        "Cancellations and reschedules, the moment you make them.",
        "Field and location changes — no more half the team at the wrong diamond.",
        "Announcements you post, game start, and the final score.",
      ]},
      { h2: "No app required — and each family picks their alerts" },
      { p: "Alerts work through the web: families tap once on the team page to turn them on, with nothing to download from an app store. (On iPhones they add the team page to the home screen first — a few seconds, once.) Notifications are per device, so each parent chooses what they want to hear about, and nobody gets buried." },
      { h2: "The rainout workflow, start to finish" },
      { ol: [
        "League calls the game. You open your team page and move or cancel the event.",
        "Every subscribed family's phone buzzes with the change.",
        "The schedule on the team page is already correct for anyone who checks it.",
        "You put your phone away. The phone tree is dead; long live the one tap.",
      ]},
      { p: "Game-day alerts are part of every team on My-Team Sports, alongside the schedule, RSVPs, live scorekeeping, and photos — one page that answers the questions before families ask them." },
    ],
    related: [
      { href: "/blog/game-day-alerts-team-notifications", label: "Game-Day Alerts", note: "How push notifications work" },
      { href: "/blog/baseball-team-website", label: "Baseball Team Website", note: "Schedule, stats, and live scores" },
      { href: "/blog/share-team-schedule-and-photos-without-an-app", label: "Share Schedule & Photos", note: "Why one link beats the group text" },
    ],
    faqs: [
      { q: "How do I notify parents that a baseball game is rained out?", a: "Update the game on your team page — cancel, reschedule, or change the field — and every family that turned on alerts gets an instant push notification with the change." },
      { q: "Do parents need an app to get rainout alerts?", a: "No. Alerts are web push notifications — families enable them with one tap on the team page. iPhone users add the page to their home screen first, which takes seconds." },
      { q: "What if a parent doesn't enable notifications?", a: "The team page schedule is always current, so anyone who checks the link sees the change — and the update is also posted as an announcement they'll see on the page." },
    ],
  },
];

export function getAllPosts() {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPost(slug) {
  return posts.find((p) => p.slug === slug) || null;
}
