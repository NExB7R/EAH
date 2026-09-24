-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: 2026-09-25
-- تنظيف + توحيد بيانات المستخدمين
-- ═══════════════════════════════════════════════════════════

-- 1. حذف الحسابات المجهولة (تجارب)
-- تم تنفيذه من Supabase SQL Editor

-- 2. توحيد phone + phone_e164
UPDATE public.profiles
SET
  phone_e164 = '+20' || SUBSTRING(REGEXP_REPLACE(phone_e164, '[^0-9]', '', 'g') FROM 3),
  phone = '0' || SUBSTRING(REGEXP_REPLACE(phone_e164, '[^0-9]', '', 'g') FROM 3)
WHERE phone_e164 IS NOT NULL;

-- 3. إضافة customer role للتجربة
INSERT INTO public.user_roles (user_id, role)
VALUES ('f7372c9d-fa0e-4b14-8f84-1c66d7b50845', 'customer')
ON CONFLICT (user_id) DO NOTHING;
