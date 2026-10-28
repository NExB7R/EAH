-- EAH: database-level validation for public review payloads.
-- Public rating aggregation requires reviews tied to delivered orders, approved by admin,
-- with dimensions from the catalog and integer scores in [1,5].

CREATE OR REPLACE FUNCTION public.enforce_transaction_verified_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_comment_length integer;
  v_dimension_count integer;
BEGIN
  IF NEW.dimensions IS NULL OR jsonb_typeof(NEW.dimensions) <> 'object' THEN
    RAISE EXCEPTION 'review_dimensions_required' USING ERRCODE = '23514';
  END IF;

  SELECT COUNT(*) INTO v_dimension_count
  FROM jsonb_object_keys(NEW.dimensions);

  IF v_dimension_count < 1 OR v_dimension_count > 13 THEN
    RAISE EXCEPTION 'review_dimensions_count_invalid' USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_each(NEW.dimensions) AS item(key, value)
    WHERE item.key NOT IN (
      'taste', 'cleanliness', 'service', 'price', 'speed', 'freshness',
      'variety', 'availability', 'quality', 'reliability', 'atmosphere',
      'presentation', 'experience'
    )
    OR CASE
      WHEN jsonb_typeof(item.value) = 'number' THEN
        (item.value::text)::numeric < 1
        OR (item.value::text)::numeric > 5
        OR (item.value::text)::numeric <> trunc((item.value::text)::numeric)
      ELSE TRUE
    END
  ) THEN
    RAISE EXCEPTION 'review_dimension_value_invalid' USING ERRCODE = '23514';
  END IF;

  v_comment_length := length(btrim(coalesce(NEW.comment, '')));
  IF v_comment_length < 10 OR v_comment_length > 500 THEN
    RAISE EXCEPTION 'review_comment_length_invalid' USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.order_requests AS o
    WHERE o.business_id = NEW.business_id
      AND o.customer_profile_id = NEW.user_id
      AND o.status = 'delivered'
  ) THEN
    RAISE EXCEPTION 'review_requires_delivered_order' USING ERRCODE = '23514';
  END IF;

  NEW.is_verified_transaction := TRUE;
  NEW.review_quality_score :=
    (CASE
      WHEN v_comment_length >= 150 THEN 70
      WHEN v_comment_length >= 50 THEN 40
      WHEN v_comment_length >= 20 THEN 20
      ELSE 0
    END) + 30;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_enforce_transaction_verified_review_insert ON public.business_reviews;
DROP TRIGGER IF EXISTS trg_enforce_transaction_verified_review_update ON public.business_reviews;

CREATE TRIGGER trg_enforce_transaction_verified_review_insert
BEFORE INSERT ON public.business_reviews
FOR EACH ROW
EXECUTE FUNCTION public.enforce_transaction_verified_review();

CREATE TRIGGER trg_enforce_transaction_verified_review_update
BEFORE UPDATE OF business_id, user_id, is_verified_transaction, dimensions, comment
ON public.business_reviews
FOR EACH ROW
EXECUTE FUNCTION public.enforce_transaction_verified_review();

REVOKE ALL ON FUNCTION public.enforce_transaction_verified_review() FROM PUBLIC, anon, authenticated;

COMMENT ON FUNCTION public.enforce_transaction_verified_review() IS
  'EAH: public reviews require a delivered order, known dimensions scored 1-5, and a 10-500 character comment; the DB sets verification and quality score.';
