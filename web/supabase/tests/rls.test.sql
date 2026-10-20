-- ============================================================
-- EAH — RLS Tests (pgTAP)
-- Date: 2026-10-01
-- Run on: GitHub Actions (CI)
-- ============================================================

begin;
select plan(37);

-- ============================================================
-- 1. profiles — anon
-- ============================================================

-- 1.1 anon ميقدرش يقرا profiles
set local role anon;
select results_eq(
  'select count(*)::int from public.profiles',
  ARRAY[0],
  'anon: لا يقرأ profiles'
);
reset role;

-- 1.2 anon ميقدرش يقرا phone_e164
set local role anon;
select throws_ok(
  'select phone_e164 from public.profiles limit 1',
  '42501',
  NULL,
  'anon: لا يقرأ phone_e164'
);
reset role;

-- ============================================================
-- 2. business_activities — RLS
-- ============================================================

-- 2.1 anon يقدر يقرا activities
set local role anon;
select lives_ok(
  'select count(*) from public.business_activities',
  'anon: يقرأ business_activities'
);
reset role;

-- 2.2 anon ميقدرش يدخل activity
set local role anon;
select throws_ok(
  $$insert into public.business_activities (business_id, user_id, activity_type)
    values (gen_random_uuid(), gen_random_uuid(), 'follow')$$,
  '42501',
  NULL,
  'anon: ممنوع إدخال activity'
);
reset role;

-- ============================================================
-- 3. Triggers
-- ============================================================

-- 3.1 prevent_self_review trigger موجود
select has_trigger(
  'public.business_reviews',
  'trigger_prevent_self_review',
  'trigger_prevent_self_review موجود'
);

-- 3.2 prevent_self_order trigger موجود
select has_trigger(
  'public.order_requests',
  'trigger_prevent_self_order',
  'trigger_prevent_self_order موجود'
);

-- 3.3 detect_review_velocity trigger موجود
select has_trigger(
  'public.business_reviews',
  'trigger_detect_review_velocity',
  'trigger_detect_review_velocity موجود'
);

-- 3.4 log_review_changes trigger موجود
select has_trigger(
  'public.business_reviews',
  'trigger_log_review_changes',
  'trigger_log_review_changes موجود'
);

-- ============================================================
-- 4. Functions
-- ============================================================

-- 4.1 is_admin موجودة
select has_function(
  'public',
  'is_admin',
  'is_admin موجودة'
);

-- 4.2 get_my_profile موجودة
select has_function(
  'public',
  'get_my_profile',
  'get_my_profile موجودة'
);

-- 4.3 is_phone_registered موجودة
select has_function(
  'public',
  'is_phone_registered',
  ARRAY['text'],
  'is_phone_registered موجودة'
);

-- 4.4 admin_get_profiles موجودة
select has_function(
  'public',
  'admin_get_profiles',
  'admin_get_profiles موجودة'
);

-- ============================================================
-- 4.5 Sensitive RPC grants (requires revoke-anon-sensitive-rpcs migration)
-- ============================================================

select is(
  has_function_privilege('anon', 'public.admin_get_business_owners()', 'EXECUTE'),
  false,
  'anon cannot execute admin_get_business_owners'
);
select is(
  has_function_privilege('authenticated', 'public.admin_get_business_owners()', 'EXECUTE'),
  true,
  'authenticated can execute guarded admin_get_business_owners'
);

select is(
  has_function_privilege('anon', 'public.admin_get_profiles()', 'EXECUTE'),
  false,
  'anon cannot execute admin_get_profiles'
);
select is(
  has_function_privilege('authenticated', 'public.admin_get_profiles()', 'EXECUTE'),
  true,
  'authenticated can execute guarded admin_get_profiles'
);

select is(
  has_function_privilege('anon', 'public.check_reviewer_badges(uuid)', 'EXECUTE'),
  false,
  'anon cannot execute check_reviewer_badges'
);
select is(
  has_function_privilege('authenticated', 'public.check_reviewer_badges(uuid)', 'EXECUTE'),
  true,
  'authenticated can execute guarded check_reviewer_badges'
);

select is(
  has_function_privilege('anon', 'public.check_social_badges(uuid)', 'EXECUTE'),
  false,
  'anon cannot execute check_social_badges'
);
select is(
  has_function_privilege('authenticated', 'public.check_social_badges(uuid)', 'EXECUTE'),
  true,
  'authenticated can execute guarded check_social_badges'
);

select is(
  has_function_privilege('anon', 'public.check_streak_badges(uuid)', 'EXECUTE'),
  false,
  'anon cannot execute check_streak_badges'
);
select is(
  has_function_privilege('authenticated', 'public.check_streak_badges(uuid)', 'EXECUTE'),
  true,
  'authenticated can execute guarded check_streak_badges'
);

select is(
  has_function_privilege('anon', 'public.get_referral_list(uuid, integer)', 'EXECUTE'),
  false,
  'anon cannot execute get_referral_list'
);
select is(
  has_function_privilege('authenticated', 'public.get_referral_list(uuid, integer)', 'EXECUTE'),
  true,
  'authenticated can execute guarded get_referral_list'
);

select is(
  has_function_privilege('anon', 'public.get_referral_stats(uuid)', 'EXECUTE'),
  false,
  'anon cannot execute get_referral_stats'
);
select is(
  has_function_privilege('authenticated', 'public.get_referral_stats(uuid)', 'EXECUTE'),
  true,
  'authenticated can execute guarded get_referral_stats'
);

select is(
  has_function_privilege('anon', 'public.get_my_profile()', 'EXECUTE'),
  false,
  'anon cannot execute get_my_profile'
);
select is(
  has_function_privilege('authenticated', 'public.get_my_profile()', 'EXECUTE'),
  true,
  'authenticated can execute self-only get_my_profile'
);

-- Phone enumeration RPCs are server-only; the API routes now use service_role.
select is(
  has_function_privilege('anon', 'public.find_by_phone(text)', 'EXECUTE'),
  false,
  'anon cannot directly execute find_by_phone'
);
select is(
  has_function_privilege('authenticated', 'public.find_by_phone(text)', 'EXECUTE'),
  false,
  'authenticated cannot directly execute find_by_phone'
);
select is(
  has_function_privilege('service_role', 'public.find_by_phone(text)', 'EXECUTE'),
  true,
  'service_role can execute find_by_phone through guarded server route'
);

select is(
  has_function_privilege('anon', 'public.is_phone_registered(text)', 'EXECUTE'),
  false,
  'anon cannot directly execute is_phone_registered'
);
select is(
  has_function_privilege('authenticated', 'public.is_phone_registered(text)', 'EXECUTE'),
  false,
  'authenticated cannot directly execute is_phone_registered'
);
select is(
  has_function_privilege('service_role', 'public.is_phone_registered(text)', 'EXECUTE'),
  true,
  'service_role can execute is_phone_registered from signupAction'
);

-- ============================================================
-- 5. RLS enabled على كل الجداول الحساسة
-- ============================================================

select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'profiles'),
  true,
  'RLS مفعّل على profiles'
);

select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'business_activities'),
  true,
  'RLS مفعّل على business_activities'
);

select is(
  (select rowsecurity from pg_tables where schemaname = 'public' and tablename = 'moderation_queue'),
  true,
  'RLS مفعّل على moderation_queue'
);

select * from finish();
rollback;
