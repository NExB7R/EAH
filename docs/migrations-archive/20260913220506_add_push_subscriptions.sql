-- =========================================================
-- EAH Migration: push_subscriptions (matches live schema)
-- Date: 2026-09-13
-- Safe to re-run (idempotent) — additive only
-- =========================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz default now()
);

create index if not exists push_subs_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- Self: user manages own subscriptions (ALL)
drop policy if exists push_subs_self on public.push_subscriptions;
create policy push_subs_self on public.push_subscriptions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin read
drop policy if exists push_subs_admin_read on public.push_subscriptions;
create policy push_subs_admin_read on public.push_subscriptions
  for select to authenticated
  using ((select private.is_admin()));

grant select, insert, update, delete on public.push_subscriptions to authenticated;
