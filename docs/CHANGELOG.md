# EAH — CHANGELOG.md

كل التغييرات المهمة في المشروع.

---

## [v2.1.0] - 2026-09-27

### Added
- **Featured:** Fisher-Yates fair rotation + sessionStorage
- **Featured:** Premium 2026 design (gold + shimmer + manual arrows)
- **Home:** RowCarousel مشترك (auto-scroll 10s + hidden arrows)
- **Home:** 8 sections بترتيب جديد
- **Home:** BusinessCard موحّد (tone per section + rich chips)
- **Pages:** `/trends` `/offers` `/new` `/nearby` `/suggest`
- **Components:** secondary-hero, section-nav, section-title, section-layout, load-more, row-carousel, scroll-to-top, loading-skeleton
- **Home Discovery:** اكتشاف في الهيدر العائم (TargetIcon)
- **Performance:** `loading.tsx` × 7 (skeleton نيون)
- **Performance:** unstable_cache TTL 300s

### Changed
- **Home:** 6 queries → 2 (query واحدة + فلترة في الكود)
- **Pages:** كل الصفحات بتستخدم SectionLayout موحّد
- **Colors:** Purple Family + Gold + Orange (SACRED-compliant)
- **Colors:** Consolidated — حذف الوردي والأزرق القديم
- **BusinessCard:** موحّد لكل الأقسام + tone prop
- **Featured:** سلايدر → LoadMoreGrid (10 كروت)

### Fixed
- Server/Client split في SectionLayout (كان بيعمل 500)
- Featured arrows تظهر بس عند hover

### Removed
- featured-card.tsx + .module.css
- featured-showcase.tsx
- section-badge.tsx + .module.css
- editorial-list.tsx + .module.css
- hero-grid.tsx + .module.css
- section-wrapper.tsx + .module.css
- section-page.tsx + .module.css
- `.env.original` + `.env.local.bak`

---

## [v2.0.0-alpha] - 2026-09-25

(Core كامل — Auth + Design + PWA + Data)

---

## [v0.1.0] - 2026-09-24

(Foundation)
