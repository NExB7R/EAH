

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

### feat — 2026-11-03 (Home Local Discovery)
- فصل تصنيفات الأنشطة عن الهيرو وإنشاء شبكة مستقلة متجاوبة.
- ترتيب Home: Featured / Nearby / Trending / Offers / New Activities / Recommendations.
- Featured equal-card rotation بدون pin/order، مع دورة لا تكرر الأنشطة قبل اكتمال العرض.
- Nearby يستخدم الموقع المحفوظ أو المنطقة اليدوية، ولا يعرض مسافات غير حقيقية.
- Trending يعتمد إشارات آخر 30 يومًا ولا يستفيد من الدفع أو نقاط المشاركة.
- Offers يطبق نافذة البداية/النهاية ويستخدم نشاط النشاط المرتبط كـproxy (لا يوجد offer-level tracking حتى الآن).
- New Activities: مدة 30 يومًا من تفعيل الأدمن ثم توقف تلقائي عن القسم.
- Recommendations تختفي حتى تتوفر إشارات اهتمام صريحة كافية.
- إزالة مشاركة المنصة المكررة وبطاقة بريد الدعم غير المضبوطة.
- Insights: استخدام `page_view_events.occurred_at` الفعلي.

**Status:** feature branch only; CI/build/E2E pending; not merged or deployed.


### feat — 2026-10-08 (Session 23)
- Roles Authority: lib/auth/roles.ts + docs/ROLES_MATRIX.md
- Admin Redirects: /account, /merchant -> /admin (ما عدا /account/edit)
- Account Edit: rebuild كامل — رفع صورة + خصوصية + حفظ حقيقي
- Avatar Upload API: /api/upload/avatar -> Cloudinary
- Server Actions: updateProfile + updatePrivacy
- SQL Fix: GRANT (legend_points) + GRANT UPDATE على 8 أعمدة


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

### feat — 2026-10-17 (Admin Panel Overhaul)

**Business Actions:**
- Business Quick Actions: approve/reject/unpublish/schedule من صفحة النشاط
- Business Bulk Actions: تحديد جماعي + toolbar (موافقة/رفض/أرشفة) — max 100
- Bulk reject مع سبب مشترك + notifications تلقائية لكل صاحب نشاط

**Featured & Drag:**
- Featured Drag & Drop (HTML5 native) + `reorderFeatured()` server action
- Featured filters: all/pinned/expiring + search
- Featured stats: total/pinned/expiring (7 أيام)

**Users:**
- Users Bulk Actions: ban (modal مع أيام/سبب) / unban / role / premium
- Users filters: all/customers/merchants/admins/premium/banned + search

**Moderation & Notifications:**
- Moderation filters: 4 tabs (all/pending/flagged/low_rating) + search
- Broadcast History: تبويب ثالث يقرأ من `audit_logs` (action=notifications.broadcast)
- يعرض: title/audience/actor/date/sent/targeted/push

**Health:**
- Health actions: `resolveError` / `unresolveError` / `resolveAllBySeverity`
- Health filters: severity tabs (critical/high/medium/low) + resolved tabs + search
- Error rows: expandable metadata + user_id
- Health CSV export

**Settings:**
- ConfirmModal component — accessible (Escape + focus trap + body-lock)
- 3 tones: danger/warn/default
- Maintenance + signups تحتاج confirmation

**CSV Export (7 أنواع):**
- `lib/utils/csv.ts` — buildCsv + csvResponse (UTF-8 BOM for Excel Arabic)
- `/api/admin/export?type=X&status=Y&q=Z` — businesses/users/subscriptions/featured/ads/audit/health
- ExportButton component يحترم الفلتر الحالي

**Command Palette (⌘K):**
- 21 أمر: 16 navigation + 5 actions (CSV)
- Cmd/Ctrl+K toggle، ESC close، Arrow keys + Enter
- بحث في label/description/keywords (عربي + إنجليزي)
- mounted فقط في `/admin/*`

**Infra:**
- 10 commits, ~3,500 سطر, ~20 ملف جديد
- TypeScript: 0 errors / ESLint: 0 errors
- كل القوائم URL-driven: `?filter=X&q=Y&status=Z`
- كل server actions ترجع `{ ok, error?, affected? }`
- Reduced-motion في كل animations جديدة

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
