# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last reviewed app-code commit: 450400a (safe remote image import + fail-closed admin upload limiter)
- Branch: main
- Vercel build/TypeScript: success on main commit `450400a`; local ESLint/Prettier/Vitest were not run in this session
- Deploy: Vercel build/deployment succeeded for `450400a`, superseding the earlier failed check for `2f3ce30`. Production runtime behavior is not yet smoke-tested

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
- **AP-15 URL paste:** external images are now downloaded only from validated public HTTPS hosts (DNS-pinned), redirects are revalidated, downloads are capped at 5MB and checked for JPEG/PNG/WebP/AVIF signatures, then uploaded to Cloudinary. Only the resulting Cloudinary URL is stored, and the endpoint has fail-closed admin upload/delete rate limiting. Vercel build succeeded; runtime edge-case testing remains.
- **DB-10/11/12:** storage policy/path problems remain open.
- **SEC-01:** rotate 11 previously exposed keys and verify current Vercel values without copying secrets into chat.
- **SEC-02b:** VERCEL_OIDC_TOKEN in git history.
- **DB-14:** migration state drift (43 entries through 2026-09-23; October SQL changes exist outside tracked migration history).
- **B2:** one documented `select('*')` exception.
- **Offers:** verify the `starts_at` filter after the previous fix; do not rely on this old note without checking runtime.

## Next Priorities (in order)
1. Smoke-test admin image upload/removal on the current deployment: valid HTTPS image, reject HTTP/private DNS/unsafe redirects/non-image/over-5MB, refresh persistence, logo and cover deletion, and `cover_image_url` rollback on DB failure where testable.
2. Run the real add-business flow end-to-end: create a real activity, associate the owner, upload logo/cover/menu/gallery, verify pending/review/publish states, then confirm the public page, search, and mobile view. Do not create fake activity data.
3. Run `web/supabase/tests/rls.test.sql` against the intended test DB with pgTAP; the file now has `plan(37)` / 37 assertions, but they have not been run.
4. Test phone lookup with the real production Turnstile key and verify 429 throttling plus a response that contains no `user_id`.
5. Test merchant logo/cover upload on production: upload, refresh, confirm logo/cover still show, and verify a non-owner receives 403.
6. Resolve remaining storage findings DB-10/11/12 and reconcile migration history before any more schema changes.
7. Rotate previously exposed keys and verify E2E on the actual release branch.

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
