# EAH — الحالة الحيّة

> آخر تحديث: 2026-09-21 00:32 UTC

## 🎯 المنصة
EAH — منصة اكتشاف محلية لشبين القناطر.
- Production: https://eah-sq.vercel.app
- GitHub: NExB7R/EAH (branch: ui-onlook)

## 🧱 التقنيات
Next.js 16 · React 19 · TypeScript · Supabase · Vercel · Cloudinary

## 👥 الأدوار
- customer — يكتشف + يقيّم + يحفظ
- merchant — يدير نشاطه
- super_admin — كل حاجة
- مفيش "admin" — بس super_admin

## ✅ الميزات الشغالة
- تسجيل/دخول + بروفايل
- صفحة نشاط كاملة
- تقييمات auto-approve
- إشعارات + welcome
- شريط أزرار عائم
- لوحة أدمن

## 🔴 مشاكل معروفة
- business_subscriptions.owner_id
- Sentry CSP blocked
- بيانات الأنشطة ناقصة (gallery/menu)

## ⚠️ قواعد ذهبية
1. Git = source of truth
2. مفيش حذف بدون موافقة
3. Typecheck قبل كل commit
4. RLS = أمن حرج
5. deploy بأمر صريح من Nour
