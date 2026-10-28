-- EAH reputation/order regression checks (pgTAP)
BEGIN;
SELECT plan(9);

SELECT ok(
  position('expired' in (
    SELECT pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'public.order_requests'::regclass
      AND conname = 'order_requests_status_check'
  )) > 0,
  'order_requests status constraint permits expired'
);

SELECT is(
  has_function_privilege('authenticated', 'public.award_review_points(uuid)', 'EXECUTE'),
  false,
  'authenticated users cannot directly award review participation points'
);

SELECT is(
  has_function_privilege('anon', 'public.award_review_points(uuid)', 'EXECUTE'),
  false,
  'anonymous users cannot directly award review participation points'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = 'order_requests'
      AND trigger_name = 'trg_update_business_rating'
  ),
  'private order feedback does not overwrite public activity stars'
);

SELECT has_trigger(
  'public.business_reviews',
  'trg_enforce_transaction_verified_review_insert',
  'public review insert requires a delivered platform order'
);

SELECT ok(
  position('is_verified_transaction = true' in pg_get_functiondef('public.refresh_business_counts()'::regprocedure)) > 0,
  'public rating aggregate counts only transaction-verified reviews'
);

SELECT ok(
  position('review_dimension_value_invalid' in pg_get_functiondef('public.enforce_transaction_verified_review()'::regprocedure)) > 0
    AND position('review_comment_length_invalid' in pg_get_functiondef('public.enforce_transaction_verified_review()'::regprocedure)) > 0,
  'database rejects forged review dimensions and invalid comment lengths'
);

SELECT is(
  has_function_privilege('authenticated', 'public.find_by_phone(text)', 'EXECUTE'),
  false,
  'authenticated users cannot call phone enumeration RPC directly'
);

SELECT is(
  has_function_privilege('authenticated', 'public.on_trust_updated()', 'EXECUTE'),
  false,
  'trigger-only trust function is not callable from authenticated clients'
);

SELECT * FROM finish();
ROLLBACK;
