## 2026-09-17 — v0.7.6 — WhatsApp Orders + Feature Flags + Facebook Collect

### ✅ اللي خلص

**WhatsApp Orders (كامل):**
- DB: confirm_order RPC + order_code + confirmed_at
- Template احترافي: code + اسم + رقم + عنوان + بروفايل العميل (verified + trust + reviews)
- Toggle للشريك (accepts_whatsapp_orders)
- Confirm button في merchant dashboard → push للعميل

**Feature Flags (Admin controlled):**
- business_features table + has_feature/set_business_feature RPCs
- /admin/businesses/[slug]/features — toggle لكل ميزة (8 features)
- كل ميزة لها مدة + ملاحظات

**Ads System:**
- ad_slots + ads + ad_stats_daily
- /admin/ads — slots + ads table
- /admin/ads/slots/[id] — slot management
- /merchant/ads + /merchant/ads/new — partner ad creation
- track_ad_event RPC (impressions + clicks)

**Moderation:**
- auto_flag_review trigger (links/phones/profanity)
- /admin/moderation — flagged reviews dashboard

**Partners:**
- business_partners table + transfer_business_ownership RPC
- /merchant/businesses/[slug]/partners — UI

**Facebook Collect expansion:**
- parser يستخرج facebook + instagram + tiktok + website + email
- CollectClient فيه حقول جديدة

**Analytics:**
- SVG chart بدون deps
- confirmed orders count في merchant report

### 🎯 الجاي
- Security audit (rate limit + secrets + RLS)
- End-to-end test للـfeatures الجديدة
- Real business data import

---

## 2026-09-17 — v0.6.0 — UI/Perf/Security pass

### ✅ اللي خلص

**UI:**
- hero جديد: tagline نيون + hook واحد
- اللوجو v15 (تاج ثابت فوق الكلمة + نبض)
- footer: follow cards وسط + نسخة في القايمة
- بطاقات التنقل: مولعة → الترند النهاردة / الجديد
- CSS: شيل كل التوهجات الكبيرة + infinite animations

**Performance:**
- شال StickersLayer + ScrollIconsBackground (أسباب اللاج الرئيسية)
- CSS durations 50% أسرع
- Splash ثابت (بدون أنميشن ثقيل)

**Features:**
- Trial auto-start trigger (30 يوم) + countdown widget
- Trial reminder cron (7ص + 7م) آخر 7 أيام
- advertise rewrite (2026 marketplace)
- pricing rewrite (مجاني/مميز/بوت)
- about rewrite (kickers عربية)
- 66 kicker من إنجليزي لعربي
- QR API + share modal
- Bot rename: رفيق → B7R
- Owner check: claim CTA مخفي لو النشاط ليه owner

**Data:**
- Migration: business coordinates (lat/lng/address)
- Migration: auto-trial trigger + get_trial_status RPC

**الأدوات:**
- pre-push hook لفحص CSS

### 🎯 الجاي (v0.6.x)

1. Security audit كامل (RLS + secrets + deps)
2. Admin advertise dashboard
3. Trial UI في صفحة النشاط
4. Auto-ad generator
5. Analytics v2 (charts)
6. Comment moderation backend
7. Partner management (نقل ملكية)

### ⚠️ مشاكل اتكسرت واتصلحت
- home-hero.tsx كسر مرتين (regex) → rewrite
- site-footer.tsx كسر مرتين (regex) → rewrite
- smart-bot.tsx API mismatch → fix
- trial countdown: businessId → id

---
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


---

## 2026-09-13 — Session continued: Push Notifications + Release v0.2.0

### ✅ Push Notifications (كامل)
- `push_subscriptions` table (public schema, unique endpoint, RLS: self ALL + admin read)
- `createServiceClient()` في `lib/supabase-server.ts` (server-only, يتخطى RLS)
- `lib/push/send.ts` → `sendPushToUser` بيستخدم service client (fix للـ RLS bug)
- `EnablePushButton` مضاف في `/account` (كان بس في `/merchant/settings`)
- `/api/push/subscribe` + `/api/push/notify` (rate-limited + zod validated)

### 🔑 env vars (`.env.local` + Vercel)
- `VAPID_PUBLIC_KEY` ✅
- `VAPID_PRIVATE_KEY` ✅
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ✅
- `VAPID_SUBJECT` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (الـ Secret key من Supabase API Keys)

### ⚠️ أمان
- الـ secret key **اتكشف في محادثة** → محتاج **Rotate** ASAP
- القاعدة: secrets في `.env.local` فقط، ممنوع في chat/screenshot/commit

### 🎯 commits الجلسة (تابع)
- `5a023aa` — push + service role + migration sync
- `<قادم>` — CSS + release

### 🏁 Release v0.2.0 checklist
- VERSION → 0.2.0
- CHANGELOG محدّث
- Git tag `v0.2.0`
- Push tags


---

## 2026-09-14 — Subscription System

### ✅ نظام الاشتراكات
- DB: subscription_plans + business_subscriptions + subscription_events
- RLS: owner read own + admin full + merchant request pending
- RPCs: get_business_subscription + expire_old_subscriptions
- Flow: merchant يطلب → admin يوافق (30 يوم trial) → إشعارات يومية آخر 7 أيام → expire تلقائي
- Seed: featured_monthly / featured_quarterly / featured_yearly (بدون سعر = تواصل)

### 📁 ملفات
- lib/subscription/{types,index,admin}.ts
- components/subscription/{subscription-badge,trial-countdown,upgrade-cta}
- app/admin/subscriptions/{page,actions,plans,events}
- app/merchant/subscription/page.tsx
- app/api/merchant/subscription/request + app/api/cron/subscription-check

### 🔑 ENV مطلوب
- CRON_SECRET (في .env.local + Vercel)

### 🎯 commits
- 58e7327 — subscription migration
- ebdfc91 — subscription lib + pages
