-- AI Coach Chat v1 (2026-08-03)
-- One private conversation per coach per team. Coaches only; parents never
-- see this. Assistant replies are inserted with the coach's own session, so
-- every row is owned by (team_id, coach_id) and plain RLS covers everything.

create table public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  coach_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index ai_chat_messages_convo_idx
  on public.ai_chat_messages (team_id, coach_id, created_at);

alter table public.ai_chat_messages enable row level security;

-- Coaches read/write only their own conversation, only on teams they staff.
create policy "coach reads own chat" on public.ai_chat_messages
  for select to authenticated
  using (coach_id = (select auth.uid()) and public.is_team_coach(team_id));

create policy "coach writes own chat" on public.ai_chat_messages
  for insert to authenticated
  with check (coach_id = (select auth.uid()) and public.is_team_coach(team_id));

create policy "coach clears own chat" on public.ai_chat_messages
  for delete to authenticated
  using (coach_id = (select auth.uid()) and public.is_team_coach(team_id));

-- No anon policies: parents have no path to this table.
