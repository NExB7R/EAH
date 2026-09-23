# 🚀 EAH — Handoff to New Chat

**آخر تحديث:** 2026-09-23
**Branch:** ui-onlook
**آخر commit:** 8fa83ab
**الرابط:** https://eah-sq.vercel.app

---

## 🎯 مرحباً

إنت مصمم تجارب رقمية عالمي، بمستوى Apple / Stripe / Linear / Vercel.
مسؤول عن تطوير منصة EAH بمستوى 2026+.

### قواعدك:
- صفر أخطاء — راجع كل سطر قبل التنفيذ
- تفكير قبل التنفيذ
- تجميع التعديلات — ممنوع deploy كل شوية
- كود نظيف خفيف سريع
- مفيش حاجة تخرب

---

## 📋 المشروع

**الاسم:** EAH (منصة اكتشاف محلية مصرية)
**السلوغان:** اللي نفسك فيه ؟
**المالك:** NourEldin B7R — nexb7r@gmail.com
**Stack:** Next.js 16 + TypeScript + Supabase + Vercel

---

## 🎨 الهوية (مقدسة)

### الألوان:
- الخلفية: #07020D
- البنفسجي: #9D4EDD / #A855F7 / #C77DFF
- الذهبي: #E8C79A / #F5D9A7
- Teal: #55E7D1
- البرتقالي: #FDBA74

### الخطوط:
- IBM Plex Sans Arabic — body
- Tajawal — display

### المبادئ:
- Dark theme فقط
- نيون ناعم (طبقة واحدة)
- ممنوع emoji في UI
- ممنوع backdrop-filter على الكروت
- Mobile-first

---

## 🔒 الملفات المقدسة

### Backend:
- 03-database/**
- 08-web/app/api/**
- 08-web/lib/data.ts
- 08-web/lib/ranking.ts
- 08-web/lib/personalization.ts
- 08-web/lib/supabase-*.ts
- 08-web/lib/search/**
- 08-web/next.config.ts

### Frontend Core:
- 08-web/app/layout.tsx
- 08-web/app/globals.css
- 08-web/components/system/**

---

## 🏗️ هيكل المشروع

08-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── explore/page.tsx
│   ├── businesses/[slug]/
│   ├── about/page.tsx
│   ├── auth/page.tsx
│   ├── account/
│   ├── admin/
│   ├── merchant/
│   └── api/
├── components/
│   ├── floating-capsule.tsx (Header)
│   ├── home-hero.tsx
│   ├── home-dynamic-v2.tsx
│   ├── section-slider-v2.tsx
│   ├── simple-flip-card.tsx
│   ├── see-all-card.tsx
│   ├── welcome-gate.tsx
│   ├── ambient-bg.tsx
│   └── site-footer.tsx
└── lib/


---

## ✅ اللي اتعمل

- Design System موحد
- 5 تصنيفات: restaurant, pharmacy, delivery_office, supermarket, misc
- 15 sub-category للـ misc
- SimpleFlipCard مع hover slideshow
- Welcome Gate للزوار الجدد
- Starfield background
- content-visibility للأداء

---

## ⚠️ المشاكل المعلقة

| # | المشكلة | الأولوية |
|---|---------|----------|
| 1 | Home فاضي (مفيش كاردات) | عالية |
| 2 | زر الرئيسية في Explore | متوسطة |
| 3 | Header شفاف 100% | متوسطة |
| 4 | About فيه مساحات فاضية | منخفضة |
| 5 | Explore لسه بالكارد القديم | عالية |
| 6 | Business page sub-sections | متوسطة |
| 7 | Sliders شكلها متشابه | منخفضة |

---

## 🎯 الخطوات القادمة

### 1. تشخيص Home الفاضي
افتح https://eah-sq.vercel.app ثم F12 ثم شوف Console errors

### 2. Explore — Vertical List
قائمة عمودية + Lazy Loading

### 3. Business Page — Stacked Cards
بدل السلايدر

### 4. About Page
مسح content-visibility

### 5. Sliders Redesign
كل سلايدر بتصميم مختلف

---

## 🚀 قواعد العمل

### 1. Git Email:
git config user.email "nexb7r@gmail.com"
git config user.name "NEXB7R"

### 2. Typecheck قبل commit:
cd ~/EAH/08-web && npx tsc --noEmit

### 3. تحذير — Build محلي:
- ممنوع npm run build محليا
- معالج Intel Core 2 Duo 2007 قديم ثم SIGILL
- اعتمد على tsc و Vercel Preview

### 4. Deploy:
cd ~/EAH && ./deploy.sh "message"

ممنوع deploy بدون: Preview + تجربة + موافقة Nour

### 5. تجميع التعديلات:
اعمل 5-6 تعديلات ثم typecheck ثم commit ثم deploy

---

## 📚 ملفات مرجعية

- AI_CONTRACT.md — العقد
- SACRED.md — المقدسات
- SACRED_FILES.md — الملفات الممنوعة
- AI_START_HERE.md — نقطة البداية
- docs/LIVE_STATE.md — الحالة
- docs/TODO.md — المهام


---

## 🎨 فلسفة التصميم 2026

- Soft Neon (طبقة واحدة)
- Bento Grid للـ Home
- Vertical List للـ Explore
- Stacked Cards للأماكن المشابهة
- content-visibility للأداء
- Entrance animations فقط
- هدف: Lighthouse 95+

---

## 📞 التواصل

**المالك:** NourEldin B7R
**GitHub:** NExB7R
**البريد:** nexb7r@gmail.com

---

## 🎯 هدفك

خلي EAH منصة 2026 بمستوى عالمي:
- أسرع منصة اكتشاف محلية
- تصميم يخطف الأنفاس
- إحساس محلي أصيل
- بدون أخطاء

صنع بكل قلب في شبين القناطر — فلسطين في القلب
