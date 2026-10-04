# EAH — NEXT_SESSION.md

> قائمة المشاكل المكتشفة في فحص 2026-10-04 — للشات الجديد.
> **اقرأه قبل أي شغل.**

**آخر تحديث:** 2026-10-04

---

## 🔴 حرجة

### 1. Feature Announcements (جديد)

**الحالة:** flag اتشال من الكود (2026-10-04) عشان feature مفقودة.

**المطلوب:**
- جدول `announcements` في DB (id, title, body, theme, starts_at, ends_at, is_active, created_by, created_at)
- component `components/announcements-banner.tsx` (يظهر أعلى الصفحة)
- admin UI: `app/admin/announcements/page.tsx` (create/edit/deactivate)
- إعادة flag `announcements_enabled` للـ features-shared.ts

**الوقت المتوقع:** ~ساعة

---

### 2. نظام الإعلانات (ناقص)

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

## 🟠 متوسطة

### 3. /suggest placeholder

**الحالة:** الصفحة بتعرض "لسه محتاجين نعرفك أكتر" + زرار. مش بترشح أنشطة فعلاً.

**الحل المطلوب:** Recommendation engine بسيط (history + area + time of day).

---

### 4. Branches CRUD للتاجر

**الحالة:** جدول `business_branches` موجود في DB (id, business_id, name, area, address_text, latitude, longitude, working_hours, phone, whatsapp, is_primary, is_active, sort_order).

**الناقص:**
- app/merchant/business/branches/page.tsx (قائمة الفروع)
- app/merchant/business/branches/branch-form.tsx (إضافة/تعديل)
- app/merchant/business/branches/actions.ts (add/update/delete/setPrimary)

**الوقت المتوقع:** ~2 ساعات

---

## 🟡 صغيرة

### 5. Google Search Console

- سجّل الموقع على https://search.google.com/search-console
- Submit sitemap: https://eah-sq.vercel.app/sitemap.xml
- الوقت: 20 دقيقة

### 6. اختبار ميداني موبايل

- افتح الموقع من موبايل حقيقي على شبكة تانية
- اختبر: تسجيل، تفاعل، طلب، إشعارات
- الوقت: 30 دقيقة

### 7. /admin/insights — احتمال تكرار

- app/admin/insights/page.tsx (139 سطر)
- app/merchant/insights/page.tsx (169 سطر)
- مراجعة: هل الاتنين محتاجين؟

---

## ✅ تم النهاردة (2026-10-04)

- إصلاح splash crash (display:none بدل el.remove)
- GRANT على business_locations (يدوي في Supabase)
- إنشاء app_settings table (يدوي في Supabase)
- **migration موثّق**: `docs/migrations/2026-10-04-app-settings-and-locations-grant.sql`
- تطبيق `reviews_enabled` في `business-tabs.tsx`
- تطبيق `orders_enabled` في `fixed-cta.tsx`
- شيل flag `announcements_enabled` (feature مفقودة — سُجلت في #1)
- توثيق REVOKE issue في LESSONS.md §28

---

## المراجع

- docs/LESSONS.md §28 — REVOKE business_locations
- docs/SESSION_LOG.md — Session 11
- docs/FUTURE.md — الأولويات الكاملة

---

آخر تحديث: 2026-10-04
