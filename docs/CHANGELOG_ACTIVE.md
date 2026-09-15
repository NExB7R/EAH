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
