# Supabase database — source of truth

Prod project: `mejkeaoytgblyvqpoyjl` (my-teamsports.com).

## migrations/

- `20260612232230` … `20260630205043` (21 files): the exact SQL of every
  migration ever applied to prod, extracted byte-for-byte from
  `supabase_migrations.schema_migrations` and MD5-verified on 2026-07-02.
- `20260701000000_security_audit_fixes.sql`: the 2026-07-01 security-audit
  changes (H1/H2/H3 + M2/M3) that were applied to prod outside migration
  history. Function bodies are the live `pg_get_functiondef` output.

**Everything in this folder is ALREADY LIVE on prod. Do not re-run it.**
It exists so the repo documents the full DB state (RLS policies, SECURITY
DEFINER functions, grants, storage policies) and so a fresh environment
can be rebuilt by running the files in order.

## Rule going forward

Any DB change (new table, policy, function, grant, storage policy) must be
committed as a new `supabase/migrations/YYYYMMDDHHMMSS_name.sql` file in the
same batch as the code that uses it. The 2026-07-01 audit found two HIGH
issues (H1, H2) that slipped in precisely because DB changes lived only in
the database.

## Not captured in migrations

- Vercel env vars: `SUPABASE_SERVICE_ROLE_KEY` (legacy JWT service_role key —
  if "Disable JWT-based API keys" is ever clicked in Supabase, swap in a new
  secret key or parent photo uploads break), `VAPID_*` (web push),
  `ANTHROPIC_API_KEY` (AI Coach), `RESEND_API_KEY` (email).
- Storage bucket `team-media` is created by migration `20260613000005`.
