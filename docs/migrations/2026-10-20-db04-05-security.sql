-- ═══════════════════════════════════════════════════════════════
-- EAH — DB-04/05 Security Fixes
-- 2026-10-20
--
-- Problems (all SECURITY DEFINER + GRANT authenticated):
--   DB-04: check_*_badges — any user can self-award badges to any UUID
--   DB-04: get_multi_account_ips — any user reads fraud IP data
--   DB-04: get_referral_* — any user reads others' referral PII
--   DB-05: get_user_points — any user reads others' points balance
--   DB-05: get_business_funnel/features/trial_status — any user reads
--          any business analytics/subscription
--
-- Fix strategy:
--   - Add guard: auth.uid() = param OR is_admin() — OR service_role bypass
--   - service_role (auth.uid() IS NULL) skips guard for cron/internal use
--   - get_multi_account_ips: REVOKE authenticated (caller switches to service)
--   - SQL-language funcs: WHERE filter (can't RAISE)
--   - plpgsql funcs: RAISE EXCEPTION
--
-- Rollback: DROP the guards (recreate from original DDL in __definition__)
-- Tested: typecheck + invariants in CI. Manual smoke test required per function.
-- ═══════════════════════════════════════════════════════════════

-- ─── DB-04: check_*_badges — self-award guard ───
CREATE OR REPLACE FUNCTION public.check_reviewer_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF auth.uid() IS NOT NULL
     AND p_user_id IS DISTINCT FROM auth.uid()
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.business_reviews
  WHERE user_id = p_user_id AND status = 'approved';

  IF v_count >= 1 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'first_review');
  END IF;
  IF v_count >= 10 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'reviewer_10');
  END IF;
  IF v_count >= 50 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'reviewer_50');
  END IF;
  IF v_count >= 100 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'reviewer_100');
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_social_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_follows integer;
BEGIN
  IF auth.uid() IS NOT NULL
     AND p_user_id IS DISTINCT FROM auth.uid()
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) INTO v_follows
  FROM public.business_follows WHERE user_id = p_user_id;

  IF v_follows >= 1 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'first_follow');
  END IF;
  IF v_follows >= 10 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'follower_10');
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_streak_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_streak integer;
BEGIN
  IF auth.uid() IS NOT NULL
     AND p_user_id IS DISTINCT FROM auth.uid()
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT streak_days INTO v_streak FROM public.profiles WHERE id = p_user_id;
  IF v_streak IS NULL THEN RETURN; END IF;

  IF v_streak >= 7 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'streak_7');
  END IF;
  IF v_streak >= 30 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'streak_30');
  END IF;
  IF v_streak >= 100 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'streak_100');
  END IF;
END;
$function$;

