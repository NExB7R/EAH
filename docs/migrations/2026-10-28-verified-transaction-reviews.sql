-- EAH — enforce verified-transaction reviews at the database boundary.
-- Apply this migration before enabling the evidence-based reputation system in production.
-- Client JWTs must not be able to insert a completed order, otherwise the review gate could be spoofed.
-- No existing review rows were found during the 2026-10-28 schema audit, but this migration
-- deliberately does not rewrite or delete review history.

-- Fix a legacy mismatch: award_trust_points accepted "user" but trust_events only
-- stores "customer" or "business". Map the event type without changing profiles APIs.
CREATE OR REPLACE FUNCTION public.award_trust_points(
  p_entity_type text,
  p_entity_id uuid,
  p_event_type text,
  p_delta integer,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_current integer;
  v_factor numeric;
  v_effective integer;
  v_new integer;
  v_tier text;
  v_legend integer;
  v_legend_delta integer := 0;
BEGIN
  IF p_entity_type = 'user' THEN
    SELECT trust_score, legend_points INTO v_current, v_legend
    FROM public.profiles WHERE id = p_entity_id;
  ELSIF p_entity_type = 'business' THEN
    SELECT trust_score, legend_points INTO v_current, v_legend
    FROM public.businesses WHERE id = p_entity_id;
  ELSE
    RAISE EXCEPTION 'invalid entity_type: %', p_entity_type;
  END IF;

  v_current := COALESCE(v_current, 50);
  v_legend := COALESCE(v_legend, 0);

  IF p_delta > 0 THEN
    v_factor := CASE
      WHEN v_current < 30 THEN 1.5
      WHEN v_current < 50 THEN 1.0
      WHEN v_current < 70 THEN 0.7
      WHEN v_current < 85 THEN 0.4
      WHEN v_current < 95 THEN 0.2
      ELSE 0.1
    END;
  ELSE
    v_factor := 1.0;
  END IF;

  v_effective := ROUND(p_delta * v_factor);
  v_new := GREATEST(0, LEAST(100, v_current + v_effective));

  IF v_current >= 100 AND p_delta > 0 THEN
    v_legend_delta := p_delta;
    v_new := 100;
  END IF;

  v_legend := v_legend + v_legend_delta;
  v_tier := public.get_trust_tier(v_new);

  IF p_entity_type = 'user' THEN
    UPDATE public.profiles
    SET trust_score = v_new, trust_tier = v_tier,
        legend_points = v_legend, trust_updated_at = now()
    WHERE id = p_entity_id;
  ELSE
    UPDATE public.businesses
    SET trust_score = v_new, trust_tier = v_tier,
        legend_points = v_legend, trust_updated_at = now()
    WHERE id = p_entity_id;
  END IF;

  INSERT INTO public.trust_events (
    entity_type, entity_id, event_type, delta, score_before, score_after, metadata
  ) VALUES (
    CASE WHEN p_entity_type = 'user' THEN 'customer' ELSE 'business' END,
    p_entity_id, p_event_type, v_effective, v_current, v_new, p_metadata
  );

  RETURN jsonb_build_object(
    'before', v_current,
    'delta_raw', p_delta,
    'delta_effective', v_effective,
    'after', v_new,
    'tier', v_tier,
    'legend', v_legend
  );
END;
$function$;

-- Existing order_message_lock_trigger referenced a removed whatsapp_url column.
-- The current orders table stores the customer-facing message in whatsapp_message.
CREATE OR REPLACE FUNCTION public.lock_order_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF OLD.message_locked_at IS NOT NULL THEN
    NEW.message_locked_at := OLD.message_locked_at;
    NEW.whatsapp_sent_at := OLD.whatsapp_sent_at;
    NEW.whatsapp_message := OLD.whatsapp_message;
    RETURN NEW;
  END IF;

  IF NEW.whatsapp_message IS NOT NULL
    AND OLD.whatsapp_message IS DISTINCT FROM NEW.whatsapp_message
  THEN
    NEW.message_locked_at := COALESCE(NEW.message_locked_at, now());
    NEW.whatsapp_sent_at := COALESCE(NEW.whatsapp_sent_at, now());
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.lock_order_message() FROM PUBLIC, anon, authenticated;

-- Keep the database status constraint in sync with the seller order state machine.
ALTER TABLE public.order_requests
  DROP CONSTRAINT IF EXISTS order_requests_status_check;
ALTER TABLE public.order_requests
  ADD CONSTRAINT order_requests_status_check
  CHECK (status = ANY (ARRAY[
    'sent'::text, 'seen'::text, 'accepted'::text, 'rejected'::text,
    'preparing'::text, 'on_way'::text, 'delivered'::text, 'cancelled'::text
  ]));

-- Keep internal risk signals separate: a pending accusation is not evidence.
DO $migration$
DECLARE had_multi_account_level boolean; had_report_wanted_level boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='multi_account_level') INTO had_multi_account_level;
  IF NOT had_multi_account_level THEN
    ALTER TABLE public.profiles ADD COLUMN multi_account_level integer NOT NULL DEFAULT 0;
    -- Reports had no rows during this rollout; preserve prior private flags as multi-account signals.
    UPDATE public.profiles SET multi_account_level = GREATEST(0, LEAST(5, COALESCE(wanted_level, 0)));
  END IF;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='report_wanted_level') INTO had_report_wanted_level;
  IF NOT had_report_wanted_level THEN
    ALTER TABLE public.profiles ADD COLUMN report_wanted_level integer NOT NULL DEFAULT 0;
  END IF;
