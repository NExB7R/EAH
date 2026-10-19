-- ═══════════════════════════════════════════════════════════
-- 2026-10-19 — Custom business type + pending approval
-- ═══════════════════════════════════════════════════════════
-- Goal: allow merchants/admins to enter a custom business type
-- (e.g. "ماركت", "حلاق", "جيم"). New types need admin approval
-- before the business becomes visible in /explore.
--
-- Columns:
--   custom_business_type TEXT      — the typed value
--   business_type_status TEXT      — 'approved' | 'pending'
--   business_type_approved_at TIMESTAMPTZ
--
-- Rules:
--   - business_type='misc' + custom_business_type != null
--     → business_type_status = 'pending' (needs approval)
--   - All others → 'approved' (auto)
--   - is_published forced false if pending
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS custom_business_type TEXT,
  ADD COLUMN IF NOT EXISTS business_type_status TEXT DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS business_type_approved_at TIMESTAMPTZ;

-- check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'businesses_business_type_status_check'
  ) THEN
    ALTER TABLE public.businesses
      ADD CONSTRAINT businesses_business_type_status_check
      CHECK (business_type_status IN ('approved', 'pending'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_businesses_type_status
  ON public.businesses (business_type_status)
  WHERE business_type_status = 'pending';

-- Default: أي نشاط جديد = approved (الأنواع الأساسية)
UPDATE public.businesses
  SET business_type_status = 'approved'
  WHERE business_type_status IS NULL;

-- ═══════════════════════════════════════════════════════════
-- Verification
-- ═══════════════════════════════════════════════════════════
-- SELECT business_type, business_type_status, count(*)
-- FROM businesses GROUP BY 1, 2;
