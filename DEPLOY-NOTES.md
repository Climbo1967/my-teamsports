# My-Team Sports — Foundation Build (June 12, 2026)

## What's new

The landing page is now a working app:

- **Coach accounts** — `/signup` and `/login` (Supabase Auth, email + password)
- **Coach dashboard** — `/dashboard` lists your teams with link + passcode
- **Create a team** — `/dashboard/new-team`: pick sport, name team → instant shareable link + 6-character passcode
- **Public team site** — `/team/[slug]`: parents enter the passcode once (saved 180 days), then see roster + schedule. No accounts, no app.

Landing page buttons now wired: "CREATE YOUR TEAM" → /signup, "Login" → /login.

## Database (Supabase project: my-teamsports)

- URL: https://mejkeaoytgblyvqpoyjl.supabase.co
- Tables: `profiles`, `teams`, `players`, `events` — all with row-level security (coaches only see their own teams)
- Parents access data only through a passcode-checked function; the teams table is invisible to anonymous users (verified)
- A demo team is live for testing: slug `riverside-raptors-12u`, passcode `XK7M2P` (coach login testcoach@example.com / test-password-123). Delete it whenever.

## To deploy

1. Copy all files from this folder to `C:\Users\rblan\my-teamsports` (your git repo). Don't copy `DEPLOY-NOTES.md` if you don't want it public.
2. In the repo: `npm install`, then `npm run dev` to test locally at http://localhost:3000
3. **Vercel → Project → Settings → Environment Variables**, add both:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://mejkeaoytgblyvqpoyjl.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_1kozOfuB6VS5gl9VsH6Ipg_RPZTIDhF`
4. **Supabase dashboard → Authentication → URL Configuration**: set Site URL to `https://my-teamsports.com` (so signup confirmation emails link to your site, not localhost)
5. `git add -A`, `git commit -m "Foundation: auth, team creation, passcode-gated team sites"`, `git push` — Vercel deploys automatically

`.env.local` is already in this folder for local dev (gitignored, never gets pushed).

## Next phases

Roster management UI (coach adds players), schedule management UI (coach adds games/practices), then photos, message board, coach's notes. The database tables for roster + schedule already exist — only the coach-facing edit screens are needed.
