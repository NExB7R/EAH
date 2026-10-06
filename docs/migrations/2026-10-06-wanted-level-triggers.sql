-- ═══════════════════════════════════════════════════════════
-- EAH — Wanted Level Trigger (2026-10-06)
-- يحدّث wanted_level تلقائي من البلاغات
-- ═══════════════════════════════════════════════════════════

-- 1) دالة: تكتشف صاحب البلاغ وتزود wanted_level
CREATE OR REPLACE FUNCTION public.apply_wanted_level_on_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_user_id uuid;
  v_pending_count integer;
  v_new_level integer;
BEGIN
  -- على INSERT فقط (بلاغ جديد)
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- نحدد صاحب الـ entity
  IF NEW.entity_type = 'user' THEN
    v_target_user_id := NEW.entity_id;
  ELSIF NEW.entity_type = 'review' THEN
    SELECT user_id INTO v_target_user_id
    FROM public.business_reviews
    WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'business' THEN
    SELECT owner_profile_id INTO v_target_user_id
    FROM public.businesses
    WHERE id = NEW.entity_id;
  END IF;

  IF v_target_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- عدد البلاغات المعلقة على نفس المستخدم
  SELECT COUNT(*) INTO v_pending_count
  FROM public.reports r
  WHERE r.status = 'pending'
    AND (
      (r.entity_type = 'user' AND r.entity_id = v_target_user_id)
      OR (r.entity_type = 'review' AND r.entity_id IN (
            SELECT id FROM public.business_reviews WHERE user_id = v_target_user_id
          ))
      OR (r.entity_type = 'business' AND r.entity_id IN (
            SELECT id FROM public.businesses WHERE owner_profile_id = v_target_user_id
          ))
    );

  -- حساب المستوى (نفس thresholds في trust.ts)
  v_new_level := CASE
    WHEN v_pending_count >= 12 THEN 5
    WHEN v_pending_count >= 8  THEN 4
    WHEN v_pending_count >= 5  THEN 3
    WHEN v_pending_count >= 3  THEN 2
    WHEN v_pending_count >= 1  THEN 1
    ELSE 0
  END;

  -- تحديث
  UPDATE public.profiles
  SET wanted_level = v_new_level,
      updated_at = now()
  WHERE id = v_target_user_id
    AND wanted_level != v_new_level;

  RETURN NEW;
END;
$$;

-- 2) trigger
DROP TRIGGER IF EXISTS trigger_apply_wanted_level ON public.reports;
CREATE TRIGGER trigger_apply_wanted_level
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_wanted_level_on_report();

-- 3) عند ما البلاغ يتحل → نعيد حساب
CREATE OR REPLACE FUNCTION public.recalc_wanted_level_on_resolve()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_user_id uuid;
  v_pending_count integer;
  v_new_level integer;
BEGIN
  IF TG_OP != 'UPDATE' OR OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- نجيب نفس المنطق
  IF NEW.entity_type = 'user' THEN
    v_target_user_id := NEW.entity_id;
  ELSIF NEW.entity_type = 'review' THEN
    SELECT user_id INTO v_target_user_id
    FROM public.business_reviews WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'business' THEN
    SELECT owner_profile_id INTO v_target_user_id
    FROM public.businesses WHERE id = NEW.entity_id;
  END IF;

  IF v_target_user_id IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO v_pending_count
  FROM public.reports r
  WHERE r.status = 'pending'
    AND (
      (r.entity_type = 'user' AND r.entity_id = v_target_user_id)
      OR (r.entity_type = 'review' AND r.entity_id IN (
            SELECT id FROM public.business_reviews WHERE user_id = v_target_user_id
          ))
      OR (r.entity_type = 'business' AND r.entity_id IN (
            SELECT id FROM public.businesses WHERE owner_profile_id = v_target_user_id
          ))
    );

  v_new_level := CASE
    WHEN v_pending_count >= 12 THEN 5
    WHEN v_pending_count >= 8  THEN 4
    WHEN v_pending_count >= 5  THEN 3
    WHEN v_pending_count >= 3  THEN 2
    WHEN v_pending_count >= 1  THEN 1
    ELSE 0
  END;

  UPDATE public.profiles
  SET wanted_level = v_new_level,
      updated_at = now()
  WHERE id = v_target_user_id
    AND wanted_level != v_new_level;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_recalc_wanted_level ON public.reports;
CREATE TRIGGER trigger_recalc_wanted_level
  AFTER UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.recalc_wanted_level_on_resolve();
