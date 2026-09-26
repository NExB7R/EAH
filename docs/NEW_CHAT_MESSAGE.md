# 🚀 EAH — رسالة الشات الجديد

> اقرأ دي الأول — بعدين الملفات الـ 14.

**التاريخ:** 2026-09-27
**الإصدار:** v2.0.0
**آخر commit:** 74371cf

---

## 0. ابدأ من هنا (بالترتيب)

### Step 1: اقرأ الرسالة دي كاملة (10 دقايق).

### Step 2: اقرأ الملفات الـ 14 بالترتيب:
1. MASTER_BRIEF.md
2. AI_CONTRACT.md
3. SACRED.md
4. LESSONS.md
5. STRUCTURE.md
6. SECURITY.md
7. CODE_STANDARDS.md
8. DEBUGGING.md
9. PRODUCTION_CHECKLIST.md
10. DATABASE_RULES.md
11. AI_HANDOFF.md
12. PROGRESS.md
13. TODO.md
14. SESSION_LOG.md

### Step 3: قول "قرأت. جاهز." واستنى.

### ⚠️ ممنوع تكتب سطر كود قبل الـ 3 خطوات دي.

---

## 1. مين أنا

**NourEldin B7R** — صاحب EAH.
- **Email:** nexb7r@gmail.com
- **WhatsApp:** 201012892806
- **GitHub:** @NExB7R
- **الموقع:** https://eah-sq.vercel.app
- **الريبو:** NExB7R/EAH (branch: v2)

**مش مبرمج** — بعتمد على AI في التطوير.

---

## 2. إيه EAH؟

**منصة اكتشاف محلية مصرية** — تبدأ من **شبين القناطر** والقرى حواليها.

### الفكرة:
- **مجانية 100%** للعميل.
- **بدون عمولة** على التاجر.
- **طلب مباشر** على واتساب.
- **تصميم 2026** — نيون ناعم، dark-only.

### الربح:
- باقات مدفوعة للتجار (200-1500 ج.م/شهر).
- إعلانات.
- **مفيش عمولة** على الطلبات.

---

## 3. اللي خلص (حتى 2026-09-27)

### 3.1 البنية التحتية (100%)
- ✅ `.env.example` — 14 مفتاح.
- ✅ `next.config.ts` — CSP + headers + images.
- ✅ `tsconfig.json` — strict + noUncheckedIndexedAccess.
- ✅ `globals.css` — design tokens + keyframes + utilities.
- ✅ خطوط Cairo + Tajawal (self-hosted).
- ✅ 4 Supabase clients (public/server/service/browser).
- ✅ `proxy.ts` — session refresh + route protection.

### 3.2 Auth (100%)
- ✅ `/auth` — signup + login (Tabs).
- ✅ `/auth/recover` — استرجاع.
- ✅ `/auth/logout` — POST endpoint.
- ✅ Zod schemas.
- ✅ 3 صيغ إيميل (legacy support).
- ✅ Location fields (area + address + GPS).

### 3.3 Design System (100%)
- ✅ 50 أيقونة SVG (custom).
- ✅ Logo component (xs/sm/md/lg/xl + variants).
- ✅ Splash screen.
- ✅ Scrollbar (بنفسجي → ذهبي).
- ✅ Watermark overlay.
- ✅ WmImage component.

### 3.4 PWA (100%)
- ✅ `favicon.ico` (التاج).
- ✅ `icon.png` + `apple-icon.png`.
- ✅ `manifest.ts`.
- ✅ `manifest.webmanifest`.

### 3.5 Home (60%)
- ✅ Hero (لوجو + شيبين + هوك + search + categories).
- ✅ Featured Bento (auto-slide).
- ✅ Floating Capsule (لوجو + أيقونات).
- ✅ Menu Drawer (كامل).
- ⏳ Trending Strip.
- ⏳ Offers Strip.
- ⏳ Nearby Grid.
- ⏳ Opportunity/الدعم Strip.
- ⏳ Footer كامل.

