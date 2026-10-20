-- ═══════════════════════════════════════════════════════════════
-- EAH — Business Enhancements for First Launch
-- 2026-10-20
-- 
-- Changes:
--   1. business_contact_methods.method_type: add 'complaints'
--   2. businesses: open_now_override, important_notice + expiry + severity
-- 
-- Rollback (if needed):
--   ALTER TABLE businesses DROP COLUMN IF EXISTS open_now_override;
--   ALTER TABLE businesses DROP COLUMN IF EXISTS important_notice;
--   ALTER TABLE businesses DROP COLUMN IF EXISTS notice_expires_at;
--   ALTER TABLE businesses DROP COLUMN IF EXISTS notice_severity;
--   (contact_type 'complaints' rows must be deleted before reverting CHECK)
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. contact_methods: add 'complaints' type ───
-- Safe: handles both ENUM and CHECK constraint cases.
DO $$
DECLARE
  has_enum boolean;
  has_check boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname IN ('contact_method_type', 'business_contact_method_type')
  ) INTO has_enum;

  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'business_contact_methods'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%method_type%'
  ) INTO has_check;

  IF has_enum THEN
    BEGIN
      ALTER TYPE contact_method_type ADD VALUE IF NOT EXISTS 'complaints';
    EXCEPTION WHEN undefined_object THEN
      BEGIN
        ALTER TYPE business_contact_method_type ADD VALUE IF NOT EXISTS 'complaints';
      EXCEPTION WHEN undefined_object THEN
        NULL; -- silent
      END;
    END;
  ELSIF has_check THEN
    ALTER TABLE business_contact_methods
      DROP CONSTRAINT IF EXISTS business_contact_methods_method_type_check;
    ALTER TABLE business_contact_methods
      ADD CONSTRAINT business_contact_methods_method_type_check
      CHECK (method_type IN ('phone','whatsapp','facebook','instagram','website','complaints'));
  END IF;
END $$;

-- ─── 2. businesses: open override + notice ───
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS open_now_override boolean DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS important_notice text,
  ADD COLUMN IF NOT EXISTS notice_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS notice_severity text DEFAULT 'info';

-- notice_severity CHECK (safe re-add)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'businesses' AND c.conname = 'businesses_notice_severity_check'
  ) THEN
    ALTER TABLE businesses
      ADD CONSTRAINT businesses_notice_severity_check
      CHECK (notice_severity IN ('info','warning','critical'));
  END IF;
END $$;

-- ─── 3. comments for future developers ───
COMMENT ON COLUMN businesses.open_now_override IS 
  'NULL = auto from working_hours; FALSE = manually closed (temporary); TRUE = manually open';
COMMENT ON COLUMN businesses.important_notice IS 
  'Critical message shown prominently on the business page (e.g., emergency closure, delay)';
COMMENT ON COLUMN businesses.notice_expires_at IS 
  'Auto-hide notice after this timestamp. NULL = no expiry';
COMMENT ON COLUMN businesses.notice_severity IS 
  'info = neutral, warning = amber, critical = red';

-- ─── 4. Verify ───
-- Run separately to check:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'businesses' 
--   AND column_name IN ('open_now_override','important_notice','notice_expires_at','notice_severity');
