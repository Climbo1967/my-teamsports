-- Shared-store rate limiter (security backlog): replace the per-serverless-instance
-- in-memory limiter with a Postgres fixed-window counter so limits hold across every
-- instance. The table is reachable only through the SECURITY DEFINER function below
-- (and the service role, which bypasses RLS); direct anon/authenticated access is
-- blocked because RLS is on with no policies.

create table if not exists public.rate_limit_counters (
  bucket text not null,
  window_start bigint not null,
  count int not null default 0,
  primary key (bucket, window_start)
);

alter table public.rate_limit_counters enable row level security;
-- Intentionally NO RLS policies.

-- Atomically record one hit for p_key in the current fixed window and report whether
-- the caller has now exceeded p_limit. Fixed-window semantics matching the old
-- in-memory limiter: the first p_limit calls in a window return false (allowed);
-- the (p_limit + 1)th onward return true (limited).
create or replace function public.check_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window bigint;
  v_count int;
begin
  -- Misconfigured call: fail open, never block traffic.
  if p_key is null or p_limit is null or p_window_seconds is null or p_window_seconds <= 0 then
    return false;
  end if;

  v_window := floor(extract(epoch from now()) / p_window_seconds);

  -- Drop this key's stale windows so the table stays tiny (primary-key-prefix delete).
  delete from public.rate_limit_counters
    where bucket = p_key and window_start < v_window;

  insert into public.rate_limit_counters (bucket, window_start, count)
    values (p_key, v_window, 1)
  on conflict (bucket, window_start)
    do update set count = public.rate_limit_counters.count + 1
  returning count into v_count;

  return v_count > p_limit;
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
