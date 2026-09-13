# EAH Security Hardening Plan

This document is part of the product requirements and must stay with the repository.

## Current role model
- `super_admin`: full control center access.
- `merchant`: manages owned businesses through the review workflow.
- `customer`: normal consumer account.
- Future assistant/staff roles must be scoped permissions only; do not reuse `super_admin`.

## Mandatory security rules
- Merchant edits never write directly to live business content.
- Every merchant change becomes `pending` and requires explicit super-admin approval.
- Public data must remain protected by RLS and least-privilege grants.
- No service-role/secret key may be exposed in browser code or `NEXT_PUBLIC_*` variables.
- Passwords are handled by Supabase Auth; never store plaintext passwords in EAH tables.
- Authorization must use server-side/database role data, never user-editable metadata.
- Every privileged action should be auditable with actor, target, action, and timestamp.
- Super-admin operations should eventually require MFA before production launch.

## Encryption hardening before production
1. Confirm Supabase/database/storage encryption at rest and encrypted backups are enabled by the provider/project plan.
2. Require HTTPS/TLS in all deployed environments.
3. Encrypt sensitive application fields at the application layer when they must be stored and are not needed for direct search/filtering.
4. Store encryption keys only in a dedicated secret manager/KMS/Vault or deployment secret store, never in Git.
5. Rotate credentials and API keys on a defined schedule and immediately after suspected exposure.
6. Keep separate production and development secrets/projects.
7. Never put OTP, password, access tokens, service-role keys, or private messaging credentials into logs/audit payloads.

## Web hardening before production
- Security headers: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame protection.
- Rate limiting on authentication and privileged RPC/API paths.
- CSRF protection for any state-changing browser endpoint that is not already protected by the framework/session model.
- Input validation and allowlists at the database boundary for privileged operations.
- File upload MIME/type/size limits plus storage path isolation.
- Audit review for SECURITY DEFINER functions and explicit EXECUTE grants.

## Recovery and operations
- Automated backups and tested restore procedure.
- Migration history committed to GitHub and applied to the intended environment.
- CI checks for TypeScript/build/lint and dependency vulnerabilities.
- Regular review of Supabase security advisors.
- Production incident procedure for credential rotation, session invalidation, and audit review.

## Definition of done
Do not mark EAH production-ready until the checklist above has been reviewed and the remaining environment-specific controls are verified with evidence.
