-- =========================================================
-- EAH Migration: profiles.onboarding_done + profiles.interests
-- Date: 2026-09-13
-- Purpose: Support onboarding overlay state + personalization tags
-- Safe to re-run (idempotent) — additive only
-- =========================================================

-- Ensure columns exist on app.profiles (source of truth)
alter table if exists app.profiles
  add column if not exists onboarding_done boolean not null default false;

alter table if exists app.profiles
  add column if not exists interests text[] not null default '{}'::text[];

-- If a public view/table named profiles exists, mirror the columns there
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
      and table_type = 'BASE TABLE'
  ) then
    alter table public.profiles
      add column if not exists onboarding_done boolean not null default false;
    alter table public.profiles
      add column if not exists interests text[] not null default '{}'::text[];
  end if;
end $$;

-- Index for fast personalization reads (skip if already present)
create index if not exists idx_profiles_interests_gin
  on app.profiles using gin (interests);

-- Optional: onboarding completion index
create index if not exists idx_profiles_onboarding_done
  on app.profiles (onboarding_done) where onboarding_done = false;

-- =========================================================
-- Verify (expected: 4 rows, 2 columns on app + 2 on public if exists)
-- =========================================================
-- select table_schema, column_name, data_type
--   from information_schema.columns
--  where column_name in ('onboarding_done','interests')
--  order by table_schema, column_name;
