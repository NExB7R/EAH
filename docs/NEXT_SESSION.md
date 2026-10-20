# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last commit: ee4abe7
- Branch: main (clean)
- Invariants: all OK (B1=0, B6=34, X1-X4=0) — CI gate active
- Deploy: Vercel (auto)

## Working
- Wizard 4-step fullscreen overlay (UI-02) — no sidebar squeeze
- Contact types (10): phone, whatsapp, complaints, facebook, instagram, website, manager, shift_morning, shift_evening, additional
- Notice system (info/warning/critical + expiry auto-hide)
- Open-now override (auto / open / closed)
- Location picker (geolocation 📍 + OSM iframe preview)
- Admin business detail — 3 tabs (نظرة عامة / تعديل / معاينة) (UI-01)
- Admin profile link in sidebar + avatar routing
- Bell → /admin/notifications for admins
- WhatsApp orders gate (server-side: block if no whatsapp contact)
- 64/64 tests passing

## Known Issues
- SEC-01: 11 keys rotate (DEFERRED — owner call)
- SEC-02b: ***REMOVED*** in git history (a322552) — needs filter-repo before launch
- DB-04/05, AP-05: pending
- hooks.ts = 380 lines (over 300) — split in next session
- B2: 5 select('*') instances — low priority
- GOD-02: new-business-wizard.tsx = 260 lines (YEL, acceptable)

## Next Priorities (in order)
1. **Add first real business** (primary goal)
2. Test notice + open-override + location picker end-to-end
3. Split `business-form-hooks.ts` (380 lines → 2 files)
4. B2: replace 5 select('*') with explicit columns
5. UI-01 polish: notice display in Overview tab if needed
6. SEC-01 rotate (when owner ready)
7. DB-04/05, AP-05

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
