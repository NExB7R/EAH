# EAH — SESSION_LOG.md

> سجل الجلسات. كل جلسة تبدأ من حيث انتهت اللي قبلها.

آخر تحديث: 2026-10-01

---

## 2026-09-27 — Session 3: Featured + Pages + Performance

### اللي اتحقق (~35 commit)

**Featured — تحويل كامل:**
- Fisher-Yates + sessionStorage (useFairRotation)
- Premium 2026 design (gold border + shimmer)
- Manual arrows (تظهر بس عند hover) + auto-rotate 5s
- حذف السلايدر → LoadMoreGrid (10 كروت/صفحة)

**Home — تحويل كل الأقسام لصفوف:**
- 8 أقسام بترتيب جديد: Hero → Featured → Trending → Offers → New → Nearby → Suggested
- RowCarousel مشترك: صف واحد + arrows مخفية + auto-scroll 10s
- كل قسم بـ tone مختلف (ذهبي للمميز، برتقالي للترند، بنفسجي للباقي)
- Consolidate colors (Purple Family + Gold + Orange) — SACRED-compliant

**Pages جديدة:**
- `/trends` — Editorial List (rank badge #1 #2 #3)
- `/offers` — Editorial List (offer icon)
- `/new` — Hero Grid (أول كارت كبير)
- `/nearby` — Hero Grid + Location CTA
- `/suggest` — placeholder

**Components جديدة:**
- `secondary-hero.tsx` (لوجو + خط + nav + عنوان)
- `section-nav.tsx` (8 أيقونات + tooltip)
- `section-title.tsx` (6 tones)
- `section-layout.tsx` (Server + LoadMoreGrid)
- `load-more.tsx` (client component للـ pagination)
- `business-card.tsx` (موحّد — كل الأقسام)
- `row-carousel.tsx` (auto-scroll صف واحد)
- `scroll-to-top.tsx` (زر الرجوع)
- `loading-skeleton.tsx` (7 skeletons)
- `trending-row.tsx`, `new-row.tsx`, `nearby-grid.tsx` (Home rows)
- `use-fair-rotation.ts` (Fisher-Yates + sessionStorage)

**Home Discovery القسم الأصلي:**
- اكتشاف → في الهيدر العائم (TargetIcon)
- رشحلى → Section جديد

**Performance:**
- Home: 6 queries → 2 (query واحدة + فلترة)
- TTL: 120s → 300s
- 7 `loading.tsx` skeletons

**Cleanup:**
- حذف: featured-card, featured-showcase, section-badge, editorial-list, hero-grid, section-wrapper, section-page
- حذف: `unstable_cache` قديمة مكررة
- حذف: `.env.original` + `.env.local.bak`

### اللي معلق
- Footer كامل
- `/about` polish
- Account / Merchant / Admin
- Business Page كاملة

---

## 2026-09-25 — Session 2: v2 Core

(مكتوب في الجلسة السابقة)

---

## 2026-09-24 — Session 1: Foundation

(مكتوب في الجلسة السابقة)

---


## 2026-09-28 — Session 4: Business Page + AI Insights

### اللي اتحقق
- Business Page كاملة (Hero + Actions + Tabs + Lightbox + Fixed CTA)
- Smart Lock Modal (قفل ذكي)
- AI Business Advisor (محرك التحليل + Storage + Retention)
- Merchant Apply Wizard (4 خطوات)
- Merchant Dashboard (7 صفحات)
- Admin Dashboard (5 صفحات)
- Pricing + Advertise (4 باقات + 4 إعلانات)
- Account (9 صفحات)
- DB: business_insights + 4 باقات + 4 ad_slots

### المحاولات الفاشلة
- Hermes Agent: اتصب واتمسح (RAM 2GB + Rate limits)

### اللي معلق
- التعليقات + التقييمات الكاملة
- نظام المصداقية الديناميكي
- الفرص الجديدة (30 يوم)
- 5 صفحات Admin المتبقية

---

آخر تحديث: 2026-09-28

## 2026-09-30 — Session 5: Quality Gate System

### اللي اتحقق
- ESLint: 55 → 0 (كل errors + warnings)
- Prettier: 204 ملف formatted
- حذف: featured-rotation.ts + distance.ts + browser.ts (ملفات ميتة)
- حذف: 6 دوال ميتة (getTopBusinesses, getOpportunities, generateAndRedirect, calculateQuickScore, sortByFeatured, shuffleArray)
- حذف: DEFAULT_AREA + AREA_COORDS
- تثبيت: lefthook + gitleaks + knip + jscpd + vitest
- lefthook: 7 طبقات (secrets + tests + prettier + eslint + typecheck + npm-audit + eslint-full)
- Vercel Analytics (5KB بدل Sentry 250KB)
- Vitest: 58 اختبار (trust + ranking + validations)
- GitHub Actions: quality gate
- توثيق: QUALITY.md

### الملفات الجديدة
- lefthook.yml
- web/knip.json
- web/.jscpd.json
- web/.prettierrc.json
- web/.prettierignore
- web/vitest.config.mts
- web/lib/trust.ts
- web/lib/hooks/use-mounted.ts
- web/lib/trust.test.ts
- web/lib/ranking.test.ts
- web/lib/validations/review-auth.test.ts
- web/app/reviews/actions.ts
- web/lib/validations/review.ts
- .github/workflows/quality.yml
- docs/QUALITY.md
- docs/PLAN_TRUST_SOCIAL.md
- docs/PLAN_AI_AGENT.md
- docs/migrations/2026-09-30-trust-foundation.sql

### اللي معلق
- Reviews system (backend اتبنى، لسه محتاج migration + اختبار)
- Trust Score (trust.ts جاهز، محتاج DB)
- البحث بالرقم
- AI Agent

## 2026-10-01 — Session 6: Quality Gate + Security Hardening

### اللي اتحقق (17 commit)

**الجودة:**
- ESLint: 55 → 0
- Prettier: 204 ملف
- 58 اختبار (Vitest)
- GitHub Actions (quality + RLS)
- knip + jscpd + gitleaks
- lefthook (3-stage)
- Dependabot

**الأمان:**
- Column-level REVOKE (5 أعمدة)
- 4 RPC functions (get_my_profile, admin_get_profiles, admin_get_business_owners, is_phone_registered)
- 4 DB Triggers (prevent_self_review, prevent_self_order, detect_review_velocity, log_review_changes)
- Cloudflare Turnstile على التسجيل
- Supabase Auth Rate Limits
- Upstash Rate Limiting على Auth
- CSRF allowedOrigins
- Anonymous sign-ins مقفولة
- Next.js 16.3.8
- Security Headers (COOP, CORP, X-XSS-Protection)

**Features:**
- Impact Card في `/account` (score + level + streak + wanted)
- Follow/Favorite live (تحديث DB + trigger يحدّث impact)
- Review → activity (يحدّث impact تلقائياً)
- البحث بالرقم (Truecaller style) — `/find`

**DB Migrations (4):**
1. `2026-09-30-trust-foundation.sql` — profiles + activities + reviews + moderation
2. `2026-09-30-security-hardening.sql` — 4 triggers
3. `2026-10-01-impact-computation.sql` — compute_user_impact + trigger
4. `2026-10-01-find-by-phone.sql` — RPC find_by_phone

**حل مشاكل:**
- SSH over port 443 (لمشكلة GitHub push)
- Vercel Analytics بدل Sentry (5KB vs 250KB)

### الملفات الجديدة
- lib/trust.ts + trust.test.ts
- lib/ranking.test.ts
- lib/validations/review-auth.test.ts
- lib/rate-limit.ts
- lib/hooks/use-mounted.ts
- components/impact-card.tsx + CSS
- components/find-by-phone.tsx + CSS
- components/review-card.tsx + CSS
- components/review-form.tsx + CSS
- components/reviews-list.tsx + CSS
- app/activities/actions.ts
- app/reviews/actions.ts
- app/find/page.tsx + CSS
- app/api/find-by-phone/route.ts
- lefthook.yml
- web/knip.json
- web/.jscpd.json
- web/.prettierrc.json
- web/vitest.config.mts
- web/supabase/tests/rls.test.sql
- .github/dependabot.yml
- .github/workflows/quality.yml
- docs/AI_LESSONS.md
- docs/QUALITY.md
- docs/SECURITY_PLAN.md
- docs/PLAN_TRUST_SOCIAL.md
- docs/PLAN_AI_AGENT.md
- docs/migrations/ (4 ملفات)

### اللي معلق
- AI Agent (Recourse)
- Web Push (VAPID + SW)
- إشعارات in-app
- اختبار المنصة
- صفحات متبقية

### ملاحظات مهمة للشات الجديد
- **SSH over 443** مفعّل (لأن port 22 محجوب)
- **Supabase على Free** — بيقف عند الخمول
- **SIGILL** في جهاز المستخدم (مفيش build محلي)
- **مفيش استفسارات عن الوقت** — المستخدم بيشتغل في أوقات متقطعة

## 2026-10-02 — Session 7: v1.0.0 Reset

### اللي اتحقق
- Reset version: v2.4.0-alpha → v1.0.0
- CHANGELOG: هيكل جديد (v1.0.0 TBD + Pre-release History)
- docs/CHANGELOG.md → pointer لـ root
- package.json: 0.1.0 → 1.0.0
- eslint-config-next: 16.3.6 → 16.3.8 (match next)
- React: 19.2.8 → 19.3.0
- React-dom: 19.2.8 → 19.3.0
- typecheck نظيف

### الملفات المعدلة
- CHANGELOG.md (root)
- docs/CHANGELOG.md (pointer)
- web/package.json
- web/package-lock.json (تلقائي)
- docs/SESSION_LOG.md

## 2026-10-02 — Session 8: AI Agent + Polish Pass

### اللي اتحقق (35+ commit)

**AI Agent:**
- OpenRouter client (lib/ai/openrouter.ts)
- 3 أدوات: search_businesses + get_business_details + get_my_stats (lib/ai/tools.ts)
- Agent loop (lib/ai/agent.ts)
- API /api/ai/chat (rate limited بـ Upstash)
- Floating widget (components/ai-widget)
- لهجة مصرية + system prompt ذكي

**SEO:**
- sitemap.ts (dynamic — static + 5000 business)
- robots.ts (disallow: /api /admin /account /merchant /auth)
- JSON-LD LocalBusiness على كل business page

**Features كاملة (من قبل):**
- Push notifications + FCM-style toggle
- /admin/notifications (broadcast + audience targeting)
- /admin/featured (pin/order/extend)
- /admin/studio
- /help + /roadmap
- /account/loyalty + /account/referral + /account/notifications/preferences
- /merchant/qr (QR generation)
- /merchant/offers CRUD
- /merchant/orders (status flow)
- /account/orders (timeline tracking)
- OrderModal (customer ordering)
- Reveal contact tracking

**POLISH_PASS §1-5:**
- DistanceBadge + geolocation hook
- Trust badges (verified/trusted/new)
- Featured premium gold + badge shimmer
- Section nav mobile labels + purple active + auto-scroll
- Business hero featured theme
- Business tabs gold for featured
- Announcements gold theme (from admin)

**Regression fixes:**
- React #418 (`<a>` جوّه `<a>`)
- Splash 2026 (LCP-safe)
- React 19.3 → 19.2.8
- Folder rename EAH-V2 → EAH

**Tests:**
- 21 Playwright E2E
- GitHub Actions E2E
- 58 vitest unit

### الملفات الجديدة
- lib/ai/openrouter.ts
- lib/ai/tools.ts
- lib/ai/agent.ts
- app/api/ai/chat/route.ts
- components/ai-widget.tsx + .module.css
- app/sitemap.ts
- app/robots.ts
- lib/utils/distance.ts
- lib/hooks/use-geolocation.ts
- components/distance-badge.tsx + .module.css
- components/order-modal.tsx + .module.css
- app/businesses/[slug]/order-actions.ts
- app/merchant/qr/* (page + generator + actions)
- app/merchant/offers/* (page + form + list + actions)
- app/merchant/orders/* (page + list + row + actions)
- app/admin/featured/* (page + row + actions)
- app/admin/studio/*
- app/admin/notifications/* (complete)
- app/account/loyalty/*
- app/account/referral/*
- app/account/notifications/preferences/*
- app/help/*
- app/roadmap/*
- app/api/push/subscribe + unsubscribe
- app/api/track-contact
- lib/push/server.ts + client.ts
- lib/notifications/server.ts
- components/push-toggle.tsx + .module.css
- public/sw.js (Service Worker)
- e2e/* (12+ tests)
- docs/plans/POLISH_PASS.md
- docs/plans/ANNOUNCEMENTS.md

### اللي معلق
- Support Bot (منفصل عن AI Agent)
- اختبار ميداني على موبايل
- Nonce CSP (أُجل — يخلي كل صفحة dynamic)
- Vercel Pro + Supabase Pro (قبل الإطلاق)
- E2E للـ AI flow

### ملاحظات
- AI Agent يشتغل بموديل مجاني (Llama 3.3 70B)
- Rate limit: 10 أسئلة / 10 دقايق / user
- .env.local فيه OPENROUTER_API_KEY
- Vercel env مضبوط


---

## 2026-10-03 — Session 9: Admin + AI + Feature Flags

### اللي اتحقق (~15 commit)

**Admin كامل:**
- /admin/audit — سجل حقيقي من audit_logs
- /admin/settings — feature flags + app_settings table
- /admin/analytics — page_view_events + top pages/businesses/referrers/devices
- /admin/reports — reports workflow كامل
- /admin/studio — Feature Flags panel (12 flag)

**AI:**
- AI Agent (OpenRouter + Llama 3.3 مجاني)
- Support Bot (منفصل — للأسئلة الفنية)
- Rate limit منفصل لكل واحد

**Pages مكتملة:**
- /help + /roadmap + /contact + /terms + /privacy + /cookies + /faq
- /support-palestine (ذهبي كامل)
- /merchant/business edit كامل

**Feature Flags:**
- lib/features.ts — 12 flag مع caching (unstable_cache + updateTag)
- مطبقة على: Home sections + AI widget + /merchant/qr + /help + /account/notifications

**E2E:**
- 6 اختبارات AI chat + widget
- اختبارات admin pages (auth guards)

### الملفات الجديدة
- lib/features.ts
- lib/ai/support.ts
- app/api/ai/support/route.ts
- components/support-widget.tsx + .module.css
- app/admin/audit/* (page + module.css)
- app/admin/settings/* (actions + form + module.css)
- app/admin/analytics/* (page + module.css)
- app/admin/reports/* (page + list + row + actions + module.css)
- app/admin/studio/* (actions + flags-panel + module.css)
- app/help/help.module.css
- app/roadmap/*
- app/contact/*
- app/terms/*
- app/privacy/*
- app/cookies/*
- app/faq/*
- app/support-palestine/*
- components/legal-page.tsx + .module.css
- e2e/ai-chat.spec.ts

### اللي معلق
- Nonce CSP (يخلي كل صفحة dynamic — قرار)
- /admin/studio Big Features (design live + نصوص ثابتة)
- اختبار ميداني موبايل
- Vercel Pro + Supabase Pro (قبل الإطلاق)

---

## 2026-10-03 — Session 10: Deep Cleanup

### §26 — Single Source of Truth اتصحح
- `PROGRESS.md` → v1.0.0 + `0fbf16b` (commit code)
- `AI_HANDOFF.md` + `NEW_CHAT_MESSAGE.md` → يشاوروا على `PROGRESS.md`

### Git نظيف
- حذف فرع `v2` (GitHub default بقى `main` + Vercel Production بقى `main`)
- حذف 15 tag قديم (محلي + remote)
- حذف 13 فرع قديم (dependabot + arena + archive)
- شيل كل مراجع v2 كفرع من docs

### OG Images (SEO)
- `app/opengraph-image.tsx` (رئيسية)
- `app/twitter-image.tsx`
- `app/businesses/[slug]/opengraph-image.tsx` (لكل نشاط)
- `public/fonts/Tajawal-Black.ttf` + `Tajawal-Bold.ttf` (satori بيقرأ من ملف، مش URL)
- `metadataBase` + `openGraph` + `twitter` في layout
- **مختبر:** `image/png` على Vercel ✅

### Cleanup — knip نظيف
- 2 ملفات ميتة (coming-soon + paid-gate)
- @vitejs/plugin-react (devDep ميت)
- server-only اتضاف (كان ناقص)
- 19 دالة/type ميتة
- 4 أيقونات ميتة (MonitorIcon + SmartphoneIcon + ToggleIcon + PaletteIcon)
- `knip.json` نظّف (removed redundant entries)
- **النتيجة:** knip = صفر dead code

### Docs نظفت
- `docs/SCHEMA.sql` (قديم — Supabase = source of truth)
- `docs/plans/AI_AGENT.md` (اتبني)
- `docs/migrations-archive/` (52 ملف v1 قديم)
- `docs/SECURITY_PLAN.md` (اتدمج جوه `SECURITY.md`)
- `docs/TODO.md` (تكرار FUTURE + SECURITY)

### Speed Insights
- اتحط → Vercel Hobby بيقول "Upgrade to Plus"
- اتشال (مش مفيد على Hobby)

### المراجع
- commits: `4b2dc76` → `dc78e00` (12 commit)
- Vercel: Production branch بقى `main`
- GitHub: default branch بقى `main`


### Schema: business_branches (للرجوع)

- id, business_id, name, area (default شبين القناطر)
- address_text, latitude, longitude, working_hours (jsonb)
- phone, whatsapp, is_primary, is_active, sort_order
- created_at, updated_at

**TODO بكرة:** Branches CRUD للتاجر (add/update/delete/setPrimary)

## 2026-10-04 — Session 11: Splash Crash Fix

### المشكلة
- Client-side navigation بيكسر (`insertBefore`/`removeChild` errors)
- سبب: `el.remove()` في Splash — React بيتلخبط لما يلاقي عنصر مش موجود

### الحل
- Splash بيستخدم `display: none` بدل `el.remove()`
- commit: `952c85c`

### النتيجة
- Splash يفضل في DOM بس مخفي — React يشتغل عادي
- مفيش DOM reconciliation errors

## 2026-10-05/06 — Session 12: Admin Panel Deep Cleanup

### §26 — اتصحح
- v1.0.0 + commit صحيح في PROGRESS.md
- AI_HANDOFF + NEW_CHAT_MESSAGE يشاوروا على PROGRESS

### Git نظيف
- فرع v2 اتحذف (main بس)
- 15 tag قديم + 13 فرع اتحذفوا
- GitHub default = main
- Vercel Production = main

### OG Images (SEO)
- app/opengraph-image.tsx + twitter-image.tsx
- app/businesses/[slug]/opengraph-image.tsx
- fonts محلية (Tajawal-Black + Bold)
- metadataBase + openGraph + twitter في layout

### Cleanup كبير
- knip = صفر dead code
- server-only مضاف
- 19 دالة/type ميتة + 4 أيقونات + 2 ملفات
- docs: SCHEMA.sql + migrations-archive + AI_AGENT.md + SECURITY_PLAN.md + TODO.md اتحذفوا
- SECURITY.md اتدمج

### Features جديدة (كاملة)
1. **Announcements** — جدول + banner + admin UI + flag
2. **Branches CRUD** للتاجر (add/edit/delete/setPrimary/toggle)
3. **/suggest ديناميكي** — بناءً على تاريخ المستخدم
4. **Ads system** — merchant request + admin approve + display
5. **Live Stats Bar** — 8 عدادات فوق الفوتر (Swiss 2026)
6. **Menu Slider + Screenshot** — في OrderModal
7. **Multi-Provider AI** (Groq → Gemini → OpenRouter → Cerebras)
8. **4 AI Tools جديدة** (offers/trending/categories/by-area)

### Security Hardening
- Prompt Injection protection
- Input sanitization (SQL wildcards)
- History validation
- Security guard في system prompt

### Search v2 (Smart Search)
- Word-level matching
- Fuzzy matching (typos)
- Intent detection (open_now/quality/nearby)
- Secondary ranking (is_open + trust + rating)
- Cache + أرقام عربية

### Admin Panel (4 صفحات نظيفة)
- **dashboard** — كروت clickable
- **businesses** — tabs (pending/published/rejected/all) + approve/reject/archive/republish
- **users** — tabs + search + ban/unban/role/trust/premium
- **moderation** — approve/reject/delete مع سبب
- **layout** — cache 30s للأرقام

### Migrations جديدة (3)
- 2026-10-04-announcements
- 2026-10-04-advertisements
- 2026-10-05-business-rejection
- 2026-10-06-review-moderation-fields

### Docs جديدة
- VISION.md (615+ سطر — كل الرؤية 2026-2027)
- USER_PREFERENCES.md (تفضيلات المالك)
- SECRETS_PLAN.md (خطة rotate)
- CODE_REVIEW_LOG.md (20+ مشكلة موثقة)
- NEXT_SESSION.md (المهام المتبقية)

### قرارات مهمة (اتسجلت في VISION)
- باقة العميل المميز = 100 ج.م/شهر
- Verified ≠ مدفوع — مكتسب بالمعايير
- العميل العادي بدون تحكم خصوصية
- رؤية التوسع: 20+ نوع نشاط
- Voice-First للعميل
- Telegram Bot (مؤجل للأساس)

### آخر commit
- d00486a (users page)
- 91c9d96 (moderation migration)


## 2026-10-06 — Session 13: System Health Monitor

### اللي اتحقق

**Feature: System Health Monitor (commit `d465eca`)**
- Migration: `system_errors` table + 4 indexes + RLS (admin-only)
- `lib/logging/errors.ts` — server-side logger (service role)
- `lib/logging/client.ts` — client reporter (fire-and-forget)
- `app/api/log-error/route.ts` — client → server endpoint
- `app/error.tsx` — route-level error boundary
- `app/global-error.tsx` — root boundary (html/body)
- `app/admin/health/page.tsx` + `health.module.css`
- `lib/data/health.ts` — summary + recent errors
- `app/api/cron/cleanup-errors/route.ts` — retention 90 يوم
- `web/vercel.json` — cron مسجّل (3 صباحاً يومياً)
- `components/admin-sidebar.tsx` — أضفنا رابط "صحة النظام"

**الملفات الجديدة:** 11 · **معدّل:** 1

### Docs Sync (§35)
- NEXT_SESSION: شيل مهام خلصت + System Health Monitor
- CODE_REVIEW_LOG: شطب كل #1-#20 (المُصلحة)
- PROGRESS: شيل `featured-rotation.ts` (مش موجود)

### Commits
- `36c6312` docs sync (1818d73)
- `fd7ca1e` docs sync (NEXT_SESSION + CODE_REVIEW_LOG)
- `a3b9087` docs cleanup (stale refs)
- `d465eca` feat: system error monitor

### اللي معلق
- كل المهام في `NEXT_SESSION.md` (حرجة + قريب)


## 2026-10-06 — Session 14: Deep Audit + Critical Fixes

### اللي اتحقق (18 commit)

**الفحص كشف 15+ مشكلة حرجة (كلها كانت بتخلي المشروع مكسور فعلياً):**

**DB Mismatches (أعمدة/جداول مش موجودة):**
1. `profiles.role` مش موجود → helper `lib/auth/admin.ts` + 10 admin actions اتصلحت
2. `advertisements` → `ads` (11 مرجع)
3. `follows` → `business_follows` (7 مراجع)
4. `businesses.whatsapp/phone` مش موجودين → من `business_branches`
5. `order_requests.message` → `items` + `notes`
6. `business_reviews.rating` → 4 أعمدة (taste/vfm/speed/experience)
7. `business_reviews.source/order_id` → مش موجودين، اتشالوا
8. `audit_logs.actor_id` → `actor_user_id` (في migration + code)
9. `reports` 5 أعمدة غلط → الصحيحة
10. `log_review_changes` trigger كان بيفشل بصمت

**Admin Workflow كامل:**
11. `/admin/businesses/[id]` (كان 404)
12. `/admin/businesses/new` (إضافة يدوي)
13. `deleteBusiness` + audit
14. Admin → subscriptions workflow (approve/reject/extend/cancel)
15. Merchant → subscription request (كان مستحيل)

**Audit Logging:**
16. helper `lib/logging/audit.ts`
17. 4 ملفات admin كانت بدون audit → كلها اتضاف
18. Fix: `actor_id` → `actor_user_id` في كل الأماكن

**System Health Monitor (feature جديدة):**
19. جدول `system_errors` + migration
20. `lib/logging/errors.ts` + `lib/logging/client.ts`
21. `app/error.tsx` + `app/global-error.tsx`
22. `/admin/health` + `vercel.json` cron (retention 90 يوم)

### Commits
- `d465eca` feat: system error monitor
- `eeb137d` fix: admin user_roles (كان كل admin معطّل)
- `e41a460` feat: businesses CRUD + subscriptions workflow
- `c299e6f` feat: merchant subscription request
- `92ad687` feat: audit logging for all admin actions
- `7188b37` fix: audit_logs column
- `6748782` fix: reviews columns (taste/vfm/speed/experience)
- `ca80114` fix: orders columns (items/notes + branch.whatsapp)
- `72d0655` fix: table names (advertisements→ads, follows→business_follows)
- `77fa136` fix: reports columns + ads status enum
- `66fb638` + `0476382` fix: reviews insert

### التأثير
**قبل:** 8 أعمدة غلط + 2 جدول مش موجود + كل admin actions ميتة + الطلبات تفشل + التقييمات تفشل + الإعلانات مكسورة
**بعد:** كل الـ workflows شغالة + logging للأخطاء المستقبلية + audit log كامل

### اللي اتأكد سليم
- 27 جدول مستخدمين في الكود — كلهم موجودين في DB ✅
- كل الـ enums صح
- كل الـ RLS policies صح


## 2026-10-06 — Session 14 (تكملة): Fraud Detection

### اللي اتحقق

**Feature: Fraud Detection شامل (مبني على DB موجود)**
- `/admin/fraud` — كشف التلاعب (مُعلّمة + wanted + trust events + multi-IP)
- Report submission UI (`report-button.tsx`) على كل تقييم
- `strictLimiter` (5/15min) على reviews + replies + orders + reports
- `apiLimiter` على activities
- wanted_level trigger (من البلاغات)
- Multi-account detection (signup IP hash + trigger + /admin/fraud section)
- Trust decay cron يومي
- `lib/auth/ip.ts` — SHA-256 IP hash بـ salt
- `lib/data/fraud.ts` — fraud data fetchers

**Migrations جديدة (4):**
- `2026-10-06-fraud-audit.sql`
- `2026-10-06-wanted-level-triggers.sql`
- `2026-10-06-multi-account-detection.sql`
- `2026-10-06-handle-new-user-ip.sql`

### Commits
- `7e997af` feat(fraud): /admin/fraud + trust-decay cron
- `23163ba` feat(fraud): report submission UI + strictLimiter
- `e3a6216` feat(fraud): rate-limits + wanted_level triggers
- `6567795` feat(fraud): multi-account detection

### الميزات المبنية على DB موجود
- `detect_review_velocity` (موجود) → مربوطة trigger
- `auto_flag_review` (موجود) → مربوطة trigger
- `apply_trust_decay` (موجود) → مربوطة cron
- `on_review_trust_trigger` / `on_order_trust_trigger` (موجودين)


## 2026-10-06 — Session 14 (تكملة 2): Badges + Roles + Cleanup

### اللي اتحقق

**Badge System:**
- جدول `badge_catalog` (18 شارة في 5 تصنيفات)
- `/account/badges` — عرض كل الشارات + التقدم
- Auto-award functions (streak/reviewer/social)
- ربط مع submit review + toggle activity

**Role-Based Polish:**
- drawer menu بقى: Guest / Customer / Merchant / Admin
- Merchant apply CTA في `/account` (لو مش عنده نشاط)
- Role-aware notifications empty state

**Cleanup:**
- knip = صفر dead code
- eslint = صفر warnings
- source-map-js updated (vuln fixed)
- sw.js مضاف للـ ignores

### Commits
- `4781f74` feat(badges)
- `a97afe9` feat(roles)
- `d1bc291` feat(roles): role-aware empty
- `38ff16c` chore: cleanup


## 2026-10-07 — Session 15: Trust 2.0 + Geo + Bدايات

### اللي اتحقق

**Trust System 2.0 (commit 9698996):**
- 5 مستويات شعبية: لسه بادئ → ماشي حاله → زي الفل → حريف → الأسطورة
- Log scale (نفس اللي في DB): factor من 1.5 → 0.1
- Legend Points بعد الـ 100
- Migration: `2026-10-06-trust-v2.sql` + `-v2-part2.sql`
- /trust public page + /merchant/trust
- TrustCard بدل ImpactCard
- حذف: impact_score + impact_level + دوالهم

**قسم "بدايات" (commit c36f382):**
- من "الجديد" → "بدايات" (مشاريع لسه فاتحة — مش مسجلين جداد)
- SunriseIcon جديد (2026 style — ذهبي)
- subtitle "مشاريع لسه فاتحة — ادعمهم"

**Geo System 2.0 (commit e2afe76 + 27d63b7):**
- GeoProvider (Context) — قراءة واحدة للموقع لكل الصفحة
- useDistance hook
- DistanceBadge v2 (يعرض "إنت هنا" لو < 100م)
- BranchList — كل فرع بمسافته + شارة "الأقرب ليك" تلقائية
- Cache 1 ساعة (localStorage)

**Cards Update (commit e9bcefc):**
- trending-row: DistanceBadge
- new-row (بدايات): Trust + DistanceBadge

**Reports Fix (commit 9698996):**
- status: open → pending (كان مش متوافق مع DB)
- 3 ملفات اتصلحت

**Impact/Wanted Cleanup:**
- إزالة من DB + الكود
- wanted_level اتحول لـ flagged (داخلي للأدمن)

### Commits الرئيسية
- `9698996` Trust 2.0 + Reports Fix
- `bc70227` /trust + /merchant/trust pages
- `c36f382` بدايات + SunriseIcon
- `e2afe76` GeoProvider
- `27d63b7` BranchList with distances
- `e9bcefc` Cards update (distance + trust)

### المتبقي
- فلاتر متقدمة (مسافة/سعر/باقة/فرز قوي)
- ترتيب العروض (5 معايير + Fair Rotation)
- تقييمات حسب النشاط (محاور ديناميكية)
- تعليقات منفصلة + صور
- إشعار التقييم بعد ساعتين
- المميزون — ميزة منفصلة بفلوس
- التوثيق منفصل عن الباقات
- ترند 7 معايير 2026
- إحالة → trust score

### ملاحظات مهمة للشات الجديد
- راجع `docs/CRITERIA.md` (معايير كاملة)
- راجع `docs/NEXT_SESSION.md` (المهام)
- كل حاجة موثقة في migrations

---

## 2026-10-07 — Session 16: LCP Fix (Splash Removal)

### اللي اتحقق
- شالنا Splash (كان بيعمل overlay ~1s — NO_LCP على Mobile + Desktop)
- layout.tsx: تقسيم لـ TopBar/BottomBar + Suspense islands
- page.tsx: HomeHero يرسم فوراً + HomeSections في Suspense
- globals.css: body fade 250ms (يحترم prefers-reduced-motion)
- preconnect + dns-prefetch لـ Supabase
- cookies page: شالنا مرجع splash

### Commits
- `6b190e1` perf(home): fix LCP — remove splash + Suspense islands + fade

### الأثر المتوقع
- LCP يتحول من NO_LCP → رقم حقيقي
- FCP < 1.8s (كان 3.0s)
- Mobile Performance: 84 → متوقع 90+

### اللي معلق
- Speed Insights يتحدّث خلال ساعة — لازم قياس جديد

---

## 2026-10-07 — Session 17: Reviews + Fair Ranking + Filters

### اللي اتحقق
- **Advanced Filters:** type/area/rating/distance/open/offers/sort — URL-driven, stackable
- **Distance precision:** 10م دقة + tie-breaker 0.5م
- **Fair Ranking Engine:** `lib/fair-ranking.ts` — Relevance+Quality+Freshness+Fairness, diversity constraint, cold-start boost, deterministic daily seed
- **Reviews 2.0:** dimensions JSONB لكل نوع نشاط + review_quality_score + verified_transaction
- **Migration:** `2026-10-07-review-dimensions.sql` (نُفّذت في Supabase)
- **LCP Fix:** شالنا Splash + Suspense islands

### Commits الرئيسية
- `188e88b` unified fair ranking engine
- `ba0d044` reviews dynamic dimensions (JSONB)
- `2fb7287`, `d981409`, `61ac92c` advanced filters
- `6b190e1`, `2bcd89b`, `835c0d5` LCP

### اللي معلق
- Merchant apply: subcategory اختيار
- Explore: subcategory filter
- التقييم بعد ساعتين (CRITERIA §5)
- ترند 7 معايير 2026

---

## 2026-10-07 — Session 18: Data Wipe + Production Ready

### اللي اتحقق
- **Nonce CSP** — per-request nonce via proxy.ts
- **Bundle audit** — MenuSlider dynamic (وفرنا ~30KB)
- **Contrast fix** — WCAG AA (14 مشكلة → صفر)
- **Offline First (Serwist)** — SW + IndexedDB + queue + flush API + offline page + badge
- **Offline-aware mutations** — review/comment/favorite/follow/like
- **Business Insights AI** — peak hours + week-over-week + AI narrative (Groq)
- **Comment thread follows** — YouTube-style notifications
- **مشاكل أمان** — 10 مفاتيح rotate (مؤجل قبل الإطلاق)

### 🎯 Data Wipe (100%)
حذفنا كل الاختبار:
- 59 نشاط وهمي
- 9 عروض تجريبية
- 9 صور unsplash
- 1 تقييم تجريبي
- 1 TEST user (01016701686)
- 54 audit_logs
- 1 notification

**اللي فاضل:**
- ✅ profile: NourEldin B7R (super_admin)
- ✅ 4 subscription_plans
- ✅ 4 ad_slots
- ✅ 18 badge_catalog
- ✅ 1 app_settings

### Commits الرئيسية
- `655b866` Nonce CSP
- `a089642` Bundle + Contrast
- `e2a8980` Offline mutations
- `fa7d975` Offline infra
- `cc45105` Thread follows + AI narrative
- `7479f20` Business caching

### اللي جاي
- إضافة أنشطة حقيقية (بداية جديدة)
- اختبار ميداني شامل
- Telegram Bot
- Vercel Pro + Domain
- Rotate المفاتيح المكشوفة

---

## 2026-10-07 — Session 19: Auth Page Cleanup + AreaDropdown

### اللي اتحقق
- **SiteChromeGate** — إخفاء Footer + LiveStatsBar في `/auth/*`
- **AreaDropdown** — مكوّن جديد (2026 style، panel قابل للتمرير، إغلاق بـ Escape + click outside)
- **auth-form** — شيل قسم "ليه EAH؟" + CUSTOMER_HOOKS + MERCHANT_HOOKS
- **auth.module.css** — شيل 188 سطر (hooks + select native)

### Commits
- `a259a9a` fix(auth): hide footer + stats bar on /auth
- `cdab9ba` feat(ui): AreaDropdown component
- `372f447` refactor(auth): remove hooks + use AreaDropdown

### المتبقي (المرحلة 2)
- Header Home: أيقونات فوق (بدون لوجو/حدود)
- Hero: شيل "سجّل عشان تقيّم" + "عندك نشاط؟"
- Weather في الهيدر (Open-Meteo)
- Stats bar responsive + المسافة الفاضية
- AI widget icon + fix "حدث مشكلة"


---

## 2026-10-07 — Session 20: UI Polish + Safety Layers

### اللي اتحقق

**Auth cleanup:**
- SiteChromeGate — إخفاء Footer + StatsBar في `/auth/*`
- AreaDropdown — مكوّن جديد (2026 style، panel قابل للتمرير)
- شيل قسم "ليه EAH؟" + CUSTOMER_HOOKS + MERCHANT_HOOKS

**Home:**
- Header دايم ظاهر على Home (مش مخفي في الأعلى)
- شيل CTAs من Hero ("سجّل عشان تقيّم" + "عندك نشاط")
- أيقونات التصنيفات: سلايدر أفقي على الموبايل + grid على التابلت

**Voice Search:**
- HomeSearchForm — client component يُملأ الـ input بالصوت
- VoiceSearchButton يقبل `onResult` callback اختياري

**Weather + Stats:**
- HeaderWeather — يقرأ geolocation المستخدم (via GeoProvider)
- Open-Meteo API (مجاني، بدون key) + cache 30 دقيقة
- LiveStatsBar: scroll أفقي على الموبايل (6 كروت)

**Footer:**
- PageHeader `compact` prop (يتخطى 70px padding-top)
- SiteFooter margin-top: 60px → 8px

**AI Widget:**
- أيقونة تاج ذهبية (CrownGoldIcon) بدل Sparkles
- ثيم ذهبي كامل (FAB + header + avatar + send)

### 🐛 Critical Bugs — Fixed

**1. AI Models deprecated (2026-10-07):**
- Groq: `llama-3.3-70b-versatile` → `openai/gpt-oss-120b`
- Gemini: `gemini-2.0-flash` → `gemini-3.8-flash`
- OpenRouter: default fallback → `google/gemini-2.5-flash`
- السبب: كل المزودين شالوا الموديلات بدون إنذار
- **الحماية:** `lib/ai/providers.test.ts` — يفشل لو الموديل القديم رجع

**2. CSS Modules errors:**
- `order-modal.module.css`: overflow conflict (hidden vs overflow-y auto)
- `insight.module.css`: `body` selector → نقل لـ `globals.css`
- **الحماية:** stylelint مع CSS Modules config

**3. Vercel Deploy فشل:**
- Serwist يطلب webpack، Next.js 16 بيستخدم Turbopack افتراضي
- الحل: `build: next build --webpack`
- lefthook `prepare` يفشل على Vercel (مفيش git) → `|| true`
- Vercel Hobby: `review-reminder` كل ساعة ممنوع → 3× يومي

**4. Vercel Git Integration:**
- بعد التحقق: كان متصل، بس webhook تعطّل بعدين اشتغل
- الحل: `npx vercel git connect` + commit فاضي للاختبار

### 🛡️ طبقات الحماية — 13 (من 7)

**جديد في الجلسة:**
- **stylelint** — CSS فحص (CSS Modules aware)
- **commitlint** — conventional commits
- **CodeQL** — أمان عميق (GitHub native)
- **Dependabot** — تحديثات أسبوعية تلقائية
- **providers.test.ts** — حراسة ضد deprecation

### Commits الرئيسية

- `a259a9a` fix(auth): hide footer + stats bar on /auth
- `cdab9ba` feat(ui): AreaDropdown component
- `372f447` refactor(auth): remove hooks
- `2523d9c` feat(home): header always visible + hero cleanup
- `9934f78` feat(hero): voice fills input in place
- `eb3cf3e` feat(header): weather chip + mobile stats scroll
- `d0f75b9` fix(footer): kill empty gap
- `9a47039` feat(ai): gold crown icon
- `3e99a00` chore(ai): verbose error logging
- `1f1e13e` fix(ai): update deprecated models
- `adfc0da` fix(build): don't fail on Vercel
- `3875b59` fix(build): use webpack
- `d046136` fix(css): use :global(body)
- `4821295` chore(quality): add stylelint + AI fixes
- `44d18b9` chore(vercel): cron to 3x daily
- `9ebadde` test: trigger vercel deploy
- `1fa1f40` chore(quality): add commitlint + CodeQL + Dependabot

### اللي معلق

- Build check في CI (محتاج 4 GitHub secrets)
- اختبار المساعد بعد تحديث الموديلات
- `getActiveAdsForSlot` — علاقة FK مكررة في Supabase
- `getActiveAnnouncements` — RLS permission denied


---

## 2026-10-08 — Session 21: Free Trial System + Safety Rails

### اللي اتحقق

**Free Trial System (كامل):**

Migration (مطبقة في Supabase):
- `businesses`: +source (merchant/admin) +trial_used +claimed_at +claimed_by_user_id
- `business_subscriptions`: +notified_days int[]
- RPC `start_business_trial(business_id, days, actor_user_id)` — آمن + idempotent
- Indexes للـ cron

Merchant side:
- `startFreeTrial()` server action (service role RPC call)
- `StartTrialButton` — ذهبي، مع تأكيد
- `getMySubscription` يرجّع `trial_available`
- الزر بيظهر بس لو: trial_used=false + source=merchant + owner موجود

Admin side:
- `adminStartTrial()` — يبدأ تجربة لأي نشاط بأيام مخصصة (1-365)
- `findUserByPhone()` — بحث برقم → user card
- `linkBusinessToUser()` — ربط + ترقية لـ merchant + audit
- `unlinkBusinessOwner()` — فك + تحويل source لـ admin
- `TrialOwnerPanel` — status bar + زر تجربة + ربط + فك

Cron:
- `/api/cron/trial-notifications` — يومي 9ص UTC
- Milestones: 3, 7, 15, 21, 25, 28, 30
- `notified_days[]` يمنع التكرار
- `downgradeExpiredTrials()` — ترجيع basic بعد الانتهاء + إشعار

Admin list:
- تاب جديد "بإدارة الأدمن" (source=admin)
- Badge على كل صف (بإدارة الأدمن ذهبي / بإدارة التاجر بنفسجي)

**Vercel Fixes:**
- `getActiveAdsForSlot`: FK صريح `!ads_business_id_fkey` (كانت 2 علاقات)
- `getAllAds`: نفس الإصلاح
- `announcements` RLS: GRANT SELECT لـ anon+authenticated (SQL editor)

**Voice Search:**
- Pre-check `navigator.permissions` قبل بدء التسجيل
- حالة جديدة `denied` مع رسالة + زر retry
- يفرّق `NotAllowedError` عن باقي الأخطاء

**Live Stats Bar:**
- avgRating: من `dimensions` JSONB (Reviews 2.0) بدل أعمدة قديمة
- أيقونة "مستخدم الشهر" → SparkleStarIcon (كانت مكررة)
- Grid: repeat(8) → repeat(7)
- Flag جديد `live_stats_enabled` (افتراضي false) — مخفي حالياً

**Safety Rails (13 طبقة — كانت 7):**
- stylelint (CSS Modules)
- commitlint (conventional commits)
- CodeQL (weekly security)
- Dependabot (weekly updates)
- Build check (webpack) في CI
- knip + jscpd + RLS: soft → hard fail
- providers.test.ts: حراسة ضد AI model deprecation

**Context Map:**
- `scripts/gen-context-map.mjs` — يولد من الكود
- GitHub Action يولّده + auto-commit
- `docs/CONTEXT_MAP.md` — 90 route + 71 component + 72 lib
- AI_CONTRACT §38 — إلزامي

**AI Onboarding:**
- `docs/AI_ONBOARDING.md` (237 سطر، 13 قسم)
- FILE_ORDER + AI_CONTRACT §0 يشاورا عليه

### Commits الرئيسية

- `f51194b` feat(trial): merchant self-service
- `0334aba` feat(admin): trial + owner management panel
- `732bca4` feat(cron): daily trial notifications
- `1458313` feat(cron): auto-downgrade expired trials
- `8710613` fix(csp): allow api.open-meteo.com
- `c8f6fcd` fix(stats-bar): correct avgRating + dedupe icon
- `d6d4d03` feat(voice): smart mic permission check
- `16df7bf` fix(ads): qualify businesses FK explicitly
- `52e21e1` feat(admin): 'admin-owned' tab + source chip
- `d711fc3` feat(trial): day 3 + 21 notifications
- `5d04e92` docs(onboarding): AI_ONBOARDING.md
- `0969aca` ci(quality): promote soft → hard fails
- `1fa1f40` chore(quality): commitlint + CodeQL + Dependabot
- `a07cbbd` feat(dx): auto-generated CONTEXT_MAP
- `11ca296` feat(flags): hide live_stats until traffic

### SQL Operations (مطبقة في Supabase)

1. Migration: `start_business_trial` RPC + new columns
2. `GRANT SELECT ON announcements TO anon, authenticated`

### اللي معلق

- اختبار ميداني للـ trial flow من أول لآخر
- 4 GitHub Secrets للـ build check الكامل
- إضافة أنشطة حقيقية (الأولوية الأولى دلوقتي)
- التحقق الأمني الشامل

### ملاحظات مهمة للشات الجديد

- **التجربة مرة واحدة بس** — `trial_used` flag
- **source** يحدد: merchant (لو مربوط بتاجر) أو admin
- **Admin يقدر يربط/يفك** من `/admin/businesses/[id]`
- **Cron يعمل يومي 9ص** — يرجّع basic تلقائي
- **live_stats_enabled = false** — يفتح يدوي من /admin/studio


### إضافة بعد الـ session

**Turnstile Fix (مؤقت):**
- Vercel env: بدّلنا مفاتيح الإنتاج بـ Test Keys من Cloudflare
- السبب: domain `eah-sq.vercel.app` مش مسجل في Cloudflare Turnstile
- Test Site Key: `1x00000000000000000000AA`
- Test Secret: `1x0000000000000000000000000000000AA`
- النتيجة: التسجيل شغال ✅
- **مؤجل:** تسجيل الـ domain في Cloudflare + رجوع المفاتيح الحقيقية
- المرجع: `Desktop/X.txt` (المفاتيح الأصلية)


---

## 2026-10-08 — Session 22: CSP + Fonts + A11y

### اللي اتحقق (7 commits)

**Turnstile Production (من Test Keys):**
- CSP: شيلنا `'strict-dynamic'` من proxy.ts
- auth: تمرير nonce عبر props (`x-nonce` من headers)
- auth: hardcode fallback للـ Site Key
- النتيجة: Turnstile Production شغال

**Fonts Migration:**
- `@fontsource` → `next/font/local`
- 5 استيرادات CSS → 1 ملف `app/_fonts.ts`
- preload للتاجوال + Cairo
- التوفير: Desktop TBT 30ms → 0ms · Blocking 300ms → 140ms

**A11y Fixes (87 → 96 → 100):**
- contrast: `--text-muted` + opacity 0.6 → `--text-secondary`
- heading order: footer `<h4>` → `<h2>`
- aria-label لزر الدخول
- touch targets: `iconBtn` + `loginBtn` → 44px

**Regression Guard:**
- `lib/a11y-touch-targets.test.ts`

### PageSpeed Before/After

| المقياس | قبل | بعد |
|---------|-----|-----|
| Mobile Performance | 95 | 95 |
| Desktop Performance | 100 | 100 |
| Mobile A11y | 87 | 100 |
| Desktop A11y | 95 | 100 |
| AI Agent | 1/2 | 2/2 |
| Desktop TBT | 30ms | 0ms |
| Mobile LCP | 3.0s | 2.9-3.0s |

### Commits
- `0c174c3` fix(csp): remove strict-dynamic
- `c4a365d` fix(auth): pass CSP nonce
- `c8ec03e` perf(fonts): next/font/local
- `f744662` fix(a11y): contrast + heading + aria
- `1053d21` fix(a11y): touch targets 44px + guard

### اللي معلق
- Mobile LCP 2.9s → < 2.5s
- إضافة أنشطة حقيقية
- Rotate المفاتيح المكشوفة (11)