END;
$migration$;

DO $constraints$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND conname='profiles_multi_account_level_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_multi_account_level_check CHECK (multi_account_level BETWEEN 0 AND 5);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.profiles'::regclass AND conname='profiles_report_wanted_level_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_report_wanted_level_check CHECK (report_wanted_level BETWEEN 0 AND 5);
  END IF;
END;
$constraints$;

UPDATE public.profiles
SET wanted_level = GREATEST(COALESCE(multi_account_level, 0), COALESCE(report_wanted_level, 0))
WHERE wanted_level IS DISTINCT FROM GREATEST(COALESCE(multi_account_level, 0), COALESCE(report_wanted_level, 0));

-- Inserting a report only creates a review queue item; it has no risk-score effect.
CREATE OR REPLACE FUNCTION public.apply_wanted_level_on_report()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $function$
BEGIN RETURN NEW; END;
$function$;
REVOKE ALL ON FUNCTION public.apply_wanted_level_on_report() FROM PUBLIC, anon, authenticated;

-- Only reports that an admin marks resolved contribute to the internal report risk component.
CREATE OR REPLACE FUNCTION public.recalc_wanted_level_on_resolve()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $function$
DECLARE v_target_user_id uuid; v_resolved_count integer; v_new_report_level integer;
BEGIN
  IF TG_OP <> 'UPDATE' OR OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  IF NEW.entity_type = 'user' THEN
    v_target_user_id := NEW.entity_id;
  ELSIF NEW.entity_type = 'review' THEN
    SELECT user_id INTO v_target_user_id FROM public.business_reviews WHERE id = NEW.entity_id;
  ELSIF NEW.entity_type = 'business' THEN
    SELECT owner_profile_id INTO v_target_user_id FROM public.businesses WHERE id = NEW.entity_id;
  END IF;
  IF v_target_user_id IS NULL THEN RETURN NEW; END IF;

  SELECT COUNT(*) INTO v_resolved_count
  FROM public.reports r
  WHERE r.status = 'resolved'
    AND (
      (r.entity_type = 'user' AND r.entity_id = v_target_user_id)
      OR (r.entity_type = 'review' AND r.entity_id IN (SELECT id FROM public.business_reviews WHERE user_id = v_target_user_id))
      OR (r.entity_type = 'business' AND r.entity_id IN (SELECT id FROM public.businesses WHERE owner_profile_id = v_target_user_id))
    );
  v_new_report_level := CASE
    WHEN v_resolved_count >= 12 THEN 5 WHEN v_resolved_count >= 8 THEN 4
    WHEN v_resolved_count >= 5 THEN 3 WHEN v_resolved_count >= 3 THEN 2
    WHEN v_resolved_count >= 1 THEN 1 ELSE 0 END;

  UPDATE public.profiles
  SET report_wanted_level = v_new_report_level,
      wanted_level = GREATEST(COALESCE(multi_account_level, 0), v_new_report_level),
      updated_at = now()
  WHERE id = v_target_user_id;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.recalc_wanted_level_on_resolve() FROM PUBLIC, anon, authenticated;

