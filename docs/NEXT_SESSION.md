# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last app-code commit: d541ea2 (ownerless activities stay unpublished; contact-save failures trigger rollback)
- Last E2E test commit: 57fd91b (search + public detail fail fast when no business cards exist; E2E workflow also triggers on main push)
- Branch: main
- Vercel build/TypeScript: success on `450400a`, `d541ea2`, and `57fd91b`.
- GitHub Actions: verify/quality/rls-tests/e2e/generate checks repeatedly fail in 2–3 seconds with no job steps or logs, including older commits `da965d4` and `15138a0`; rerunning E2E showed the same. Track as CI-09; actual test results have not been produced.
- Local ESLint/Prettier/Vitest/Playwright were not run in this session. Production browser upload/delete smoke tests remain unverified.

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
- **DB-04/05:** migration `docs/migrations/2026-10-20-revoke-anon-sensitive-rpcs.sql` applied as `20261020203655`; all 8 grants verified (anon denied, authenticated/service_role allowed).
- **DB-20:** migration `docs/migrations/2026-10-20-restrict-phone-lookup-rpcs.sql` applied as `20261020203959`; direct grant verification passed for `find_by_phone` and `is_phone_registered` (only service_role can execute).

- **AP-04:** phone lookup now verifies Turnstile, uses strict fail-closed rate limiting, returns an allowlisted response without `user_id`, and its two data RPCs are service-role-only; Vercel succeeded for code commit `da965d4`, but production CAPTCHA/429 smoke testing is still pending.
- **Image upload:** merchant route writes logo/cover through `business_media`, synchronizes `cover_image_url`, checks database write errors, and reads the logo from media. The app-code commit passed Vercel; a production upload/refresh smoke test is still pending.
- **Admin image removal:** UI preserves the preview on API failure; API validates DB writes and synchronizes the legacy cover URL. Vercel build/TypeScript succeeded on `450400a`; production DELETE behavior and rollback behavior still need a smoke test.
- **AP-15 URL paste:** external images are now downloaded only from validated public HTTPS hosts (DNS-pinned), redirects are revalidated, downloads are capped at 5MB and checked for JPEG/PNG/WebP/AVIF signatures, then uploaded to Cloudinary. Only the resulting Cloudinary URL is stored, and the endpoint has fail-closed admin upload/delete rate limiting. Vercel build succeeded on `450400a`; runtime edge-case testing remains.
- **AP-16 business creation:** the wizard no longer submits `is_published=on` without a selected owner; the server rejects direct publishing without an owner, stores unassigned businesses as admin drafts, and checks/rolls back contact insert failures. A preview of the real DB showed no merchant-role account exists yet, so a real owner must register before end-to-end owner-link testing.
- **Live data baseline (read-only check):** one published business, no `owner_profile_id`, no `business_media` rows, no `business_contact_methods` rows; one profile with admin role and zero merchant-role rows. No live business data was mutated.
- **E2E public discovery:** the test now searches for a published business and opens its public page; it fails instead of silently returning when no card is present. Workflow now runs on `main` pushes. Vercel build succeeded, but the GitHub Actions job failed before any step/logs were created; actual E2E result is unverified (CI-09).
- **DB-10/11/12:** storage policy/path problems remain open.
- **SEC-01:** rotate 11 previously exposed keys and verify current Vercel values without copying secrets into chat.
- **SEC-02b:** VERCEL_OIDC_TOKEN in git history.
- **DB-14:** migration state drift (43 entries through 2026-09-23; October SQL changes exist outside tracked migration history).
- **B2:** one documented `select('*')` exception.
- **Offers:** verify the `starts_at` filter after the previous fix; do not rely on this old note without checking runtime.

## Next Priorities (in order)
1. Resolve CI-09: GitHub Actions workflows fail before starting a runner step and provide no logs. Inspect repository Actions/runner availability in GitHub settings; do not treat checks as passing.
2. Smoke-test admin image upload/removal on the current deployment: valid HTTPS image, reject HTTP/private DNS/unsafe redirects/non-image/over-5MB, refresh persistence, logo and cover deletion, and `cover_image_url` rollback on DB failure where testable.
3. Complete the real add-business flow only when the real owner's account exists: create an unpublished draft, link the correct owner, upload logo/cover/menu/gallery, approve/publish, then confirm public page, search, and mobile view. Do not attach the existing activity to an arbitrary account or create fake business data.
4. Run `web/supabase/tests/rls.test.sql` against the intended test DB with pgTAP; the file now has `plan(37)` / 37 assertions, but they have not been run.
5. Test phone lookup with the real production Turnstile key and verify 429 throttling plus a response that contains no `user_id`.
6. Test merchant logo/cover upload on production: upload, refresh, confirm logo/cover still show, and verify a non-owner receives 403.
7. Resolve remaining storage findings DB-10/11/12 and reconcile migration history before any more schema changes.
8. Rotate previously exposed keys and verify E2E on the actual release branch.

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
