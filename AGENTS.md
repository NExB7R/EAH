# EAH — Project instructions

This is the entry point for every developer and AI session. Read it before changing code.
Canonical product, permission and security decisions live in the linked documents, not in old chat history.

## Read before work

1. `docs/DEVELOPMENT_GUIDE.md` — architecture, commands, security boundaries, testing and hand-off.
2. `docs/PRODUCT_SPEC.md`, `docs/ROLES_MATRIX.md` and `docs/SECURITY.md` — product contracts, roles and permissions.
3. `docs/CONTEXT_MAP.md` — generated route/component/lib map. Run `npm run context-map` to update it; never edit it by hand.
4. `docs/ERROR_REGISTER.md`, `docs/PROGRESS.md` and `docs/LAUNCH_CHECKLIST.md` — current debt and recorded decisions. Verify historical notes against code and CI.

## Product rules

- Exactly three registered roles: الأدمن (`super_admin`), البايع (`merchant`) and المشتري (`customer`). Visitor is an access state, not a fourth role.
- Keep stored role values and existing routes stable unless a reviewed migration and authorization tests explicitly require a change.
- Role, ownership, standing, verification, subscription, publication and order eligibility are separate facts. Never infer permissions from one another.
- Admin may create activities without an owner. Linking an existing user is optional and does not require that user's personal phone number.
- Draft/unpublished activities must never appear in public discovery or public activity detail pages.

## Repository and environment safety

- Work directly on `main`. Do not create test branches or unnecessary PR branches.
- Do not deploy, change Vercel settings, alter secrets or re-run workflows without a reviewed reason.
- Never create fake accounts, activities, uploads or seed data in the connected production Supabase project.
- Database mutation tests require a dedicated non-production database. Keep the RLS workflow's guard that refuses the production project.
- Do not apply SQL migrations to production from an agent session. Review and test them on isolated QA first.
- Treat service-role clients as server-only. Authenticate and authorize before using them; never expose private fields in public payloads.

## Engineering contract

- TypeScript strict mode. Do not introduce `any`, ignored errors, casual type assertions, swallowed write failures or untracked fire-and-forget mutations.
- Validate untrusted server input with schemas; enforce authorization in each server action/route and at the database boundary where applicable.
- Public reads use explicit field allowlists. User-specific responses are `private, no-store`; never cache authenticated HTML, RSC payloads or account/admin APIs in the service worker.
- Use shared EAH design tokens and existing UI primitives. Keep RTL, keyboard navigation, visible focus, touch targets, responsive layouts and reduced-motion behavior.
- Prefer small focused modules, one source of truth per behavior, typed result contracts and explicit error states.

## Required quality loop

1. Trace the caller, data source, permissions, cache behavior and related routes before editing.
2. Make the smallest coherent change and add regression coverage for the defect/invariant.
3. Run TypeScript, ESLint, Prettier, Stylelint, unit tests, build, production dependency audit and dead-code/duplication checks.
4. Review the diff for authorization bypass, private-data exposure, race conditions, failed writes, mobile overflow, keyboard access and reduced-motion support.
5. Inspect GitHub Actions on the exact commit. Separate runner/setup failures from real test/build failures.
6. Update the relevant docs and regenerate the context map after structural changes.
7. Report the exact SHA, changes, checks, unverified areas and safe test environment.

A task is not done just because code was written. It is done after the relevant automated checks and isolated runtime/database checks pass.
