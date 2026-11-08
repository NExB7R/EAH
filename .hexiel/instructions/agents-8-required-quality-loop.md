---
name: agents-8-required-quality-loop
description: For every meaningful change:
source: AGENTS.md
source_hash: 7fbc67d40c5f
title: 8. Required quality loop
---

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

