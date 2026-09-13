# Changelog

All notable changes to EAH are documented here.

## [v0.2.0] — 2026-09-13

### Added — Discovery + Personalization + PWA
- **SEO**: Dynamic OG image (`app/opengraph-image.tsx`) + `h1` on home + twitter large card + `og:site_name` + `og:url`
- **Auth**: `proxy.ts` (Next.js 16) — session refresh + route protection (`/admin`, `/merchant`) + auto-redirect signed-in users from `/auth`
- **Onboarding**: 4-step overlay (welcome → interests → area + budget → rewards) + jsonb tag storage in `profiles.interests`
- **Personalization**: `lib/personalization.ts` layer on top of `ranking.ts` — category/area/offers/new/trends boosts. Wired into home + recommend.
- **PWA**: Generated `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` from `icon.svg`. Consolidated 2 SW registers → 1, 3 install prompts → 2. Removed dead code.
- **Real Trends**: RPC `get_business_view_stats(text[], int)` + `lib/real-stats.ts` loader. Home + recommend now use real view counts (with mock fallback).
- **Push Notifications**: `push_subscriptions` table + `EnablePushButton` in `/account` + service-role client. Full pipeline: subscribe → DB → send.

### Changed
- `mock-stats.ts`: accepts `override.recentViews` for real view counts
- `home-dynamic.tsx` + `recommend/page.tsx`: use `personalized` order, feed real view stats

### Fixed
- Offers page: title duplication (`العروض | EAH` instead of `العروض | EAH | EAH`)
- Push send: RLS bug — service client bypasses RLS for cross-user reads

### Database migrations
- `20260913215640_add_profiles_onboarding_interests.sql`
- `20260913220005_add_get_business_view_stats_rpc.sql`
- `20260913220506_add_push_subscriptions.sql`

### Known issues
- Rate limit in-memory (not distributed)
- Git auto-deploy intermittent (GitHub permissions)
- Secret key rotation pending (exposed in session)

## [v0.1.0] — 2026-09-11

### Added
- Foundation: 23 tables, 34 functions, 46 RLS policies
- Roles & audit foundation (`app_role`, `user_roles`, `audit_logs`)
- Anti-manipulation v1 (server-side hash + rate limit)
- Public pages + auth + admin + merchant + account

