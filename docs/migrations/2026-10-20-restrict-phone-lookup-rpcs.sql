-- EAH — Restrict phone-enumeration RPCs to the trusted server
-- Date: 2026-10-20
-- Applied to Supabase project EAH as migration version 20261020203959.
-- Verified: anon=false, authenticated=false, service_role=true for both RPCs.
--
-- Callers in main now use createServiceClient() only after server-side
-- rate-limit/CAPTCHA checks (find_by_phone) or within signupAction
-- (is_phone_registered). Do not expose either RPC directly through PostgREST.

REVOKE ALL PRIVILEGES ON FUNCTION public.find_by_phone(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_by_phone(text) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.is_phone_registered(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_phone_registered(text) TO service_role;

-- Post-apply verification query (already run against the live project):
-- SELECT p.proname,
--   has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
--   has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
--   has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_execute
-- FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.proname IN ('find_by_phone', 'is_phone_registered')
-- ORDER BY p.proname;
-- Expected: anon=false, authenticated=false, service_role=true.
