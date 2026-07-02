create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (team_id, endpoint)
);
create index if not exists push_subscriptions_team_id_idx on public.push_subscriptions(team_id);

alter table public.push_subscriptions enable row level security;

-- Team coaches/staff manage (read for sending, delete stale) their team's device subscriptions.
drop policy if exists "Members manage push subscriptions" on public.push_subscriptions;
create policy "Members manage push subscriptions" on public.push_subscriptions
  for all using (public.is_team_coach(team_id)) with check (public.is_team_coach(team_id));

-- Anonymous parents subscribe through this validated SECURITY DEFINER RPC (dedup by team+endpoint).
create or replace function public.add_push_subscription(
  p_team_id uuid, p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.teams where id = p_team_id) then
    raise exception 'team not found';
  end if;
  insert into public.push_subscriptions (team_id, endpoint, p256dh, auth, user_agent)
  values (p_team_id, p_endpoint, p_p256dh, p_auth, p_user_agent)
  on conflict (team_id, endpoint) do update
    set p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent;
end;
$$;

grant execute on function public.add_push_subscription(uuid, text, text, text, text) to anon, authenticated;