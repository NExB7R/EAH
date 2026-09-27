-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: add business counts (denormalized)
-- التاريخ: 2026-09-27
-- الحالة: ✅ تم التنفيذ بنجاح في production
-- الهدف: كارد المميزين محتاج branches + offers + rating
-- ═══════════════════════════════════════════════════════════

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS branches_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS offers_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_avg numeric(3,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count int NOT NULL DEFAULT 0;

UPDATE businesses b SET
  branches_count = COALESCE((SELECT COUNT(*) FROM business_branches WHERE business_id = b.id), 0),
  offers_count = COALESCE((SELECT COUNT(*) FROM offers WHERE business_id = b.id AND is_published = true), 0),
  rating_avg = COALESCE((SELECT ROUND(AVG((taste + value_for_money + speed + experience) / 4.0)::numeric, 2) FROM business_reviews WHERE business_id = b.id AND status = 'approved'), 0),
  rating_count = COALESCE((SELECT COUNT(*) FROM business_reviews WHERE business_id = b.id AND status = 'approved'), 0);

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
    rating_avg = COALESCE((SELECT ROUND(AVG((taste + value_for_money + speed + experience) / 4.0)::numeric, 2) FROM business_reviews WHERE business_id = biz_id AND status = 'approved'), 0),
    rating_count = COALESCE((SELECT COUNT(*) FROM business_reviews WHERE business_id = biz_id AND status = 'approved'), 0)
  WHERE id = biz_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_branches ON business_branches;
CREATE TRIGGER trg_refresh_branches
AFTER INSERT OR UPDATE OR DELETE ON business_branches
FOR EACH ROW EXECUTE FUNCTION refresh_business_counts();

DROP TRIGGER IF EXISTS trg_refresh_offers ON offers;
CREATE TRIGGER trg_refresh_offers
AFTER INSERT OR UPDATE OR DELETE ON offers
FOR EACH ROW EXECUTE FUNCTION refresh_business_counts();

DROP TRIGGER IF EXISTS trg_refresh_reviews ON business_reviews;
CREATE TRIGGER trg_refresh_reviews
AFTER INSERT OR UPDATE OR DELETE ON business_reviews
FOR EACH ROW EXECUTE FUNCTION refresh_business_counts();

CREATE INDEX IF NOT EXISTS idx_businesses_branches_count ON businesses(branches_count);
CREATE INDEX IF NOT EXISTS idx_businesses_offers_count ON businesses(offers_count);
CREATE INDEX IF NOT EXISTS idx_businesses_rating_avg ON businesses(rating_avg);

-- ═══════════════════════════════════════════════════════════
-- نتيجة التنفيذ: biz_with_offers = 9 (باقي الجداول فاضية)
-- ═══════════════════════════════════════════════════════════
