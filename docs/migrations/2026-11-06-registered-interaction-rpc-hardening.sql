-- EAH — Harden legacy authenticated RPCs before public launch.
-- Several legacy write RPCs have no application call sites and either bypass
-- business ownership checks or can mutate rewards without verifying the event.
-- Keep them server-only until a validated Server Action/Route Handler is built.
-- User-facing self-service RPCs retained below reject Supabase anonymous users.

BEGIN;

-- Legacy mutation RPCs: no application call sites found; service-side only.
REVOKE ALL PRIVILEGES ON FUNCTION public.submit_pending_change(text, text, uuid, jsonb)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_pending_change(text, text, uuid, jsonb) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.redeem_coupon(uuid, uuid)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(uuid, uuid) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.log_unique_visit(uuid, text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_unique_visit(uuid, text) TO service_role;

-- Older duplicate daily-visit function: no application call site. Only the
-- current daily-login routine remains available to a registered account.
REVOKE ALL PRIVILEGES ON FUNCTION public.record_daily_visit()
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_daily_visit() TO service_role;

-- Admin points adjustment is currently not used by the app and mixes the
-- legacy trust_score with points_log balance. Keep server-only until unified.
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_adjust_points(uuid, integer, text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_points(uuid, integer, text) TO service_role;

-- Daily login bonus is self-service but must require a registered account.
CREATE OR REPLACE FUNCTION public.award_daily_login()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_last date;
  v_streak int;
  v_longest int;
  v_points int;
  v_balance int;
  v_role text;
BEGIN
  IF v_user IS NULL OR COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'registered_account_required');
  END IF;

  SELECT role INTO v_role FROM public.user_roles WHERE user_id = v_user;
  IF v_role = 'super_admin' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'admin_excluded');
  END IF;

  SELECT last_seen_date, streak_count, longest_streak
  INTO v_last, v_streak, v_longest
  FROM public.profiles
  WHERE id = v_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'profile_not_found');
  END IF;

  IF v_last = v_today THEN
    RETURN jsonb_build_object('ok', true, 'already', true, 'streak', COALESCE(v_streak, 0), 'points', 0);
  END IF;

  IF v_last = v_today - INTERVAL '1 day' THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  v_longest := GREATEST(COALESCE(v_longest, 0), v_streak);

  IF v_streak = 30 THEN v_points := 20;
  ELSIF v_streak = 7 THEN v_points := 10;
  ELSIF v_streak = 3 THEN v_points := 7;
  ELSE v_points := 5;
  END IF;

  UPDATE public.profiles
  SET last_seen_date = v_today,
      streak_count = v_streak,
      longest_streak = v_longest,
      trust_score = COALESCE(trust_score, 0) + v_points
  WHERE id = v_user
  RETURNING trust_score INTO v_balance;

  INSERT INTO public.points_log (user_id, delta, reason, balance_after)
  VALUES (v_user, v_points, 'دخول يومي (streak ' || v_streak || ')', v_balance);

  RETURN jsonb_build_object('ok', true, 'points', v_points, 'streak', v_streak, 'balance', v_balance);
END;
$function$;

-- Referral claim is self-service but anonymous identities cannot earn/transfer
-- participation points or create referral relationships.
CREATE OR REPLACE FUNCTION public.claim_referral(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_referrer_id uuid;
  v_existing uuid;
  v_bonus int := 50;
BEGIN
  IF v_user_id IS NULL OR COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'registered_account_required');
  END IF;

  SELECT id INTO v_existing
  FROM public.referrals
  WHERE referred_id = v_user_id;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_claimed');
  END IF;

  SELECT id INTO v_referrer_id
  FROM public.profiles
  WHERE upper(referral_code) = upper(p_code)
    AND id <> v_user_id;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_code');
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, code, bonus_points)
  VALUES (v_referrer_id, v_user_id, upper(p_code), v_bonus);

  UPDATE public.profiles
  SET trust_score = COALESCE(trust_score, 0) + v_bonus
  WHERE id = v_referrer_id;

  UPDATE public.profiles
  SET trust_score = COALESCE(trust_score, 0) + v_bonus,
      referred_by = v_referrer_id
  WHERE id = v_user_id;

  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES
    (v_referrer_id, 'points', '🎉 صاحبك اشترك', 'كسبت ' || v_bonus || ' نقطة من إحالة', '/account/referral'),
    (v_user_id, 'welcome', '🎁 أهلاً بيك', 'كسبت ' || v_bonus || ' نقطة ترحيبية', '/account');

  RETURN jsonb_build_object('ok', true, 'bonus', v_bonus, 'referrer_id', v_referrer_id);
END;
$function$;

-- Starting a chat requires a registered customer and a publicly visible
-- business page; anonymous auth identities cannot create messages.
CREATE OR REPLACE FUNCTION public.start_chat(p_business_id uuid, p_body text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_chat_id uuid;
  v_body text := trim(COALESCE(p_body, ''));
BEGIN
  IF v_user IS NULL OR COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'registered_account_required');
  END IF;

  IF length(v_body) < 1 OR length(v_body) > 2000 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_body');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.businesses
    WHERE id = p_business_id
      AND is_published IS TRUE
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'business_not_found');
  END IF;

  SELECT id INTO v_chat_id
  FROM public.chats
  WHERE business_id = p_business_id
    AND customer_id = v_user;

  IF v_chat_id IS NULL THEN
    INSERT INTO public.chats (business_id, customer_id)
    VALUES (p_business_id, v_user)
    RETURNING id INTO v_chat_id;
  END IF;

  INSERT INTO public.messages (chat_id, sender_id, body)
  VALUES (v_chat_id, v_user, v_body);

  RETURN jsonb_build_object('ok', true, 'chat_id', v_chat_id);
END;
$function$;

COMMIT;
