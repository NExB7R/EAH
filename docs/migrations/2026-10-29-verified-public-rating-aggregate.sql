-- EAH: public rating aggregate requires approved, transaction-verified reviews.
-- Keep this source migration in sync with the applied verified_public_rating_aggregate migration.

CREATE OR REPLACE FUNCTION public.refresh_business_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  biz_id uuid;
BEGIN
  biz_id := COALESCE(NEW.business_id, OLD.business_id);
  IF biz_id IS NULL THEN RETURN NULL; END IF;

  UPDATE public.businesses
  SET
    branches_count = COALESCE((SELECT COUNT(*) FROM public.business_branches WHERE business_id = biz_id), 0),
    offers_count = COALESCE((SELECT COUNT(*) FROM public.offers WHERE business_id = biz_id AND is_published = true), 0),
    rating_avg = COALESCE((
      SELECT ROUND(AVG(
        (SELECT AVG(v::numeric)
         FROM jsonb_each_text(r.dimensions) AS t(k, v)
         WHERE v ~ '^[0-9]+$')
      )::numeric, 2)
      FROM public.business_reviews AS r
      WHERE r.business_id = biz_id
        AND r.status = 'approved'
        AND r.is_verified_transaction = true
        AND r.dimensions IS NOT NULL
    ), 0),
    rating_count = COALESCE((
      SELECT COUNT(*)
      FROM public.business_reviews AS r
      WHERE r.business_id = biz_id
        AND r.status = 'approved'
        AND r.is_verified_transaction = true
    ), 0)
  WHERE id = biz_id;

  RETURN NULL;
END;
$function$;

COMMENT ON FUNCTION public.refresh_business_counts() IS
  'Recomputes branch/offer counts and public rating aggregates. Public ratings require approved transaction-verified reviews.';

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
      AND r.is_verified_transaction = true
      AND r.dimensions IS NOT NULL
  ), 0),
  rating_count = COALESCE((
    SELECT COUNT(*)
    FROM public.business_reviews AS r
    WHERE r.business_id = b.id
      AND r.status = 'approved'
      AND r.is_verified_transaction = true
  ), 0);
