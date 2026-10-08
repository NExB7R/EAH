

### perf(home) — 2026-10-07
- **LCP Fix:** شالنا Splash (كان بيعمل overlay 1s — NO_LCP)
- Suspense islands في layout (TopBar/BottomBar) + page (Hero/Sections)
- body fade 250ms (prefers-reduced-motion مدعوم)
- preconnect + dns-prefetch لـ Supabase
- commit: `6b190e1`


### feat — 2026-10-07
- Fair Ranking Engine موحّد (كل الأقسام عادلة)
- Advanced Filters (type/area/rating/distance/open/offers/sort)
- Reviews Dimensions JSONB (لكل نوع نشاط أبعاد مخصصة)
- LCP Fix (شالنا Splash)

## [Unreleased]

### fix — 2026-10-08 (نهائي)
- **A11y Mobile: 87 → 100** 🎯
- **A11y Desktop: 95 → 100**
- Turnstile Production شغال
- Fonts: next/font/local (5 CSS → 1)
- Crown image sizes (توفير 14.5 KB)
- **Tap-targets:** 48×48 + flex-shrink: 0 + إلغاء installPulse
- **Test guards:** a11y-touch-targets + logo-image-sizes

### fix — 2026-10-08
- **CSP + Turnstile**: شيل `'strict-dynamic'` + تمرير nonce — Production شغال
- **Fonts**: `@fontsource` → `next/font/local` (5 CSS → 1) + preload
- **A11y**: contrast + heading order + aria-label + touch targets 44px
- **Test guard**: `a11y-touch-targets.test.ts`
- **PageSpeed**: A11y Mobile 87→100 · Desktop 95→100 · Agent 1/2→2/2


### Trust System 2.0 (2026-10-07)
- 5 مستويات شعبية: لسه بادئ → ماشي حاله → زي الفل → حريف → الأسطورة
- Log scale + Legend Points
- /trust + /merchant/trust
- TrustCard بدل ImpactCard
- حذف Impact + Wanted

### قسم "بدايات" (2026-10-07)
- من "الجديد" → "بدايات" (مشاريع لسه فاتحة)
- SunriseIcon جديد (2026 style)
- subtitle "مشاريع لسه فاتحة — ادعمهم"

### Geo System 2.0 (2026-10-07)
- GeoProvider (Context) — قراءة واحدة
- useDistance hook
- DistanceBadge (إنت هنا)
- BranchList بمسافات + الأقرب ليك

### Reports Fix + Audit (2026-10-07)
- status: open → pending (توافق DB)
- Audit logging كامل
- Notifications prefs

 - 2026-10-02

### Added
- **AI Agent:** OpenRouter + 3 أدوات + Floating widget + لهجة مصرية
- **SEO:** sitemap.ts + robots.ts + JSON-LD LocalBusiness
- **Notifications:**
  - /admin/notifications (broadcast + audience)
  - /account/notifications/preferences
  - Auto notifications (review + reply + follow + offer + order)
  - Announcements gold theme
- **Orders:**
  - OrderModal (customer)
  - Status flow (merchant)
  - Timeline tracking (customer)
  - Track-contact API
- **Push:** VAPID + Service Worker + Toggle
- **Featured:** /admin/featured (pin/order/extend)
- **Studio:** /admin/studio placeholder
- **Pages:** /help + /roadmap + /account/loyalty + /account/referral
- **Merchant:** QR + Offers CRUD
- **Polish Pass:** DistanceBadge + Trust tiers + Nav mobile + Featured gold
- **System Health Monitor:** error logging + `/admin/health` + 90-day retention cron (2026-10-06)

### Changed
- React: 19.3.0 → 19.2.8 (compat with Next 16.3.8)
- CHANGELOG: moved to web/CHANGELOG.md
- Folder: EAH-V2 → EAH

### Fixed
- React #418 (nested `<a>` from Logo href=undefined)
- Splash: LCP-safe 2026 version
- 502 from Facebook CDN (WmImage unoptimized)

### Removed
- Splash (original — was cause of NO_LCP)

### Security
- WmImage trust host allowlist
- Push endpoints reject unauthenticated
- Track-contact auth required

### Tests
- 21 Playwright E2E
- 9 new flows tests
# EAH — CHANGELOG.md

> كل التغييرات المهمة في المشروع.

**الإصدار العام الأول:** v1.0.0 (قادم)
**ملاحظة:** الإصدارات v2.x-α كانت تطوير داخلي قبل الإطلاق العام. محفوظة كـ Pre-release History.

---

## [v1.0.0] — الإطلاق العام (TBD)

### Planned
- Next.js 16.3+ upgrade
- Playwright E2E (5 مسارات حرجة)
- Core Web Vitals baseline + تسجيل
- Updates page (auto-sync + صفحة داخل المنصة)
- Nonce-based CSP
- Cloudflare Turnstile (موجود — يتأكد)
- Upstash Rate Limiting (موجود — يتأكد)
- Vercel Pro + Supabase Pro (قبل الإطلاق)

---

## [Pre-release History]

> التطوير الداخلي قبل الإطلاق العام. محفوظ للأمانة.

---

## [v2.4.0] - 2026-10-01

### Added
- **Quality Gate:** lefthook (3-stage) + knip + jscpd + gitleaks + Vitest (58 tests)
- **CI:** GitHub Actions + Dependabot
- **Security:** Cloudflare Turnstile + Upstash Rate Limiting + Supabase Auth Rate Limits
- **Security:** Column-level REVOKE + 4 RPC functions
- **Security:** 4 DB Triggers (prevent_self_review/order, velocity detection, audit log)
- **Security:** CSRF allowedOrigins + Security Headers (COOP, CORP, X-XSS-Protection)
- **Features:** Impact Card في `/account`
- **Features:** Follow/Favorite live + Review → activity
- **Features:** البحث بالرقم (Truecaller style) — `/find`
- **Docs:** AI_LESSONS.md + QUALITY.md + SECURITY_PLAN.md + PLAN_TRUST_SOCIAL.md + PLAN_AI_AGENT.md
- **DB:** 4 migrations جديدة

### Changed
- Next.js: 16.3.x → 16.3.8
- user.ts: UserSession بقت تشمل impact + privacy fields
- account.ts: getFullProfile بقى يستخدم RPC

### Removed
- lib/featured-rotation.ts
- lib/utils/distance.ts
- lib/supabase/browser.ts
- 6 dead functions

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