-- Preserve multi-account detection separately and use the valid trust_events entity value.
CREATE OR REPLACE FUNCTION public.detect_multi_account_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $function$
DECLARE v_count integer;
BEGIN
  IF NEW.signup_ip_hash IS NULL THEN RETURN NEW; END IF;
  SELECT public.count_accounts_from_ip(NEW.signup_ip_hash, 7) INTO v_count;
  IF v_count >= 3 THEN
    UPDATE public.profiles
    SET multi_account_level = GREATEST(COALESCE(multi_account_level, 0), 2),
        wanted_level = GREATEST(COALESCE(report_wanted_level, 0), COALESCE(multi_account_level, 0), 2),
        updated_at = now()
    WHERE id = NEW.id;
    INSERT INTO public.trust_events (entity_type, entity_id, event_type, delta, score_before, score_after, metadata)
    VALUES ('customer', NEW.id, 'multi_account_detected', 0, 0, 0,
      jsonb_build_object('ip_hash_prefix', left(NEW.signup_ip_hash, 8), 'count_7d', v_count));
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.detect_multi_account_signup() FROM PUBLIC, anon, authenticated;

CREATE UNIQUE INDEX IF NOT EXISTS reports_reporter_entity_unique
ON public.reports (reporter_id, entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.on_order_confirmed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  IF TG_OP <> 'UPDATE' THEN RETURN NEW; END IF;
  IF NEW.status = 'delivered' AND OLD.status IS DISTINCT FROM 'delivered' THEN
    IF NEW.customer_profile_id IS NOT NULL THEN
      PERFORM public.award_trust_points('user', NEW.customer_profile_id, 'order_completed', 8, jsonb_build_object('order_id', NEW.id));
    END IF;
    PERFORM public.award_trust_points('business', NEW.business_id, 'order_completed', 8, jsonb_build_object('order_id', NEW.id));
  END IF;
  -- Rejection alone is not a penalty signal: stock, hours, duplicate orders and customer changes matter.
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.on_order_confirmed() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_order_update_state()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $function$
DECLARE v_transition_allowed boolean := false;
BEGIN
  IF auth.uid() IS NULL OR private.is_admin(auth.uid()) THEN RETURN NEW; END IF;

  IF NEW.business_id IS DISTINCT FROM OLD.business_id
    OR NEW.customer_profile_id IS DISTINCT FROM OLD.customer_profile_id THEN
    RAISE EXCEPTION 'order_identity_fields_are_immutable' USING ERRCODE = '42501';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_transition_allowed := CASE OLD.status
      WHEN 'sent' THEN NEW.status IN ('seen', 'accepted', 'rejected', 'cancelled')
      WHEN 'seen' THEN NEW.status IN ('accepted', 'rejected', 'cancelled')
      WHEN 'accepted' THEN NEW.status IN ('preparing', 'cancelled')
      WHEN 'preparing' THEN NEW.status IN ('on_way', 'cancelled')
      WHEN 'on_way' THEN NEW.status IN ('delivered', 'cancelled')
      ELSE false
    END;
    IF NOT v_transition_allowed THEN
      RAISE EXCEPTION 'invalid_order_status_transition: % -> %', OLD.status, NEW.status USING ERRCODE = '23514';
    END IF;
    IF NEW.status = 'delivered' THEN
      NEW.delivered_at := COALESCE(NEW.delivered_at, now());
      NEW.feedback_due_at := COALESCE(NEW.feedback_due_at, now() + interval '1 hour');
      NEW.feedback_reminder_at := COALESCE(NEW.feedback_reminder_at, NEW.feedback_due_at + interval '30 minutes');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.guard_order_update_state() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_guard_order_update_state ON public.order_requests;
CREATE TRIGGER trg_guard_order_update_state BEFORE UPDATE ON public.order_requests
FOR EACH ROW EXECUTE FUNCTION public.guard_order_update_state();

COMMENT ON FUNCTION public.guard_order_update_state() IS
  'EAH: seller order updates preserve buyer/business identity and follow the allowed order lifecycle.';

DROP POLICY IF EXISTS order_requests_owner_update ON public.order_requests;
CREATE POLICY order_requests_owner_update ON public.order_requests
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = order_requests.business_id AND b.owner_profile_id = (SELECT auth.uid()))
  OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'::public.app_role)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = order_requests.business_id AND b.owner_profile_id = (SELECT auth.uid()))
  OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = (SELECT auth.uid()) AND ur.role = 'super_admin'::public.app_role)
);

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
CREATE OR REPLACE FUNCTION public.guard_review_submission_state()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT private.is_admin(auth.uid()) THEN
    NEW.status := 'pending';
    NEW.flagged_reason := NULL;
    NEW.moderated_by := NULL;
    NEW.moderated_at := NULL;
    NEW.merchant_reply := NULL;
    NEW.merchant_reply_at := NULL;
    NEW.merchant_reply_by := NULL;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.guard_review_submission_state() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS a_guard_review_submission_state ON public.business_reviews;
