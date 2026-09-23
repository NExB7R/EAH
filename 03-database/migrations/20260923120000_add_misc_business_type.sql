-- ═══════════════════════════════════════════════════════════════
-- EAH — Add 'misc' to business_type + sub-categories
-- Date: 2026-09-23
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Drop existing check constraint if exists ───
DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'businesses'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%business_type%';

  IF cname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE businesses DROP CONSTRAINT ' || quote_ident(cname);
    RAISE NOTICE 'Dropped constraint: %', cname;
  END IF;
END $$;

-- ─── 2. Add new check with 5 types ───
ALTER TABLE businesses
  ADD CONSTRAINT businesses_business_type_check
  CHECK (business_type IN ('restaurant', 'pharmacy', 'supermarket', 'delivery_office', 'misc'));

-- ─── 3. Add sub_category column for misc ───
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS sub_category text;

-- ─── 4. Index for sub_category ───
CREATE INDEX IF NOT EXISTS idx_businesses_sub_category
  ON businesses(sub_category)
  WHERE sub_category IS NOT NULL;

-- ─── 5. Comment ───
COMMENT ON COLUMN businesses.sub_category IS
  'For misc businesses: vegetables, meat, fish, grocery, dairy, bakery, sweets, spices, baking, cleaning, kitchen, home, clothes, shoes, other';

-- ═══════════════════════════════════════════════════════════════
-- Verify: SELECT business_type, COUNT(*) FROM businesses GROUP BY business_type;
-- ═══════════════════════════════════════════════════════════════
