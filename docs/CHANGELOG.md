
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
