# EAH — Whole-platform launch audit

**Snapshot date:** 2026-10-21  
**Scope:** source-tree inventory, admin/customer/merchant route structure, selected auth/API flows, GitHub workflow configuration, and read-only Supabase inspection.  
**Status:** **NOT READY TO LAUNCH** — this is an initial engineering audit, not a certification that every route or production integration has been tested.

## Inventory observed

- 76 Next.js page routes and 23 API route handlers in the tracked tree.
- 23 test/spec-related files/patterns across Playwright, SQL/RLS tests, and other test sources.
- 41 migration SQL files tracked under `docs/migrations/`.
- 47 migrations reported as applied by the connected Supabase project (latest reported version: `20261020220827`). The repo and live migration histories therefore do not currently reconcile; identify the missing/extra history entries before any future schema change.
- Open platform CI issues: [#20 Supabase security/RLS findings](https://github.com/NExB7R/EAH/issues/20), [#21 CodeQL publishing](https://github.com/NExB7R/EAH/issues/21), [#22 GitHub Actions runners failing before steps](https://github.com/NExB7R/EAH/issues/22).
- Current admin redesign review: [PR #27](https://github.com/NExB7R/EAH/pull/27), stacked on [PR #26](https://github.com/NExB7R/EAH/pull/26). Neither is merged.

## Confirmed findings and branch work

| Priority | Finding | Current disposition |
|---|---|---|
| P0 | The public business-detail query selected `owner_profile_id` through the public Supabase client solely to render an owner banner. | Fixed in this branch: the public payload no longer selects the owner UUID; owner status is checked server-side using the authenticated user's own session ID. Requires build and authenticated-owner/non-owner tests. |
| P1 | Public site chrome was not consistently gated on routes with dedicated admin/merchant/auth shells: the floating capsule and signup/AI/announcement widgets rendered outside `SiteChromeGate`. | Fixed in this branch with a shared server-side route guard: TopBar and BottomBar now skip loading their data in dedicated workspaces, and SiteFooter returns before loading app copy; client-side gates remain defense-in-depth. Requires route tests on desktop and mobile. |
| P1 | Admin business-list data defaulted to the newest 100 rows, then applied query and area filters in memory; the header and status counts were derived from this truncated collection. | Fixed in this branch with exact status counts, DB-filtered results, and pagination. Owner names/phones are searched through a bounded profile lookup, then combined with name/area/owner ID in one database-level OR query, so the result set is paged in the database instead of loaded into server memory. This still requires typecheck/build and representative large-dataset testing. |
| P1 | The admin dashboard pending count included rejected activities, unlike the pending tab. | Fixed in this branch by excluding rows with `rejected_at` from the pending count. |
| P1 | Merchant application writes used the authenticated client for business creation, contacts, active subscription creation, and role promotion, even though live RLS has no regular-user insert policy for `businesses` or `business_contact_methods`, only permits owner subscription inserts as `pending`, and permits `user_roles` updates only to super-admins. Errors were previously ignored. | Fixed in this branch: application eligibility and current role are checked first, the server writes only the current user's unpublished merchant-owned business and related rows through a service client, every required write is checked, and partial applications are rolled back when possible. Admin owner assignment/promotion uses a service client only after `requireAdmin()` and owner-role validation. Requires end-to-end tests on a non-admin account and a regular admin. |
| P1 | Some costly or state-changing paths relied on the default fail-open rate-limit behavior or lacked request bounds. | Hardened in this branch: offline queue flush, AI chat/support/transcription, push subscribe/unsubscribe, contact/action/error telemetry, avatar/comment uploads, insight generation, and the highest-impact customer write actions now fail closed when their limiter is unavailable and apply endpoint-specific payload bounds. A full inventory of all server actions and API routes, plus outage/429 tests, remains required. |
| P1 | Automatic account recovery currently returns an explicit “not available; password was not changed” error. | Open product/implementation gap. Choose and implement the supported recovery channel, with abuse controls and non-enumerating responses. |
| P1 | The old E2E workflow triggered for PRs targeting `v2` and silently pointed Playwright at `https://eah-sq.vercel.app`, so it could test stale code. | Changed in this branch: production smoke runs remain tied to main/v2 pushes; manual E2E runs require an explicit HTTPS Vercel Preview URL and reject the known production hostname. This prevents a PR validation run from silently hitting Production. Latest Preview still needs to be built and the manual test run executed; runner infrastructure remains an open blocker. |

## Additional source-level review completed

- The public phone-lookup endpoint returns profile and trust fields after CAPTCHA and throttling. It intentionally behaves like a phone directory; the policy for public discovery and which fields may be shown is still a launch decision.
- Live role-table schema has a primary key on `user_id` (one role per account); service-side owner-promotion paths must preserve this invariant and must not use a conflict target of `(user_id, role)`.
- IP fingerprints in engagement telemetry now omit the fingerprint when `EAH_VISITOR_SALT` is not configured instead of using a known static fallback; the live column permits null.
- CSP violation telemetry is now rate-limited, request-size bounded, parsed defensively, and logs only truncated fields.
- Shared Cloudinary upload logic now checks the actual image signature and re-labels the uploaded part from detected bytes; SVG/unknown raster formats are not accepted as images.
- Admin and merchant business-image endpoints cap declared multipart request size, handle malformed forms, and validate the admin business UUID before privileged operations.
- Offline queue writes now enforce an 8 KiB body cap, bound review dimensions/slugs, avoid raw DB error disclosure, and check favorite/follow/like write results before returning success.
- Anonymous AI rate-limit keys now use the shared proxy-aware IP helper rather than trusting the first client-supplied `X-Forwarded-For` token.

- Service-role reads for business detail and owner candidates now authorize at the data boundary; fraud intelligence and system-health reads also call `requireAdmin()` before privileged queries.
- Customer badge data now checks the authenticated user and refuses cross-user earned-badge lookups unless the caller is an admin.
- Admin-created activities support `owner_profile_id = null` in their source type, preserving the required owner-optional workflow.
- Push subscription endpoints validate malformed JSON, cap inputs, and return generic error messages instead of exposing raw database errors.
- AI insight generation is rate-limited after ownership/admin authorization and caps its requested metric window at 90 days.
- Admin system health is now linked from the primary navigation and command search.
- Public-shell data work is skipped server-side on `/auth`, `/admin`, and `/merchant`; the client-side display gate remains as an additional layer.

## Findings still requiring targeted tests or decisions

- Search and pagination need test cases where name/area and owner name/phone match the same activity, more than 250 profiles match, page numbers are out of range, and result sets exceed 1,000 records.
- Upload tests must verify MIME/content signatures and storage ownership, not only browser-supplied `Content-Type`; server-side upload helper checks should be retained.
- The global rate-limit outage policy is not finalized for every action. Costly generation and high-impact writes are fail-closed; lower-risk telemetry and read paths need deliberate availability/abuse tradeoffs.
- Public phone/contact visibility (especially phone lookup results), identity/trust badge semantics, recovery channel, analytics consent/retention, commission artifacts, and operating budget still require explicit product decisions.
- No feature branch build or E2E run has validated the latest source yet. Treat code edits as unverified until the actual Vercel build/test outputs are available.

## Live Supabase advisory snapshot (read-only)

The connected project reported:

- **35** `SECURITY DEFINER` functions executable by `anon` and **107** executable by `authenticated` in the Supabase advisor. Each function must be classified as intentionally public, authenticated-user, admin-only, or trigger-only. The counts alone do not prove each function is exploitable; do not revoke all grants without inventorying callers and tests.
- **6** RLS-enabled tables with no policies: `ad_events`, `badge_catalog`, `business_insights`, `loyalty_tiers`, `order_counters`, `rate_limits`. This may be deliberate deny-by-default for server-only data; verify every intended client read/write.
- **2** functions with mutable `search_path`: `public.set_new_until`, `public.get_trust_tier`.
- One Auth warning for leaked/compromised-password protection being disabled.
- Performance advisories: 13 foreign keys without covering indexes, 13 RLS policies with per-row auth-initplan patterns, 137 multiple-permissive-policy findings, 74 unused indexes, and one duplicate index pair on `trust_badges`.

These require individual review against current function definitions and application call sites. No SQL, grants, RLS policies, indexes, migrations, or Production records were changed as part of this audit.

## Production-data baseline observed

A read-only inspection previously found only one business and no linked business contacts or locations for that business. This is not enough representative data to prove the user journey end-to-end or validate large-scale behavior. Do not create a “real” business or alter Production records as a test without the platform owner explicitly choosing a safe test-data plan.

## Decisions needed before launch

1. **Business contact privacy:** who can see branch phone/WhatsApp fields and business contact methods—public visitors, authenticated visitors, owner, or admins? Current docs flag public-read concerns; confirm the policy before changing RLS.
2. **Verification semantics:** distinguish phone-verified accounts, identity-verified people, and platform-trusted businesses; the same “verified” badge must not imply proof that was never collected.
3. **Marketing measurement and privacy:** define which analytics/campaign events are expected, their retention, and the user's notice/consent policy. Do not disable all analytics or add new trackers by assumption.
4. **Zero-commission principle:** source docs describe no commission while the schema/code contains commission-related artifacts. Confirm whether this feature is retired before deleting or wiring it further.
5. **Account recovery:** choose SMS OTP, verified email, or support-assisted recovery; the current server action intentionally does not pretend to change a password.
6. **500k-user operating budget and target:** confirm an acceptable monthly spend and service tier before enabling paid Vercel/Supabase plans or adding paid queue, monitoring, or messaging services.

## Required release gates

- TypeScript typecheck, ESLint, format check, unit tests, Playwright tests against the PR preview, and RLS tests must run and their actual reports must be retained.
- Resolve migration-history drift before adding/applying schema changes.
- Review every `SECURITY DEFINER` function and every Storage bucket policy; run anonymous/customer/merchant/admin/super-admin authorization tests.
- Exercise customer signup/login/profile/favorites/reviews; merchant application, owner isolation, image upload, orders, and subscription; admin activity create/edit/assign-owner/review/publish/unpublish, including ownerless activity visibility; and public search/detail/contact flows.
- Run realistic load tests for expected peak request rate and concurrency—not just 500k registered accounts—and measure p95 latency, error rate, DB connection saturation, cache behavior, and upload/CDN performance.
- Confirm backups and a restore drill, monitoring/alerts, scheduled jobs, domain/SSL, SEO, accessibility, mobile breakpoints, rate limits, abuse response, and rollback procedures.

**Validation note:** the last observed Vercel check reported `build-rate-limit`, and the connected Vercel integration returns a team-scope 403 for direct deployment/log access. The GitHub Actions runner issue is also open. No claim of a passing build or complete test suite is made until a fresh build of the latest commit and the relevant runtime tests finish.
