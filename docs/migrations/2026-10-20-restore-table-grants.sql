-- ═══════════════════════════════════════════════════════════
-- 2026-10-20 — Restore missing GRANTs (Supabase 2026 behavior)
-- ═══════════════════════════════════════════════════════════
-- Supabase stopped auto-granting privileges on new public tables.
-- Result: business_follows, customer_locations, coupons,
-- promo_posts, business_activities return "permission denied".
-- RLS policies remain the security boundary (row-level).
--
-- `business_subscriptions` already has SELECT — adds write perms.
--
-- Safe to re-run (idempotent). Uses per-table BEGIN/EXCEPTION
-- so missing tables don't abort the migration.
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  t text;
  crud_tables text[] := ARRAY[
    'business_follows',
    'customer_locations',
    'coupons',
    'promo_posts',
    'business_activities'
  ];
  write_tables text[] := ARRAY[
    'business_subscriptions'
  ];
BEGIN
  -- Full CRUD (RLS enforces row-level access)
  FOREACH t IN ARRAY crud_tables LOOP
    BEGIN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
      RAISE NOTICE 'CRUD granted: %', t;
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'skipped (not exist): %', t;
    END;
  END LOOP;

  -- Write perms only (SELECT already exists)
  FOREACH t IN ARRAY write_tables LOOP
    BEGIN
      EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
      RAISE NOTICE 'write granted: %', t;
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'skipped (not exist): %', t;
    END;
  END LOOP;
END $$;

-- anon SELECT for public-facing tables (pricing, coupons browse)
DO $$
DECLARE
  t text;
  anon_read text[] := ARRAY[
    'business_subscriptions',
    'coupons',
    'promo_posts'
  ];
BEGIN
  FOREACH t IN ARRAY anon_read LOOP
    BEGIN
      EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
      RAISE NOTICE 'anon SELECT granted: %', t;
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'skipped (missing): %', t;
    END;
  END LOOP;
END $$;

-- Sequences (needed if any table uses serial PKs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
