-- ═══════════════════════════════════════════════════════════
-- EAH — Add logo_url to businesses
-- يضيف عمود اللوجو (صورة مربعة صغيرة) بشكل منفصل عن الغلاف
-- ═══════════════════════════════════════════════════════════

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url text;

-- إن كان جدول business_media موجود، ننسخ اللوجوهات الحالية
UPDATE businesses b
SET logo_url = (
  SELECT storage_path FROM business_media
  WHERE business_id = b.id AND media_type = 'logo' AND is_published = true
  LIMIT 1
)
WHERE b.logo_url IS NULL;

COMMENT ON COLUMN businesses.logo_url IS 'صورة اللوجو (مربعة) — تُعرض في الكارد الرئيسي';
