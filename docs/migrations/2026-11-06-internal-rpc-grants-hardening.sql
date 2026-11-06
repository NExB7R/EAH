-- EAH — Restrict internal mutation/maintenance/trigger SECURITY DEFINER RPCs.
-- These routines are not browser-facing API actions. User-facing flows call
-- guarded Server Actions/RPCs; trigger functions continue to run when their
-- trigger fires even after direct EXECUTE is revoked from API roles.
--
-- Applied to the current EAH pre-launch base on 2026-11-06 (Supabase migration version 20261106041256)
-- after call-site and function dependency review; service_role retains explicit EXECUTE.

BEGIN;

-- Trigger-only functions: keep triggers attached, remove direct PostgREST calls.
REVOKE ALL PRIVILEGES ON FUNCTION public.assign_order_code_v2() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_order_code_v2() TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.auto_flag_review() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_flag_review() TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.auto_referral_code() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_referral_code() TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.grant_trial_on_owner() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_trial_on_owner() TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.notify_partner_invitation() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.notify_partner_invitation() TO service_role;

-- Internal helpers: no direct browser call sites. Trusted SECURITY DEFINER
-- callers keep working because they execute as the function owner.
REVOKE ALL PRIVILEGES ON FUNCTION public.check_and_award_badges(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_award_badges(text, uuid) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.cleanup_old_locations() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_locations() TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits() TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.get_next_order_seq(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_order_seq(text) TO service_role;

-- This general settings getter had no app call site and can read any key.
REVOKE ALL PRIVILEGES ON FUNCTION public.get_setting(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_setting(text) TO service_role;

COMMIT;
