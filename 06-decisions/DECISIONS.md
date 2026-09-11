# Decision Log

## ADR-001 — Start with MVP, not full platform
Decision: Launch with discovery, favorites, exclusions, offers, ratings and recommendations; postpone ordering and rewards.
Reason: zero-budget constraint and need for real usage data.

## ADR-002 — Menus are images in MVP
Decision: Restaurant menus are uploaded as images.
Reason: faster merchant onboarding and simpler data model.

## ADR-003 — Contact/payment/ratings gated by verified registration
Decision: These details become visible only after phone verification.
Reason: user value for registration and reduced exposure of merchant contact data.

## ADR-004 — Separate restaurant rating from customer Trust Score
Decision: Keep business quality rating and customer reliability score as separate systems.
Reason: they measure different things and have different privacy requirements.

## ADR-005 — Trust Score is private
Decision: Restaurants should not see a customer's raw Trust Score or complete behavioral history.
Reason: privacy and prevention of unnecessary profiling.

## ADR-006 — Category-aware location weighting
Decision: Pharmacies/supermarkets strongly prioritize proximity; restaurants do not have to be nearest-first.
Reason: matches user intent by category.

## ADR-007 — Featured placement is capped
Decision: Payment can boost visibility but cannot override personalization/relevance indefinitely.
Reason: preserve user trust.

## ADR-008 — WhatsApp is not system of record
Decision: Future orders are stored in the platform and WhatsApp is used as a communication channel.
Reason: data ownership, analytics and future channel flexibility.

## ADR-009 — Monthly personalized welcome surface
Decision: A light monthly “على ذوقك” style message communicates that the platform is learning and improving suggestions without exposing creepy behavioral details.
Reason: retention and perceived care.


## ADR-008 — Brand name punctuation
- Decision: Public brand name is **EAH** without `!`.
- Rationale: cleaner URLs, domains, metadata, source code identifiers, SEO slugs, app-store naming, and fewer edge cases around punctuation.
- Status: accepted.
- Date: 2026-09-11.
