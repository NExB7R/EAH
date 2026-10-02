-- EAH Notifications v2: quiet hours + preferences
-- Adds:
--   profiles.notif_quiet_hours  jsonb
--   notifications.type          text (existed)
-- Idempotent — safe to rerun.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'notif_quiet_hours'
  ) then
    alter table public.profiles
      add column notif_quiet_hours jsonb default '{"enabled":false,"from":"22:00","to":"08:00"}'::jsonb;
  end if;
end $$;

-- Existing notif_prefs column is expected to be jsonb
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'notif_prefs'
  ) then
    alter table public.profiles
      add column notif_prefs jsonb default '{}'::jsonb;
  end if;
end $$;
