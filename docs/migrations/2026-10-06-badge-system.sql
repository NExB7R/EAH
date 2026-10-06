-- ═══════════════════════════════════════════════════════════
-- EAH — Badge Catalog + Auto-Award (2026-10-06)
-- نظام شارات كامل: تعريفات + منح تلقائي
-- ═══════════════════════════════════════════════════════════

-- 1) جدول تعريفات الشارات
CREATE TABLE IF NOT EXISTS public.badge_catalog (
  key text PRIMARY KEY,
  label text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('achievement', 'quality', 'consistency', 'social', 'special')),
  display_order integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- 2) Seed الشارات
INSERT INTO public.badge_catalog (key, label, description, icon, category, display_order) VALUES
  ('streak_7', 'أسبوع كامل', 'دخلت 7 أيام متتالية', '🔥', 'consistency', 10),
  ('streak_30', 'شهر مستمر', 'دخلت 30 يوم متتالي', '🔥', 'consistency', 20),
  ('streak_100', 'مئوية', 'دخلت 100 يوم متتالي', '💎', 'consistency', 30),
  ('first_review', 'أول تقييم', 'كتبت أول تقييم', '✍️', 'achievement', 40),
  ('reviewer_10', '10 تقييمات', 'ساعدت 10 أنشطة', '📝', 'achievement', 50),
  ('reviewer_50', '50 تقييم', 'عمود من أعمدة EAH', '🏆', 'achievement', 60),
  ('reviewer_100', '100 تقييم', 'أسطورة التقييمات', '👑', 'achievement', 70),
  ('photographer', 'مصوّر', 'أضفت صور لتقييماتك', '📸', 'quality', 80),
  ('helpful_10', 'مفيد', '10 تقييماتك كانت مفيدة', '💚', 'quality', 90),
  ('helpful_50', 'مفيد جداً', '50 تقييم مفيد', '💚', 'quality', 100),
  ('first_follow', 'متابع', 'أول متابعة لنشاط', '👁', 'social', 110),
  ('follower_10', 'متابع نشيط', 'تابعت 10 أنشطة', '👁', 'social', 120),
  ('first_order', 'أول طلب', 'أول طلب على المنصة', '🛒', 'achievement', 130),
  ('orders_10', 'عميل وفي', '10 طلبات مكتملة', '🛒', 'achievement', 140),
  ('top_reviewer', 'أفضل مراجع', 'من أفضل 10 مراجعين شهرياً', '🌟', 'special', 200),
  ('verified_identity', 'موثّق', 'تم التحقق من حسابك', '✓', 'special', 210),
  ('community_pillar', 'ركن المجتمع', 'ساعدت 100+ مستخدم', '🏛', 'special', 220),
  ('early_adopter', 'من الأوائل', 'انضممت في أول 1000 مستخدم', '🌅', 'special', 230)
ON CONFLICT (key) DO NOTHING;

-- 3) فهارس
CREATE INDEX IF NOT EXISTS idx_trust_badges_entity ON public.trust_badges (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_trust_badges_key ON public.trust_badges (badge_key);

-- 4) دالة: user badge summary (للعرض)
CREATE OR REPLACE FUNCTION public.get_user_badges(p_user_id uuid)
RETURNS TABLE(
  badge_key text,
  label text,
  description text,
  icon text,
  category text,
  earned_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    tb.badge_key,
    bc.label,
    bc.description,
    bc.icon,
    bc.category,
    tb.earned_at
  FROM public.trust_badges tb
  JOIN public.badge_catalog bc ON bc.key = tb.badge_key
  WHERE tb.entity_type = 'user'
    AND tb.entity_id = p_user_id
  ORDER BY bc.display_order ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_badges(uuid) TO authenticated, anon;

-- 5) دالة: auto-award بناءً على streak
CREATE OR REPLACE FUNCTION public.check_streak_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak integer;
BEGIN
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
$$;

GRANT EXECUTE ON FUNCTION public.check_streak_badges(uuid) TO authenticated;

-- 6) دالة: auto-award من عدد التقييمات
CREATE OR REPLACE FUNCTION public.check_reviewer_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
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
$$;

GRANT EXECUTE ON FUNCTION public.check_reviewer_badges(uuid) TO authenticated;

-- 7) دالة: auto-award من المتابعات
CREATE OR REPLACE FUNCTION public.check_social_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_follows integer;
BEGIN
  SELECT COUNT(*) INTO v_follows
  FROM public.business_follows WHERE user_id = p_user_id;

  IF v_follows >= 1 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'first_follow');
  END IF;
  IF v_follows >= 10 THEN
    PERFORM public.award_trust_badge('user', p_user_id, 'follower_10');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_social_badges(uuid) TO authenticated;
