# Project Status — v0.2.0

## Mission
Build a local discovery platform that starts in Shibin El-Qanater and nearby villages/centers, then expands.

## Current version
**v0.2.0** — Discovery + UX + PWA (in progress)

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
- DB: 23 tables, 34 functions, 46 RLS policies
- Storage: 3 buckets (business-media, business-menu, business-offers)
- Anti-manipulation v1: server-side hash + rate limit
- Public pages: `/`, `/explore`, `/recommend`, `/offers`, `/businesses/[slug]`, `/about`, `/contact`, `/terms`, `/privacy`
- Auth pages: `/auth`, `/auth/change-password`, `/auth/recover`
- Admin: `/admin` (full)
- Merchant: `/merchant` (full)
- Customer: `/account`

## What's next (priority order)
1. `middleware.ts` for session refresh
2. Onboarding flow (after signup)
3. PWA install prompt
4. Real trends from page_view_events
5. Notifications

## Known issues
- No `middleware.ts` → sessions don't auto-refresh
- Git auto-deploy not connected (GitHub permissions issue)
- Rate limit is in-memory (not distributed)

## Golden rules
See `PROJECT_MEMORY.md` section 3.
