-- ============================================================
-- EAH — Migration 2: Security Hardening (Anti-Fraud)
-- Date: 2026-09-30
-- Purpose: منع التلاعب على مستوى DB (لا يمكن تجاوزه)
-- ============================================================

-- ============================================================
-- 1. منع تقييم النفس (Self-Review Block)
-- ============================================================
-- لو user_id = owner_profile_id → ارفض التقييم
-- Trigger على مستوى DB — مستحيل يتخطى

CREATE OR REPLACE FUNCTION public.prevent_self_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT owner_profile_id INTO v_owner_id
  FROM public.businesses
  WHERE id = NEW.business_id;

  IF v_owner_id IS NOT NULL AND v_owner_id = NEW.user_id THEN
    RAISE EXCEPTION 'مالك النشاط مش يقدر يقيّم نفسه'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_self_review ON public.business_reviews;
CREATE TRIGGER trigger_prevent_self_review
  BEFORE INSERT OR UPDATE ON public.business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_review();

-- ============================================================
-- 2. منع الطلب الوهمي (Self-Order Block)
-- ============================================================
-- لو customer_profile_id = owner_profile_id → ارفض الطلب

CREATE OR REPLACE FUNCTION public.prevent_self_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT owner_profile_id INTO v_owner_id
  FROM public.businesses
  WHERE id = NEW.business_id;

  IF v_owner_id IS NOT NULL AND v_owner_id = NEW.customer_profile_id THEN
    RAISE EXCEPTION 'مالك النشاط مش يقدر يطلب من نفسه'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_self_order ON public.order_requests;
CREATE TRIGGER trigger_prevent_self_order
  BEFORE INSERT OR UPDATE ON public.order_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_order();

-- ============================================================
-- 3. كشف التلاعب بالتعليقات (Velocity Detection)
-- ============================================================
-- لو أكتر من 10 تعليقات سلبية على نفس النشاط في ساعة → احجز للمراجعة

CREATE OR REPLACE FUNCTION public.detect_review_velocity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_count integer;
BEGIN
  -- افحص فقط الـ INSERT
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- احسب عدد التقييمات في آخر ساعة من نفس النشاط
  SELECT COUNT(*) INTO v_recent_count
  FROM public.business_reviews
  WHERE business_id = NEW.business_id
    AND created_at > (now() - interval '1 hour');

  -- لو أكتر من 10 → احجز للمراجعة
  IF v_recent_count >= 10 THEN
    NEW.status := 'pending';
    NEW.flagged_reason := 'velocity: 10+ reviews in 1 hour';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_detect_review_velocity ON public.business_reviews;
CREATE TRIGGER trigger_detect_review_velocity
  BEFORE INSERT ON public.business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_review_velocity();

-- ============================================================
-- 4. Audit Log لكل عملية حساسة
-- ============================================================
-- تلقائياً يسجل التعديلات على business_reviews

CREATE OR REPLACE FUNCTION public.log_review_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.user_id,
      'review.created',
      'business_review',
      NEW.id,
      jsonb_build_object(
        'business_id', NEW.business_id,
        'status', NEW.status,
        'source', NEW.source
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
    VALUES (
      COALESCE(NEW.merchant_reply_by, NEW.user_id),
      'review.status_changed',
      'business_review',
      NEW.id,
      jsonb_build_object(
        'business_id', NEW.business_id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_review_changes ON public.business_reviews;
CREATE TRIGGER trigger_log_review_changes
  AFTER INSERT OR UPDATE ON public.business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.log_review_changes();

-- ============================================================
-- 5. منع تكرار Follow/Favorite (DB Level)
-- ============================================================
-- موجود في unique indexes — بس نتأكد

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'uniq_follow'
  ) THEN
    CREATE UNIQUE INDEX uniq_follow
      ON public.business_activities(business_id, user_id)
      WHERE activity_type = 'follow';
  END IF;
END $$;

-- ============================================================
-- 6. ملاحظة: Premium abuse
-- ============================================================
-- Premium مرتبط بـ profile_id (1-1 مع auth.users).
-- الحماية من التلاعب = Turnstile + Phone Verification (App Level)
-- مفيش حماية DB ممكنة لأن phone مش في profiles.

-- ============================================================
-- Done
-- ============================================================
