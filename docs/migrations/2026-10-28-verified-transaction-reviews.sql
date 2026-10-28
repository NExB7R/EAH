-- EAH — enforce verified-transaction reviews at the database boundary.
-- Apply this migration before enabling the evidence-based reputation system in production.
-- Client JWTs must not be able to insert a completed order, otherwise the review gate could be spoofed.
-- No existing review rows were found during the 2026-10-28 schema audit, but this migration
-- deliberately does not rewrite or delete review history.

-- A client-created order must never be born as delivered or with fabricated feedback.
-- Seller-side status transitions remain governed by order_requests RLS.
CREATE OR REPLACE FUNCTION public.guard_client_order_insert_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') IN ('anon', 'authenticated') THEN
    NEW.status := 'sent';
    NEW.confirmed_at := NULL;
    NEW.confirmed_via := NULL;
    NEW.accepted_at := NULL;
    NEW.delivered_at := NULL;
    NEW.feedback_rating := NULL;
    NEW.feedback_text := NULL;
    NEW.feedback_issue_type := NULL;
    NEW.feedback_due_at := NULL;
    NEW.feedback_sent_at := NULL;
    NEW.feedback_reminder_at := NULL;
    NEW.feedback_reminder_sent_at := NULL;
    NEW.review_reminder_sent_at := NULL;
    NEW.customer_trust_score_snapshot := NULL;
    NEW.business_trust_score_snapshot := NULL;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.guard_client_order_insert_state() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_client_order_insert_state ON public.order_requests;
CREATE TRIGGER trg_guard_client_order_insert_state
BEFORE INSERT ON public.order_requests
FOR EACH ROW
EXECUTE FUNCTION public.guard_client_order_insert_state();

COMMENT ON FUNCTION public.guard_client_order_insert_state() IS
  'EAH: order rows created through client JWTs always start as sent and cannot spoof delivery or feedback fields.';

-- Keep reviewers from editing moderation/ownership outcomes through the self-update policy.
-- They may edit their own text/dimensions, but only admins may change review state or moderation fields.
CREATE OR REPLACE FUNCTION public.guard_review_moderation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT private.is_admin(auth.uid()) THEN
    IF NEW.status IS DISTINCT FROM OLD.status
      OR NEW.flagged_reason IS DISTINCT FROM OLD.flagged_reason
      OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
      OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
      OR NEW.review_quality_score IS DISTINCT FROM OLD.review_quality_score
      OR NEW.merchant_reply IS DISTINCT FROM OLD.merchant_reply
      OR NEW.merchant_reply_at IS DISTINCT FROM OLD.merchant_reply_at
      OR NEW.merchant_reply_by IS DISTINCT FROM OLD.merchant_reply_by
      OR NEW.is_verified_transaction IS DISTINCT FROM OLD.is_verified_transaction
    THEN
      RAISE EXCEPTION 'review_moderation_fields_are_server_managed'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.guard_review_moderation_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS a_guard_review_moderation_fields ON public.business_reviews;
CREATE TRIGGER a_guard_review_moderation_fields
BEFORE UPDATE ON public.business_reviews
FOR EACH ROW
EXECUTE FUNCTION public.guard_review_moderation_fields();

COMMENT ON FUNCTION public.guard_review_moderation_fields() IS
  'EAH: reviewer self-update cannot approve/reject/verify reviews or rewrite moderation/reply fields.';

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
