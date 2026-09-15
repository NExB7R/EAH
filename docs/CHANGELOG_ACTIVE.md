# Active Changelog — 2026-09-15 Session

## Commits (ui-onlook)

    c2d87a7  feat(studio): live preview + undo/redo + design renderer
    fb3dfe8  fix(admin): merchant form saves all fields correctly
    2bc80cf  feat: logout fix + simplified profile + clean badges
    0a8119c  feat(brand): proper PWA icons + favicon + side panel persistence
    91fab00  fix: offline page SSR + restore side panel + header tooltips + perf
    97d406f  fix: real data side-panel + premium toggle + clean splash
    b785225  feat(ui): clean glass header + royal splash + metadata coverage
    b57c6ca  feat(ui): Sprint 1 hot fixes — crown + share + cleanup
    8700381  chore(cleanup): consolidate migrations + remove dead supabase folder

## What changed this session

### Bugs fixed
- Logout broken         → proxy.ts exempts /auth/logout
- Merchant form         → lost images/hours/contacts → controlled inputs
- Sentry slow in dev    → disabled unless NODE_ENV=production
- Header CSS error      → rebuilt from scratch

### Features added
- PWA icons             → crown + EAH + neon (favicon + install)
- SidePanel             → real Supabase data + "اعرض نشاطك" CTA
- Offline page          → /offline with beautiful fallback
- Network status        → online/offline indicator
- Studio 2026           → live preview + undo/redo + design renderer

### Design changes
- Profile simplified    → badges only (Crown / Premium / Verified)
- Removed              → titles + frames (~50 titles, ~25 frames)
- Glass header         → transparent at top, appears on scroll
- Tooltips restored    → on header icons

### Deleted
- supabase/ folder (dead duplicate)
- seed-demo-data.sql (violated AGENTS.md)
- profile-presets.ts complexity (replaced)

## Known issues
- Vercel env vars need verification (see VERCEL_SETUP_2026.md)
- GitHub Actions needs secrets (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
- Studio Inspector not yet integrated into editor UI

## Next steps
1. Verify Vercel deploy
2. Add GitHub Actions secrets
3. Integrate Studio Inspector
4. Test merchant form (end-to-end)
