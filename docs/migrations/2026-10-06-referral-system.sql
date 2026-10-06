-- EAH — Referral System (2026-10-06)
-- كود دعوة + مكافآت + tracking كامل

-- 1) جدول referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  signup_at timestamptz NOT NULL DEFAULT now(),
  first_order_at timestamptz,
  points_awarded_signup integer DEFAULT 0,
  points_awarded_first_order integer DEFAULT 0,
  UNIQUE(referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals (referrer_id, signup_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals (code);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own referrals" ON public.referrals;
CREATE POLICY "users see own referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (referrer_id = (SELECT auth.uid()) OR referred_id = (SELECT auth.uid()));

-- 2) دالة: award points + سجل
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id uuid,
  p_delta integer,
  p_reason text,
  p_created_by uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current integer;
BEGIN
  SELECT COALESCE(SUM(delta), 0) INTO v_current
  FROM public.points_log WHERE user_id = p_user_id;

  INSERT INTO public.points_log (user_id, delta, reason, balance_after, created_by)
  VALUES (p_user_id, p_delta, p_reason, v_current + p_delta, p_created_by);
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_points(uuid, integer, text, uuid) TO authenticated;

-- 3) trigger: عند التسجيل بكود
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_referrer_id uuid;
BEGIN
  v_code := nullif(NEW.raw_user_meta_data->>'referral_code', '');
  IF v_code IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_referrer_id
  FROM public.profiles
  WHERE referral_code = v_code
  LIMIT 1;

  IF v_referrer_id IS NULL OR v_referrer_id = NEW.id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, code, points_awarded_signup)
  VALUES (v_referrer_id, NEW.id, v_code, 30)
  ON CONFLICT (referred_id) DO NOTHING;

  UPDATE public.profiles
  SET referred_by = v_referrer_id
  WHERE id = NEW.id;

  PERFORM public.award_points(v_referrer_id, 30, 'referral_signup', NEW.id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_handle_referral_signup ON auth.users;
CREATE TRIGGER trigger_handle_referral_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_signup();

-- 4) trigger: عند أول طلب مكتمل
CREATE OR REPLACE FUNCTION public.handle_referral_first_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_already_awarded integer;
BEGIN
  IF TG_OP != 'UPDATE' OR NEW.status != 'delivered' OR OLD.status = 'delivered' THEN
    RETURN NEW;
  END IF;

  SELECT referrer_id, points_awarded_first_order
  INTO v_referrer_id, v_already_awarded
  FROM public.referrals
  WHERE referred_id = NEW.customer_profile_id
  LIMIT 1;

  IF v_referrer_id IS NULL OR v_already_awarded > 0 THEN
    RETURN NEW;
  END IF;

  UPDATE public.referrals
  SET points_awarded_first_order = 100,
      first_order_at = now()
  WHERE referred_id = NEW.customer_profile_id;

  PERFORM public.award_points(v_referrer_id, 100, 'referral_first_order', NEW.customer_profile_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_handle_referral_first_order ON public.order_requests;
CREATE TRIGGER trigger_handle_referral_first_order
  AFTER UPDATE ON public.order_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_first_order();

-- 5) stats
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id uuid)
RETURNS TABLE(
  total_invited bigint,
  signed_up bigint,
  first_order bigint,
  total_points bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE signup_at IS NOT NULL)::bigint,
    COUNT(*) FILTER (WHERE first_order_at IS NOT NULL)::bigint,
    COALESCE(SUM(points_awarded_signup + points_awarded_first_order), 0)::bigint
  FROM public.referrals
  WHERE referrer_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_referral_stats(uuid) TO authenticated;

-- 6) list
CREATE OR REPLACE FUNCTION public.get_referral_list(p_user_id uuid, p_limit integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  display_name text,
  avatar_url text,
  signup_at timestamptz,
  first_order_at timestamptz,
  points_awarded integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
  ORDER BY r.signup_at DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_referral_list(uuid, integer) TO authenticated;
