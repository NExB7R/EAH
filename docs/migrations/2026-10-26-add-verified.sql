-- ═══════════════════════════════════════════════════════════
-- EAH — Add is_verified to businesses
-- Enables admin "blue checkmark" verification
-- ═══════════════════════════════════════════════════════════

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

-- Index for filter queries
CREATE INDEX IF NOT EXISTS idx_businesses_verified
  ON businesses(is_verified) WHERE is_verified = true;

COMMENT ON COLUMN businesses.is_verified IS 'موثق من EAH يدوياً — شهادة admin';
COMMENT ON COLUMN businesses.verified_at IS 'متى تم التوثيق';
COMMENT ON COLUMN businesses.verified_by IS 'الأدمن اللي وثّق';
