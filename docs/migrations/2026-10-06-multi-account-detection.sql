-- ═══════════════════════════════════════════════════════════
-- EAH — Multi-Account Detection (2026-10-06)
-- تتبع IP عند التسجيل + كشف الحسابات المتعددة
-- ═══════════════════════════════════════════════════════════

-- 1) عمود signup_ip_hash في profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS signup_ip_hash text;

CREATE INDEX IF NOT EXISTS idx_profiles_signup_ip_hash
ON public.profiles (signup_ip_hash)
WHERE signup_ip_hash IS NOT NULL;

-- 2) دالة: كم حساب من نفس IP hash خلال X يوم؟
CREATE OR REPLACE FUNCTION public.count_accounts_from_ip(
  p_ip_hash text,
  p_days integer DEFAULT 7
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.profiles
  WHERE signup_ip_hash = p_ip_hash
    AND created_at > (now() - (p_days || ' days')::interval);
$$;

-- 3) trigger: عند تسجيل جديد → لو 3+ حسابات من نفس IP → flag
CREATE OR REPLACE FUNCTION public.detect_multi_account_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF NEW.signup_ip_hash IS NULL THEN
    RETURN NEW;
  END IF;

  -- عدد الحسابات من نفس IP خلال 7 أيام
  SELECT public.count_accounts_from_ip(NEW.signup_ip_hash, 7) INTO v_count;

  -- لو 3+ → flag للـ wanted_level
  IF v_count >= 3 THEN
    UPDATE public.profiles
    SET wanted_level = GREATEST(wanted_level, 2),
        updated_at = now()
    WHERE id = NEW.id;

    -- سجّل الحدث في trust_events
    INSERT INTO public.trust_events (
      entity_type, entity_id, event_type, delta, score_before, score_after, metadata
    ) VALUES (
      'user', NEW.id, 'multi_account_detected', 0, 0, 0,
      jsonb_build_object('ip_hash_prefix', left(NEW.signup_ip_hash, 8), 'count_7d', v_count)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_detect_multi_account ON public.profiles;
CREATE TRIGGER trigger_detect_multi_account
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.signup_ip_hash IS NOT NULL)
  EXECUTE FUNCTION public.detect_multi_account_signup();

-- 4) دالة عامة للأدمن: قائمة IPs فيها 3+ حسابات
CREATE OR REPLACE FUNCTION public.get_multi_account_ips(p_days integer DEFAULT 30)
RETURNS TABLE(ip_hash_prefix text, accounts_count bigint, latest_signup timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    left(signup_ip_hash, 8) AS ip_hash_prefix,
    COUNT(*) AS accounts_count,
    MAX(created_at) AS latest_signup
  FROM public.profiles
  WHERE signup_ip_hash IS NOT NULL
    AND created_at > (now() - (p_days || ' days')::interval)
  GROUP BY left(signup_ip_hash, 8)
  HAVING COUNT(*) >= 3
  ORDER BY COUNT(*) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.count_accounts_from_ip(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_multi_account_ips(integer) TO authenticated;
