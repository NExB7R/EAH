-- ═══════════════════════════════════════════════════════════════════
-- EAH — EMPTY-01 + CONFLICT-01: drop confirmed-empty tables
-- Date: 2026-10-23
-- Reviewer: owner (run manually after backup)
-- ═══════════════════════════════════════════════════════════════════
--
-- Tables targeted (must be empty at run time — otherwise aborts):
--   site_designs         — EMPTY-01 (experimental puck residue)
--   business_commissions — CONFLICT-01 (duplicate of commission model)
--   live_page_sessions   — EMPTY-01 (unused live sessions)
--   ads                  — EMPTY-01 (ads moved to platform_announcements)
--   rate_limits          — EMPTY-01 (replaced by Redis Upstash)
--
-- Safety: each table is verified empty before DROP. If ANY row exists,
-- the whole block raises an exception and rolls back — no partial drop.
--
-- Rollback: not required — DROP on empty tables is reversible only via
--           re-creation from schema (see docs/migrations/ for CREATE history).
--           Backup DB before running: `supabase db dump > backup-$(date).sql`
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl   TEXT;
  cnt   BIGINT;
  total BIGINT := 0;
  tables_to_drop TEXT[] := ARRAY[
    'site_designs',
    'business_commissions',
    'live_page_sessions',
    'ads',
    'rate_limits'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_drop
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl) INTO cnt;
      IF cnt > 0 THEN
        RAISE EXCEPTION 'ABORT: table % contains % rows (must be empty)', tbl, cnt;
      END IF;
      EXECUTE format('DROP TABLE public.%I CASCADE', tbl);
      RAISE NOTICE '✓ Dropped %', tbl;
      total := total + 1;
    ELSE
      RAISE NOTICE '– Skipped % (does not exist)', tbl;
    END IF;
  END LOOP;

  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'Migration complete: % table(s) dropped', total;
  RAISE NOTICE '════════════════════════════════════════';
END $$;

-- Verification queries (run after migration):
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN ('site_designs','business_commissions','live_page_sessions','ads','rate_limits');
-- Expected: 0 rows.
