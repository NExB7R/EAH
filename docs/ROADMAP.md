# 🗺️ EAH — ROADMAP.md

> خطة تنفيذ على 12 أسبوع — 3 مراحل × 4 أسابيع.
> **قاعدة صارمة:** لا قفز للمرحلة التالية قبل ما السابقة تخلص 100%.

**آخر تحديث:** 2026-09-24
**الإصدار:** 1.0

---

## 🎯 نظرة عامة

| المرحلة | المدة | الهدف | الناتج |
|---------|------|-------|--------|
| **المرحلة 1: الأساس** | 4 أسابيع | بنية أساسية + الصفحات الرئيسية | موقع شغّال (بدون تفاعل) |
| **المرحلة 2: التفاعل** | 4 أسابيع | Auth + Account + Merchant | منصة كاملة شغّالة |
| **المرحلة 3: الإطلاق** | 4 أسابيع | Admin + PWA + AI + Polish | جاهز للجمهور |

---

## 🏗️ المرحلة 1 — الأساس (4 أسابيع)

**الهدف:** بنية تقنية نظيفة + الصفحات العامة الأساسية.

### الأسبوع 1: البنية التحتية

**Day 1-2: المشروع**
- [ ] إنشاء Next.js 16 project (بدون مثال)
- [ ] TypeScript strict mode
- [ ] ESLint + Prettier
- [ ] هيكل المجلدات (src/app, src/components, src/lib)
- [ ] `next.config.ts` كامل
- [ ] `.env.example`

**Day 3-4: Supabase**
- [ ] إنشاء Supabase project (أو استخدام الحالي)
- [ ] تشغيل `SCHEMA.sql` (migration كامل)
- [ ] التأكد من RLS + Policies
- [ ] Storage buckets (business-media, avatars)
- [ ] Seed data (أنشطة تجريبية)

**Day 5-7: Auth**
- [ ] `createClient` + `createPublicClient` + `createServiceClient`
- [ ] `proxy.ts` (بدل middleware)
- [ ] Auth flow: تسجيل/دخول/خروج
- [ ] Magic link + Password
- [ ] صفحة `/auth` كاملة

**Definition of Done:**
- [ ] نوع مشروع مفتوح على localhost:3000
- [ ] Auth flow شغّال (تسجيل + دخول)
- [ ] typecheck نظيف
- [ ] Deploy على Vercel ناجح

---

### الأسبوع 2: الهوية والصفحات العامة

**Day 8-9: Design System**
- [ ] `globals.css` (الألوان + الخطوط)
- [ ] Cairo Variable + Tajawal
- [ ] Icons library (SVG custom)
- [ ] مكونات أساسية (Button, Input, Card)

**Day 10-11: Home**
- [ ] Splash (CSS-only، 1s)
- [ ] Hero (لوجو + slogan + hook + search + 5 categories)
- [ ] Featured (Bento Grid)
- [ ] Trending (Vertical List — 10)
- [ ] Offers (Snap Strip)
- [ ] New (Snap Strip)
- [ ] Footer

**Day 12-13: Explore**
- [ ] Search bar ذكي (عربي مصري)
- [ ] Filters (تصنيف، منطقة، تقييم، مفتوح حالاً)
- [ ] Grid + List view
- [ ] Pagination / Infinite scroll
- [ ] sort options

**Day 14: Business Page**
- [ ] Hero (غلاف + لوجو + اسم)
- [ ] Quick actions (اتصال + واتساب + حفظ + مشاركة)
- [ ] Gallery + Lightbox
- [ ] Menu + Lightbox
- [ ] Hours
- [ ] Map
- [ ] Reviews

**Definition of Done:**
- [ ] Home شغّال + 4 sections
- [ ] Explore + فلترة + بحث
- [ ] Business page كاملة
- [ ] mobile responsive (320px → 4K)
- [ ] Lighthouse > 90
- [ ] Deploy

---

### الأسبوع 3: البيانات والمنطق

**Day 15-16: Data Layer**
- [ ] `lib/data.ts` (getPublishedBusinesses + getBusinessBySlug)
- [ ] `unstable_cache` على module-level
- [ ] `createPublicClient` للـ public reads
- [ ] `lib/ranking.ts` (trending score + decay)
- [ ] `lib/personalization.ts`

**Day 17-18: Search + AI Assistant**
- [ ] `lib/search/normalize.ts` (عربي مصري)
- [ ] Voice button (Web Speech API)
- [ ] AI Assistant (زر ثابت + داخل البحث)
- [ ] Rate limiting على AI

**Day 19-21: SEO + Schema**
- [ ] `metadata` لكل صفحة
- [ ] `sitemap.ts` (revalidate 3600)
- [ ] `robots.ts`
- [ ] `opengraph-image.tsx`
- [ ] LocalBusiness Schema (JSON-LD) على business pages
- [ ] Google Business Profile integration (basic)

