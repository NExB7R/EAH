-- ═══════════════════════════════════════════════════════════
-- 2026-10-19 — Fix missing GRANTs for authenticated role
-- ═══════════════════════════════════════════════════════════
-- Root cause: Supabase 2026 stopped auto-granting on new public tables.
-- Result: order_requests + others return "permission denied".
--
-- Scope: ONLY tables missing grants (verified via diagnostic).
-- Already-granted tables are NOT touched.
-- `profiles` is EXCLUDED on purpose — it has column-level grants
-- (from 2026-10-08-security-hardening.sql) that protect privacy.
-- Table-level GRANT on profiles would break that.
--
-- Safe to re-run (idempotent).
-- ═══════════════════════════════════════════════════════════

-- ─── USER-FACING: full CRUD via RLS ───
-- (only tables confirmed missing from DB)
DO $$
DECLARE
  tables text[] := ARRAY[
    'order_requests',
    'follows',
    'business_comments',
    'comment_likes',
    'comment_thread_follows',
    'engagement_events'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
      RAISE NOTICE 'granted CRUD: %', t;
    ELSE
      RAISE NOTICE 'skipped (missing): %', t;
    END IF;
  END LOOP;
END $$;

-- ─── USER-FACING: read-mostly (SELECT only) ───
-- (only tables confirmed missing from DB)
DO $$
DECLARE
  tables text[] := ARRAY[
    'business_branches',
    'advertisements',
    'business_subscriptions',
    'business_types'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
      EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
      RAISE NOTICE 'granted SELECT: %', t;
    ELSE
      RAISE NOTICE 'skipped (missing): %', t;
    END IF;
  END LOOP;
END $$;

-- ─── Sequences (for INSERT with serial PKs) ───
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
