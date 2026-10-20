# EAH — NEXT_SESSION.md

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State
- Last security-code commit: 7a42f2b (phone lookup hardening)
- Branch: main
- Invariants: not re-verified after the latest code changes
- Deploy: Vercel status was pending at last check; production runtime not yet verified

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
- **DB-04/05:** migration `docs/migrations/2026-10-20-revoke-anon-sensitive-rpcs.sql` committed but NOT applied or verified on the production database.
- **AP-04:** phone lookup now sends/verifies Turnstile, uses strict fail-closed rate limiting, and returns an allowlisted response without `user_id`; production verification is pending.
- **Image upload:** merchant upload route still needs repair (it references nonexistent `businesses.logo_url` and ignores the database update error); do not call it fixed.
- **DB-10/11/12:** storage policy/path problems remain open.
- **SEC-01:** rotate 11 previously exposed keys and verify current Vercel values without copying secrets into chat.
- **SEC-02b:** VERCEL_OIDC_TOKEN in git history.
- **DB-14:** migration state drift (43 entries through 2026-09-23; October SQL changes exist outside tracked migration history).
- **B2:** one documented `select('*')` exception.
- **Offers:** verify the `starts_at` filter after the previous fix; do not rely on this old note without checking runtime.

## Next Priorities (in order)
1. Take/confirm a recoverable database backup, then apply `docs/migrations/2026-10-20-revoke-anon-sensitive-rpcs.sql` and verify every targeted function grants as anon/authenticated/service_role. Do not mark DB-04/05 closed until verified.
2. Wait for the current Vercel check to finish; run phone lookup with a real production Turnstile key, then verify 429 throttling and that the response contains no `user_id`.
3. Fix merchant image persistence using `business_media` as the canonical source; check every DB write result and retain the cover URL sync.
4. Run the whole add-business flow (create, owner association, images, pending/review/publish, public page, search, mobile).
5. Resolve the storage-policy findings DB-10/11/12 and reconcile migration history before any further SQL changes.
6. Rotate previously exposed keys and verify build/E2E on the actual release branch.
7. Address the remaining launch checklist only after the blocking flows have test evidence.

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
