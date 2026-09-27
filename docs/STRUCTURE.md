# EAH — STRUCTURE.md

> بنية الملفات + قواعد التنظيم.
> آخر تحديث: 2026-09-27

---

## 1. البنية العامة

EAH-V2/
├── docs/                      ← الوثائق (24 ملف)
├── web/                       ← Next.js app
│   ├── app/                   ← App Router
│   ├── components/            ← مكونات
│   ├── lib/                   ← Utilities
│   ├── public/                ← Static assets
│   ├── proxy.ts               ← Session refresh
│   └── next.config.ts         ← Config
└── CHANGELOG.md

---

## 2. قواعد التسمية

| النوع | Convention | مثال |
|------|-----------|------|
| Components | PascalCase | BusinessCard.tsx |
| Files | kebab-case | business-card.tsx |
| Variables | camelCase | userName |
| Constants | UPPER_SNAKE | MAX_RETRIES |
| CSS Classes | camelCase | .cardHeader |
| CSS Variables | kebab-case | --purple-primary |
| Types | PascalCase | BusinessType |
| DB Tables | snake_case | business_media |

---

## 3. ترتيب الملفات

### Component (.tsx)
1. Imports
2. Types
3. Constants
4. Helpers
5. Component
6. Export

### CSS Module
1. Base
2. Variants
3. States
4. Children
5. Responsive
6. Reduced motion

---

## 4. هيكل components

### Layout
- floating-capsule.tsx — الهيدر العائم
- menu-drawer.tsx — القائمة الجانبية
- secondary-hero.tsx — الهيرو الثاني (لكل صفحة)
- page-header.tsx — هيدر بسيط
- section-nav.tsx — أيقونات التنقل
- section-title.tsx — عنوان القسم (6 tones)
- scroll-to-top.tsx — زر الرجوع

### Cards
- business-card.tsx — موحّد لكل الأقسام
- featured-bento.tsx — Home Featured (8/6/4)

### Home Sections
- home-hero.tsx — Hero
- trending-row.tsx — الترند
- offers-strip.tsx — العروض
- new-row.tsx — الجديد
- nearby-grid.tsx — قريب منك
- nearby-cta.tsx — location
- suggested-section.tsx — رشحلى

### Shared
- row-carousel.tsx — صف أفقي متحرك
- load-more.tsx — pagination client
- section-layout.tsx — wrapper للصفحات
- loading-skeleton.tsx — skeleton

### UI
- avatar.tsx, logo.tsx, splash.tsx
- watermark.tsx, wm-image.tsx
- icons/index.tsx (50 icons)
- install-prompt.tsx, signup-prompt.tsx, review-reminder.tsx
- explore-search.tsx

---

## 5. هيكل lib

### Data
- data/businesses.ts — 11 query (cache 300s)
- data/user.ts — session
- data/areas.ts — المناطق
- data/index.ts — re-exports

### Hooks
- hooks/use-fair-rotation.ts — Fisher-Yates + sessionStorage

### Utils
- ranking.ts — trendScore + dailyShuffle
- engagement.ts — tracking
- nav-items.ts — التنقل (8 items)
- featured-rotation.ts — ⚠️ مش مستخدم
- search/ — normalize + synonyms + history
- utils/distance.ts
- validations/auth.ts

### Supabase
- supabase/public.ts — بدون cookies (cached)
- supabase/server.ts — مع cookies (auth)
- supabase/service.ts — bypass RLS (admin)
- supabase/browser.ts — client components

---

## 6. قواعد DRY / KISS / YAGNI

### DRY
- 3 مرات → استخرج Helper/Component.
- 3 مرات CSS → Variable.
- 3 مرات query → دالة.

### KISS
- أبسط حل = الأحسن.
- مفيش over-engineering.

### YAGNI
- متضيفش features لم تُطلب.

---

## 7. المراجع

- AI_CONTRACT.md
- ARCHITECTURE.md
- DESIGN_SYSTEM.md
- LESSONS.md

---

آخر تحديث: 2026-09-27
