-- EAH — Preserve RLS helper execution for public-role policies.
-- Date: 2026-10-29
--
-- Some existing policies whose role target is PUBLIC call auth_is_admin() or is_admin()
-- as part of their row predicate (customer_order_stats, order_reactions,
-- merchant_order_settings, moderation_queue). PostgreSQL must be able to execute a policy
-- predicate even when the predicate ultimately returns false for an anonymous request.
--
-- Both functions return only a boolean and evaluate auth.uid(); unauthenticated callers
-- receive false. They do not grant table access. Re-enable EXECUTE for anon while keeping
-- data access enforced by each table's existing RLS policies.

GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Verification:
-- SELECT has_function_privilege('anon', 'public.auth_is_admin()', 'EXECUTE'),
--        has_function_privilege('anon', 'public.is_admin()', 'EXECUTE');
-- Then test the tables above as anon and authenticated on a non-production project.
