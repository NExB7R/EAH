-- EAH — Cleanup Test Data
-- Purpose: Remove all demo businesses and test accounts after testing.
-- Run AFTER completing the testing guide.

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 1. امسح كل متعلقات الأنشطة التجريبية
-- ═══════════════════════════════════════════════════════════

-- Reviews
DELETE FROM public.business_reviews 
WHERE business_id IN (SELECT id FROM public.businesses WHERE slug LIKE 'demo-%');

-- Comments
DELETE FROM public.business_comments 
WHERE business_id IN (SELECT id FROM public.businesses WHERE slug LIKE 'demo-%');

-- Offers
DELETE FROM public.offers 
WHERE business_id IN (SELECT id FROM public.businesses WHERE slug LIKE 'demo-%');

-- Branches
DELETE FROM public.business_branches 
WHERE business_id IN (SELECT id FROM public.businesses WHERE slug LIKE 'demo-%');

-- Order settings
DELETE FROM public.merchant_order_settings 
WHERE business_id IN (SELECT id FROM public.businesses WHERE slug LIKE 'demo-%');

-- Orders
DELETE FROM public.order_requests 
WHERE business_id IN (SELECT id FROM public.businesses WHERE slug LIKE 'demo-%');

-- Follows
DELETE FROM public.business_follows 
WHERE business_id IN (SELECT id FROM public.businesses WHERE slug LIKE 'demo-%');

-- Favorites
DELETE FROM public.favorites 
WHERE business_id IN (SELECT id FROM public.businesses WHERE slug LIKE 'demo-%');

-- Businesses
DELETE FROM public.businesses WHERE slug LIKE 'demo-%';

-- ═══════════════════════════════════════════════════════════
-- 2. امسح تفاعلات الحسابات التجريبية
-- ═══════════════════════════════════════════════════════════

DELETE FROM public.points_log 
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@eah.test');

DELETE FROM public.standing_events 
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@eah.test');

DELETE FROM public.notifications 
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@eah.test');

-- ═══════════════════════════════════════════════════════════
-- 3. امسح الحسابات نفسها (profiles → auth.users)
-- ═══════════════════════════════════════════════════════════

DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@eah.test');

DELETE FROM public.profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email LIKE '%@eah.test');

DELETE FROM auth.users WHERE email LIKE '%@eah.test';

COMMIT;

-- التحقق: المفروض ترجع 0
-- SELECT count(*) FROM public.businesses WHERE slug LIKE 'demo-%';
-- SELECT count(*) FROM auth.users WHERE email LIKE '%@eah.test';
