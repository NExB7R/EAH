-- ═══════════════════════════════════════════════════════════
-- EAH — Launch Verification Script
-- Run in Supabase SQL Editor to verify everything is ready.
-- Expected: every row shows ✅ (or a clear warning)
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Test accounts ───
SELECT
  '1. Test accounts' AS category,
  '4 accounts exist (customer1/2, merchant1/2)' AS check,
  CASE WHEN count(*) = 4 THEN '✅ OK' ELSE '❌ FAIL (' || count(*) || '/4)' END AS status
FROM auth.users
WHERE email IN ('customer1@eah.test', 'customer2@eah.test', 'merchant1@eah.test', 'merchant2@eah.test');

-- ─── 2. Demo businesses exist ───
SELECT
  '2. Demo businesses' AS category,
  '3 demo businesses exist' AS check,
  CASE WHEN count(*) >= 3 THEN '✅ OK (' || count(*) || ')' ELSE '❌ FAIL (' || count(*) || ')' END AS status
FROM public.businesses
WHERE slug LIKE 'demo-%';

-- ─── 3. Every published business has a branch ───
SELECT
  '3. Branches coverage' AS category,
  'No published business without primary branch' AS check,
  CASE
    WHEN count(*) = 0 THEN '✅ OK'
    ELSE '❌ FAIL (' || count(*) || ' orphans)'
  END AS status
FROM public.businesses b
WHERE b.is_published = true
  AND NOT EXISTS (
    SELECT 1 FROM public.business_branches bb
    WHERE bb.business_id = b.id AND bb.is_primary = true
  );

-- ─── 4. Owner uniqueness ───
SELECT
  '4. Owner uniqueness' AS category,
  'No account owns multiple businesses' AS check,
  CASE
    WHEN count(*) = 0 THEN '✅ OK'
    ELSE '❌ FAIL (' || count(*) || ' duplicate owners)'
  END AS status
FROM (
  SELECT owner_profile_id
  FROM public.businesses
  WHERE owner_profile_id IS NOT NULL
  GROUP BY owner_profile_id
  HAVING count(*) > 1
) dup;

-- ─── 5. customer1 profile ───
SELECT
  '5. customer1 active' AS category,
  'customer1 has standing=good, points>=100' AS check,
  CASE
    WHEN p.standing = 'good' AND (SELECT COALESCE(SUM(delta),0) FROM points_log WHERE user_id = p.id) >= 100
      THEN '✅ OK'
    ELSE '❌ FAIL'
  END AS status
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'customer1@eah.test';

-- ─── 6. customer2 restricted ───
SELECT
  '6. customer2 restricted' AS category,
  'customer2 has standing=restricted' AS check,
  CASE
    WHEN p.standing = 'restricted' THEN '✅ OK'
    ELSE '❌ FAIL (standing=' || COALESCE(p.standing, 'null') || ')'
  END AS status
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'customer2@eah.test';

-- ─── 7. customer1 delivered orders ───
SELECT
  '7. customer1 orders' AS category,
  'customer1 has >=2 delivered orders' AS check,
  CASE WHEN count(*) >= 2 THEN '✅ OK (' || count(*) || ')' ELSE '⚠️ LOW (' || count(*) || ')' END AS status
FROM public.order_requests o
JOIN auth.users u ON u.id = o.customer_profile_id
WHERE u.email = 'customer1@eah.test' AND o.status = 'delivered';

-- ─── 8. customer1 reviews ───
SELECT
  '8. customer1 reviews' AS category,
  'customer1 has >=2 approved reviews' AS check,
  CASE WHEN count(*) >= 2 THEN '✅ OK (' || count(*) || ')' ELSE '⚠️ LOW (' || count(*) || ')' END AS status
FROM public.business_reviews r
JOIN auth.users u ON u.id = r.user_id
WHERE u.email = 'customer1@eah.test' AND r.status = 'approved';

-- ─── 9. Standing System RPC ───
SELECT
  '9. Standing RPC' AS category,
  'can_interact function exists' AS check,
  CASE WHEN count(*) = 1 THEN '✅ OK' ELSE '❌ FAIL' END AS status
FROM pg_proc WHERE proname = 'can_interact';

-- ─── 10. Autopilot trigger ───
SELECT
  '10. Autopilot trigger' AS category,
  'trigger_autopilot_penalties enabled' AS check,
  CASE WHEN count(*) = 1 THEN '✅ OK' ELSE '❌ FAIL' END AS status
FROM pg_trigger
WHERE tgname = 'trigger_autopilot_penalties' AND tgenabled = 'O';

-- ─── 11. Contact privacy ───
SELECT
  '11. Contact privacy' AS category,
  'No public phone/whatsapp in business_contact_methods' AS check,
  CASE
    WHEN count(*) = 0 THEN '✅ OK'
    ELSE '❌ LEAK (' || count(*) || ' exposed)'
  END AS status
FROM public.business_contact_methods
WHERE is_public = true AND method_type IN ('phone', 'whatsapp');

-- ─── 12. notify_merchant trigger functional ───
SELECT
  '12. Review trigger' AS category,
  'notify_merchant_on_review uses correct columns' AS check,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'notify_merchant_on_review'
        AND prosrc LIKE '%notification_type%'
        AND prosrc NOT LIKE '%type, title%'
    ) THEN '✅ OK'
    ELSE '❌ FAIL (uses old schema)'
  END AS status;

-- ─── 13. RLS enabled on critical tables ───
SELECT
  '13. RLS coverage' AS category,
  'RLS enabled on all 15 critical tables' AS check,
  CASE
    WHEN count(*) = 15 THEN '✅ OK (15/15)'
    ELSE '❌ FAIL (' || count(*) || '/15)'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'user_roles', 'businesses', 'business_branches',
    'business_reviews', 'business_comments', 'order_requests',
    'points_log', 'standing_events', 'notifications', 'trust_events',
    'business_contact_methods', 'merchant_order_settings', 'offers',
    'business_follows'
  )
  AND rowsecurity = true;

-- ─── 14. Demo offers ───
SELECT
  '14. Demo offer' AS category,
  'At least 1 published offer exists' AS check,
  CASE WHEN count(*) >= 1 THEN '✅ OK (' || count(*) || ')' ELSE '⚠️ NONE' END AS status
FROM public.offers WHERE is_published = true;

-- ─── 15. Standings events log ───
SELECT
  '15. Standing events' AS category,
  'At least 1 standing event logged' AS check,
  CASE WHEN count(*) >= 1 THEN '✅ OK (' || count(*) || ')' ELSE '⚠️ NONE' END AS status
FROM public.standing_events;

-- ─── 16. Recent errors ───
SELECT
  '16. Recent errors' AS category,
  'No unresolved critical errors in last 24h' AS check,
  CASE
    WHEN count(*) = 0 THEN '✅ OK'
    ELSE '⚠️ ' || count(*) || ' unresolved'
  END AS status
FROM public.system_errors
WHERE resolved_at IS NULL
  AND severity IN ('high', 'critical')
  AND created_at > now() - interval '24 hours';
