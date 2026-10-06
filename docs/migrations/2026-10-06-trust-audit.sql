-- ═══════════════════════════════════════════════════════════
-- EAH — Trust System Audit (كامل — مرة واحدة)
-- ═══════════════════════════════════════════════════════════

-- 1) دوال Trust موجودة (أسماء + arguments + body)
SELECT
  '1_FUNCTION' AS section,
  p.proname AS name,
  pg_get_function_arguments(p.oid) AS args,
  pg_get_functiondef(p.oid) AS body
FROM pg_proc p
WHERE p.pronamespace = 'public'::regnamespace
  AND (p.proname LIKE '%trust%' OR p.proname LIKE '%impact%' OR p.proname LIKE '%tier%')
ORDER BY p.proname;

-- 2) Triggers على profiles + business_reviews + order_requests
SELECT
  '2_TRIGGER' AS section,
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS op,
  action_statement AS fn
FROM information_schema.triggers
WHERE event_object_table IN ('profiles', 'business_reviews', 'order_requests', 'business_activities')
ORDER BY event_object_table, trigger_name;

-- 3) أعمدة Trust في profiles + businesses
SELECT
  '3_COLUMN' AS section,
  table_name,
  column_name,
  column_default,
  data_type
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('profiles', 'businesses')
  AND (column_name LIKE '%trust%' OR column_name LIKE '%impact%' OR column_name LIKE '%wanted%')
ORDER BY table_name, column_name;

-- 4) توزيع trust_score الحالي
SELECT
  '4_DIST' AS section,
  'profiles' AS tbl,
  COUNT(*) FILTER (WHERE trust_score < 20) AS s_0_19,
  COUNT(*) FILTER (WHERE trust_score >= 20 AND trust_score < 40) AS s_20_39,
  COUNT(*) FILTER (WHERE trust_score >= 40 AND trust_score < 60) AS s_40_59,
  COUNT(*) FILTER (WHERE trust_score >= 60 AND trust_score < 80) AS s_60_79,
  COUNT(*) FILTER (WHERE trust_score >= 80) AS s_80_100
FROM public.profiles
UNION ALL
SELECT
  '4_DIST',
  'businesses',
  COUNT(*) FILTER (WHERE trust_score < 20),
  COUNT(*) FILTER (WHERE trust_score >= 20 AND trust_score < 40),
  COUNT(*) FILTER (WHERE trust_score >= 40 AND trust_score < 60),
  COUNT(*) FILTER (WHERE trust_score >= 60 AND trust_score < 80),
  COUNT(*) FILTER (WHERE trust_score >= 80)
FROM public.businesses;

-- 5) عينة trust_tier الحالية
SELECT
  '5_TIER' AS section,
  'profiles' AS tbl,
  trust_tier AS tier,
  COUNT(*) AS count
FROM public.profiles
GROUP BY trust_tier
UNION ALL
SELECT
  '5_TIER',
  'businesses',
  trust_tier,
  COUNT(*)
FROM public.businesses
GROUP BY trust_tier;
