# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last commit: `55fa25ef`
- Branch: main (clean)
- Invariants: all OK

**Live (2026-10-23):**
- Admin dashboard 2026 — StatCard + Panel + alerts + quick actions
- Admin sidebar — 6 sections, التقارير مستقل
- Admin business detail — Hero + underline tabs + StatCards (YouTube style)
- **Merchant dashboard — Hero + alerts + KPI + quick actions (YouTube Creator Studio)**
- Reports hub (admin) — generate + print + delete + filter + sections
- Merchant archive — browse all past reports by month
- CI-01 + CI-02 — E2E on PR + auto Vercel preview URL
- Types: 4 only (restaurant/pharmacy/delivery_office/misc)
- GOD-01 split — business-form 1179 → 14 files
- SPRAWL-01 — audit merged into health (tabs)

## Working
- Business wizard fullscreen + 10 contact types
- Notice + open-override + location picker (📍 + OSM)
- Images: file upload + URL paste (logo/cover/menu/gallery) — 200 on all
- Menu + Gallery sections (admin) + ImageGrid resource-based DELETE
- Offers CRUD (admin) + public offers tab
- Share modal (WhatsApp/Twitter/FB/Telegram/copy/QR)
- Admin mobile drawer + profile + bell routing
- WhatsApp orders gate (server-side)
- God Components all split (≤300 lines each)
- 3 layouts unified (admin/merchant/account) with SecondaryHero + 1240px + footer
- All dates/numbers: Western (en-US)
- `/updates` removed
- Invariants CI gate (B1=0, B2=1, B3=10, B4=16, B5=47, B6=31, B7=8, B8=21, X1-X4=0)

## Known Issues
- SEC-01: 11 keys rotate (DEFERRED)
- SEC-02b: ***REMOVED*** in git history (pre-launch)
- B2: 1 select('*') — admin-business (documented exception)
- Testing: end-to-end with real business data pending

## Next Priorities (in order)
1. **Add first real business** (primary goal)
2. Test end-to-end: images + offers + share + mobile drawer
3. SEC-01 rotate (when owner ready)
4. SEC-02b: git history (pre-launch)
5. UI polish based on real-world feedback

## Forbidden
- No Puck/designtools/Surface (failed experiments)
- No new branches before launch
- No DB changes without migration in docs/migrations/
- Never commit .env.local

## Key Files
- AI_PLAYBOOK.md — read first
- BRAIN.md — quick understanding
- ERROR_REGISTER.md — error states
- migrations/ — all DB changes
