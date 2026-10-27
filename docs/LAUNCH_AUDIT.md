# EAH — Whole-platform launch audit

**Snapshot date:** 2026-10-27  
**Scope:** source-tree inventory, admin/customer/merchant route structure, selected auth/API flows, GitHub workflow configuration, and read-only Supabase inspection.  
**Status:** **NOT READY TO LAUNCH** — this is an initial engineering audit, not a certification that every route or production integration has been tested.

## Current deployment and validation status (2026-10-27)

- Production remains `https://eah-sq.vercel.app`. No changes from this pre-launch branch have been merged to `main` or deployed to production.
- The current PR #33 head is `39be3457dd570a395a565683d53ec2ec1f12447f` on `prelaunch/audit-hardening-2026-10-27`; its Vercel preview is **READY**: https://eah-cryssbz2c-eah-74a0.vercel.app/ (branch alias: https://eah-git-prelaunch-audit-hardening-2026-10-27-eah-74a0.vercel.app/).
- The latest Vercel build compiled successfully, completed TypeScript, generated all 54 static pages, and reached `Build Completed`.
- The current Vercel build on 39be345 compiled successfully, completed TypeScript, generated all 54 static pages, and completed deployment. Anonymous smoke checks returned HTTP 200 for `/`, `/explore`, `/explore?filters=1`, `/explore?type=supermarket`, `/nearby`, `/businesses/tapooosh`, and `/merchant/apply`; the protected `/admin/businesses/new` route resolves to authentication for an anonymous visitor. The supermarket URL filter returns the expected empty state because the currently observed public dataset has no published supermarket activity. These checks do **not** replace signed-in admin/seller E2E tests or actual upload verification.
- Discovery currently shows one published activity on the last observed public dataset. The available preview contains no verified real admin-create submission, so successful creation, owner promotion, image upload, search visibility, and owner permissions still need an authenticated E2E cycle.
- GitHub Actions runs still terminate before any step starts (`runner_id: 0`, zero recorded steps); see [issue #22](https://github.com/NExB7R/EAH/issues/22). A failing run in that state does not establish a source-code test failure. Retries did not resolve runner allocation.
- PR #33 contains a database hardening migration that has **not** been applied to production. A transactional dry-run was rolled back, but migration-history reconciliation, a verified backup/rollback plan, and a non-production RLS run remain release gates.
- PR #34 separately addresses public listing/ads permission errors. Both PRs are still drafts; keep them unmerged until the release gates below have genuine results.

## Inventory observed (initial baseline 2026-10-21)

- 76 Next.js page routes and 23 API route handlers in the tracked tree.
- 23 test/spec-related files/patterns across Playwright, SQL/RLS tests, and other test sources.
- 41 migration SQL files tracked under `docs/migrations/`.
- 47 migrations reported as applied by the connected Supabase project (latest reported version: `20261020220827`). The repo and live migration histories therefore do not currently reconcile; identify the missing/extra history entries before any future schema change.
- Open platform CI issues: [#20 Supabase security/RLS findings](https://github.com/NExB7R/EAH/issues/20), [#21 CodeQL publishing](https://github.com/NExB7R/EAH/issues/21), [#22 GitHub Actions runners failing before steps](https://github.com/NExB7R/EAH/issues/22).
- Current pre-launch hardening: [PR #33](https://github.com/NExB7R/EAH/pull/33). Public permission hotfix: [PR #34](https://github.com/NExB7R/EAH/pull/34). Both remain draft and unmerged.

## Confirmed findings and branch work

| Priority | Finding | Current disposition |
|---|---|---|
| P0 | The public business-detail query selected `owner_profile_id` through the public Supabase client solely to render an owner banner. | Fixed in this branch: the public payload no longer selects the owner UUID; owner status is checked server-side using the authenticated user's own session ID. Requires build and authenticated-owner/non-owner tests. |
| P1 | Public site chrome was not consistently gated on routes with dedicated admin/merchant/auth shells: the floating capsule and signup/AI/announcement widgets rendered outside `SiteChromeGate`. | Fixed in this branch with a shared server-side route guard: TopBar and BottomBar now skip loading their data in dedicated workspaces, and SiteFooter returns before loading app copy; client-side gates remain defense-in-depth. Requires route tests on desktop and mobile. |
| P1 | Admin business-list data defaulted to the newest 100 rows, then applied query and area filters in memory; the header and status counts were derived from this truncated collection. | Fixed in this branch with exact status counts, DB-filtered results, and pagination. Owner names/phones are searched through a bounded profile lookup, then combined with name/area/owner ID in one database-level OR query, so the result set is paged in the database instead of loaded into server memory. This still requires typecheck/build and representative large-dataset testing. |
| P1 | The admin dashboard pending count included rejected activities, unlike the pending tab. | Fixed in this branch by excluding rows with `rejected_at` from the pending count. |
| P1 | Merchant application writes used the authenticated client for business creation, contacts, active subscription creation, and role promotion, even though live RLS has no regular-user insert policy for `businesses` or `business_contact_methods`, only permits owner subscription inserts as `pending`, and permits `user_roles` updates only to super-admins. Errors were previously ignored. | Fixed in this branch: application eligibility and current role are checked first, the server writes only the current user's unpublished merchant-owned business and related rows through a service client, every required write is checked, and partial applications are rolled back when possible. Admin owner assignment/promotion uses a service client only after `requireAdmin()` and owner-role validation; target-role reads for creation, linking, and edit flows also use the guarded service path because live `user_roles` RLS is self-only. Requires end-to-end tests on a non-admin account and a regular admin. |
| P1 | Shared CSV exports escaped delimiters but did not neutralize formula-like untrusted text cells, which can execute when opened in spreadsheet apps. | Fixed in this branch in the shared CSV builder by prefixing dangerous untrusted text cells (`=`, `+`, `-`, `@`, or control-character prefixes) with an apostrophe; numeric values remain unchanged. Added regression tests, not yet executed in CI. |
| P1 | Admin user management calls `admin_get_profiles()` without pagination, then filters/slices results in memory; the users export also processes the full result before joining role records. | Open scalability blocker: a 500k-user dataset can make the admin list/export time out or exceed memory. Proper query/filter pagination requires a compatible bounded RPC/data contract; reconcile live/repo migration history before adding schema changes. No database changes were made. |
| P1 | Production `profiles_authenticated_read` policy is `USING (true)` for all authenticated users. Column grants exclude phone and ban fields, but permit reading profile fields such as bio, gender, avatar URL, area, trust/premium metadata and visibility-setting fields for all profile rows. | Confirm the intended profile directory/privacy contract and ensure settings like `hide_avatar` are enforced by the data boundary—not only the UI. No policy or grants were changed. |
| P1 | Some costly or state-changing paths relied on the default fail-open rate-limit behavior or lacked request bounds. | Hardened in this branch: offline queue flush, AI chat/support/transcription, push subscribe/unsubscribe, contact/action/error telemetry, avatar/comment uploads, insight generation, and the highest-impact customer write actions now fail closed when their limiter is unavailable and apply endpoint-specific payload bounds. A full inventory of all server actions and API routes, plus outage/429 tests, remains required. |
| P1 | Automatic account recovery currently returns an explicit “not available; password was not changed” error. | Open product/implementation gap. Choose and implement the supported recovery channel, with abuse controls and non-enumerating responses. |
| P1 | The old E2E workflow triggered for PRs targeting `v2` and silently pointed Playwright at `https://eah-sq.vercel.app`, so it could test stale code. | Changed in this branch: production smoke runs remain tied to main/v2 pushes; manual E2E runs require an explicit HTTPS Vercel Preview URL and reject the known production hostname. This prevents a PR validation run from silently hitting Production. Latest Preview still needs to be built and the manual test run executed; runner infrastructure remains an open blocker. |

## Additional source-level review completed

- The public phone-lookup endpoint returns profile and trust fields after CAPTCHA and throttling. It intentionally behaves like a phone directory; the policy for public discovery and which fields may be shown is still a launch decision.
- Read-only production RLS/grant inspection found `profiles_authenticated_read` has a `true` row predicate for authenticated users; SELECT grants do not include phone or ban fields, but do include multiple other profile and trust/premium/visibility columns. Confirm whether all authenticated users should be able to query these columns and make hidden-field behavior enforceable server-side.
- Live role-table schema has a primary key on `user_id` (one role per account); service-side owner-promotion paths must preserve this invariant and must not use a conflict target of `(user_id, role)`.
- IP fingerprints in engagement telemetry now omit the fingerprint when `EAH_VISITOR_SALT` is not configured instead of using a known static fallback; the live column permits null.
- CSP violation telemetry is now rate-limited, request-size bounded, parsed defensively, and logs only truncated fields.
- Shared Cloudinary upload logic now checks the actual image signature and re-labels the uploaded part from detected bytes; SVG/unknown raster formats are not accepted as images.
- Latest checks on PR #33 head `39be3457dd570a395a565683d53ec2ec1f12447f` still terminate before any runner step: [E2E](https://github.com/NExB7R/EAH/actions/runs/40566136083), [Quality Gate](https://github.com/NExB7R/EAH/actions/runs/40566136224), [CodeQL](https://github.com/NExB7R/EAH/actions/runs/40566136002), and [Invariants](https://github.com/NExB7R/EAH/actions/runs/40566136277). The Jobs API reports `runner_id=0`, empty runner name, and `steps=0`. These jobs did not run tests or quality checks; [issue #22](https://github.com/NExB7R/EAH/issues/22) remains blocked on runner allocation.
- Admin CSV exports now have a dedicated fail-closed limiter (10 requests per 15 minutes per admin/IP key), validates export types and bounds filter lengths before querying.
- Admin and merchant business-image endpoints cap declared multipart request size, handle malformed forms, and validate the admin business UUID before privileged operations.
- Offline queue writes now enforce an 8 KiB body cap, bound review dimensions/slugs, avoid raw DB error disclosure, and check favorite/follow/like write results before returning success.
- Anonymous AI rate-limit keys now use the shared proxy-aware IP helper rather than trusting the first client-supplied `X-Forwarded-For` token.

- Service-role reads for business detail and owner candidates now authorize at the data boundary; fraud intelligence and system-health reads also call `requireAdmin()` before privileged queries.
- Admin create, link, and edit owner flows read the selected user's role through a guarded server-side query scoped to the supplied user ID; they no longer depend on the admin session being able to read another user's role under self-only RLS.
- Customer badge data now checks the authenticated user and refuses cross-user earned-badge lookups unless the caller is an admin.
- Admin-created activities support `owner_profile_id = null`; visibility is now controlled independently from whether an owner account is linked, as required for admin-created businesses.
- Custom business type review no longer controls public visibility. A pending/rejected custom label falls back to the built-in `أخرى` category; approval shows the approved label, while rejecting or resubmitting the label does not hide the activity. Admin details now include a custom-label correction/resubmission control. Public visibility/approval still require an end-to-end test.
- The admin branch editor now loads inactive branches and stored primary/activity state, lets admins toggle branch activity, keeps edits/deletes scoped to the parent activity, and attempts to restore/reassign the primary branch when a mutation fails or the primary branch is disabled/deleted. The client now preserves the returned ID when creating a branch so the next save updates that branch instead of inserting a duplicate; state updates use functional setters so paired active/primary checkbox changes are not overwritten. These fixes have not yet been run against database-backed regression tests.
- The admin overview now separates the action queue from four global metrics and the live activity feed; redundant quick links and duplicate 24-hour metric cards were removed. The global topbar no longer repeats the page heading, redirect-only navigation entries were removed, and admin accent contrast was strengthened using EAH's existing purple/gold/teal palette. Desktop/mobile visual review is still required.
- The admin sidebar now groups primary workflows by activity, trust/moderation, commercial growth, communication, and system tools. Low-frequency tools are collapsed by default, section headers expose `aria-expanded`/`aria-controls`, and the current route's section opens automatically. The command palette no longer exposes redirect-only report/fraud/announcement aliases; shortcuts now point to the canonical moderation/notification tabs.
- Activity owner management is now unified in the activity edit tab: the duplicate owner accordion that asked admins to paste a raw User ID and invoked a second save-owner server action was removed. The phone-search panel remains the single path and checks account roles before linking. Owner lookup distinguishes query/service failures from a missing account; notification failures are audited without reporting a successfully saved owner link as failed.
- Push subscription endpoints validate malformed JSON, cap inputs, and return generic error messages instead of exposing raw database errors.
- AI insight generation is rate-limited after ownership/admin authorization and caps its requested metric window at 90 days.
- The `/admin/health` redirect-only placeholder was replaced with a real admin-only error log page: summary metrics for the last 24 hours/seven days, critical/unresolved counts, top error paths, filters/search, and resolve/reopen actions. Resolution actions now verify an actual row update and return safe errors instead of falsely reporting success.
- `/admin/profile` now renders the shared profile form inside the admin shell instead of redirecting into the customer account shell.
- The admin topbar bell now opens the personal inbox tab inside `/admin/notifications`, rather than the broadcast-composer tab. Added an inbox shortcut in the command palette, per-notification read actions scoped to the authenticated admin's own `user_id`, and a single four-tab communication workspace for inbox, send, announcements, and broadcast history.
- Merchant and customer dashboards no longer duplicate sidebar destinations as quick-link/stat-card navigation. Merchant application is standalone (no duplicate merchant dashboard chrome), requires a signed-in customer/merchant account before showing the form, redirects admins to the admin flow, and fails closed if the existing-owner check returns a database error. Merchant accounts without an activity see only the overview and registration entry in their sidebar.
- Public-shell data work is skipped server-side on `/auth`, `/admin`, and `/merchant`; the client-side display gate remains as an additional layer.

## Findings still requiring targeted tests or decisions

- Search and pagination need test cases where name/area and owner name/phone match the same activity, more than 250 profiles match, page numbers are out of range, and result sets exceed 1,000 records.
- Upload tests must verify MIME/content signatures and storage ownership, not only browser-supplied `Content-Type`; server-side upload helper checks should be retained.
- The global rate-limit outage policy is not finalized for every action. Costly generation and high-impact writes are fail-closed; lower-risk telemetry and read paths need deliberate availability/abuse tradeoffs.
- Public phone/contact visibility (especially phone lookup results), identity/trust badge semantics, recovery channel, analytics consent/retention, commission artifacts, and operating budget still require explicit product decisions.
- Vercel build for the current PR #33 head `39be3457dd570a395a565683d53ec2ec1f12447f` is `READY`: compilation, TypeScript, and generation of all 54 static pages completed. Interactive E2E, unit-test execution, signed-in owner linking, image uploads, database/RLS tests, and a real admin-create cycle remain unverified because GitHub Actions jobs do not start.

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

**Validation note (updated 2026-10-27):** PR #33 remains open/draft and unmerged. The current Vercel preview at `https://eah-cryssbz2c-eah-74a0.vercel.app/` is READY on commit `39be3457dd570a395a565683d53ec2ec1f12447f`; TypeScript and static generation of 54 pages completed, and anonymous route smoke checks returned HTTP 200. GitHub Actions still fails before job steps (`runner_id=0`, `steps=[]`), so Vitest, Playwright, CodeQL, Invariants, and RLS tests are not verified as passing. The proposed Storage policy change passed an isolated transactional dry-run and was rolled back; a post-rollback query confirmed the original production policy remains. No merge to `main`, production deployment, or production database change was performed.