**Definition of Done:**
- [ ] البحث شغّال باللهجة المصرية
- [ ] AI Assistant يجاوب أسئلة بسيطة
- [ ] SEO كامل + OG Images
- [ ] Google يقرأ Schema

---

### الأسبوع 4: Polish المرحلة 1

**Day 22-23: Performance**
- [ ] Lighthouse audit
- [ ] ضغط الصور (Cloudinary transforms)
- [ ] إزالة الـ unused CSS
- [ ] Code splitting
- [ ] Preload للـ critical

**Day 24-25: تجربة الموبايل**
- [ ] Bottom sheet للفلاتر
- [ ] Touch targets 44px+
- [ ] Drawer menu
- [ ] Safe areas (iPhone notch)
- [ ] Container Queries

**Day 26-27: Accessibility**
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast (WCAG AA)

**Day 28: Deploy + Testing**
- [ ] Final deploy
- [ ] Testing شامل
- [ ] Bug fixes
- [ ] **Tag:** v1.0.0-alpha

**Definition of Done المرحلة 1:**
- [ ] Home + Explore + Business شغالين
- [ ] Lighthouse 95+ على Mobile
- [ ] Responsive من 320px لـ 4K
- [ ] SEO كامل
- [ ] Tag: v1.0.0-alpha

---

## 🔄 المرحلة 2 — التفاعل (4 أسابيع)

**الهدف:** Auth كامل + Account + Merchant + Admin (جزئي).

**⚠️ شرط البدء:** المرحلة 1 خلصت 100%.

### الأسبوع 5: Account

**Day 29-30: Profile**
- [ ] `/account` صفحة رئيسية
- [ ] `/account/edit` (تعديل)
- [ ] رفع Avatar (Cloudinary + Crop)
- [ ] Trust Score + Verified badge

**Day 31-32: Points + Loyalty**
- [ ] `/account/points` (رصيد + سجل)
- [ ] `/account/loyalty` (المستوى)
- [ ] نظام النقاط (award_points RPC)
- [ ] Streak tracking

**Day 33-34: Favorites + Following**
- [ ] زر "احفظ" على كل نشاط
- [ ] زر "تابع"
- [ ] `/account/following`
- [ ] إشعارات عند عرض جديد

**Day 35: Notifications**
- [ ] `/notifications` صفحة
- [ ] Push subscribe (VAPID)
- [ ] تحكم كامل في أنواع الإشعارات
- [ ] Quiet Hours

**Definition of Done:**
- [ ] Profile كامل
- [ ] Points شغّالة
- [ ] Favorites + Following
- [ ] Push notifications

---

### الأسبوع 6: Merchant

**Day 36-37: Merchant Dashboard**
- [ ] `/merchant` صفحة رئيسية
- [ ] إحصائيات أساسية
- [ ] روابط لكل الأقسام

**Day 38-39: إدارة النشاط**
- [ ] `/merchant/businesses/[slug]/edit`
- [ ] رفع صور (Gallery + Menu)
- [ ] إدارة الفروع
- [ ] أوقات العمل

**Day 40-42: الطلبات + العروض**
- [ ] `/merchant/orders`
- [ ] WhatsApp Order Flow (مع تأكيد خلال 10 دقايق)
- [ ] `/merchant/offers` (إنشاء + إدارة)
- [ ] `/merchant/coupons`

**Definition of Done:**
- [ ] Dashboard كامل
- [ ] إدارة النشاط
- [ ] Orders + Offers شغالين

---

### الأسبوع 7: Admin (جزئي)

**Day 43-44: Admin Shell**
- [ ] `/admin` layout
- [ ] Sidebar + Header
- [ ] Dashboard أساسي

**Day 45-46: إدارة الأنشطة**
- [ ] `/admin/businesses` (list + filters)
- [ ] الموافقة / الرفض
- [ ] التعديل المباشر
- [ ] `/admin/businesses/new`

**Day 47-49: إدارة المستخدمين + المراجعة**
- [ ] `/admin/users` (list + filters)
- [ ] Ban / Unban
- [ ] Trust Score adjust
- [ ] `/admin/moderation` (reviews)

**Definition of Done:**
- [ ] Admin shell شغال
- [ ] الأنشطة مُدارة
- [ ] المستخدمين مُدارين
- [ ] المراجعة شغّالة

---

### الأسبوع 8: Polish المرحلة 2

**Day 50-51: WhatsApp Order Flow كامل**
- [ ] رسالة محمية (غير قابلة للتعديل)
- [ ] تأكيد خلال 10 دقايق (مع countdown)
- [ ] تتبع الحالة
- [ ] Audit log لكل عملية
- [ ] تحذيرات للتلاعب

