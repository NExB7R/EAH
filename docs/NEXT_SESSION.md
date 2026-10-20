# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last commit: b45a804
- Branch: main (clean)
- Businesses in DB: 0 (fresh start)

## Working
- Wizard 4-step + custom types + approval
- Contacts repeater (15 max)
- Real-time dashboard + ⌘K palette
- Business detail page (Material 3 base)
- Health, Audit, Studio
- DB-01 (GRANTs), DB-03 (RPCs) hardened
- 64/64 tests passing

## Known Issues
- UI-01: Business detail page layout broken (needs redesign)
- UI-02: Wizard uses sidebar (needs full-width)
- SEC-01: 11 keys need rotate (DEFERRED — DO FIRST)
- DB-04/05, AP-05: pending

## Next Priorities (in order)
1. SEC-01: Rotate 11 exposed keys (30 min) — CRITICAL
2. UI redesign: business detail page (YouTube Studio pattern)
3. UI redesign: wizard full-width + edit page separated
4. Add 20+ real businesses
5. DB-04, DB-05, AP-05 fixes

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
