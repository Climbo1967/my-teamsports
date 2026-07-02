create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  coach_email text not null,
  coach_name text,
  team_id uuid references public.teams(id) on delete set null,
  team_name text,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);

alter table public.support_requests enable row level security;

-- Coaches can create their own requests
create policy "support_insert_own" on public.support_requests
  for insert with check (coach_id = auth.uid());

-- Coaches can read their own requests; admins can read all
create policy "support_select_own_or_admin" on public.support_requests
  for select using (coach_id = auth.uid() or public.is_admin());

-- Admins can update (e.g. mark resolved)
create policy "support_update_admin" on public.support_requests
  for update using (public.is_admin()) with check (public.is_admin());

create index if not exists support_requests_status_idx on public.support_requests (status, created_at desc);