### 3.6 Explore (70%)
- ✅ Smart Search (لهجة مصرية + synonyms).
- ✅ Search History (10 عمليات).
- ✅ Voice Search (Web Speech API).
- ✅ Pagination (12/صفحة).
- ⏳ Filters (type + area + sort).
- ⏳ Business Page (موجودة مؤقتاً).

---

## 4. اللي جاي (الأولويات)

### 4.1 المرحلة الحالية — Home كامل
1. Trending Strip.
2. Offers Strip.
3. Nearby Grid (قريب منك).
4. Opportunity Strip (الدعم).
5. Footer كامل.

### 4.2 Explore + Filters
6. Filters (type + area + sort).
7. `/featured`, `/offers`, `/trends`, `/new`, `/nearby`, `/suggest`, `/support`.

### 4.3 Pages
8. `/about` + Presentation.
9. `/updates` + `/terms` + `/privacy` + `/cookies`.
10. `/pricing` + `/advertise` + `/contact` + `/support-palestine`.

### 4.4 Account
11. `/account` + `/account/edit` + `/account/points` + `/account/orders`.

### 4.5 Merchant
12. `/merchant/apply` + `/merchant` + `/merchant/business/edit` + `/merchant/orders`.

### 4.6 Admin
13. `/admin` + `/admin/businesses` + `/admin/users` + `/admin/analytics` + `/admin/ads` + `/admin/moderation` + `/admin/subscriptions`.

### 4.7 Phase 2
14. نظام النقاط (7 نقاط مفيدة + Anti-Abuse).
15. Rate Limiting + Turnstile.
16. Cloudinary migration.

---

## 5. القواعد المطلقة (لا تتفاوض)

### 5.1 قبل أي شغل
- ✅ اقرأ الملفات الـ 14.
- ✅ افحص الموجود (grep).
- ✅ افهم السياق.
- ✅ اسأل لو مش واضح.
- ❌ ممنوع تخمين.

### 5.2 أثناء الشغل
- ✅ typecheck بعد كل تعديل.
- ✅ commit صغير.
- ✅ اختبر كل خطوة.
- ❌ ممنوع commit بدون typecheck.
- ❌ ممنوع deploy بدون preview.

### 5.3 عند الخطأ
- ✅ قف فوراً.
- ✅ اجمع أدلة.
- ✅ افهم السبب.
- ✅ اقترح حل.
- ✅ استنى موافقة.
- ✅ بعدها نفّذ.
- ❌ متخمّنش.
- ❌ متعدّلش بدون سبب.

### 5.4 الممنوعات المطلقة
- ❌ تعديل بدون سؤال.
- ❌ commit بدون typecheck.
- ❌ deploy بدون preview.
- ❌ build محلي (SIGILL).
- ❌ secrets في Git.
- ❌ تكرار كود.
- ❌ `any` بدون سبب.
- ❌ `console.log` في الإنتاج.

---

## 6. الحقائق التقنية

### 6.1 Environment
- **Node:** v22+
- **npm:** v10+
- **Next.js:** 16.3.6
- **React:** 19.2.8
- **TypeScript:** 5.9 (strict)
- **Zod:** 4.6.5

### 6.2 Supabase
- **Project ID:** npmpiivmdksdirrumbmt
- **Region:** Frankfurt (eu-central-1)
- **Tables:** 66
- **Functions:** 106
- **Businesses:** 53 (published)
- **Profiles:** 2
- **RLS:** 100% enabled

### 6.3 Vercel
- **Team:** eah-74a0
- **Project:** eah
- **Production:** https://eah-sq.vercel.app
- **Region:** fra1
- **Root Directory:** web
- **Branch:** v2
- **Auto-deploy:** on every push to v2

### 6.4 Cloudinary
- **Cloud name:** zlgcimmg
- **Auto-transforms:** WebP + AVIF

### 6.5 Git
- **Repo:** NExB7R/EAH (private)
- **Branch:** v2 (default)
- **Old code:** archive/v1, backup-4ffe42d

---

## 7. البنية الحالية

