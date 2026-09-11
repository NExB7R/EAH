# Project Status — v0.1.0

## Mission
Build a local discovery platform that starts in Shibin El-Qanater and nearby villages/centers, then expands to other cities and service categories.

## Current business model
- Free core discovery experience for users.
- Restaurants can pay for featured placement.
- Future paid capabilities may include customer search/CRM and order-bot tooling.
- No commission-based ordering in the MVP.

## MVP pillars
1. Restaurants, delivery offices, supermarkets, pharmacies and other local listings.
2. Restaurant menus as uploaded images.
3. Written offers with a teaser image.
4. User account: verified phone + name + password.
5. Ratings/comments, contact details and payment methods become visible after registration.
6. Favorites, exclusions, notifications and personalized home feed.
7. "Suggest food" guided recommendation flow.
8. Offer reactions and trend signals.
9. Customer Trust Score exists from the beginning but has no financial/reward value in MVP.
10. SEO/local discovery + Facebook/shareability from day one.
11. PWA + dark mode as default + install/add-to-home UX.

## Product rules
- Search/recommendation logic varies by category.
- Paid featured placement must have a bounded boost; relevance cannot be destroyed by payment.
- Private customer data is not exposed to merchants unless strictly necessary for a future transaction.
- WhatsApp, later, will be a communication channel; the platform remains the system of record for orders.
- Project knowledge must live in versioned project files, not only chat memory.

## Current phase
Foundation -> Naming/Brand -> Architecture -> Database/Auth -> UX/UI -> Implementation.

## Naming status
EAH selected by founder as the working/public product name. Legal, domain and social availability remain separate verification gates before paid registration or public scale.

## Next build gate
1. Finish Auth/phone verification flow.
2. Finish Storage buckets and image policies.
3. Reconcile the live database with a clean versioned baseline migration.
4. Build the first mobile-first dark-mode shell.


## Database implementation
- Supabase project exists and is ACTIVE_HEALTHY in eu-central-1 (Frankfurt).
- Live foundation: 10 public tables with RLS enabled.
- Security hardening migration `20260910232459_foundation_security_hardening.sql` is applied.
- Contact methods are separated from public business data and gated by verified phone status.
- Businesses now support `owner_profile_id` for future merchant ownership.
- Migration history still needs a clean baseline capture because the original foundation was bootstrapped before versioned migrations were enabled.

## Workflow status — 2026-09-11

The project is now managed as a single repository. Git history is authoritative; compressed archives are release snapshots only.
