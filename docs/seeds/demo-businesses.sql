-- EAH — Demo Businesses for Visual Testing (v2 — schema-accurate)
-- Purpose: Populate missing sections (Featured, Offers, New) for UI review.
-- Safe to re-run (idempotent by slug).
-- Based on actual columns from lib/data/* (verified).

BEGIN;

-- 1. نشاط 1: مطعم (للقسم المميز)
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, is_published, created_at
) VALUES (
  'demo-featured-restaurant',
  'مطعم البركة (تجريبي)',
  'restaurant',
  'أكل بيتي مصري أصيل، مشويات، وكشري.',
  'أحلى كشري في شبين',
  'شبين القناطر',
  true,
  now() - interval '2 days'
) ON CONFLICT (slug) DO NOTHING;

-- 2. نشاط 2: صيدلية (لقسم الجديد)
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, is_published, created_at
) VALUES (
  'demo-new-pharmacy',
  'صيدلية النور (تجريبي)',
  'pharmacy',
  'صيدلية 24 ساعة، أدوية ومستلزمات طبية.',
  'دواء على مدار الساعة',
  'شبين القناطر',
  true,
  now() - interval '1 day'
) ON CONFLICT (slug) DO NOTHING;

-- 3. نشاط 3: ماركت (للترند/قريب منك)
INSERT INTO public.businesses (
  slug, name, business_type, description, hook,
  area, is_published, created_at
) VALUES (
  'demo-trending-market',
  'ماركت الأسرة (تجريبي)',
  'misc',
  'بقالة وميني ماركت، كل احتياجات البيت.',
  'كل حاجة تحتاجها',
  'شبين القناطر',
  true,
  now() - interval '5 days'
) ON CONFLICT (slug) DO NOTHING;

-- 4. عرض تجريبي (باستخدام الأعمدة الفعلية: price, is_published)
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