CREATE TRIGGER a_guard_review_submission_state
BEFORE INSERT ON public.business_reviews
FOR EACH ROW EXECUTE FUNCTION public.guard_review_submission_state();

COMMENT ON FUNCTION public.guard_review_submission_state() IS
  'EAH: non-admin review submissions always enter moderation as pending.';

CREATE OR REPLACE FUNCTION public.guard_review_moderation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $function$
DECLARE
  v_is_admin boolean := auth.uid() IS NOT NULL AND private.is_admin(auth.uid());
  v_is_owner boolean := false;
BEGIN
  IF v_is_admin OR auth.uid() IS NULL THEN RETURN NEW; END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
    OR NEW.flagged_reason IS DISTINCT FROM OLD.flagged_reason
    OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
    OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
    OR NEW.review_quality_score IS DISTINCT FROM OLD.review_quality_score
    OR NEW.is_verified_transaction IS DISTINCT FROM OLD.is_verified_transaction
    OR NEW.business_id IS DISTINCT FROM OLD.business_id
    OR NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.comment IS DISTINCT FROM OLD.comment
    OR NEW.dimensions IS DISTINCT FROM OLD.dimensions
  THEN
    RAISE EXCEPTION 'review_content_and_moderation_are_server_managed'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.merchant_reply IS DISTINCT FROM OLD.merchant_reply
    OR NEW.merchant_reply_at IS DISTINCT FROM OLD.merchant_reply_at
    OR NEW.merchant_reply_by IS DISTINCT FROM OLD.merchant_reply_by
  THEN
    SELECT EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = OLD.business_id AND b.owner_profile_id = auth.uid()
    ) INTO v_is_owner;

    IF NOT v_is_owner OR OLD.status <> 'approved'
      OR OLD.merchant_reply IS NOT NULL OR NEW.merchant_reply IS NULL
      OR NEW.merchant_reply_by IS DISTINCT FROM auth.uid()
      OR NEW.merchant_reply_at IS NULL
    THEN
      RAISE EXCEPTION 'only_activity_owner_may_reply_once_to_approved_review'
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
FOR EACH ROW EXECUTE FUNCTION public.guard_review_moderation_fields();

COMMENT ON FUNCTION public.guard_review_moderation_fields() IS
  'EAH: only admins moderate reviews; the activity owner may reply once to an approved review.';

DROP POLICY IF EXISTS business_reviews_merchant_reply ON public.business_reviews;
CREATE POLICY business_reviews_merchant_reply ON public.business_reviews
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_reviews.business_id AND b.owner_profile_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_reviews.business_id AND b.owner_profile_id = (SELECT auth.uid())));

CREATE OR REPLACE FUNCTION public.enforce_transaction_verified_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE v_comment_length integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.order_requests o
    WHERE o.business_id = NEW.business_id
      AND o.customer_profile_id = NEW.user_id
      AND o.status = 'delivered'
  ) THEN
    RAISE EXCEPTION 'review_requires_delivered_order' USING ERRCODE = '23514';
  END IF;
  NEW.is_verified_transaction := TRUE;
  v_comment_length := length(btrim(coalesce(NEW.comment, '')));
  NEW.review_quality_score :=
    (CASE WHEN v_comment_length >= 150 THEN 70
          WHEN v_comment_length >= 50 THEN 40
          WHEN v_comment_length >= 20 THEN 20
          ELSE 0 END) + 30;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.enforce_transaction_verified_review() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_enforce_transaction_verified_review ON public.business_reviews;
DROP TRIGGER IF EXISTS trg_enforce_transaction_verified_review_insert ON public.business_reviews;
DROP TRIGGER IF EXISTS trg_enforce_transaction_verified_review_update ON public.business_reviews;

CREATE TRIGGER trg_enforce_transaction_verified_review_insert
BEFORE INSERT ON public.business_reviews
FOR EACH ROW
EXECUTE FUNCTION public.enforce_transaction_verified_review();

CREATE TRIGGER trg_enforce_transaction_verified_review_update
BEFORE UPDATE OF business_id, user_id, is_verified_transaction
ON public.business_reviews
FOR EACH ROW
EXECUTE FUNCTION public.enforce_transaction_verified_review();

COMMENT ON FUNCTION public.enforce_transaction_verified_review() IS
  'EAH: every review that can affect rating aggregates must be tied to a delivered platform order.';
