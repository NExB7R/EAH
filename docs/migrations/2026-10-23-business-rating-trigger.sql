-- ═══════════════════════════════════════════════════════════════════
-- EAH — Trigger: update business rating aggregate on feedback
-- Date: 2026-10-23
-- Purpose: keep businesses.rating_avg + rating_count in sync when a
--          customer submits order feedback. Runs SECURITY DEFINER
--          so it can update businesses regardless of RLS.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_business_rating_from_feedback()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  biz_id uuid;
  cnt    integer;
  avg_r  numeric;
BEGIN
  IF NEW.feedback_rating IS NOT NULL AND OLD.feedback_rating IS NULL THEN
    biz_id := NEW.business_id;

    SELECT COUNT(*), AVG(feedback_rating)
    INTO cnt, avg_r
    FROM order_requests
    WHERE business_id = biz_id
      AND status = 'delivered'
      AND feedback_rating IS NOT NULL;

    IF cnt > 0 THEN
      UPDATE businesses
      SET rating_avg    = ROUND(avg_r::numeric, 2),
          rating_count  = cnt,
          updated_at    = now()
      WHERE id = biz_id;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_update_business_rating ON order_requests;
CREATE TRIGGER trg_update_business_rating
AFTER UPDATE ON order_requests
FOR EACH ROW
EXECUTE FUNCTION update_business_rating_from_feedback();

-- Verification:
-- SELECT tgname FROM pg_trigger WHERE tgname = 'trg_update_business_rating';
-- Expected: 1 row
