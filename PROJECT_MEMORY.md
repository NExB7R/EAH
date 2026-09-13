# EAH — Project Memory (Cross-session)

> ملف حي — يتحدّث بعد كل جلسة. للتواصل بين الشاتات.


---

## 2026-09-13 — Session: SEO + Auth + Onboarding + Personalization + PWA

### 🎓 دروس تقنية (مهمة للشاتات الجاية)

#### Next.js 16.3+
- **`middleware.ts` انتهى!** الاسم الجديد `proxy.ts` مع تصدير `proxy` بدل `middleware`.
  - الخطأ: `Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected`
  - القاعدة: ملف واحد بس اسمه `proxy.ts` في جذر `08-web/`.
- `export const runtime = 'edge'` في `opengraph-image.tsx` بيولّد صورة OG ديناميكية بدون أي ملف static.

#### Patches بـ Python regex — فخ خطير
- استخدام `r"\1\n\2const x"` في `re.sub` **بيلزق الأسطر** (الـ `\n` بيتم تفسيره حرفياً في بعض السياقات).
- **الحل الصح:** استخدام دالة lambda في replacement أو `"\n".join(...)` بدل string replacement.

#### SW + PWA
- **`public/icon-192.png` و `icon-512.png` مش موجودين في الريبو** — اتولّدوا من `public/icon.svg` بأمر `convert` (ImageMagick).
- كان فيه **SW registers مكررة** (`register-sw` + `sw-register`) و **3 install prompts** في layout → اتوحّدوا.
- الـ localStorage keys الموحّدة دلوقتي: `eah-install-dismissed` (install banner فقط).

#### Personalization layer
- ملف جديد: `lib/personalization.ts` — طبقة فوق `lib/ranking.ts`، **بدون لمس ranking**.
- Tag format من onboarding: `["restaurant", "area:shibin", "budget:mid"]`.
- `loadUserProfileTags()` بتقرا من `profiles.interests` (array).
- `applyPersonalization(items, profile)` — boosts مدروسة: category +0.15, area +0.10.
- مربوط في `components/home-dynamic.tsx` + `app/recommend/page.tsx`.
- **`app/explore/page.tsx` مش مربوط** — عمداً (سرعة الكاش).

### 🗂️ migrations مهمة (اتطبقت يدوياً على Supabase)
- `profiles.onboarding_done` (bool) — flag للـ overlay
- `profiles.interests` (text[]) — tags المستخدم
- ⚠️ **مش موجودين في `03-database/migrations/*.sql`** — لازم نضيفهم في migration قادمة للـ reproducibility.

### 📋 Golden rules (تأكيد)
1. Git = source of truth
2. SQL يتطبق يدوي في Supabase SQL Editor
3. **الحفاظ على الوظائف السابقة** — additive only
4. Proxy ≠ Middleware (Next.js 16.3+)
5. بعد أي patch → `npx tsc --noEmit` + runtime check قبل commit

### 🎯 commits الجلسة (ui-onlook)
- `b6eafd2` — SEO: OG image + h1 + twitter large card
- `49d0f31` — proxy.ts (auth route protection)
- `1aff496` — onboarding: area + budget
- `edb0b64` + `4c3f741` — personalization layer
- `888dfcd` — PWA icons (generated)
- `bbe09d0` — PWA consolidation

### 🎯 متبقي في v0.2.0
1. Real trends من `page_view_events`
2. Notifications
3. Migration في الريبو لـ `onboarding_done` + `interests`
4. اختبار يدوي للـ personalization في المتصفح


---

## 2026-09-13 — Session continued: Real Trends

### ✅ Real trends pipeline (كامل)
- `public.page_view_events` (موجود من `20260911193000_add_business_analytics_and_live_visitors_v2.sql`)
- RPC `get_business_view_stats(text[], int)` — aggregate آمن، بيرجع `slug, views, unique_visitors`
- `lib/real-stats.ts` — loader مع fallback صامت
- `mock-stats.ts` — بياخد `override?.recentViews` من الأرقام الحقيقية
- مربوط في `home-dynamic.tsx` + `app/recommend/page.tsx`

### 🎓 دروس
- `page_view_events.visitor_id` نوعه **`uuid`** مش text — انتبه للـ cast
- **multiline patches** في Python: الـ string literals مع `\n` بتحتاج دقة عالية
- `noUnusedLocals: false` بيخفي أخطاء imports غير مستخدمة — راقبها يدوياً

### 🎯 commits الجلسة (تابع)
- `18e82f3` — profiles.onboarding_done + interests (jsonb) migration
- `bdc30c2` — RPC get_business_view_stats + real-stats.ts
- `0934e2a` — fix: wire realStats into home-dynamic

### 📋 متبقي في v0.2.0
- Notifications (Web Push) — المكونات موجودة
- تنظيف دوري لـ `page_view_events` (cron أو RPC)
- عرض `views` الحقيقي في صفحة business

