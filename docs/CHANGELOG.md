# EAH — CHANGELOG.md

كل التغييرات المهمة في المشروع.

---

## [v2.3.0] - 2026-09-30

### Added
- Reviews System (submit + reply + display + sentiment)
- Trust Impact System (trust.ts — 4 pillars + decay + GTA wanted level)
- useMounted + useMediaQuery hooks (React 19 useSyncExternalStore)
- Quality Gate: lefthook + gitleaks + knip + jscpd + vitest
- Vercel Analytics (5KB)
- Vitest: 58 unit tests (trust, ranking, validations)
- GitHub Actions quality gate
- Docs: QUALITY.md, PLAN_TRUST_SOCIAL.md, PLAN_AI_AGENT.md
- Migration: 2026-09-30-trust-foundation.sql

### Changed
- ESLint: 55 → 0 issues
- Prettier: 204 files formatted
- Supabase: 4 clients → 3 (removed browser.ts)

### Removed
- lib/featured-rotation.ts
- lib/utils/distance.ts
- lib/supabase/browser.ts
- 6 dead functions
- 2 dead constants (DEFAULT_AREA, AREA_COORDS)

---

## [v2.2.0] - 2026-09-28

### Added
- **Business Page:** Hero + Tabs + Actions + Fixed CTA + Lightbox
- **Smart Lock Modal:** قفل ذكي للمحتوى
- **AI Business Advisor:** محرك التحليل + Storage + Retention
- **Merchant Apply Wizard:** 4 خطوات
- **Merchant Dashboard:** 7 صفحات
- **Merchant Insights:** AI + Generate + Print
- **Admin Dashboard:** 5 صفحات + Audit + Notifications + Reports + Settings + Insights
- **Account:** 9 صفحات
- **Pricing + Advertise:** 4 باقات + 4 إعلانات
- **Static Pages:** /faq /terms /privacy /cookies /contact /support-palestine
- **Components:** plan-card, paid-gate, smart-lock-modal, business-hero, business-tabs, business-actions, fixed-cta, signature, palestine-heart, sidebars, empty-state, coming-soon
- **DB:** business_insights + 4 باقات + 4 ad_slots

### Changed
- **PROGRESS.md:** المصدر الوحيد للحقيقة
- **SACRED.md:** قائمة الملفات المقدسة محدّثة
- **AI_CONTRACT.md:** Single Source of Truth

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
