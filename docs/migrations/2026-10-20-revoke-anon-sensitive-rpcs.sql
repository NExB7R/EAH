-- EAH — Close anonymous EXECUTE grants on user/admin RPCs
-- Date: 2026-10-20
--
-- PostgreSQL grants EXECUTE to PUBLIC on new functions by default.
-- These functions are intended for authenticated app flows and already
-- contain user/admin guards; keeping anon from calling them is defense-in-depth.
-- This migration is deliberately additive and reversible.

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_get_business_owners() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_business_owners() TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_get_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_profiles() TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.check_reviewer_badges(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_reviewer_badges(uuid) TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.check_social_badges(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_social_badges(uuid) TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.check_streak_badges(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_streak_badges(uuid) TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.get_referral_list(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_referral_list(uuid, integer) TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.get_referral_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_referral_stats(uuid) TO authenticated, service_role;

-- Returns the current user's private profile only. No anonymous caller is needed.
REVOKE ALL PRIVILEGES ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated, service_role;

-- Verification (run after applying this migration):
-- SELECT p.proname,
--   has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
--   has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute
-- FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public' AND p.proname IN (
--   'admin_get_business_owners', 'admin_get_profiles',
--   'check_reviewer_badges', 'check_social_badges', 'check_streak_badges',
--   'get_referral_list', 'get_referral_stats', 'get_my_profile'
-- )
-- ORDER BY p.proname;
-- Expected: anon_can_execute = false for all; authenticated_can_execute = true for all.
