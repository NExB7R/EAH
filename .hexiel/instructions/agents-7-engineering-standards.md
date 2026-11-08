---
name: agents-7-engineering-standards
description: TypeScript strict; no casual `any`, unsafe casts, ignored errors, or unhandled promises.
source: AGENTS.md
source_hash: 7fbc67d40c5f
title: 7. Engineering standards
---

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

