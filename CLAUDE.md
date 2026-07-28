# CLAUDE.md — Ron's Working Protocol (My-TeamSports)

Read this before touching anything. It exists because a session once guessed
instead of checking. Every rule below was earned.

## Who you're working with

Ron Blankenship — owner-operator of 2B Creations (2bcreations.com, Shopify/Amazon/eBay),
Quail Keeper Max (quailkeepermax.com), Homestead Paradise, Heartbeat Ministries,
My-TeamSports, and Advanced Integration & Automation (AIA, startup). He is not a
developer. He is a sharp business owner who tests his own product live, makes
decisions fast, and expects you to do the technical work — correctly — and
explain it in plain English.

## The rules

1. **Check. Never guess.** Do not state anything about files, configs, or systems
   that you did not read *this session*. "I searched X and Y and found nothing"
   is acceptable. "It isn't there" without searching is not.

2. **Nothing unverified reaches Ron or production.** Code changes get a successful
   production build (`npm run build`) before you present them as done. If you
   cannot verify (no network, no deps), say exactly that — never imply it's clean.

3. **Terminal = PowerShell, always labeled.** Ron runs commands in Windows
   PowerShell. Say "This is PowerShell," give an exact copy-paste block, and tell
   him what output to expect. If a step can fail, go one step at a time and wait.

4. **Do what was asked; surface everything else.** If you find a problem outside
   the request, report it and ask. Do not fix it unprompted.

5. **Read `git log` before working on a repo.** Decisions live in commit messages
   (root causes, owner directives, live-test results). Write your commit messages
   the same way — they are the project's memory.

6. **Explain before executing anything with consequences.** What will happen,
   what changes where, how to undo it. Then wait for the go.

## This project (verified 2026-07-28)

- **Repo:** `~/my-teamsports` on device ronarea51 (Windows 11).
  GitHub `Climbo1967/my-teamsports` → Vercel auto-deploys `main`.
- **Live site:** my-teamsports.com (www also active). Vercel team
  `climbo1967s-projects`, project `my-teamsports`.
- **Framework:** Next.js 16 (App Router, `src/`), React 19 — newer stack than
  Ron's other apps; don't copy Next-14-era patterns in blindly.
- **Database/auth:** Supabase project `mejkeaoytgblyvqpoyjl` (us-east-2).
  Plain migrations, no edge functions — everything lives in the Next app.
- **Payments:** Stripe v22 **inside the app** (`STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `STRIPE_TAX`). History shows checkout hardening
  (duplicate guard, payment-intent tagging, promo codes, async-payment
  polling). QKM lesson that applies anywhere Stripe does: the webhook must
  point at the exact host that serves the app without redirecting — a 307
  between apex and www once silently killed 111 webhook deliveries.
- **AI features:** Anthropic API (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`).
- **Push notifications:** Web Push via VAPID keys (`VAPID_*`).
- **Email:** Resend. **Bot check:** Turnstile.
- **Known gaps (as of 2026-07-28):** no Sentry, no Vercel Web Analytics —
  unlike Ron's other apps. Surface this when relevant; don't add unprompted.

## Repo conventions

- `.env*` gitignored. Never commit secrets.
- `_stage_tmp/` (staging artifacts) and `_to_delete/` (files cloud sessions
  can't delete; Ron empties it) are the conventions in Ron's other repos —
  **not yet in this repo's .gitignore**. Add them (with Ron's OK) before using.

## Standard ship flow

1. Edit in `~/my-teamsports` (pull first if GitHub is ahead — check).
2. Verify: production build passes; test both sides of any conditional behavior.
   Building outside Vercel needs dummy env values for anything the build touches.
3. Hand Ron the PowerShell block: `git add <files>` → `git commit -m "<decision-rich message>"` → `git push`.
4. Vercel auto-deploys. Verify the live site is serving the new deployment ID
   before calling it done.

## Maintaining this file

This file *is* the protocol. When Ron corrects how you work, propose the edit
here (with his OK) so the next session — whatever model it runs — starts smart.
The master copy of the rules lives in `~/Claude/CLAUDE.md` (QKM version).

*Created 2026-07-28 by Claude (Fable). Project facts verified against the live
repo, Vercel, and Supabase that day.*
