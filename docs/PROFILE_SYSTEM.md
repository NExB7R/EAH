# EAH — Profile System (v1.0)

آخر تحديث: 2026-11-11

## المكونات
- lib/profile/role-theme.ts — ألوان وشارات الأدوار
- components/profile/* — Hero, Tabs, Uploader, Badge
- lib/data/audit.ts — قراءة سجل النشاط
- lib/audit/user-event.ts — كتابة سجل النشاط (user-side)

## الأدوار
- super_admin: بنفسجي، كامل الصلاحيات
- merchant: أخضر
- advertiser: ذهبي
- customer: أزرق

## سجل التدقيق
- الجدول: audit_logs (12 عمودًا)
- RLS: user reads own, admin reads all
- Actions مسجلة: profile.name_update, profile.avatar_upload, profile.avatar_delete
- TODO: delivery.search

## الأفاتار
- التخزين: Cloudinary (eah/avatars/{user_id})
- Supabase bucket "avatars" غير مستخدم — أُهمل
- Crop: react-easy-crop + Canvas (512px output)

## TODO (للجاي)
1. Delivery driver phone search — Phase 2
2. 2FA backend — migration مطلوبة
3. Customer privacy controls (hide_comments, hide_ratings)
4. Badge للمعلن (يظهر إن hasActiveAds=true)
5. Admin profile: Bio/Preferences مؤجلة (قرار المستخدم)

## الاختبار السريع
1. رفع صورة من /admin/profile — تظهر في Hero + FloatingCapsule فوري
2. تعديل الاسم — يظهر في FloatingCapsule بعد refresh
3. Tab النشاط يعرض آخر 30 حدث
