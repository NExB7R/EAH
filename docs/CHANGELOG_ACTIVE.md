# CHANGELOG — v1.0.0 (2026-09-17)

## Milestone Release

### From v0.8.5 → v1.0.0

**UI/UX**
- 71 files emoji cleanup → 0 emojis
- 30+ neon SVG icons unified
- 16 food category icons
- Global gradient headings (purple→gold)
- 40-icon neon background
- Font weight 900 boost
- Spacing system tokens
- Logo below header fix
- Install above cookies

**Features**
- WhatsApp order flow
- Feature flags admin (per business)
- Ads lifecycle (slots + merchant create + admin approve)
- Moderation dashboard
- Partners transfer ownership
- Facebook collect expansion
- Merchant insights (real daily data)
- Explore filters (2026 design)

**Technical**
- VERSION auto-update from package.json
- AmbientBg rewrite (proper types)
- Emoji cleanup across 71 files
- 37 migrations

---

# Active Changelog — v0.7.6 (2026-09-17)

## Session — WhatsApp Orders + Feature Flags + Ads + Partners

### Features shipped
- WhatsApp order flow (template + confirm RPC + push)
- Feature flags per business (admin controlled, 8 keys)
- Ads system (slots + ads + tracking + admin + merchant UI)
- Moderation (auto-flag + dashboard)
- Partners (transfer ownership)
- Facebook collect expansion (facebook + instagram + website + tiktok + email)
- Analytics SVG chart (no deps)
- Trial: auto-start + countdown + cron (7ص + 7م)
- Maps (Leaflet + CartoDB)
- Bot B7R (avatar + design)

### Data (5 migrations, all applied)
- 20260916100000_business_coordinates
- 20260916110000_auto_trial_on_owner
- 20260916120000_ads_system
- 20260916130000_partners_and_moderation
- business_features (applied via editor)

### UI/Perf
- Hero: tagline + hook
- Crown v15 (static + pulse)
- Footer 2027 (follow cards + QR)
- 66 kicker إنجليزي → عربي
- شيل 50% توهجات + infinite animations
- AmbientBg stickers global
- حذف 7 dead files

### ⚠️ Known issues
- 12 جدول متوقعة مش في Supabase (بس business_partners + business_menu_items اتضافوا يدوياً)
- 111 `any` types
- End-to-end testing لسه

---

# Active Changelog — v0.6.0 (2026-09-17)

## Session 2026-09-17 — UI/Perf/Security

### Commits (ui-onlook) — 30+ commits من 46a0763

**UI:**
- v0.3.5 → v0.6.0: hero/footer/labels/crown/splash polish
- شيل 66 kicker إنجليزي → عربي
- Footer follow cards + QR share modal
- Bot B7R (avatar + design)

**Perf:**
- شيل StickersLayer + ScrollIconsBackground
- CSS: 50% أسرع + شيل infinite
- Splash static

**Features:**
- Trial auto-start (30 يوم) + countdown
- Trial reminder cron (7ص + 7م)
- Maps (Leaflet + CartoDB)
- Advertise marketplace rewrite
- Pricing free/premium/bot rewrite
- About full rewrite
- QR API

**Data:**
- Coordinates migration
- Trial trigger + get_trial_status RPC

### ⚠️ Known issues
- Rate limiting لسه in-memory
- Supabase leaked-password protection لسه مش مفعل
- RLS init-plan warnings
- Missing tests for new features

---

# Active Changelog — Session 2026-09-15

## Commits (ui-onlook) — Batches 1-9

    828b8ff  feat(seo): sitemap + robots + JSON-LD graph
    bf1699c  chore: remove dead files (0 refs)
    b12a573  feat(admin): analytics expanded KPIs
    e8a090c  feat(account): cleaner edit page + status cards
    c8352e9  feat(admin): security center functional dashboard
    f8a2cba  feat(notifications): adminMode + role-aware
    532cd5e  feat(notifications): adminMode + role-aware
    68c52eb  feat(notifications): v2 filters + quiet hours
    617a42b  feat: explore URL-driven + visitor welcome

