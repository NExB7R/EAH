
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
