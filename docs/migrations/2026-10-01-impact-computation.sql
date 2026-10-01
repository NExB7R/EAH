-- ============================================================
-- EAH — Migration 3: Impact Score Computation
-- Date: 2026-10-01
-- Purpose: حساب impact_score تلقائياً من business_activities
-- ============================================================

-- ============================================================
-- 1. دالة حساب الأثر لمستخدم
-- ============================================================

CREATE OR REPLACE FUNCTION public.compute_user_impact(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activities integer;
  v_weighted numeric;
  v_distinct_businesses integer;
  v_streak integer;
  v_reach numeric;
  v_influence numeric;
  v_trust numeric;
  v_consistency numeric;
  v_score numeric;
BEGIN
  -- عدد الأنشطة الكلي (reach)
  SELECT COUNT(*) INTO v_activities
  FROM public.business_activities
  WHERE user_id = p_user_id;

  -- مجموع الأوزان (influence)
  SELECT COALESCE(SUM(
    CASE activity_type
      WHEN 'share' THEN 25
      WHEN 'reply' THEN 15
      WHEN 'comment' THEN 10
      WHEN 'follow' THEN 8
      WHEN 'favorite' THEN 6
      WHEN 'like' THEN 1
      ELSE 1
    END
  ), 0) INTO v_weighted
  FROM public.business_activities
  WHERE user_id = p_user_id;

  -- عدد الأنشطة المختلفة (trust)
  SELECT COUNT(DISTINCT business_id) INTO v_distinct_businesses
  FROM public.business_activities
  WHERE user_id = p_user_id;

  -- الـ streak
  SELECT COALESCE(streak_days, 0) INTO v_streak
  FROM public.profiles
  WHERE id = p_user_id;

  -- Normalize (log scale)
  v_reach := CASE WHEN v_activities <= 0 THEN 0
    ELSE LEAST(100, (LN(v_activities + 1) / LN(10001)) * 100) END;

  v_influence := CASE WHEN v_weighted <= 0 THEN 0
    ELSE LEAST(100, (LN(v_weighted + 1) / LN(501)) * 100) END;

  v_trust := CASE WHEN v_distinct_businesses <= 0 THEN 0
    ELSE LEAST(100, (LN(v_distinct_businesses + 1) / LN(101)) * 100) END;

  v_consistency := CASE WHEN v_streak <= 0 THEN 0
    ELSE LEAST(100, (LN(v_streak + 1) / LN(101)) * 100) END;

  -- Weighted sum × 10
  v_score := (
    v_reach * 0.25 +
    v_influence * 0.35 +
    v_trust * 0.25 +
    v_consistency * 0.15
  ) * 10;

  RETURN GREATEST(0, LEAST(1000, ROUND(v_score)::integer));
END;
$$;

GRANT EXECUTE ON FUNCTION public.compute_user_impact(uuid) TO authenticated;

-- ============================================================
-- 2. دالة تحديد المستوى من الـ score
-- ============================================================

CREATE OR REPLACE FUNCTION public.level_from_impact(p_score integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score >= 800 THEN 'regular'
    WHEN p_score >= 400 THEN 'member'
    WHEN p_score >= 100 THEN 'basic'
    ELSE 'visitor'
  END;
$$;

-- ============================================================
-- 3. Trigger: تحديث الأثر بعد أي activity
-- ============================================================

CREATE OR REPLACE FUNCTION public.refresh_user_impact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_score integer;
  v_level text;
BEGIN
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);

  v_score := public.compute_user_impact(v_user_id);
  v_level := public.level_from_impact(v_score);

  UPDATE public.profiles
  SET
    impact_score = v_score,
    impact_level = v_level,
    last_activity_at = now()
  WHERE id = v_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_refresh_user_impact ON public.business_activities;
CREATE TRIGGER trigger_refresh_user_impact
  AFTER INSERT OR DELETE ON public.business_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_user_impact();
