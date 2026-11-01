BEGIN;

SELECT plan(2);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'businesses_one_owner_per_account_idx'
  ),
  'one-owner-per-account index exists on businesses'
);

SELECT ok(
  (
    SELECT i.indisunique AND i.indpred IS NOT NULL
    FROM pg_index i
    WHERE i.indexrelid = 'public.businesses_one_owner_per_account_idx'::regclass
  ),
  'owner index is unique and applies only to non-null owner links'
);

SELECT * FROM finish();

ROLLBACK;
