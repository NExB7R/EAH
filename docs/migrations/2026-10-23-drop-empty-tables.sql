-- ═══════════════════════════════════════════════════════════════════
-- EAH — EMPTY-01 + CONFLICT-01 (v3 — SAFE FINAL)
-- Date: 2026-10-23
--
-- v3 drops only 3 confirmed-dead tables. Excludes:
--   - site_designs (LIVE home page — has 1 row key=home)
--   - ads           (still referenced in 12+ code locations — needs feature removal first)
--   - ad_stats_daily (0 rows, orphaned — harmless, drop later with ads)
--
-- Deferred: removing `ads` + `ad_stats_daily` requires code cleanup in
-- merchant/ads, admin/ads, api/admin/export, lib/data/ads. See §12.
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl   TEXT;
  cnt   BIGINT;
  total BIGINT := 0;
  tables_to_drop TEXT[] := ARRAY[
    'business_commissions',
    'live_page_sessions',
    'rate_limits'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_drop LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema='public' AND table_name=tbl
    ) THEN
      RAISE NOTICE 'Skipped % (does not exist)', tbl;
      CONTINUE;
    END IF;

    EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl) INTO cnt;
    IF cnt > 0 THEN
      RAISE EXCEPTION 'ABORT: % has % rows (must be empty)', tbl, cnt;
    END IF;

    EXECUTE format('DROP TABLE public.%I', tbl);
    RAISE NOTICE 'Dropped %', tbl;
    total := total + 1;
  END LOOP;

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Migration complete: % table(s) dropped', total;
  RAISE NOTICE 'SKIPPED: site_designs (live), ads (in code), ad_stats_daily (orphan)';
  RAISE NOTICE '----------------------------------------';
END $$;

-- Verification (run after):
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN ('business_commissions','live_page_sessions','rate_limits');
-- Expected: 0 rows.
--
-- SELECT key FROM site_designs;                          -- home
-- SELECT COUNT(*) FROM ads;                              -- 0 (kept, in code)
-- SELECT COUNT(*) FROM ad_stats_daily;                   -- 0 (orphan, kept)
