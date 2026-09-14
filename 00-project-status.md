# Project Status — v0.3.0

## Mission
Build a local discovery platform that starts in Shibin El-Qanater and nearby villages/centers, then expands.

## Current version
**v0.3.0** — Discovery + Personalization + PWA + Subscriptions

## Business model
- Free core discovery experience
- Restaurants can pay for featured placement
- Future: customer CRM + order-bot tooling
- No commission-based ordering in MVP

## Live URLs
- **Production:** https://eah-sq.vercel.app
- **GitHub:** https://github.com/NExB7R/EAH (branch: `ui-onlook`)
- **Supabase:** npmpiivmdksdirrumbmt (Frankfurt, eu-central-1)

## What's working
- DB: core discovery + analytics + rewards/referrals + subscriptions + notification foundations
- Storage: business-media, business-menu, business-offers
- Anti-manipulation v1: server-side visitor hashing + rate limiting
- Auth route session refresh: `proxy.ts`
- Public discovery: `/`, `/explore`, `/recommend`, `/offers`, `/businesses/[slug]`, `/about`, `/contact`, `/terms`, `/privacy`
- Auth: `/auth`, `/auth/change-password`, `/auth/recover`
- Admin: `/admin` with super-admin gate
- Merchant: `/merchant`
- Customer: `/account`
- Real view stats + personalization + push notifications + subscriptions
- Admin Studio persists site design in Supabase `site_designs`

## Active quality/security work
- Privileged RPC boundaries hardened for admin analytics, verification eligibility, business subscriptions, and subscription expiry.
- `touch_updated_at` and `is_open_now` now use explicit system search paths.
- GitHub quality gate: `npm run typecheck` on `ui-onlook` pushes and pull requests.

## Known issues / follow-up
- Supabase leaked-password protection still needs enabling in Auth settings.
- Rate limiting remains in-memory and is not distributed.
- Supabase performance lints still include unindexed foreign keys, RLS init-plan warnings, unused indexes, and multiple permissive policy groups; review before scale-up.
- `main` is not the active product branch; `ui-onlook` is the current development/deployment source.

## Golden rules
See `PROJECT_MEMORY.md` and `AGENTS.md`.