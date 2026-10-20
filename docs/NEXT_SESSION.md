# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last reviewed code commit: 435d40f (service client marked server-only)
- Branch: main
- Invariants/typecheck: not re-verified after the latest code changes
- Deploy: Vercel check pending; production runtime not yet verified

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
- **DB-04/05:** migration `docs/migrations/2026-10-20-revoke-anon-sensitive-rpcs.sql` applied to Supabase as `20261020203655`; direct grant verification passed for all 8 targeted RPCs (anon denied, authenticated/service_role allowed).
- **AP-04:** phone lookup now sends/verifies Turnstile, uses strict fail-closed rate limiting, and returns an allowlisted response without `user_id`; production verification is pending.
- **Image upload:** merchant route now writes logo/cover through `business_media`, synchronizes `cover_image_url`, checks database write errors, and reads the logo from media. Code is committed; Vercel build and a production upload/refresh smoke test are still pending.
- **DB-10/11/12:** storage policy/path problems remain open.
- **SEC-01:** rotate 11 previously exposed keys and verify current Vercel values without copying secrets into chat.
- **SEC-02b:** VERCEL_OIDC_TOKEN in git history.
- **DB-14:** migration state drift (43 entries through 2026-09-23; October SQL changes exist outside tracked migration history).
- **B2:** one documented `select('*')` exception.
- **Offers:** verify the `starts_at` filter after the previous fix; do not rely on this old note without checking runtime.

## Next Priorities (in order)
1. Verify the latest Vercel deployment completes; the current status was still pending at the last check, and the Vercel log API returned 403 for this connection.
2. Run `web/supabase/tests/rls.test.sql` against the intended test DB with pgTAP; it now includes 16 assertions for the sensitive RPC grants.
3. Test phone lookup with the real production Turnstile key and verify 429 throttling plus a response that contains no `user_id`.
4. Test merchant logo/cover upload on production: upload, refresh, confirm logo/cover still show, and verify a non-owner receives 403. The code change is committed but runtime test is pending.
5. Resolve remaining storage findings DB-10/11/12 and reconcile migration history before any more schema changes.
6. Rotate previously exposed keys and verify E2E on the actual release branch.
7. Run the add-business flow (create, owner association, images, pending/review/publish, public page, search, mobile) before launch.

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
