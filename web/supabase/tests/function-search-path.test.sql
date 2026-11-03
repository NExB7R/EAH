-- EAH regression checks for mutable function search_path findings.
-- Run only on a dedicated non-production database after applying the migration.
BEGIN;

SELECT plan(4);

SELECT ok(
  (SELECT proconfig @> ARRAY['search_path=pg_catalog']
   FROM pg_proc
   WHERE oid = 'public.get_trust_tier(integer)'::regprocedure),
  'get_trust_tier uses a fixed pg_catalog search_path'
);

SELECT ok(
  (SELECT proconfig @> ARRAY['search_path=pg_catalog']
   FROM pg_proc
   WHERE oid = 'public.set_new_until()'::regprocedure),
  'set_new_until uses a fixed pg_catalog search_path'
);

SELECT ok(
  (SELECT proconfig @> ARRAY['search_path=pg_catalog']
   FROM pg_proc
   WHERE oid = 'public.prevent_merchant_toggle_orders_enabled()'::regprocedure),
  'prevent_merchant_toggle_orders_enabled uses a fixed pg_catalog search_path'
);

SELECT ok(
  (SELECT pg_get_functiondef('public.prevent_merchant_toggle_orders_enabled()'::regprocedure)
      LIKE '%auth.uid()%public.auth_is_admin()%'),
  'trigger authorization calls are schema-qualified'
);

SELECT * FROM finish();

ROLLBACK;
