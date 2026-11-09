-- ═══════════════════════════════════════════════════════════
-- EAH — Launch Verification (Unified Query)
-- Run once in Supabase SQL Editor — shows ALL 16 checks.
-- ═══════════════════════════════════════════════════════════

WITH checks AS (
  SELECT '1. Test accounts'::text AS category,
    '4 accounts exist'::text AS check,
    CASE WHEN count(*) = 4 THEN '✅ OK' ELSE '❌ FAIL (' || count(*) || '/4)' END::text AS status
  FROM auth.users WHERE email IN ('customer1@eah.test', 'customer2@eah.test', 'merchant1@eah.test', 'merchant2@eah.test')

  UNION ALL

  SELECT '2. Demo businesses', '3 demo businesses exist',
    CASE WHEN count(*) >= 3 THEN '✅ OK (' || count(*) || ')' ELSE '❌ FAIL (' || count(*) || ')' END
  FROM public.businesses WHERE slug LIKE 'demo-%'

  UNION ALL

  SELECT '3. Branches coverage', 'No published business without primary branch',
    CASE WHEN count(*) = 0 THEN '✅ OK' ELSE '❌ FAIL (' || count(*) || ' orphans)' END
  FROM public.businesses b
  WHERE b.is_published = true
    AND NOT EXISTS (SELECT 1 FROM public.business_branches bb WHERE bb.business_id = b.id AND bb.is_primary = true)

  UNION ALL

  SELECT '4. Owner uniqueness', 'No account owns multiple businesses',
    CASE WHEN count(*) = 0 THEN '✅ OK' ELSE '❌ FAIL (' || count(*) || ' duplicate owners)' END
  FROM (SELECT owner_profile_id FROM public.businesses WHERE owner_profile_id IS NOT NULL GROUP BY owner_profile_id HAVING count(*) > 1) dup

  UNION ALL

  SELECT '5. customer1 active', 'customer1 has standing=good, points>=100',
    CASE WHEN p.standing = 'good' AND (SELECT COALESCE(SUM(delta),0) FROM points_log WHERE user_id = p.id) >= 100
      THEN '✅ OK' ELSE '❌ FAIL (standing=' || COALESCE(p.standing,'null') || ')' END
  FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'customer1@eah.test'

  UNION ALL

  SELECT '6. customer2 restricted', 'customer2 has standing=restricted',
    CASE WHEN p.standing = 'restricted' THEN '✅ OK' ELSE '❌ FAIL (standing=' || COALESCE(p.standing, 'null') || ')' END
  FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'customer2@eah.test'

  UNION ALL

  SELECT '7. customer1 orders', 'customer1 has >=2 delivered orders',
    CASE WHEN count(*) >= 2 THEN '✅ OK (' || count(*) || ')' ELSE '⚠️ LOW (' || count(*) || ')' END
  FROM public.order_requests o JOIN auth.users u ON u.id = o.customer_profile_id
  WHERE u.email = 'customer1@eah.test' AND o.status = 'delivered'

  UNION ALL

  SELECT '8. customer1 reviews', 'customer1 has >=2 approved reviews',
    CASE WHEN count(*) >= 2 THEN '✅ OK (' || count(*) || ')' ELSE '⚠️ LOW (' || count(*) || ')' END
  FROM public.business_reviews r JOIN auth.users u ON u.id = r.user_id
  WHERE u.email = 'customer1@eah.test' AND r.status = 'approved'

  UNION ALL

  SELECT '9. Standing RPC', 'can_interact function exists',
    CASE WHEN count(*) = 1 THEN '✅ OK' ELSE '❌ FAIL' END
  FROM pg_proc WHERE proname = 'can_interact'

  UNION ALL

  SELECT '10. Autopilot trigger', 'trigger_autopilot_penalties enabled',
    CASE WHEN count(*) = 1 THEN '✅ OK' ELSE '❌ FAIL' END
  FROM pg_trigger WHERE tgname = 'trigger_autopilot_penalties' AND tgenabled = 'O'

  UNION ALL

  SELECT '11. Contact privacy', 'No public phone/whatsapp in contact_methods',
    CASE WHEN count(*) = 0 THEN '✅ OK' ELSE '❌ LEAK (' || count(*) || ' exposed)' END
  FROM public.business_contact_methods WHERE is_public = true AND method_type IN ('phone', 'whatsapp')

  UNION ALL

  SELECT '12. Review trigger', 'notify_merchant uses notification_type',
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_merchant_on_review' AND prosrc LIKE '%notification_type%')
      THEN '✅ OK' ELSE '❌ FAIL (old schema)' END

  UNION ALL

  SELECT '13. RLS coverage', 'RLS enabled on all 15 critical tables',
    CASE WHEN count(*) = 15 THEN '✅ OK (15/15)' ELSE '❌ FAIL (' || count(*) || '/15)' END
  FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN ('profiles','user_roles','businesses','business_branches','business_reviews','business_comments','order_requests','points_log','standing_events','notifications','trust_events','business_contact_methods','merchant_order_settings','offers','business_follows')
    AND rowsecurity = true

  UNION ALL

  SELECT '14. Demo offer', 'At least 1 published offer exists',
    CASE WHEN count(*) >= 1 THEN '✅ OK (' || count(*) || ')' ELSE '⚠️ NONE' END
  FROM public.offers WHERE is_published = true

  UNION ALL

  SELECT '15. Standing events', 'At least 1 standing event logged',
    CASE WHEN count(*) >= 1 THEN '✅ OK (' || count(*) || ')' ELSE '⚠️ NONE' END
  FROM public.standing_events

  UNION ALL

  SELECT '16. Recent errors', 'No unresolved critical errors (24h)',
    CASE WHEN count(*) = 0 THEN '✅ OK' ELSE '⚠️ ' || count(*) || ' unresolved' END
  FROM public.system_errors WHERE resolved_at IS NULL AND severity IN ('high','critical') AND created_at > now() - interval '24 hours'
)
SELECT category, check, status FROM checks ORDER BY category;
