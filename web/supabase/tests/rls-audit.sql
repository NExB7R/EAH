-- ============================================================
-- EAH — RLS Audit (Comprehensive)
-- يفحص كل الجداول + السياسات + الأعمدة الحساسة
-- آخر تحديث: 2026-10-07
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
  proname AS detail,
  'HIGH: search_path ناقص' AS issue
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND prosecdef = true
  AND proconfig IS NULL;

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
