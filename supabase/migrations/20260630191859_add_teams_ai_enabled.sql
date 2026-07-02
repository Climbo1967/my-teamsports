-- Per-team entitlement for the AI Assistant Coach (Coach's Briefing).
-- Defaults off; flipped on for subscribed teams (manually now, via Stripe webhook later).
alter table public.teams add column if not exists ai_enabled boolean not null default false;