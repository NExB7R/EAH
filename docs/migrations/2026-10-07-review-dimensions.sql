-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: Review Dimensions (JSONB) + Subcategory
-- التاريخ: 2026-10-07
-- الهدف: تقييمات ديناميكية حسب نوع النشاط + subcategory
-- ═══════════════════════════════════════════════════════════

-- ─── 1. businesses: + subcategory ───
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS subcategory text;

CREATE INDEX IF NOT EXISTS idx_businesses_subcategory
  ON public.businesses(subcategory)
  WHERE subcategory IS NOT NULL;

-- ─── 2. business_reviews: + dimensions + quality + verified ───
ALTER TABLE public.business_reviews
  ADD COLUMN IF NOT EXISTS dimensions jsonb,
  ADD COLUMN IF NOT EXISTS review_quality_score int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified_transaction boolean NOT NULL DEFAULT false;

-- ─── 3. نقل البيانات القديمة → JSONB ───
UPDATE public.business_reviews
SET dimensions = jsonb_strip_nulls(jsonb_build_object(
  'taste', taste,
  'cleanliness', NULL,
  'service', NULL,
  'price', value_for_money,
  'speed', speed,
  'experience', experience
))
WHERE dimensions IS NULL
  AND (taste IS NOT NULL OR value_for_money IS NOT NULL OR speed IS NOT NULL OR experience IS NOT NULL);

-- ─── 4. حساب review_quality_score للصفوف القديمة ───
UPDATE public.business_reviews
SET review_quality_score = LEAST(100,
  CASE WHEN length(coalesce(comment, '')) >= 50 THEN 40 ELSE 20 END +
  CASE WHEN length(coalesce(comment, '')) >= 150 THEN 30 ELSE 0 END +
  CASE WHEN is_verified_transaction THEN 30 ELSE 0 END
)
WHERE review_quality_score = 0;

-- ─── 5. تحديث refresh_business_counts — يحسب من JSONB ───
CREATE OR REPLACE FUNCTION refresh_business_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  biz_id uuid;
BEGIN
  biz_id := COALESCE(NEW.business_id, OLD.business_id);
  IF biz_id IS NULL THEN RETURN NULL; END IF;

  UPDATE businesses SET
    branches_count = COALESCE((SELECT COUNT(*) FROM business_branches WHERE business_id = biz_id), 0),
    offers_count = COALESCE((SELECT COUNT(*) FROM offers WHERE business_id = biz_id AND is_published = true), 0),
    rating_avg = COALESCE((
      SELECT ROUND(AVG(
        (SELECT AVG(v::numeric) FROM jsonb_each_text(dimensions) AS t(k, v) WHERE v ~ '^[0-9]+$')
      )::numeric, 2)
      FROM business_reviews
      WHERE business_id = biz_id
        AND status = 'approved'
        AND dimensions IS NOT NULL
    ), 0),
    rating_count = COALESCE((
      SELECT COUNT(*) FROM business_reviews
      WHERE business_id = biz_id AND status = 'approved'
    ), 0)
  WHERE id = biz_id;

  RETURN NULL;
END;
$$;

-- إعادة تشغيل الـ trigger عشان يحسب القيم للصفوف القديمة
UPDATE public.business_reviews SET updated_at = updated_at WHERE status = 'approved';

-- ─── 6. حذف الأعمدة القديمة ───
ALTER TABLE public.business_reviews
  DROP COLUMN IF EXISTS taste,
  DROP COLUMN IF EXISTS value_for_money,
  DROP COLUMN IF EXISTS speed,
  DROP COLUMN IF EXISTS experience;

-- ─── 7. Indexes ───
CREATE INDEX IF NOT EXISTS idx_reviews_dimensions_gin
  ON public.business_reviews USING gin(dimensions)
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_reviews_quality
  ON public.business_reviews(review_quality_score DESC)
  WHERE status = 'approved';
