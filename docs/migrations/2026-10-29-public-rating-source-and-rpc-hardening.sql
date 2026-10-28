-- EAH: only approved business_reviews drive public stars.
-- Order feedback remains private operational data and must not overwrite the public rating aggregate.
DROP TRIGGER IF EXISTS trg_update_business_rating ON public.order_requests;

REVOKE ALL PRIVILEGES ON FUNCTION public.award_review_points(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.on_trust_updated() FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.update_business_rating_from_feedback() FROM PUBLIC, anon, authenticated;

UPDATE public.businesses AS b
SET
  rating_avg = COALESCE((
    SELECT ROUND(AVG(
      (SELECT AVG(v::numeric)
       FROM jsonb_each_text(r.dimensions) AS t(k, v)
       WHERE v ~ '^[0-9]+$')
    )::numeric, 2)
    FROM public.business_reviews AS r
    WHERE r.business_id = b.id
      AND r.status = 'approved'
      AND r.dimensions IS NOT NULL
  ), 0),
  rating_count = COALESCE((
    SELECT COUNT(*)
    FROM public.business_reviews AS r
    WHERE r.business_id = b.id
      AND r.status = 'approved'
  ), 0);

COMMENT ON COLUMN public.businesses.rating_avg IS
  'Public rating average sourced from approved business_reviews only; private order feedback is excluded.';
COMMENT ON COLUMN public.businesses.rating_count IS
  'Count of approved public business_reviews only; private order feedback is excluded.';
