-- Profiles attribution: drift write-back (2026-09-25).
--
-- WHY THIS FILE EXISTS: the live database already has these columns and this
-- trigger. They were applied straight through the Supabase connector as the
-- live migrations `onboarding_state_and_signup_source` (20260731005013) and
-- `ai_chat` (20260803152346, which added ai_trial_ends_at), but neither SQL
-- file was ever committed to this repo. Per Ron's rule that git is the source
-- of truth, this file pins the FULL live `public.profiles` column set and the
-- live `handle_new_user()` body so the repo matches production.
--
-- Everything here is idempotent (ADD COLUMN IF NOT EXISTS / CREATE OR REPLACE)
-- and is a no-op against the live DB. Verified against the live schema via
-- information_schema on 2026-09-25 before writing — not inferred from function
-- signatures.
--
-- Live profiles columns (ordinal order): id, full_name, email, created_at,
-- onboarding_step, onboarding_completed, signup_source, signup_medium,
-- signup_campaign, signup_content, signup_term, signup_referrer,
-- signup_landing_path, ai_trial_ends_at.

-- Onboarding wizard state (from onboarding_state_and_signup_source)
alter table public.profiles add column if not exists onboarding_step integer not null default 0;
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;

-- First-touch signup attribution, written once by handle_new_user() and never
-- overwritten. Captured client-side by the attr-capture script in
-- src/app/layout.js (sessionStorage 'mts_attr'), carried into auth metadata by
-- src/app/signup/page.js (options.data), copied here by the trigger below.
-- Null landing_path = signed up before attribution shipped (reported as
-- 'unknown' by the monitor — never guessed). Referrer/campaign strings are not
-- PII; no IPs are stored.
alter table public.profiles add column if not exists signup_source text;
alter table public.profiles add column if not exists signup_medium text;
alter table public.profiles add column if not exists signup_campaign text;
alter table public.profiles add column if not exists signup_content text;
alter table public.profiles add column if not exists signup_term text;
alter table public.profiles add column if not exists signup_referrer text;
alter table public.profiles add column if not exists signup_landing_path text;

-- AI Coach trial (from ai_chat): every signup gets a 14-day AI trial.
alter table public.profiles add column if not exists ai_trial_ends_at timestamptz not null default (now() + interval '14 days');

-- Live handle_new_user() body, verbatim. Supersedes the 3-column version in
-- supabase/migrations/20260612232230_foundation_schema.sql.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id, full_name, email,
    signup_source, signup_medium, signup_campaign,
    signup_content, signup_term, signup_referrer, signup_landing_path
  )
  values (
    new.id,
    m->>'full_name',
    new.email,
    left(nullif(m->>'utm_source',   ''), 120),
    left(nullif(m->>'utm_medium',   ''), 120),
    left(nullif(m->>'utm_campaign', ''), 200),
    left(nullif(m->>'utm_content',  ''), 200),
    left(nullif(m->>'utm_term',     ''), 200),
    left(nullif(m->>'referrer',     ''), 400),
    left(nullif(m->>'landing_path', ''), 400)
  );
  return new;
end;
$$;

-- Keep the lockdown from supabase/migrations/20260612232335_lock_down_trigger_fn.sql
revoke execute on function public.handle_new_user() from anon, authenticated, public;
