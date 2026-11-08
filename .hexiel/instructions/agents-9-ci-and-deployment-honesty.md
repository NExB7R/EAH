---
name: agents-9-ci-and-deployment-honesty
description: A GitHub Actions job that ends before runner assignment is an infrastructure/runner problem, not proof that th
source: AGENTS.md
source_hash: 7fbc67d40c5f
title: 9. CI and deployment honesty
---

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

