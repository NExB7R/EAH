-- =========================================================
-- EAH Migration: profiles.onboarding_done + profiles.interests
-- Date: 2026-09-13
-- Purpose: Support onboarding overlay state + personalization tags
-- Safe to re-run (idempotent) — additive only
--
-- NOTE: Live DB uses public.profiles with:
--   - onboarding_done boolean  default false
--   - interests       jsonb    default '[]'::jsonb
-- This migration reflects reality. app.profiles is legacy —
-- we mirror there only if it exists.
-- =========================================================

-- === 1. public.profiles (the actual live table) ===
alter table if exists public.profiles
  add column if not exists onboarding_done boolean not null default false;

alter table if exists public.profiles
  add column if not exists interests jsonb not null default '[]'::jsonb;

-- GIN index on jsonb for fast tag lookups
create index if not exists idx_profiles_interests_gin
  on public.profiles using gin (interests);

-- Partial index for pending onboarding
create index if not exists idx_profiles_onboarding_done
  on public.profiles (onboarding_done) where onboarding_done = false;

-- === 2. app.profiles (legacy schema — mirror if exists) ===
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'app' and table_name = 'profiles'
      and table_type = 'BASE TABLE'
  ) then
    execute 'alter table app.profiles add column if not exists onboarding_done boolean not null default false';
    execute 'alter table app.profiles add column if not exists interests jsonb not null default ''[]''::jsonb';
    execute 'create index if not exists idx_app_profiles_interests_gin on app.profiles using gin (interests)';
    execute 'create index if not exists idx_app_profiles_onboarding_done on app.profiles (onboarding_done) where onboarding_done = false';
    raise notice 'Mirrored columns onto app.profiles';
  else
    raise notice 'app.profiles not found — skipped (expected in live env)';
  end if;
end $$;

-- === 3. Verify ===
-- Expected after run:
--   public: interests (jsonb, default '[]'::jsonb)
--   public: onboarding_done (boolean, default false)
-- select table_schema, column_name, data_type, column_default
--   from information_schema.columns
--  where column_name in ('onboarding_done','interests')
--  order by table_schema, column_name;
