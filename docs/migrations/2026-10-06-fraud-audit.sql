SELECT 'INDEX' AS kind, tablename AS a, indexname AS b, indexdef AS info
FROM pg_indexes WHERE tablename IN ('business_reviews','business_activities')
UNION ALL
SELECT 'PROFILE_COL', column_name, COALESCE(column_default,''), data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles'
  AND column_name IN ('trust_score','trust_tier','wanted_level','impact_score','trust_updated_at')
UNION ALL
SELECT 'TRIGGER', event_object_table, trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table IN ('business_reviews','business_activities','order_requests','favorites','business_follows')
UNION ALL
SELECT 'TE_COL', column_name, data_type, ''
FROM information_schema.columns
WHERE table_schema='public' AND table_name='trust_events'
UNION ALL
SELECT 'CR_COL', column_name, data_type, ''
FROM information_schema.columns
WHERE table_schema='public' AND table_name='contact_reveals'
UNION ALL
SELECT 'FUNC', proname, '', ''
FROM pg_proc
WHERE pronamespace='public'::regnamespace
  AND (proname LIKE '%trust%' OR proname LIKE '%fraud%' OR proname LIKE '%velocity%'
       OR proname LIKE '%ban%' OR proname LIKE '%flag%' OR proname LIKE '%detect%')
UNION ALL
SELECT 'ACT', activity_type, COUNT(*)::text, ''
FROM public.business_activities
GROUP BY activity_type
ORDER BY 1, 2;
