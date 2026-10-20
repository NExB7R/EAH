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
3. **Dedicated session: DB-04/05** (security RPCs — needs migration + testing)
4. SEC-01 rotate (when owner ready)
5. Mobile QA polish

## DB-04/05 — Session Blockers (not quick fixes)

**DB-04:** RPCs called from user client must be converted OR revoked:
- `check_*_badges` in `lib/data/badges.ts` → **needs ownership check inside RPC** (not simple service swap; would allow self-award if naively converted)
- `get_multi_account_ips` in `lib/data/fraud.ts` → convert to service client (admin-only)
- `find_by_phone` in `/api/find-by-phone` → convert to service client + rate limit
- `is_phone_registered` in `auth/actions.ts` → convert to service client
- `get_referral_*` in `lib/data/referrals.ts` → convert to service client OR verify RPC checks p_user_id = auth.uid()

**DB-05:** `get_business_funnel/features/trial_status/user_points` — NO callers in code, but SQL check pending:
- Run SQL to check triggers + RPC dependencies
- If no triggers: REVOKE authenticated
- If triggers: add ownership check + keep user access

**Before starting DB-04/05 session:**
1. Backup Supabase
2. Run `pg_get_functiondef` on all RPCs
3. Run trigger dependency SQL (I sent above)
4. Plan migrations + rollback
5. Test each step

## B2 remaining (1)

`admin-business.ts` keeps `select('*')` with documented exception:
- 32+ columns used across form/hooks (including working_hours cast)
- Adding explicit columns risks silent breakage on new fields
- Documented in code + §6

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