web/
├── app/
│   ├── auth/ (signup + login + recover + logout)
│   ├── explore/ (search + filters + grid)
│   ├── businesses/[slug]/ (temporary)
│   ├── layout.tsx
│   ├── page.tsx (Home)
│   ├── globals.css
│   └── manifest.ts
├── components/
│   ├── avatar.tsx
│   ├── business-card.tsx
│   ├── explore-search.tsx
│   ├── featured-bento.tsx
│   ├── floating-capsule.tsx
│   ├── home-hero.tsx
│   ├── icons/index.tsx (50 icons)
│   ├── install-prompt.tsx
│   ├── logo.tsx
│   ├── menu-drawer.tsx
│   ├── page-header.tsx
│   ├── signup-prompt.tsx
│   ├── splash.tsx
│   ├── watermark.tsx
│   └── wm-image.tsx
├── lib/
│   ├── data/ (businesses + user + areas + index)
│   ├── ranking.ts
│   ├── search/ (normalize + synonyms + history + index)
│   ├── supabase/ (public + server + service + browser)
│   ├── utils/distance.ts
│   └── validations/auth.ts
├── public/
│   ├── eah-word.webp
│   ├── eah-crown.webp
│   ├── icon-192.png
│   └── icon-512.png
├── proxy.ts
└── next.config.ts

---

## 8. المشاكل المعروفة

### 8.1 React #418 (Hydration Mismatch)
- **السبب:** random/data client مختلف بين server/client.
- **الحل:** mounted guard + shuffle على server.
- **تم:** في Featured Bento.

### 8.2 Firefox Console مش بيعرض output
- **العَرَض:** console.log('test') → undefined.
- **الحل:** استخدم Chrome / Edge.
- **تم:** موثّق في LESSONS.md.

### 8.3 Facebook CDN 502
- **السبب:** بعض الصور من fbcdn.net.
- **الحل:** fallback gradient (BusinessCard).
- **تم:** في BusinessCard.

### 8.4 build محلي = SIGILL
- **السبب:** معالج قديم.
- **الحل:** Vercel Preview فقط.

### 8.5 صفحات مفقودة
- **404 حالياً:** /about, /account, /notifications, /featured, /offers, /trends, /new, /nearby, /suggest, /support, /merchant, /admin, /terms, /privacy, /cookies, /pricing, /advertise, /contact, /support-palestine.
- **الحل:** تُبنى في المراحل القادمة.

---

## 9. نصائح للـ AI الجديد

### 9.1 قبل أي تعديل
- **دوّر** على الملف أول (`find`, `grep`).
- **اقرأ** الملف كامل.
- **افهم** استخداماته.
- **اسأل** لو مش واضح.

### 9.2 أثناء التعديل
- **عدّل حاجة واحدة** — متخلطش.
- **typecheck** بعد كل تعديل.
- **commit** صغير.

### 9.3 طريقة الكتابة
- **`cat > file << 'EOF'`** — للملفات الصغيرة.
- **chunks (15-20 سطر)** — للملفات الكبيرة.
- **VSCode** — لو متاح (مش ممنوع — بس إنت قلت بلاش).
- **متعملش paste** في terminal — بيفشل.

### 9.4 عند الخطأ
- **قف** — متكمّلش.
- **اجمع أدلة** — Console + Network.
- **افهم** السبب.
- **اسأل** لو مش عارف.

---

## 10. القاعدة الذهبية

> لو مش فاهم → اسأل.
> لو مش متأكد → اتأكد.
> لو فيه خطر → قف.
> لو فيه شك → اسأل.

**الالتزام = مشروع نظيف.**
**التجاهل = مشروع ملخبط.**

---

## 11. الخلاصة

**EAH مشروع احترافي — محتاج شغل احترافي.**

**أنت دلوقتي:**
1. ✅ قريت الرسالة دي.
2. ⏳ هتقرأ الملفات الـ 14.
3. ⏳ هتقول "قرأت. جاهز.".
4. ⏳ هتستنى تعليمات NourEldin.

**الرحلة:**
- **3 شهور** → MVP كامل.
- **6 شهور** → إطلاق رسمي.
- **سنة** → 20K مستخدم.
- **5 سنين** → 500K مستخدم.

**مرحباً بك في EAH! 🚀**

---

آخر تحديث: 2026-09-27
