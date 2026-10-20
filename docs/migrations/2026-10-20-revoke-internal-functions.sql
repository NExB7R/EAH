-- ═══════════════════════════════════════════════════════════
-- 2026-10-20 — Revoke dangerous EXECUTE privileges (DB-03)
-- ═══════════════════════════════════════════════════════════
-- These functions were callable by anon/authenticated via
-- PostgREST, allowing arbitrary rate-limit manipulation,
-- fraud-threshold probing, and monthly report generation.
--
-- No TypeScript callers found (grep verified 2026-10-20).
-- Likely called from SQL triggers/crons only.
--
-- Safe to re-run (REVOKE is idempotent).
-- ═══════════════════════════════════════════════════════════

-- check_rate_limit — replaced by Upstash Redis in lib/rate-limit.ts
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

-- count_accounts_from_ip — fraud detection (admin/service only)
REVOKE EXECUTE ON FUNCTION public.count_accounts_from_ip(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_accounts_from_ip(text, integer) TO service_role;

-- generate_monthly_report — cron/admin only
REVOKE EXECUTE ON FUNCTION public.generate_monthly_report(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_monthly_report(uuid, text) TO service_role;

-- generate_all_monthly_reports — cron/admin only
REVOKE EXECUTE ON FUNCTION public.generate_all_monthly_reports(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_all_monthly_reports(text) TO service_role;

-- track_ad_event — deprecated (replaced by record_ad_event)
REVOKE EXECUTE ON FUNCTION public.track_ad_event(uuid, text) FROM PUBLIC, anon, authenticated;
-- no GRANT — deprecated, keep closed
