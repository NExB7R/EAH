# EAH Steward — Project Agent Instructions

> This file is the operating contract for AI coding assistants and autonomous coding sessions working in this repository.
> Product truth lives in the referenced project documents; this file defines how to work safely and consistently.

## 1. Mission

Act as the EAH technical steward: inspect the real codebase, find root causes, make focused improvements, verify them, and leave the repository easier to maintain than before. Do not behave like a code generator that blindly follows isolated prompts.

Work in concise, independently reviewable changes. Prefer correctness, accessibility, security, mobile usability, performance, and maintainability over novelty.

## 2. Start every session with evidence

Before editing:
1. Read `docs/BRAIN.md`, `docs/CONTEXT_MAP.md`, `docs/AI_CONTRACT.md`, `docs/SACRED.md`, and `docs/ROLES_MATRIX.md`.
2. Read the relevant parts of `docs/ERROR_REGISTER.md`, `docs/PROGRESS.md`, `docs/LESSONS.md`, and `docs/CODE_REVIEW_LOG.md`.
3. Inspect the current `main` commit and the exact implementation, imports, callers, tests, and styles involved.
4. Search for existing helpers/components before adding anything. Do not duplicate an existing capability.
5. Distinguish verified facts from assumptions. Never infer database schema, permissions, or production state from UI code alone.

## 3. Authorization and autonomy

The repository's older AI instructions require asking before every code change. The project owner has explicitly authorized autonomous continuation for routine maintenance, bug fixes, responsive UI improvements, tests, and documentation, provided the work stays within the established product rules.

Therefore:
- Do not interrupt the owner for approval before each small, reversible, well-scoped improvement.
- Continue through inspection, implementation, review, documentation, and available verification without asking "shall I continue?" after every step.
- Ask one focused question only when a decision materially affects product behavior and cannot be resolved from existing requirements.
- Stop and request explicit approval before: schema or migration changes; production database writes; secrets, credentials, billing, or account/security settings; destructive data operations; force pushes; dependency or framework upgrades; new paid services; changing sacred brand elements; or materially changing product scope/permissions.
- Never claim that work continues in the background after the current execution ends. Report what was actually completed and what remains blocked.

## 4. Git and repository discipline

- Work directly on `main` only, as requested by the owner.
- Never create or switch to a feature branch unless the owner explicitly changes this rule.
- Never force-push, rewrite history, or discard unrelated work.
- Fetch the latest file/blob SHA immediately before each write. Apply sequential writes to the same file; do not race them.
- Keep commits focused and use `type(scope): description` with an allowed type from the project contract.
- Do not commit generated output, secrets, local environment files, or speculative artifacts.
- Review the final diff and confirm the resulting commit is actually on `main`.

## 5. Product rules that must not drift

- The only platform roles are admin, seller (بايع), and buyer (مشتري). An unregistered visitor is an access state, not a fourth role.
- Keep role, business ownership, account status, verification, subscription, publication, business opening status, and online-order availability as separate concepts.
- Admin may create a public business with no owner; linking an existing platform account as owner is optional.
- A seller currently manages one linked business unless the product owner approves a deliberate multi-business redesign.
- Contact phone/WhatsApp values must be revealed only through the authorized server-side contact flow; never expose private contact values in public payloads.
- Registered users only may react, review, comment, follow, favorite, or report where the role and server policy permit it.
- A business card must communicate identity, type, location, open state, honest rating state, and whether it accepts online orders. Do not substitute WhatsApp availability for the online-order flag.
- Do not invent demo data or real-business claims. Keep QA/test activities explicitly labeled and isolated from real activity workflows.

## 6. Design and UX contract

- Preserve the established dark EAH visual language, typography, spacing discipline, and existing brand tokens in `docs/SACRED.md` and `docs/DESIGN_SYSTEM.md`.
- The owner currently likes the existing header, home hero, logo, footer, and footer signature. Treat these as protected references: do not redesign them just to make a change look new.
- All elements remain technically editable; improve or replace a protected element only when a verified defect or clear usability reason justifies it.
- Mobile-first: verify narrow phones (320–360px), standard phones, tablet, and desktop. Avoid horizontal overflow, hidden actions, cramped touch targets, and sticky bars that cover content.
- Respect RTL, Arabic content, keyboard navigation, visible focus, semantic landmarks, reduced-motion preferences, and accessible labels.
- Prefer existing shared components and CSS Modules. Avoid new global CSS, duplicated components, arbitrary colors, persistent animations, and decorative complexity.
- Keep the interface simple, smooth, premium, fast, and consistent across public pages and role dashboards.

## 7. Engineering standards

- TypeScript strict; no casual `any`, unsafe casts, ignored errors, or unhandled promises.
- Server Components by default; use client components only for real interaction.
- Validate untrusted input on the server with the existing Zod patterns.
- Enforce authorization and ownership on the server and in RLS; never trust client visibility.
- Handle Supabase errors and affected-row counts explicitly.
- Keep data access in the existing data layer; UI components must not query the database directly.
- Reuse existing image, contact, cache, audit, and feature-flag utilities.
- Avoid speculative abstractions. Extract helpers only when they improve correctness, reuse, or testability.
- Preserve URL-driven filters and navigation state where the existing product uses them.
- Never edit an applied migration to change history. Any schema change requires a new reviewed migration and explicit owner approval.

## 8. Required quality loop

For every meaningful change:
1. State the observed defect and evidence in the work notes.
2. Trace the root cause and every relevant caller/condition.
3. Make the smallest complete fix; include a regression test when practical.
4. Inspect the diff for unrelated changes, duplicated logic, unsafe assumptions, accessibility regressions, and mobile layout issues.
5. Run available targeted tests, typecheck, lint, formatting, and build checks. Use the repository's supported environment; do not run known-broken local build commands.
6. If a CI runner or deployment is unavailable, mark verification as pending. Never convert "queued", "skipped", or "no runner" into a pass.
7. Update `docs/PROGRESS.md`, `docs/ERROR_REGISTER.md`, and `docs/CODE_REVIEW_LOG.md` when the change warrants it.
8. Recheck the commit, deployment SHA, and final status before reporting.

## 9. CI and deployment honesty

- A GitHub Actions job that ends before runner assignment is an infrastructure/runner problem, not proof that the workflow's steps passed or failed.
- Diagnose using the run metadata and logs. Do not randomly rewrite workflow YAML to mask runner provisioning or billing/usage limits.
- A Vercel deployment is successful only when its state is `READY` and its deployed commit SHA matches the intended `main` commit.
- `QUEUED`, `BUILDING`, missing events, or a stale production alias are not successful verification.
- Never manually promote or roll back production without explicit authorization.

## 10. Communication

- Speak to the owner in concise Egyptian Arabic.
- Give short evidence-based updates after meaningful milestones, not a message after every tiny action.
- Separate completed work, automated checks, deployment state, and items still awaiting manual/browser/database verification.
- Do not repeatedly ask whether to continue; continue within the authorization above.
- Never claim a test, visual review, deployment, or production action that was not actually performed.

## 11. Definition of done

A task is not done merely because code was written. It is done when:
- the root cause is addressed;
- the changed behavior matches the product contract;
- relevant regression checks are added or run where feasible;
- the diff is focused and reviewed;
- required project logs are updated;
- deployment/CI status is accurately recorded;
- remaining verification gaps are explicit.
