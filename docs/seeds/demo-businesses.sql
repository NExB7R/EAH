-- EAH — Demo Businesses for Visual Testing (v3 — full schema)
-- Populates: Featured, New, Trending, Offers sections.
-- Safe to re-run (idempotent by slug).

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 1. نشاط مميز (Featured) — مطعم
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, city, address_text, is_published, is_featured, is_open,
  is_new_project, working_hours, featured_until, new_until,
  created_at
) VALUES (
  'demo-featured-restaurant',
  'مطعم البركة (تجريبي)',
  'restaurant',
  'أكل بيتي مصري أصيل، مشويات، وكشري.',
  'أحلى كشري في شبين',
  'شبين القناطر', 'شبين القناطر', 'شارع الجيش، أمام البنك',
  true, true, true, false,
  '{"sat":{"open":"10:00","close":"23:00"},"sun":{"open":"10:00","close":"23:00"}}'::jsonb,
  now() + interval '30 days',
  NULL,
  now() - interval '2 days'
) ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- 2. نشاط جديد (New) — صيدلية
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, city, address_text, is_published, is_featured, is_open,
  is_new_project, working_hours, featured_until, new_until,
  created_at
) VALUES (
  'demo-new-pharmacy',
  'صيدلية النور (تجريبي)',
  'pharmacy',
  'صيدلية 24 ساعة، أدوية ومستلزمات طبية.',
  'دواء على مدار الساعة',
  'شبين القناطر', 'شبين القناطر', 'شارع المحطة',
  true, false, true, true,
  '{"sat":{"open":"00:00","close":"23:59"},"sun":{"open":"00:00","close":"23:59"}}'::jsonb,
  NULL,
  now() + interval '30 days',
  now() - interval '1 day'
) ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- 3. نشاط ثالث (Trending/Nearby) — ماركت
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, city, address_text, is_published, is_featured, is_open,
  is_new_project, working_hours, featured_until, new_until,
  created_at
) VALUES (
  'demo-trending-market',
  'ماركت الأسرة (تجريبي)',
  'misc',
  'بقالة وميني ماركت، كل احتياجات البيت.',
  'كل حاجة تحتاجها',
  'شبين القناطر', 'شبين القناطر', 'شارع المستشفى',
  true, false, true, false,
  '{"sat":{"open":"08:00","close":"22:00"}}'::jsonb,
  NULL, NULL,
  now() - interval '5 days'
) ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- 4. فرع أساسي لكل نشاط (مطلوب للـ FeaturedBento والـ NearbyGrid)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.business_branches (
  business_id, name, area, address_text, is_primary, is_active,
  working_hours
)
SELECT
  b.id, b.name, b.area, b.address_text, true, true,
  b.working_hours
FROM public.businesses b
WHERE b.slug IN ('demo-featured-restaurant', 'demo-new-pharmacy', 'demo-trending-market')
  AND NOT EXISTS (
    SELECT 1 FROM public.business_branches bb
    WHERE bb.business_id = b.id AND bb.is_primary = true
  );

-- ═══════════════════════════════════════════════════════════
-- 5. عرض تجريبي (Offers section) — باستخدام الأعمدة الفعلية
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.offers (
  business_id, title, description, price,
  starts_at, ends_at, is_published
)
SELECT
  b.id,
  'خصم 20% على أول طلب (تجريبي)',
  'عرض افتتاحي لأول طلب من المطعم.',
  50,
  now(),
  now() + interval '7 days',
  true
FROM public.businesses b
WHERE b.slug = 'demo-featured-restaurant'
  AND NOT EXISTS (SELECT 1 FROM public.offers o WHERE o.business_id = b.id)
LIMIT 1;

COMMIT;
