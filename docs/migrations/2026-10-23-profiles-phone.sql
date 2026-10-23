-- ═══════════════════════════════════════════════════════════════════
-- EAH — Add phone column to profiles (idempotent)
-- Date: 2026-10-23
-- Purpose: enable prefilling customer phone in order modal
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone text;

CREATE INDEX IF NOT EXISTS idx_profiles_phone
  ON profiles(phone) WHERE phone IS NOT NULL;

COMMIT;

-- Verification:
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='profiles' AND column_name='phone';
-- Expected: 1 row
