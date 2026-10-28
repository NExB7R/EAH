-- EAH — enforce verified-transaction reviews at the database boundary.
-- Apply this migration before enabling the evidence-based reputation system in production.
-- No existing review rows were found during the 2026-10-28 schema audit, but this migration
-- deliberately does not rewrite or delete review history.

CREATE OR REPLACE FUNCTION public.enforce_transaction_verified_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.order_requests AS o
    WHERE o.business_id = NEW.business_id
      AND o.customer_profile_id = NEW.user_id
      AND o.status = 'delivered'
  ) THEN
    RAISE EXCEPTION 'review_requires_delivered_order'
      USING ERRCODE = '23514';
  END IF;

  -- Never trust a value supplied by the browser/API caller.
  NEW.is_verified_transaction := TRUE;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.enforce_transaction_verified_review() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_enforce_transaction_verified_review ON public.business_reviews;

CREATE TRIGGER trg_enforce_transaction_verified_review
BEFORE INSERT OR UPDATE OF business_id, user_id, is_verified_transaction
ON public.business_reviews
FOR EACH ROW
EXECUTE FUNCTION public.enforce_transaction_verified_review();

COMMENT ON FUNCTION public.enforce_transaction_verified_review() IS
  'EAH: every review that can affect rating aggregates must be tied to a delivered platform order.';
