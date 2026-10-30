-- Enforce one primary branch per activity.
-- Run only against a dedicated non-production database after the paired migration.
BEGIN;
SELECT plan(3);

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class idx ON idx.oid = i.indexrelid
    JOIN pg_namespace n ON n.oid = idx.relnamespace
    WHERE n.nspname = 'public'
      AND idx.relname = 'business_branches_one_primary_per_business'
      AND i.indisunique
      AND i.indpred IS NOT NULL
  ),
  'a unique partial index enforces one primary branch per business'
);

SELECT ok(
  position('is_primary' IN pg_get_expr(i.indpred, i.indrelid)) > 0,
  'the unique index applies only to primary branches'
)
FROM pg_index i
JOIN pg_class idx ON idx.oid = i.indexrelid
JOIN pg_namespace n ON n.oid = idx.relnamespace
WHERE n.nspname = 'public'
  AND idx.relname = 'business_branches_one_primary_per_business';

SELECT ok(
  position('business_id' IN pg_get_indexdef(i.indexrelid)) > 0,
  'primary uniqueness is scoped to each activity'
)
FROM pg_index i
JOIN pg_class idx ON idx.oid = i.indexrelid
JOIN pg_namespace n ON n.oid = idx.relnamespace
WHERE n.nspname = 'public'
  AND idx.relname = 'business_branches_one_primary_per_business';

SELECT * FROM finish();
ROLLBACK;
