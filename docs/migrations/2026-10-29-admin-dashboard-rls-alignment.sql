-- EAH — Align session-backed admin features with requireAdmin().
-- Date: 2026-10-29
--
-- In this app requireAdmin() authorizes both admin and super_admin. Several existing
-- RLS policies used private.is_admin(), which authorizes only super_admin. The features
-- below use the user's session client (not the service-role client), so an ordinary admin
-- passed the app guard but could not perform the same work in PostgreSQL.
--
-- Test on a dedicated non-production Supabase project first. This file is additive to
-- the other 2026-10-29 migrations and must not be applied to production without staging
-- validation and a backup. No data rows are changed by this migration.

-- The admin approval action already writes these fields, but the live ads table lacked
-- them. Add them before updating the policy/trigger so approval does not fail with
-- a schema-cache/undefined-column error. Moderator IDs reference auth.users just like
-- business_reviews.moderated_by and reports.reviewed_by.
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Activity reviews: admin review/approve/reject/delete actions use the session client.
DROP POLICY IF EXISTS business_reviews_admin_all ON public.business_reviews;
CREATE POLICY business_reviews_admin_all
ON public.business_reviews
FOR ALL
TO authenticated
USING ((SELECT public.auth_is_admin()))
WITH CHECK ((SELECT public.auth_is_admin()));

-- User reports: permit both admin roles to review and resolve reports. Keep self-only
-- reporter policies separate; anonymous inserts remain impossible because reporter_id
-- must match auth.uid().
DROP POLICY IF EXISTS reports_admin_all ON public.reports;
CREATE POLICY reports_admin_all
ON public.reports
FOR ALL
TO authenticated
USING ((SELECT public.auth_is_admin()))
WITH CHECK ((SELECT public.auth_is_admin()));

-- Audit trails: normal admins can append entries and read admin audit records, but this
-- deliberately does NOT give them update/delete rights. The existing super_admin-only
-- ALL policy stays in place for high-privilege operations.
DROP POLICY IF EXISTS audit_logs_admin_insert ON public.audit_logs;
CREATE POLICY audit_logs_admin_insert
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.auth_is_admin()));

DROP POLICY IF EXISTS audit_logs_admin_select ON public.audit_logs;
CREATE POLICY audit_logs_admin_select
ON public.audit_logs
FOR SELECT
TO authenticated
USING ((SELECT public.auth_is_admin()));

-- Ad moderation. Owners retain access to their own ads; admins gain visibility of pending
-- and rejected records and can approve, pause, resume, or delete them. Public visitors
-- still see active ads only (subject to end date).
DROP POLICY IF EXISTS ads_read ON public.ads;
CREATE POLICY ads_read
ON public.ads
FOR SELECT
TO anon, authenticated
USING (
  (
    status = 'active'
    AND (ends_at IS NULL OR ends_at > now())
  )
  OR owner_profile_id = (SELECT auth.uid())
  OR (SELECT public.auth_is_admin())
);

DROP POLICY IF EXISTS ads_insert ON public.ads;
CREATE POLICY ads_insert
ON public.ads
FOR INSERT
TO authenticated
WITH CHECK (
  owner_profile_id = (SELECT auth.uid())
  OR (SELECT public.auth_is_admin())
);

DROP POLICY IF EXISTS ads_update ON public.ads;
CREATE POLICY ads_update
ON public.ads
FOR UPDATE
TO authenticated
USING (
  owner_profile_id = (SELECT auth.uid())
  OR (SELECT public.auth_is_admin())
)
WITH CHECK (
  owner_profile_id = (SELECT auth.uid())
  OR (SELECT public.auth_is_admin())
);

DROP POLICY IF EXISTS ads_delete ON public.ads;
CREATE POLICY ads_delete
ON public.ads
FOR DELETE
TO authenticated
USING (
  (SELECT public.auth_is_admin())
  OR (
    owner_profile_id = (SELECT auth.uid())
    AND status IN ('pending', 'rejected')
  )
);

-- A row owner may edit the creative/request details, but cannot self-approve, pause,
-- reject or otherwise change moderation state by bypassing the server action.
CREATE OR REPLACE FUNCTION public.prevent_owner_ad_moderation_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.auth_is_admin() THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.approved_by IS DISTINCT FROM OLD.approved_by
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
       OR NEW.rejected_reason IS DISTINCT FROM OLD.rejected_reason THEN
      RAISE EXCEPTION 'Only platform admins can change ad moderation fields'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL PRIVILEGES ON FUNCTION public.prevent_owner_ad_moderation_update() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS ads_protect_moderation_fields ON public.ads;
CREATE TRIGGER ads_protect_moderation_fields
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.prevent_owner_ad_moderation_update();

-- Subscription approvals and extensions are handled in the admin dashboard via the
-- authenticated session. The business owner still has their own read/request policies.
DROP POLICY IF EXISTS subs_admin_all ON public.business_subscriptions;
CREATE POLICY subs_admin_all
ON public.business_subscriptions
FOR ALL
TO authenticated
USING ((SELECT public.auth_is_admin()))
WITH CHECK ((SELECT public.auth_is_admin()));

-- Analytics queries used by the admin dashboards are session-backed. The helper only
-- returns true for a signed-in admin; row-level access remains limited to authorized staff.
DROP POLICY IF EXISTS page_view_events_admin_select ON public.page_view_events;
CREATE POLICY page_view_events_admin_select
ON public.page_view_events
FOR SELECT
TO authenticated
USING ((SELECT public.auth_is_admin()));

DROP POLICY IF EXISTS live_sessions_admin_select ON public.live_page_sessions;
CREATE POLICY live_sessions_admin_select
ON public.live_page_sessions
FOR SELECT
TO authenticated
USING ((SELECT public.auth_is_admin()));

DROP POLICY IF EXISTS visits_admin_select ON public.daily_visits;
CREATE POLICY visits_admin_select
ON public.daily_visits
FOR SELECT
TO authenticated
USING ((SELECT public.auth_is_admin()));

-- Verification checklist on staging:
-- 1) admin (not super_admin): sees unpublished activities and can create/update/publish.
-- 2) admin: can view/approve/reject reviews, resolve reports, moderate ads, manage
--    subscriptions, and view analytics. Audit inserts/selects succeed; audit update/delete
--    remains forbidden.
-- 3) super_admin: retains all existing capabilities.
-- 4) seller: can only access own permitted activity data and owner ad records.
-- 5) buyer: cannot access admin queues or mutate another user's records.
-- 6) anon: can view active public ads only; cannot view pending/rejected ads or admin data.