-- ─── DB-04: get_referral_* — self-only guard ───
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id uuid)
RETURNS TABLE(total_invited bigint, signed_up bigint, first_order bigint, total_points bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE signup_at IS NOT NULL)::bigint,
    COUNT(*) FILTER (WHERE first_order_at IS NOT NULL)::bigint,
    COALESCE(SUM(points_awarded_signup + points_awarded_first_order), 0)::bigint
  FROM public.referrals
  WHERE referrer_id = p_user_id
    AND (
      auth.uid() IS NULL
      OR p_user_id = auth.uid()
      OR public.is_admin()
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_referral_list(p_user_id uuid, p_limit integer DEFAULT 50)
RETURNS TABLE(id uuid, display_name text, avatar_url text, signup_at timestamptz, first_order_at timestamptz, points_awarded integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    r.id,
    p.display_name,
    p.avatar_url,
    r.signup_at,
    r.first_order_at,
    (r.points_awarded_signup + r.points_awarded_first_order)
  FROM public.referrals r
  JOIN public.profiles p ON p.id = r.referred_id
  WHERE r.referrer_id = p_user_id
    AND (
      auth.uid() IS NULL
      OR p_user_id = auth.uid()
      OR public.is_admin()
    )
  ORDER BY r.signup_at DESC
  LIMIT p_limit;
$function$;

-- ─── DB-04: get_multi_account_ips — REVOKE from authenticated ───
REVOKE EXECUTE ON FUNCTION public.get_multi_account_ips(integer) FROM authenticated;

-- ─── DB-05: get_user_points — self-only ───
CREATE OR REPLACE FUNCTION public.get_user_points(p_user uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL
         OR p_user = auth.uid()
         OR public.is_admin() THEN
      COALESCE(
        (SELECT balance_after FROM public.points_log
         WHERE user_id = p_user
         ORDER BY created_at DESC LIMIT 1),
        0
      )
    ELSE 0
  END;
$function$;

-- ─── DB-05: get_business_features — ownership filter (SQL, no RAISE) ───
CREATE OR REPLACE FUNCTION public.get_business_features(p_business_id uuid)
RETURNS TABLE(feature_key text, enabled boolean, expires_at timestamptz, notes text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT f.feature_key, f.enabled, f.expires_at, f.notes
  FROM public.business_features f
  WHERE f.business_id = p_business_id
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = p_business_id
        AND (
          auth.uid() IS NULL
          OR b.owner_profile_id = auth.uid()
          OR public.is_admin()
        )
    );
$function$;

-- ─── DB-05: get_business_funnel — ownership guard (plpgsql) ───
CREATE OR REPLACE FUNCTION public.get_business_funnel(p_business_id uuid, p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_since timestamptz := now() - (p_days || ' days')::interval;
  v_views int;
  v_reveals int;
  v_order_start int;
  v_order_confirm int;
  v_peak_hours jsonb;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = p_business_id
      AND (b.owner_profile_id = auth.uid() OR public.is_admin())
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT COUNT(*) INTO v_views FROM public.page_view_events
    WHERE business_id = p_business_id AND occurred_at >= v_since AND event_scope = 'business_view';

  SELECT COUNT(*) INTO v_reveals FROM public.page_view_events
    WHERE business_id = p_business_id AND occurred_at >= v_since AND event_scope = 'business_reveal';

  SELECT COUNT(*) INTO v_order_start FROM public.page_view_events
    WHERE business_id = p_business_id AND occurred_at >= v_since AND event_scope = 'order_start';

  SELECT COUNT(*) INTO v_order_confirm FROM public.page_view_events
    WHERE business_id = p_business_id AND occurred_at >= v_since AND event_scope = 'order_confirm';

  SELECT COALESCE(jsonb_agg(row_to_json(h)), '[]'::jsonb) INTO v_peak_hours
  FROM (
    SELECT
      EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'Africa/Cairo')::int AS hour,
      COUNT(*)::int AS count
    FROM public.page_view_events
    WHERE business_id = p_business_id
      AND occurred_at >= v_since
      AND event_scope = 'business_view'
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 5
  ) h;

  RETURN jsonb_build_object(
    'views', v_views,
    'reveals', v_reveals,
    'order_start', v_order_start,
    'order_confirm', v_order_confirm,
    'conversion_rate', CASE WHEN v_views > 0
      THEN ROUND((v_order_confirm::numeric / v_views) * 100, 2) ELSE 0 END,
    'peak_hours', v_peak_hours
  );
END;
$function$;

-- ─── DB-05: get_trial_status — ownership guard (plpgsql) ───
CREATE OR REPLACE FUNCTION public.get_trial_status(p_business_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sub record;
  v_seconds_left bigint;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = p_business_id
      AND (b.owner_profile_id = auth.uid() OR public.is_admin())
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT id, status, is_trial, starts_at, expires_at
    INTO v_sub
  FROM public.business_subscriptions
  WHERE business_id = p_business_id
    AND status IN ('trial', 'active')
  ORDER BY expires_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('has_subscription', false);
  END IF;

  v_seconds_left := greatest(0, extract(epoch FROM (v_sub.expires_at - now()))::bigint);

  RETURN jsonb_build_object(
    'has_subscription', true,
    'subscription_id', v_sub.id,
    'status', v_sub.status,
    'is_trial', v_sub.is_trial,
    'starts_at', v_sub.starts_at,
    'expires_at', v_sub.expires_at,
    'seconds_left', v_seconds_left,
    'days_left',   v_seconds_left / 86400,
    'hours_left', (v_seconds_left % 86400) / 3600,
    'minutes_left', (v_seconds_left % 3600) / 60,
    'seconds_rem', v_seconds_left % 60,
    'is_expiring_soon', v_seconds_left < (7 * 86400)
  );
END;
$function$;
