
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
