-- Regression assertions for public.ads RLS hardening. Requires pgTAP.
BEGIN;
SELECT plan(6);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.ads'::regclass),
  'RLS stays enabled on legacy ads'
);
SELECT ok(
  (SELECT qual LIKE '%status = ''active''%'
      AND qual LIKE '%starts_at%'
      AND qual LIKE '%ends_at%'
   FROM pg_policies
   WHERE schemaname='public' AND tablename='ads' AND policyname='ads_read'),
  'anonymous reads require active status and the scheduled start/end window'
);
SELECT ok(
  (SELECT with_check LIKE '%owner_profile_id%'
      AND with_check LIKE '%status = ''pending''%'
      AND with_check LIKE '%businesses%'
      AND with_check LIKE '%auth.uid%'
   FROM pg_policies
   WHERE schemaname='public' AND tablename='ads' AND policyname='ads_insert'),
  'seller inserts are pending and tied to a business they own'
);
SELECT ok(
  (SELECT qual LIKE '%auth_is_admin%' AND with_check LIKE '%auth_is_admin%'
   FROM pg_policies
   WHERE schemaname='public' AND tablename='ads' AND policyname='ads_update'),
  'only a platform admin can update ad rows'
);
SELECT ok(
  (SELECT qual LIKE '%owner_profile_id%'
      AND qual LIKE '%pending%'
      AND qual LIKE '%rejected%'
      AND qual LIKE '%auth_is_admin%'
   FROM pg_policies
   WHERE schemaname='public' AND tablename='ads' AND policyname='ads_delete'),
  'owners can delete only their pending/rejected ads while admins retain moderation'
);
SELECT ok(
  (SELECT count(*) = 4
   FROM pg_policies
   WHERE schemaname='public' AND tablename='ads'
     AND policyname IN ('ads_read','ads_insert','ads_update','ads_delete')),
  'all four expected policies exist exactly once'
);

SELECT * FROM finish();
ROLLBACK;
