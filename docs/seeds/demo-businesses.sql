-- EAH — Demo Businesses for Visual Testing
-- Purpose: Populate missing sections (Featured, Offers, New) for UI review.
-- Safe to re-run (idempotent by slug).

BEGIN;

-- 1. نشاط مميز (Featured + New)
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, city, address_text, is_published, is_featured, is_open,
  working_hours, created_at
) VALUES (
  'demo-featured-restaurant', 'مطعم البركة (تجريبي)', 'restaurant',
  'أكل بيتي مصري أصيل، مشويات، وكشري.',
  'أحلى كشري في شبين',
  'شبين القناطر', 'شبين القناطر', 'شارع الجيش، أمام البنك',
  true, true, true, '{"sat":{"open":"10:00","close":"23:00"}}'::jsonb,
  now() - interval '2 days'
) ON CONFLICT (slug) DO NOTHING;

-- 2. نشاط جديد (New + Nearby)
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, city, address_text, is_published, is_featured, is_open,
  working_hours, created_at
) VALUES (
  'demo-new-pharmacy', 'صيدلية النور (تجريبي)', 'pharmacy',
  'صيدلية 24 ساعة، أدوية ومستلزمات طبية.',
  'دواء على مدار الساعة',
  'شبين القناطر', 'شبين القناطر', 'شارع المحطة',
  true, false, true, '{"sat":{"open":"00:00","close":"23:59"}}'::jsonb,
  now() - interval '1 day'
) ON CONFLICT (slug) DO NOTHING;

-- 3. نشاط ثالث (Trending)
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, city, address_text, is_published, is_featured, is_open,
  working_hours, created_at
) VALUES (
  'demo-trending-market', 'ماركت الأسرة (تجريبي)', 'misc',
  'بقالة وميني ماركت، كل احتياجات البيت.',
  'كل حاجة تحتاجها',
  'شبين القناطر', 'شبين القناطر', 'شارع المستشفى',
  true, false, true, '{"sat":{"open":"08:00","close":"22:00"}}'::jsonb,
  now() - interval '5 days'
) ON CONFLICT (slug) DO NOTHING;

-- 4. عرض تجريبي (عشان قسم Offers يظهر)
INSERT INTO public.offers (
  business_id, title, description, discount_type, discount_value, code,
  starts_at, ends_at, is_active
)
SELECT
  b.id, 'خصم 20% على أول طلب (تجريبي)', 'عرض افتتاحي لأول طلب من المطعم.',
  'percent', 20, 'DEMO20',
  now(), now() + interval '7 days', true
FROM public.businesses b
WHERE b.slug = 'demo-featured-restaurant'
  AND NOT EXISTS (SELECT 1 FROM public.offers o WHERE o.business_id = b.id)
LIMIT 1;

COMMIT;
