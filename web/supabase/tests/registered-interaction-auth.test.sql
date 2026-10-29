-- Registered-account mutation guards. Run only on the isolated RLS test database.
BEGIN;
SELECT plan(6);

SELECT is(
  (SELECT count(*)::int FROM pg_policies
   WHERE schemaname = 'public'
     AND position('registered_account_only_' in policyname) = 1),
  60,
  'all 60 mutation-only registered-account policies are installed'
);

SELECT is(
  (SELECT count(*)::int FROM pg_policies
   WHERE schemaname = 'public'
     AND position('registered_account_only_' in policyname) = 1
     AND permissive = 'RESTRICTIVE'),
  60,
  'every registered-account guard is RESTRICTIVE'
);

SELECT is(
  (SELECT count(*)::int FROM pg_policies
   WHERE schemaname = 'public'
     AND position('registered_account_only_' in policyname) = 1
     AND (
       (cmd = 'INSERT' AND (with_check NOT LIKE '%is_anonymous%' OR with_check NOT LIKE '%auth.uid%'))
       OR (cmd = 'UPDATE' AND (
         qual NOT LIKE '%is_anonymous%' OR qual NOT LIKE '%auth.uid%'
         OR with_check NOT LIKE '%is_anonymous%' OR with_check NOT LIKE '%auth.uid%'
       ))
       OR (cmd = 'DELETE' AND (qual NOT LIKE '%is_anonymous%' OR qual NOT LIKE '%auth.uid%'))
     )),
  0,
  'every mutation guard requires a non-anonymous UID in its applicable checks'
);

SELECT is(
  (SELECT count(DISTINCT tablename)::int FROM pg_policies
   WHERE schemaname = 'public'
     AND position('registered_account_only_' in policyname) = 1),
  28,
  'mutation guards cover all 28 intended interaction and account tables'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'business_comments'
      AND cmd = 'SELECT' AND permissive = 'PERMISSIVE'
  ),
  'the existing comment read policy remains permissive'
);

SELECT is(
  (SELECT count(*)::int FROM pg_policies
   WHERE schemaname = 'public'
     AND position('registered_account_only_' in policyname) = 1
     AND cmd = 'SELECT'),
  0,
  'no SELECT policy is added or tightened by this mutation migration'
);

SELECT * FROM finish();
ROLLBACK;
