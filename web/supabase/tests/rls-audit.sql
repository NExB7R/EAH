-- ============================================================
-- EAH — RLS Audit (Comprehensive)
-- يفحص كل الجداول + السياسات + الأعمدة الحساسة
-- آخر تحديث: 2026-10-29
-- ============================================================

-- ============================================================
-- 1. جداول بدون RLS (CRITICAL)
-- ============================================================
SELECT
  '1_no_rls' AS check_name,
  schemaname || '.' || tablename AS detail,
  'CRITICAL: RLS معطّل' AS issue
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys');

-- ============================================================
-- 2. سياسات USING (true) — خطر
-- ============================================================
SELECT
  '2_using_true' AS check_name,
  schemaname || '.' || tablename || '.' || policyname AS detail,
  'CRITICAL: USING (true)' AS issue
FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
  AND cmd IN ('SELECT', 'UPDATE', 'DELETE');

-- ============================================================
-- 3. INSERT policies بدون WITH CHECK
-- ============================================================
SELECT
  '3_no_check' AS check_name,
  schemaname || '.' || tablename || '.' || policyname AS detail,
  'HIGH: مفيش WITH CHECK' AS issue
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'INSERT'
  AND with_check IS NULL;

-- ============================================================
-- 4. جداول public.readable — تأكيد مقصود
-- ============================================================
SELECT
  '4_public_reads' AS check_name,
  tablename AS detail,
  'INFO: قراءة عامة' AS issue
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'SELECT'
  AND qual LIKE '%true%'
  AND tablename IN ('businesses', 'business_reviews', 'offers', 'announcements', 'ad_slots')
ORDER BY tablename;

-- ============================================================
-- 5. الأعمدة الحساسة — تأكد REVOKE
-- ============================================================
SELECT
  '5_sensitive_cols' AS check_name,
  table_name || '.' || column_name AS detail,
  'INFO: عمود حساس' AS issue
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('phone', 'phone_e164', 'email')
ORDER BY table_name, column_name;

-- ============================================================
-- 6. جداول مستخدمين بلا owner check
-- ============================================================
SELECT
  '6_user_tables' AS check_name,
  c.relname AS detail,
  'INFO: جدول مستخدمين' AS issue
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'profiles', 'notifications', 'favorites', 'business_follows',
    'points_log', 'business_subscriptions', 'push_subscriptions',
    'referrals', 'order_requests'
  )
  AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = c.relname
      AND column_name IN ('user_id', 'profile_id', 'customer_profile_id', 'owner_profile_id')
  )
ORDER BY c.relname;

-- ============================================================
-- 7. Functions SECURITY DEFINER بدون search_path
-- ============================================================
SELECT
  '7_definer_no_path' AS check_name,
  format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) AS detail,
  'HIGH: search_path ناقص' AS issue
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'private')
  AND p.prosecdef = true
  AND NOT EXISTS (
    SELECT 1
    FROM unnest(coalesce(p.proconfig, ARRAY[]::text[])) AS setting
    WHERE setting LIKE 'search_path=%'
  );

-- ============================================================
-- 8. ملخص عدد السياسات لكل جدول
-- ============================================================
SELECT
  '8_policy_count' AS check_name,
  tablename AS detail,
  COUNT(*)::text || ' policies' AS issue
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================
-- 9. RLS enabled with no policies (do not add public policies
--    automatically; classify each table as private/internal first)
-- ============================================================
SELECT
  '9_rls_no_policy' AS check_name,
  n.nspname || '.' || c.relname AS detail,
  'REVIEW: RLS enabled but no policies exist' AS issue
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies AS p
    WHERE p.schemaname = n.nspname AND p.tablename = c.relname
  )
ORDER BY c.relname;

-- ============================================================
-- 10. Anon-callable SECURITY DEFINER RPCs (review each; some
--     public telemetry/search RPCs are intentionally exposed)
-- ============================================================
SELECT
  '10_anon_security_definer' AS check_name,
  format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) AS detail,
  'REVIEW: anon can execute SECURITY DEFINER function' AS issue
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'private')
  AND p.prosecdef = true
  AND has_function_privilege('anon', p.oid, 'EXECUTE')
ORDER BY n.nspname, p.proname;

-- ============================================================
-- 11. Foreign keys missing a leading-column index
-- ============================================================
WITH foreign_key_columns AS (
  SELECT
    con.conrelid AS table_oid,
    con.conname,
    con.conkey,
    con.conrelid::regclass AS table_name,
    array_agg(att.attname ORDER BY k.ord) AS column_names
  FROM pg_constraint AS con
  JOIN pg_namespace AS n ON n.oid = con.connamespace
  JOIN unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
  JOIN pg_attribute AS att ON att.attrelid = con.conrelid AND att.attnum = k.attnum
  WHERE con.contype = 'f' AND n.nspname = 'public'
  GROUP BY con.oid, con.conrelid, con.conname, con.conkey
)
SELECT
  '11_fk_missing_index' AS check_name,
  format('%s.%s (%s)', fk.table_name, fk.conname, array_to_string(fk.column_names, ', ')) AS detail,
  'REVIEW: foreign key has no covering leading-column index' AS issue
FROM foreign_key_columns AS fk
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_index AS i
  WHERE i.indrelid = fk.table_oid
    AND i.indisvalid
    AND i.indisready
    AND (i.indkey::int2[])[0:array_length(fk.conkey, 1) - 1] @> fk.conkey
)
ORDER BY fk.table_name, fk.conname;
