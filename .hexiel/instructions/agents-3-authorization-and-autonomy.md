---
name: agents-3-authorization-and-autonomy
description: 2. Start every session with evidence
source: AGENTS.md
source_hash: 7fbc67d40c5f
title: 3. Authorization and autonomy
---

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

