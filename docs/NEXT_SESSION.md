# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last commit: b43e770
- Branch: main (clean)
- Businesses in DB: 0 (fresh start)
- Invariants: all OK (B1=0, B6=34, X1-X4=0) — CI gate active (`.github/workflows/invariants.yml`)

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
- SEC-01: 11 keys rotate (DEFERRED — owner call)
- SEC-02b: VERCEL_OIDC_TOKEN in git history (a322552) — needs filter-repo before launch
- GOD-01: business-form.tsx = 1179 lines (Pre-Launch RED)
- DB-04/05, AP-05: pending

## Next Priorities (in order)
1. GOD-01: split business-form.tsx (1179 → ≤300) — Pre-Launch RED
2. EMPTY-01 + CONFLICT-01: delete empty tables + business_commissions (migration)
3. CONSISTENCY-01: SACRED to 4 types
4. SPRAWL-01: merge monitoring pages
5. CI-01 + CI-02: E2E on main
6. UI redesign: business detail page (YouTube Studio pattern)
7. UI redesign: wizard full-width + edit page separated
8. Add 20+ real businesses
9. DB-04, DB-05, AP-05 fixes

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
