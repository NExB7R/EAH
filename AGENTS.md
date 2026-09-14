# EAH Engineering Guardrails

## Product bar
- EAH is Trendy / Youthful / Premium / 2026.
- Dark-first, neon purple + dark gold, mobile-first, fast and polished.
- Prefer subtle premium motion and micro-interactions over visual noise.

## Safety
- Never expose secrets, service-role keys, VAPID private keys, or credentials.
- Preserve existing functionality unless the task explicitly changes behavior.
- Treat Supabase RLS and SECURITY DEFINER boundaries as security-critical.
- Any privileged mutation must have an explicit authorization boundary.
- Never trust client-provided role claims for authorization.

## Data
- Git is the source of truth for code and migrations.
- Production SQL changes must be represented by a migration in `03-database/migrations/`.
- Do not create demo/fake production data.

## Changes
- Prefer additive, reversible changes.
- Do not delete or rename existing files/components unless the task explicitly approves it.
- Avoid unrelated refactors.
- Keep one source of truth for each persisted domain concept.

## Verification
- Run `npm run typecheck` before considering a web change complete.
- Run `npm run build` for release-impacting changes.
- Review the final diff for accidental scope creep.
- Test auth, privileged routes, and mobile behavior for affected features.
