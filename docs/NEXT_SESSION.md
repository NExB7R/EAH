# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last commit: (will be updated after final push)
- Branch: main (clean)
- Invariants: all OK
- Deploy: Vercel auto

## Working
- Business wizard fullscreen (UI-02)
- Contact types (10)
- Notice + open-override
- Location picker (📍 + OSM)
- Images: file upload + URL paste (logo/cover/menu/gallery)
- Menu + Gallery sections in admin
- Offers CRUD (admin) + public display (new tab)
- Share modal (WhatsApp/Twitter/FB/Telegram/copy/QR)
- Admin mobile drawer (no sidebar squeeze)
- Admin profile + bell routing
- WhatsApp orders gate
- God Components all split (≤300 lines each)

## Known Issues
- SEC-01: rotate 11 keys (DEFERRED)
- SEC-02b: ***REMOVED*** in git history
- DB-04/05, AP-05: pending
- B2: 5 select('*') (low risk)
- Offers: no "starts_at" filter on public display (shows not-yet-started)

## Next Priorities (in order)
1. **Add first real business** (primary goal)
2. Test offers + images + share + mobile drawer end-to-end
3. SEC-01 rotate (when owner ready)
4. SEC-02b: git history (pre-launch)
5. Mobile QA polish
6. CONSISTENCY-01: SACRED → 4 types

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