**Day 52-53: التقييم بعد التجربة**
- [ ] إشعار بعد ساعة
- [ ] "تجربة موثقة"
- [ ] تمييز عن التقييمات العامة

**Day 54-55: الأقسام المقفلة**
- [ ] Gate على رقم التواصل + التعليقات + المفضلة + المتابعة + الموقع + فيسبوك + واتساب + المنيو
- [ ] Banner "سجّل عشان تستفيد"

**Day 56: Testing + Deploy**
- [ ] Testing شامل
- [ ] Bug fixes
- [ ] **Tag:** v1.0.0-beta

**Definition of Done المرحلة 2:**
- [ ] Account كامل
- [ ] Merchant Dashboard
- [ ] Admin أساسي
- [ ] WhatsApp Order Flow
- [ ] **Tag:** v1.0.0-beta

---

## 🚀 المرحلة 3 — الإطلاق (4 أسابيع)

**الهدف:** Admin كامل + PWA + AI + Polish + إطلاق.

### الأسبوع 9: Admin كامل

**Day 57-58: Analytics + Reports**
- [ ] `/admin/analytics`
- [ ] رسوم بيانية
- [ ] Export CSV / PDF

**Day 59-60: Subscriptions + Ads**
- [ ] `/admin/subscriptions` (إدارة كاملة)
- [ ] `/admin/ads` (Slots + Ads)
- [ ] تفعيل/إيقاف + جدولة

**Day 61-62: Audit + Settings**
- [ ] `/admin/audit` (timeline)
- [ ] `/admin/settings` (عام + flags)
- [ ] `/admin/notifications` (إرسال جماعي)

**Day 63: Featured + Moderation كامل**
- [ ] `/admin/featured` (ترتيب + pin)
- [ ] `/admin/moderation` كامل

**Definition of Done:**
- [ ] Admin كامل
- [ ] Analytics + Subscriptions + Ads
- [ ] Audit + Settings

---

### الأسبوع 10: PWA + AI

**Day 64-65: PWA كامل**
- [ ] Manifest
- [ ] Service Worker
- [ ] Install prompt
- [ ] Offline-first
- [ ] iOS 16.4+ push
- [ ] App Badge

**Day 66-67: AI Assistant كامل**
- [ ] Integration (OpenAI/Gemini)
- [ ] Context من المستخدم
- [ ] Voice input/output
- [ ] Rate limiting
- [ ] Fallback

**Day 68-70: Support Bot**
- [ ] `/support` صفحة
- [ ] FAQ أساسي
- [ ] Walkthrough
- [ ] تصعيد للبشري

**Definition of Done:**
- [ ] PWA يعمل offline
- [ ] Push notifications
- [ ] AI Assistant شغّال
- [ ] Support Bot شغّال

---

### الأسبوع 11: Polish نهائي

**Day 71-72: Performance نهائي**
- [ ] Lighthouse 95+
- [ ] Core Web Vitals ممتاز
- [ ] صفر animations مستمرة
- [ ] صفر `content-visibility` على الأساسي

**Day 73-74: Security audit**
- [ ] RLS كامل
- [ ] Rate limiting شامل
- [ ] Secrets audit
- [ ] CSP صارم
- [ ] HTTPS + HSTS

**Day 75-77: Content**
- [ ] `/about` كامل
- [ ] `/terms` + `/privacy` + `/cookies`
- [ ] `/pricing` + `/advertise`
- [ ] `/support-palestine`
- [ ] `/contact`

**Definition of Done:**
- [ ] كل الصفحات جاهزة
- [ ] Security audit نظيف
- [ ] Performance ممتاز

---

### الأسبوع 12: الإطلاق

**Day 78-79: Testing نهائي**
- [ ] كل الصفحات على كل الأجهزة
- [ ] Bug fixes أخير
- [ ] Regression testing

**Day 80-81: Data seeding**
- [ ] إضافة 50+ نشاط حقيقي
- [ ] صور + منيو
- [ ] تقييمات أولية

**Day 82-83: Marketing prep**
- [ ] Domain نهائي
- [ ] Google Business Profile
- [ ] Social media
- [ ] Launch announcement

**Day 84: 🚀 LAUNCH**
- [ ] Deploy نهائي
- [ ] Monitoring
- [ ] Support جاهز
- [ ] **Tag:** v1.0.0

---

## قواعد صارمة للتنفيذ

### قاعدة 1: لا قفز
ممنوع البدء في المرحلة N+1 قبل إتمام المرحلة N 100%.
- استثناء: bug fixes عاجلة
- ممنوع: ضيف ميزة صغيرة من المرحلة 2 أثناء المرحلة 1

