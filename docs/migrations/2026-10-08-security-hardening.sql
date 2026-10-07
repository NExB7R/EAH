-- EAH — Security Hardening (profiles + privileges)
-- Applied: 2026-10-08
-- See SESSION_LOG.md (Session 21) for context

-- 1) شيل كل الـ policies القديمة
drop policy if exists public_read_profiles      on public.profiles;
drop policy if exists profiles_self_select      on public.profiles;
drop policy if exists profiles_admin_select     on public.profiles;
drop policy if exists profiles_self_update      on public.profiles;
drop policy if exists users_update_own_profile  on public.profiles;

-- 2) سياسة قراءة موحدة — authenticated بس
create policy profiles_authenticated_read
  on public.profiles for select
  to authenticated
  using (true);

-- 3) سياسة تحديث للذات
create policy profiles_self_update
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 4) عمود-عمود: امنع الأعمدة الداخلية
revoke select (ban_reason)             on public.profiles from anon, authenticated;
revoke select (banned_until)           on public.profiles from anon, authenticated;
revoke select (wanted_level)           on public.profiles from anon, authenticated;
revoke select (impact_score)           on public.profiles from anon, authenticated;
revoke select (impact_level)           on public.profiles from anon, authenticated;
revoke select (streak_count)           on public.profiles from anon, authenticated;
revoke select (longest_streak)         on public.profiles from anon, authenticated;
revoke select (last_seen_date)         on public.profiles from anon, authenticated;
revoke select (last_visit_date)        on public.profiles from anon, authenticated;
revoke select (last_activity_at)       on public.profiles from anon, authenticated;
revoke select (cancelled_orders)       on public.profiles from anon, authenticated;
revoke select (total_reviews_received) on public.profiles from anon, authenticated;

-- 5) صفر TRUNCATE/TRIGGER/REFERENCES على كل جداول public
do $$
declare
  r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format(
      'revoke truncate, trigger, references on public.%I from anon, authenticated',
      r.tablename
    );
  end loop;
end $$;
