-- ═══════════════════════════════════════════════════════════════
-- Daily Login Points + Review Points
-- تاريخ: 2026-09-18
-- ═══════════════════════════════════════════════════════════════

-- عمود آخر دخول
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_date date;

CREATE INDEX IF NOT EXISTS profiles_last_seen_idx ON public.profiles (last_seen_date);

-- ═══ RPC: award_daily_login ═══
CREATE OR REPLACE FUNCTION public.award_daily_login()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
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
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
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
$$;

GRANT EXECUTE ON FUNCTION public.award_daily_login TO authenticated;

-- ═══ RPC: award_review_points (أول تقييم لنشاط = +10) ═══
CREATE OR REPLACE FUNCTION public.award_review_points(p_review_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_business_id uuid;
  v_role text;
  v_count int;
  v_balance int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  SELECT role INTO v_role FROM public.user_roles WHERE user_id = v_user;
  IF v_role = 'super_admin' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'admin_excluded');
  END IF;

  SELECT business_id INTO v_business_id
  FROM public.business_reviews
  WHERE id = p_review_id AND user_id = v_user;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_owner');
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.business_reviews
  WHERE user_id = v_user AND business_id = v_business_id AND status != 'rejected';

  IF v_count > 1 THEN
    RETURN jsonb_build_object('ok', true, 'points', 0, 'reason', 'repeat');
  END IF;

  UPDATE public.profiles
  SET trust_score = COALESCE(trust_score, 0) + 10
  WHERE id = v_user
  RETURNING trust_score INTO v_balance;

  INSERT INTO public.points_log (user_id, delta, reason, balance_after)
  VALUES (v_user, 10, 'أول تقييم لنشاط', v_balance);

  RETURN jsonb_build_object('ok', true, 'points', 10, 'balance', v_balance);
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_review_points TO authenticated;

COMMENT ON FUNCTION public.award_daily_login IS 'نقاط الدخول اليومي + streak (5/7/10/20)';
COMMENT ON FUNCTION public.award_review_points IS 'منح 10 نقاط لأول تقييم لكل نشاط';
