
---

## [v2.1.0] - 2026-09-27 — Featured Redesign

### Added
- `lib/featured-rotation.ts` — Round-Robin عادل (8 ثواني/دورة)
- `components/featured-card.tsx` + `.module.css` — كارت موحد (hero + small)
- `app/featured/page.tsx` + `featured-showcase.tsx` + `featured.module.css`

### Changed
- `components/featured-bento.tsx` — Hero + 4 صغيرة + دوران تلقائي
- `components/featured-bento.module.css` — Bento حقيقي (2fr 1fr 1fr)
- `app/page.tsx` ⚠️ SACRED — شيل dailyShuffle

### Fixed
- عدالة المميزين — كل مميز ياخد Hero بنفس عدد المرات
- Hydration — الدوران مبني على `initialStart` من الـ server

---

## [v2.1.2] - 2026-09-27 — Featured Card Rich Info

### Added
- Badges في الكارت: النوع (بأيقونة) + المنطقة + التقييم + المصداقية + واتساب
- Badge "مفتوح/مقفل" على الصورة (أخضر/أحمر)
- Badge "مميز" على الـ hero

### Changed
- `featured-card.tsx` — أيقونات نوع ديناميكية (restaurant/pharmacy/...)
- `featured-card.module.css` — chips صغيرة + topBadges

### Notes
- صفر JS إضافي — كله CSS + JSX
- حقول جديدة (branches_count, offers_count, rating_count) → TODO (محتاج migration)

---

## [v2.1.3] - 2026-09-27 — Business Counts + Card Badges

### Added
- Migration: `branches_count` + `offers_count` + `rating_avg` + `rating_count`
- Triggers على business_branches/offers/business_reviews
- Indexes جديدة
- أيقونات: `StoreIcon` + `GiftIcon`
- Badges في الكارد: فروع + عروض + عدد التقييمات

### Changed
- `featured-card.tsx` — rating_avg الحقيقي لو موجود، وإلا trust_score/20
- `Business` type — 4 حقول جديدة
- `BUSINESS_COLUMNS` — 4 حقول جديدة

### Notes
- Denormalized counts = قراءة فورية (صفر JOIN وقت العرض)
- Triggers تحدّث تلقائي (SECURITY DEFINER)
- الـ migration الحالي: 9 أنشطة عندها عروض

---

## [v2.1.4] - 2026-09-27 — Featured Bento Fix + Fallback

### Fixed
- Bento grid: `grid-template-areas` بدل `grid-column/row` (كان مش شغّال في RTL)
- Hero بيكبر صح (2fr × 2 rows على Desktop)
- الكروت الصغيرة مترتبة صح (s1, s2 / s3, s4)

### Added
- Fallback جميل بدون صورة: أيقونة النوع كبيرة + توهج بنفسجي/ذهبي

### Notes
- معظم الأنشطة مفيش عندها cover → الـ fallback هو الأساسي حالياً
- صفر JS إضافي

---

## [v2.1.5] - 2026-09-27 — Home Scroll-Snap + Header Polish

### Added
- Scroll-snap عمودي (`y proximity`) على Home — إحساس قلب صفحات
- الهيدر مخفي في الهيرو + يظهر بعد ما تسكرول
- featured-bento = صفحة كاملة (min-height 100dvh)

### Changed
- `home-hero` — مساحة فوق اللوجو أقل + spacer اتشال
- `floating-capsule` — data-home + توسيط اللوجو بالظبط
- `app/page.tsx` — `data-snap="true"` على `<main>`

### Fixed
- اللوجو في الهيدر مش متوسّط بالظبط (grid-columns minmax(0,1fr))
- مساحة فاضية كبيرة فوق لوجو الهيرو

### Notes
- `prefers-reduced-motion` → يعطّل snap
- الهيدر يظهر بعد 80px (بدل 50px)

---

## [v2.1.6] - 2026-09-27 — Splash + Install + Bento Polish

### Fixed
- **Splash بيظهر متأخر** — بقى ظاهر من أول paint + useLayoutEffect يخفي قبل paint تاني
- **Install prompt مزعج** — بقى يدوي فقط (من زر الهيدر) — مفيش auto-show
- Header مبهدل — شيلنا `justify-items: center` (grid-columns كفاية)
- Scroll-snap مش بيقلب — `y mandatory` بدل `y proximity`
- Featured Bento في النص — `align-items: flex-start` بدل center

### Changed
- `splash.tsx` — initial hidden=false + useLayoutEffect
- `install-prompt.tsx` — إزالة auto-show (30s) — يدوي فقط
