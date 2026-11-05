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

-- Analytics write RPCs have no browser call sites in the current app. Keep them server-only;
-- future browser tracking must go through a rate-limited API route with server validation.
REVOKE ALL PRIVILEGES ON FUNCTION public.record_ad_event(uuid, text, uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_ad_event(uuid, text, uuid, uuid, text) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.record_page_view(text, uuid, uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_page_view(text, uuid, uuid, uuid, text, text) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.heartbeat_page_session(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.heartbeat_page_session(uuid, text, uuid) TO service_role;

-- Coupon details are consumed through trusted server-side flows, not as an unauthenticated
-- coupon-enumeration endpoint.
REVOKE ALL PRIVILEGES ON FUNCTION public.validate_coupon(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, uuid) TO service_role;

-- These boolean-only helpers are also referenced by existing RLS policies
-- whose role target is PUBLIC. An anonymous request must be able to evaluate the
-- predicate (which returns false when auth.uid() is null), while table RLS still
-- enforces row access. Keep the grant narrow to anon, not PUBLIC.
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.auth_is_admin() TO anon, authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

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


-- Harden legacy authenticated RPCs whose current bodies did not enforce the
-- caller's business ownership or serialize reward stock/balance updates.
CREATE OR REPLACE FUNCTION public.request_promo_post(
  p_business uuid,
  p_url text,
  p_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_count integer;
  v_owner uuid;
  v_url text := trim(coalesce(p_url, ''));
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unauth');
  END IF;

  IF p_business IS NULL
     OR length(v_url) < 10
     OR length(v_url) > 2048
     OR v_url !~* '^https://[a-z0-9.-]+(:[0-9]+)?(/|$)' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_url');
  END IF;

  IF p_note IS NOT NULL AND length(p_note) > 500 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_note');
  END IF;

  SELECT owner_profile_id
  INTO v_owner
  FROM public.businesses
  WHERE id = p_business;

  IF NOT FOUND OR v_owner IS DISTINCT FROM v_user THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_owner');
  END IF;

  SELECT count(*) INTO v_count
  FROM public.promo_posts
  WHERE business_id = p_business AND status = 'pending';

  IF v_count > 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'has_pending');
  END IF;

  SELECT count(*) INTO v_count
  FROM public.promo_posts
  WHERE business_id = p_business AND status = 'approved';

  IF v_count > 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_used');
  END IF;

  INSERT INTO public.promo_posts (business_id, owner_id, post_url, note)
  VALUES (p_business, v_user, v_url, nullif(trim(coalesce(p_note, '')), ''));

  RETURN jsonb_build_object('ok', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_reward record;
  v_balance integer;
  v_streak integer;
  v_code text;
  v_stock integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  -- Serialize redemptions for the same reward before checking its stock.
  SELECT *
  INTO v_reward
  FROM public.reward_catalog
  WHERE id = p_reward_id AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'reward_not_found');
  END IF;

  IF v_reward.stock IS NOT NULL THEN
    SELECT count(*) INTO v_stock
    FROM public.reward_redemptions
    WHERE reward_id = p_reward_id AND status != 'rejected';

    IF v_stock >= v_reward.stock THEN
      RETURN jsonb_build_object('ok', false, 'reason', 'out_of_stock');
    END IF;
  END IF;

  -- Serialize balance changes for this account across concurrent redemptions.
  SELECT coalesce(trust_score, 0), coalesce(streak_count, 0)
  INTO v_balance, v_streak
  FROM public.profiles
  WHERE id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'profile_not_found');
  END IF;

  IF v_balance < v_reward.points_cost THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_points', 'balance', v_balance, 'needed', v_reward.points_cost);
  END IF;

  IF v_streak < coalesce(v_reward.min_streak, 0) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'streak_too_low', 'streak', v_streak, 'needed', v_reward.min_streak);
  END IF;

  v_code := upper(substring(md5(v_user::text || p_reward_id::text || clock_timestamp()::text), 1, 8));

  UPDATE public.profiles
  SET trust_score = trust_score - v_reward.points_cost
  WHERE id = v_user;

  INSERT INTO public.reward_redemptions (user_id, reward_id, points_spent, code, status)
  VALUES (v_user, p_reward_id, v_reward.points_cost, v_code, 'pending');

  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (v_user, 'points', '🎁 استبدلت مكافأة', 'كود: ' || v_code || ' — ' || v_reward.title, '/account/points');

  RETURN jsonb_build_object('ok', true, 'code', v_code, 'new_balance', v_balance - v_reward.points_cost, 'reward_title', v_reward.title);
END;
$function$;

REVOKE ALL PRIVILEGES ON FUNCTION public.request_promo_post(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_promo_post(uuid, text, text) TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.redeem_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid) TO authenticated, service_role;

-- Post-migration verification:
-- 1) anon cannot read insight rows or execute the sensitive RPCs above.
-- 2) an authenticated owner can only CRUD reports for their own business.
-- 3) admin/super_admin can read and maintain reports across businesses.
-- 4) trigger-based inserts/updates still fire the same business logic.
