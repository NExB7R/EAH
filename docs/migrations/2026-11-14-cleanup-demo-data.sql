-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: 2026-11-14
-- حذف البيانات التجريبية قبل إدخال الأنشطة الحقيقية
-- ═══════════════════════════════════════════════════════════

-- 1. حذف الأنشطة التجريبية (cascade على media/reviews/orders/events)
delete from public.businesses
where id in (
  'd7e67323-8e4b-4b20-9f4f-ec9bc45f8404', -- اختبار EAH — صيدلية جديدة
  'd0e13049-3ac9-4232-9f95-3f8d03a57505', -- اختبار EAH — نشاط متنوع
  '7f47ef2e-9f35-4e5c-bbc9-5e6201221a01', -- اختبار EAH — بطاقة مميزة مطعم
  '40bbea8d-ff27-456d-ac03-6f9b06bc3ce7', -- اختبار EAH — نشاط تجريبي
  '42ab3b78-c286-451e-9f0a-62d7f5fa1202', -- اختبار EAH — بطاقة مميزة صيدلية
  '6e44ebf5-3b5b-4d7f-91c5-2b80aa7aaf06', -- اختبار EAH — أرقام متعددة
  'e04c39f4-8cc4-4e13-8b28-0ccf8a13b303', -- اختبار EAH — توصيل
  'a70a5161-9a32-4bc7-ae68-cc30c46520cd', -- مطعم البركة (تجريبي)
  'ad70fc05-5c46-4b44-ac4e-911bc0640fa6', -- صيدلية النور (تجريبي)
  '72eb5209-6e97-4c1e-97f6-4cf718c77092'  -- ماركت الأسرة (تجريبي)
);

-- 2. حذف الحسابات التجريبية (cascade على profiles, user_roles, sessions)
delete from auth.users
where email in (
  'merchant1@eah.test',
  'merchant2@eah.test',
  'customer1@eah.test',
  'customer2@eah.test'
);

-- 3. تنظيف سجلات البحث التجريبية (احتياطي)
delete from public.phone_search_log where found = false;
delete from public.audit_logs where action like '%test%' or entity_type = 'business';

-- ═══ تحقق ═══
-- الأنشطة المتبقية (المتوقع: طبوش السورى فقط)
-- select id, name, source, is_published from public.businesses;

-- المستخدمون المتبقون (المتوقع: NourEldin فقط)
-- select email, ur.role::text from auth.users u
--   left join public.user_roles ur on ur.user_id = u.id;