### قاعدة 2: Definition of Done
كل يوم لازم ينتهي بـ:
- typecheck نظيف
- commit واضح
- push للـ main
- Preview على Vercel
- لا regressions

### قاعدة 3: Deploy Rules
- Preview على كل push (تلقائي)
- Production فقط في نهاية كل أسبوع (بعد موافقة صريحة)
- Tag في نهاية كل مرحلة

### قاعدة 4: الملفات الممنوعة
ممنوع تعديل أي من دول بدون تصريح خاص:
- home-hero.tsx
- home-dynamic-v2.tsx
- section-slider-v2.tsx
- simple-flip-card.tsx
- lib/data.ts
- lib/ranking.ts
- lib/supabase-server.ts

### قاعدة 5: عند الخطأ
1. وقف فوراً — لا تكمل
2. بلّغ — فيه مشكلة في X
3. انتظر تعليمات — لا تصلّح بنفسك
4. بعد الموافقة — أصلح، typecheck، commit منفصل

### قاعدة 6: Backup
قبل كل تعديل كبير:
cp file.tsx file.tsx.pre-DATE

### قاعدة 7: Session Log
في نهاية كل يوم عمل، أضف لـ docs/SESSION_LOG.md.

---

## Checklist عام

### قبل كل commit
- typecheck نظيف
- مفيش console.log
- مفيش secrets
- الملفات مرتبة

### قبل كل deploy
- typecheck نظيف
- Preview جاهز
- اختبر على الموبايل والـ Desktop
- لا regressions
- موافقة صريحة

### في نهاية كل مرحلة
- كل الميزات خلصت
- كل DoD اتحقق
- Tag جديد
- Update SESSION_LOG.md

---

## أنماط ممنوعة

### في الكود
- any بدون سبب
- @ts-ignore بدون تعليق
- console.log في الإنتاج
- img بدون optimization
- unstable_cache جوه component
- content-visibility على الأساسي
- emojis في UI

### في CSS
- !important كتير
- backdrop-filter على الكروت
- animations مستمرة
- will-change دائم

### في DB
- تعديل Schema مباشر
- RLS بدون اختبار
- queries بدون indexes

### في Git
- commit بدون رسالة واضحة
- push بدون typecheck
- force push بدون backup

---

## معايير الجودة

### Performance
- Lighthouse: 95+ Mobile + Desktop
- First Contentful Paint: أقل من 1.5s
- Time to Interactive: أقل من 3s
- Cumulative Layout Shift: أقل من 0.1

### UX
- Touch targets: 44px+
- Contrast: WCAG AA
- Offline: يعمل للصفحات المشوفة

### Code
- TypeScript Strict
- صفر any
- Bundle أقل من 200KB

### Security
- RLS على كل الجداول
- Rate limiting شامل
- CSP صارم
- صفر secrets في Git

---

## جدول مرن + علامات النهاية

### لو الشغل أسرع
- ممكن نضغط لـ 8 أسابيع (2 أسبوع لكل مرحلة)
- ممنوع نبدأ مرحلة قبل ما السابقة تخلص

### لو الشغل أبطأ
- مسموح نمدّ المرحلة
- ممنوع نحذف ميزات من Definition of Done

### نهاية المرحلة 1
- اسم الإصدار: v1.0.0-alpha
- الرابط: staging على Vercel
- الحالة: داخلي فقط

### نهاية المرحلة 2
- اسم الإصدار: v1.0.0-beta
- الرابط: production مع noindex
- الحالة: 10-20 مستخدم تجريبي

### نهاية المرحلة 3
- اسم الإصدار: v1.0.0
- الرابط: production indexable
- الحالة: إطلاق عام

---

## مؤشرات النجاح

### بعد شهر
- 50+ نشاط مسجل
- 500+ مستخدم
- 100+ تقييم
- Lighthouse 95+

### بعد 3 شهور
- 100+ نشاط
- 3,000+ مستخدم
- 500+ تقييم
- 5+ نشاط مدفوع
- 10,000 ج.م دخل شهري

### بعد سنة
- 300+ نشاط
- 20,000+ مستخدم
- 30+ نشاط مدفوع
- 30,000 ج.م دخل شهري
- توسع لقرى مجاورة

---

## كلمة أخيرة

EAH مش مجرد مشروع كود — هو منتج بيخدم ناس حقيقيين.

الأولوية الأولى: يشتغل صح.
الثانية: يشتغل سريع.
الثالثة: يبان حلو.

مفيش استعجال. 3 شهور شغل صح = 3 سنين نجاح.

---

آخر تحديث: 2026-09-24
الإصدار: 1.0
المالك: NourEldin B7R
