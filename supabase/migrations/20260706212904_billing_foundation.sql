-- Billing foundation: season passes (calendar-year), AI add-on, 30-day trials.
-- Lock model: expired teams lose the coach dashboard only; public team sites never lock.

alter table public.teams
  add column if not exists paid_through date,
  add column if not exists ai_paid_through date,
  add column if not exists trial_ends_at timestamptz not null default (now() + interval '30 days');

-- Grandfather every existing team through the 2026 season (pre-billing early adopters).
update public.teams set paid_through = date '2026-12-31' where paid_through is null;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  coach_id uuid references auth.users(id) on delete set null,
  product text not null check (product in ('season','ai')),
  season_year int not null,
  amount_cents int not null,
  currency text not null default 'usd',
  stripe_session_id text not null unique,
  stripe_payment_intent text,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Coaches can view their team's payment history; writes happen only via the
-- service-role webhook (no insert/update policies on purpose).
create policy "Coaches view own team payments" on public.payments
  for select using (is_team_coach(team_id));

create index if not exists payments_team_idx on public.payments (team_id);
create index if not exists payments_coach_idx on public.payments (coach_id);
