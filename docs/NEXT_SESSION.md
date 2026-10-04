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

### 2. Feature Announcements (جديد)

**الحالة:** flag اتشال من الكود (2026-10-04) عشان feature مفقودة.

**المطلوب:**
- جدول `announcements` في DB (id, title, body, theme, starts_at, ends_at, is_active, created_by, created_at)
- component `components/announcements-banner.tsx` (يظهر أعلى الصفحة)
- admin UI: `app/admin/announcements/page.tsx` (create/edit/deactivate)
- إعادة flag `announcements_enabled` للـ features-shared.ts

**الوقت المتوقع:** ~ساعة

---

### 3. نظام الإعلانات (ناقص)

**الموجود:**
- جدول `ad_slots` في DB (4 أماكن: home_banner, home_feed, category_banner, trend_pin)
- `/admin/ads` بيعرض الأماكن بس (read-only)

**الناقص:**
- جدول `advertisements` (الإعلانات الفعلية): id, slot_id, business_id, image_url, title, link_url, starts_at, ends_at, status, price_paid_egp, created_at
- Admin CRUD للأماكن (edit price, max_concurrent, deactivate)
- Admin CRUD للإعلانات (approve, reject, schedule)
- Merchant side: `/merchant/ads` (request, view stats, pause)
- Public API: `GET /api/ads/active?slot=home_banner` (fetch active ads for slot)
- Components لعرض الإعلانات: `<AdSlot code="home_banner" />`

**الوقت المتوقع:** ~3 ساعات

---

### 4. Feature Flags ميتة (2 flags)

| Flag | المشكلة | الملف المطلوب |
|------|---------|---------------|
| reviews_enabled | flag معرّف، business-tabs مش بيتحقق منه | components/business-tabs.tsx |
| orders_enabled | flag معرّف، fixed-cta مش بيتحقق منه | components/fixed-cta.tsx |

**التأثير:** من /admin/studio لما الأدمن يوقف flag، مفيش تأثير.

---

## 🟠 متوسطة

### 5. /suggest placeholder

**الحالة:** الصفحة بتعرض "لسه محتاجين نعرفك أكتر" + زرار. مش بترشح أنشطة فعلاً.

**الحل المطلوب:** Recommendation engine بسيط (history + area + time of day).

---

### 6. Branches CRUD للتاجر

**الحالة:** جدول `business_branches` موجود في DB (id, business_id, name, area, address_text, latitude, longitude, working_hours, phone, whatsapp, is_primary, is_active, sort_order).

**الناقص:**
- app/merchant/business/branches/page.tsx (قائمة الفروع)
- app/merchant/business/branches/branch-form.tsx (إضافة/تعديل)
- app/merchant/business/branches/actions.ts (add/update/delete/setPrimary)

**الوقت المتوقع:** ~2 ساعات

---

## 🟡 صغيرة

### 7. Google Search Console

- سجّل الموقع على https://search.google.com/search-console
- Submit sitemap: https://eah-sq.vercel.app/sitemap.xml
- الوقت: 20 دقيقة

### 8. اختبار ميداني موبايل

- افتح الموقع من موبايل حقيقي على شبكة تانية
- اختبر: تسجيل، تفاعل، طلب، إشعارات
- الوقت: 30 دقيقة

### 9. /admin/insights — احتمال تكرار

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
