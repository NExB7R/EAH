# EAH — NEXT_SESSION.md

> قائمة المشاكل المكتشفة في فحص 2026-10-04 — للشات الجديد.
> **اقرأه قبل أي شغل.**

**آخر تحديث:** 2026-10-04

---

## 🔴 حرجة

### 1. Migrations ناقصة (أهم حاجة)

**المشكلة:**
- `app_settings` table اتضاف يدوي في Supabase (2026-10-04) — مش موجود في `docs/migrations/`
- `GRANT SELECT ON business_locations TO anon, authenticated` اتصلح يدوي (2026-10-04) — مش موجود في migrations

**الخطر:**
- لو Supabase اتعمله reset/recreate من migrations -> الموقع يقع تاني
- الأقسام هتختفي (نفس مشكلة §28 في LESSONS.md)

**الحل المطلوب:**
اكتب migration جديد: `docs/migrations/2026-10-04-app-settings-and-locations-grant.sql`

محتوى:
- CREATE TABLE app_settings (key, value, updated_at) + RLS (super_admin only)
- GRANT SELECT (id, business_id, address_text, latitude, longitude, is_primary, created_at) ON business_locations TO anon, authenticated

---

### 2. Feature Flags ميتة (3 flags)

| Flag | المشكلة | الملف المطلوب |
|------|---------|---------------|
| announcements_enabled | مفيش component أصلاً | components/announcements-banner.tsx (جديد) |
| reviews_enabled | flag معرّف، business-tabs مش بيتحقق منه | components/business-tabs.tsx |
| orders_enabled | flag معرّف، fixed-cta مش بيتحقق منه | components/fixed-cta.tsx |

**التأثير:** من /admin/studio لما الأدمن يوقف flag، مفيش تأثير.

---

## 🟠 متوسطة

### 3. /api/ads/active مفقود

**المشكلة:** Vercel logs طلع عليه 404. الكود فيه إشارات لـ `/api/ads/active` بس الـ route مش موجود.

**التحقق:**
grep -rn "api/ads/active" app/ components/ lib/

**الحل:** إما نعمل route، أو نشيل الإشارات.

---

### 4. /suggest placeholder

**الحالة:** الصفحة بتعرض "لسه محتاجين نعرفك أكتر" + زرار. مش بترشح أنشطة فعلاً.

**الحل المطلوب:** Recommendation engine بسيط (history + area + time of day).

---

### 5. Branches CRUD للتاجر

**الحالة:** جدول `business_branches` موجود في DB (id, business_id, name, area, address_text, latitude, longitude, working_hours, phone, whatsapp, is_primary, is_active, sort_order).

**الناقص:**
- app/merchant/business/branches/page.tsx (قائمة الفروع)
- app/merchant/business/branches/branch-form.tsx (إضافة/تعديل)
- app/merchant/business/branches/actions.ts (add/update/delete/setPrimary)

**الوقت المتوقع:** ~2 ساعات

---

## 🟡 صغيرة

### 6. Google Search Console

- سجّل الموقع على https://search.google.com/search-console
- Submit sitemap: https://eah-sq.vercel.app/sitemap.xml
- الوقت: 20 دقيقة

### 7. اختبار ميداني موبايل

- افتح الموقع من موبايل حقيقي على شبكة تانية
- اختبر: تسجيل، تفاعل، طلب، إشعارات
- الوقت: 30 دقيقة

### 8. /admin/insights — احتمال تكرار

- app/admin/insights/page.tsx (139 سطر)
- app/merchant/insights/page.tsx (169 سطر)
- مراجعة: هل الاتنين محتاجين؟

---

## ✅ تم النهاردة (2026-10-04)

- إصلاح splash crash (display:none بدل el.remove)
- GRANT على business_locations (يدوي في Supabase)
- إنشاء app_settings table (يدوي في Supabase)
- توثيق REVOKE issue في LESSONS.md §28

---

## المراجع

- docs/LESSONS.md §28 — REVOKE business_locations
- docs/SESSION_LOG.md — Session 11
- docs/FUTURE.md — الأولويات الكاملة

---

آخر تحديث: 2026-10-04
