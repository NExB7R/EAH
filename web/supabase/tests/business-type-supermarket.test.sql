BEGIN;

SELECT plan(3);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conrelid = 'public.businesses'::regclass
      AND c.conname = 'businesses_business_type_check'
      AND pg_get_constraintdef(c.oid) LIKE '%supermarket%'
  ),
  'business type constraint explicitly permits supermarket'
);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conrelid = 'public.businesses'::regclass
      AND c.conname = 'businesses_business_type_check'
      AND pg_get_constraintdef(c.oid) LIKE '%restaurant%'
      AND pg_get_constraintdef(c.oid) LIKE '%pharmacy%'
      AND pg_get_constraintdef(c.oid) LIKE '%delivery_office%'
      AND pg_get_constraintdef(c.oid) LIKE '%misc%'
  ),
  'existing business types remain permitted'
);

SELECT ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    WHERE c.conrelid = 'public.businesses'::regclass
      AND c.conname = 'businesses_business_type_check'
      AND pg_get_constraintdef(c.oid) LIKE '%supermarket%'
      AND pg_get_constraintdef(c.oid) LIKE '%other_unreviewed_type%'
  ),
  'the approved category list is explicit and does not silently allow unknown types'
);

SELECT * FROM finish();
ROLLBACK;