## Features shipped this session

### Explore
- URL-driven state (type/area/sort/q/open/offers/view)
- Click on categories now works
- Hero logo added, duplicate search bar removed

### Notifications v2
- Role-aware filters + quiet hours
- Premium banner for merchants without sub
- Respects user prefs + quiet_hours in push
- Migration: 20260915000000_add_notif_quiet_hours.sql

### Admin
- Security center: real KPIs + env vars + banned + audit
- Analytics: new users 7d, active 7d, pending reviews
- Dedicated /admin/logout route

### Account
- Edit page: status cards (verified/admin)
- Profile badges simplified (crown/premium/verified)
- Super admin hides trust score

### SEO
- robots.ts comprehensive
- sitemap.ts static + dynamic businesses
- JSON-LD @graph

### Cleanup
- Removed 9 dead files
- Removed stray ui-onlook file

## Pending (next)

- WhatsApp Channel + FB Page links (user)
- Supabase leaked-password protection
- Smart Bot (backlog #1)
- Competitor research (backlog #2)
- Real businesses data (backlog #3)

## Batches 40-46 — Deploy fixes + polish

### Vercel deploy fixes (critical)
- next.config.ts: removed mixed CJS/ESM (was breaking build)
- Removed 4 dynamic OG images (Arabic font shaping unsupported on nodejs runtime)
- proxy.ts: /merchant-info is now public (was blocked by /merchant prefix)
- package.json: engines.node pinned to 22.x < 23

### Final polish
- Cookie consent banner (localStorage persistence)
- Featured + /new pages rewritten (real data)
- Trust section (4 features + CTA)
- Bot: +5 intents (slow, login, cant-find, privacy, terms)
- Loading skeletons (businesses/[slug], offers)
- Neon scrollbar + smooth anchors in globals.css
- Coming-soon: owner CTA added

### Structure (verified)
- 47 components
- 25 lib files
- 67 app pages
- 15 API routes
- 26 migrations
- 100% typecheck pass
- Production: READY ✅


## Batches 47-60 — Final session (2026-09-15 night)

### Order Bot feature (merchant-paid)
- Migration: order_requests table + RLS
- Migration: has_merchant_premium() helper
- components/order-request.tsx: full form (name/phone/area/address/items/notes)
- /api/orders/notify: push notification to merchant
- /merchant/orders: dashboard with status filters
- Merchant dashboard: orders link + gold button

### Homepage + Pricing
- home-hero: animated background (blobs + grid), gradient headline, 4 categories
- /pricing: full rewrite for Egyptian market (3 plans + FAQ + compare)

### Competitors + Data
- docs/COMPETITORS_ANALYSIS.md: Egypt + global matrix
- data/BUSINESSES_TEMPLATE.json + README
- scripts/import-businesses.mjs: idempotent Supabase importer

### Bot + Polish
- smart-bot: 2026 AI orb icon (animated ring + sparkle)
- search: full rewrite with EahLogo hero
- business/[slug]: enhanced JSON-LD + breadcrumbs
- coming-soon: owner CTA + Palestine + WhatsApp

### Final state
- Pages: 68 | API: 16 | Components: 48 | Lib: 25 | Migrations: 27
- 100% typecheck pass
- All imports resolve
- Production: https://eah-sq.vercel.app (READY)

## Next session priorities

### Data collection (in progress)
- Fill data/BUSINESSES.json with real businesses
- Run: npx tsx scripts/import-businesses.ts data/BUSINESSES.json

### Features backlog
1. Real-time order tracking UI
2. Business analytics v2 (charts)
3. Menu management UI
4. Reservation system
5. Multi-merchant order notification

### Docs to read first
- README_AI.md (5-min onboarding)
- docs/COMPETITORS_ANALYSIS.md
- docs/BIG_PROJECTS_BACKLOG.md
