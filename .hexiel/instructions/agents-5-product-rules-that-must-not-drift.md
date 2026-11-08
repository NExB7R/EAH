---
name: agents-5-product-rules-that-must-not-drift
description: 4. Git and repository discipline
source: AGENTS.md
source_hash: 7fbc67d40c5f
title: 5. Product rules that must not drift
---

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
- All phone-like contact values (`phone`, `whatsapp`, `complaints`, `manager`, `shift_morning`, `shift_evening`, `additional`) are private. Reveal them only through an authorized server-side flow after the required authentication/ownership checks; never serialize them into public props, HTML, JSON-LD, client caches, or metadata. Public contact payloads may contain only approved social/website URLs.
- Registered users only may react, review, comment, follow, favorite, or report where the role and server policy permit it.
- A business card must communicate identity, type, location, open state, honest rating state, and whether it accepts online orders. Do not substitute WhatsApp availability for the online-order flag.
- Do not invent demo data or real-business claims. Keep QA/test activities explicitly labeled and isolated from real activity workflows.

