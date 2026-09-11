# Changelog

## v0.1.0-planning — Initial project foundation
- Captured product vision and MVP scope
- Captured privacy and trust principles
- Defined initial recommendation model
- Defined category-aware location logic
- Defined future ordering architecture direction
- Defined project documentation as source of truth

## v0.1.0-foundation — 2026-09-11
- Brand working name selected: EAH
- Added EAH brand brief and provisional dark-first design tokens.
- Recorded EAH as the working product name while keeping availability verification as a gate.

## Updated: Schema/RLS
- Added v0.1.0 Supabase schema and RLS matrix.


## 2026-09-11 — v0.1.0
- Standardized the product name from `EAH!` to **EAH** across project documentation.
- Added ADR-008 for punctuation-free brand naming.


### v0.1.0-foundation — 2026-09-11
- Added first executable Supabase/Postgres migration.
- Added RLS, PostGIS location support, auth bootstrap, and public directory views.

## 2026-09-10 — Database/Auth foundation hardening
- Added `businesses.owner_profile_id` for future merchant ownership.
- Removed public `businesses.phone` and `businesses.whatsapp` fields.
- Added `business_contact_methods` with RLS gating to verified-phone users.
- Added trigger to sync `auth.users.phone_confirmed_at` into `profiles.phone_verified_at`.
- Added `business-media` public-read storage bucket with owner-scoped upload/update/delete policies.
- Revoked public execute access to Supabase's `public.rls_auto_enable()` helper; security advisor now returns no findings.

## 2026-09-11 — v0.2.0-web-foundation
- Added `08-web/` Next.js App Router foundation for EAH.
- Added dark-first mobile-first home shell with discovery CTA and category-aware copy.
- Added Supabase browser/server clients and Next.js proxy session refresh pattern.
- Added phone OTP authentication UI; SMS provider remains an external deployment gate.
- Added PWA manifest, service worker shell, theme metadata, RTL Arabic document setup.
- Added initial SEO/Open Graph metadata and canonical root.
- Pinned framework dependencies for reproducible installs.

## v0.2.2 — Supabase Discovery Foundation

- Connected the web data layer to published Supabase businesses and active offers.
- Added intent-aware business filtering.
- Added safe Demo fallback when Supabase environment variables are absent.
- Added environment-driven site URL for canonical/SEO configuration.
- Established Git-based source-of-truth workflow, CI baseline, and release process.
