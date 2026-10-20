-- ═══════════════════════════════════════════════════════════════
-- EAH — Fix PUBLIC grant leak on get_multi_account_ips
-- 2026-10-20 (supersedes 2026-10-20-db04-05-security.sql section)
--
-- Problem: previous migration did `REVOKE ... FROM authenticated` but
-- left PUBLIC grant — meaning anon + authenticated + service_role all
-- still had EXECUTE. PUBLIC is the highest-level grant that includes all.
--
-- Fix: REVOKE FROM PUBLIC first, then GRANT to specific roles only.
-- ═══════════════════════════════════════════════════════════════

REVOKE ALL ON FUNCTION public.get_multi_account_ips(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_multi_account_ips(integer) FROM anon;
REVOKE ALL ON FUNCTION public.get_multi_account_ips(integer) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.get_multi_account_ips(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_multi_account_ips(integer) TO postgres;

COMMENT ON FUNCTION public.get_multi_account_ips(integer) IS
  'ADMIN-ONLY. Service role bypasses RLS. Call via service client only.';
