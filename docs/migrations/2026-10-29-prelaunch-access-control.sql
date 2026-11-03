-- EAH — Restrict sensitive RPCs and restore owner/admin access to insight reports.
-- Date: 2026-10-29
-- Safety: additive privilege/policy changes only. Test against a dedicated non-production
-- database and run the verification queries before applying to production.
--
-- Several of these functions return unpublished activity metadata, analytics or contact
-- reveal counters. Current app code does not call them directly from a browser; the
-- supported server-side contact flow uses the service-role client after auth + rate checks.

-- Sensitive RPCs: keep callable only by trusted server-side code.
REVOKE ALL PRIVILEGES ON FUNCTION public.can_signup_with_phone(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_signup_with_phone(text) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.check_business_name_unique(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_business_name_unique(text, uuid) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.get_business_view_stats(text[], integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_business_view_stats(text[], integer) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.reveal_contact(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reveal_contact(uuid, text, text) TO service_role;

-- Coupon details are consumed through trusted server-side flows, not as an unauthenticated
-- coupon-enumeration endpoint.
REVOKE ALL PRIVILEGES ON FUNCTION public.validate_coupon(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, uuid) TO service_role;

-- These authorization helpers are required by authenticated RLS policies and triggers,
-- but should not be callable by anonymous clients.
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Trigger functions are invoked by PostgreSQL's trigger executor, not by PostgREST RPC.
-- Remove default PUBLIC/anon/authenticated EXECUTE grants while preserving installed triggers.
REVOKE ALL PRIVILEGES ON FUNCTION public.comment_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.detect_review_velocity() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.handle_referral_first_order() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.handle_referral_signup() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.log_review_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.on_review_added() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.prevent_self_order() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.prevent_self_review() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.refresh_business_counts() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.refresh_business_scores() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.refresh_comment_likes() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.set_comment_depth() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.set_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.update_customer_stats_on_delivered() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.update_customer_stats_on_insert() FROM PUBLIC, anon, authenticated;

-- Fix mutable search_path settings found by the Supabase advisor.
ALTER FUNCTION public.get_trust_tier(integer) SET search_path = pg_catalog, public;
ALTER FUNCTION public.set_new_until() SET search_path = pg_catalog, public;
ALTER FUNCTION public.prevent_merchant_toggle_orders_enabled() SET search_path = pg_catalog, public;

-- business_insights is read/written through the authenticated session by merchant/admin
-- routes. RLS was enabled but the table had no policies, so every such operation was denied.
-- Keep the table private: owners can access their own business reports; admin can access all.
REVOKE ALL PRIVILEGES ON TABLE public.business_insights FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_insights TO authenticated;

DROP POLICY IF EXISTS business_insights_select_owner_or_admin ON public.business_insights;
CREATE POLICY business_insights_select_owner_or_admin
ON public.business_insights FOR SELECT TO authenticated
USING (
  (SELECT public.auth_is_admin())
  OR EXISTS (
    SELECT 1
    FROM public.businesses AS b
    WHERE b.id = business_insights.business_id
      AND b.owner_profile_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS business_insights_insert_owner_or_admin ON public.business_insights;
CREATE POLICY business_insights_insert_owner_or_admin
ON public.business_insights FOR INSERT TO authenticated
WITH CHECK (
  (SELECT public.auth_is_admin())
  OR EXISTS (
    SELECT 1
    FROM public.businesses AS b
    WHERE b.id = business_insights.business_id
      AND b.owner_profile_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS business_insights_update_owner_or_admin ON public.business_insights;
CREATE POLICY business_insights_update_owner_or_admin
ON public.business_insights FOR UPDATE TO authenticated
USING (
  (SELECT public.auth_is_admin())
  OR EXISTS (
    SELECT 1
    FROM public.businesses AS b
    WHERE b.id = business_insights.business_id
      AND b.owner_profile_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  (SELECT public.auth_is_admin())
  OR EXISTS (
    SELECT 1
    FROM public.businesses AS b
    WHERE b.id = business_insights.business_id
      AND b.owner_profile_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS business_insights_delete_owner_or_admin ON public.business_insights;
CREATE POLICY business_insights_delete_owner_or_admin
ON public.business_insights FOR DELETE TO authenticated
USING (
  (SELECT public.auth_is_admin())
  OR EXISTS (
    SELECT 1
    FROM public.businesses AS b
    WHERE b.id = business_insights.business_id
      AND b.owner_profile_id = (SELECT auth.uid())
  )
);

-- Post-migration verification:
-- 1) anon cannot read insight rows or execute the sensitive RPCs above.
-- 2) an authenticated owner can only CRUD reports for their own business.
-- 3) admin/super_admin can read and maintain reports across businesses.
-- 4) trigger-based inserts/updates still fire the same business logic.
