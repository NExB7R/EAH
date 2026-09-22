# EAH Platform Pass — 2026-09-21

## Scope

Initial pass across security, search logic, performance, UX, accessibility, and the Soft Neon 2026 visual layer.

## Fixed in this pass

### Security

- Closed an authorization gap in the pending-change merchant notification endpoint. Service-role notification work now runs only after a verified `super_admin` boundary.
- Removed the internal unauthenticated HTTP callback from admin moderation actions and replaced it with a server-only notification function.
- Hardened the admin web collector against SSRF:
  - HTTP/HTTPS only.
  - No URL credentials or uncommon ports.
  - Local, private, link-local, metadata and internal hosts are blocked.
  - Every redirect target is revalidated.
  - HTML responses are limited to 2 MB and checked by content type.
- Restricted avatar uploads to the authenticated user's own Cloudinary folder.
- Restricted merchant business uploads to businesses owned by that merchant; new unbound folders remain super-admin only.
- Added upload and QR rate limits, URL validation, analytics payload limits, and validation for the legacy reveal tracker.
- Added an atomic database-backed rate-limit RPC and switched contact reveal protection to it.
- Removed `unsafe-eval` from the production CSP, added the missing Cloudflare Turnstile directives, and added Cloudinary image support.

### Search and product logic

- Unified typed and voice search behind one URL builder.
- Search now separates intent words from the actual place name, preventing queries such as "مطعم" or "صيدلية فاتحة" from filtering all valid results back to zero.
- Added Egyptian intent handling for food categories, open-now, nearby, rating, trends, offers, newest, areas, and definite-article forms.
- Arabic matching now normalizes letter variants before comparing names, areas, descriptions, hooks, and vibe labels.
- Added supermarket support consistently to discovery, homepage categories, cards, forms, filters, and data mapping.
- Food category keys are presented with Arabic labels and unavailable filter options are disabled rather than producing misleading counts.
- Nearby search can carry its intent into Explore and request location only when explicitly requested.

### Performance and reliability

- Replaced 40 animated background SVG nodes with a four-node CSS Ambient Aurora. Animation is disabled on small screens and for reduced-motion users.
- Self-hosted Cairo and Dancing Script variable fonts through npm, eliminating build-time Google Fonts requests and duplicate Cairo downloads.
- Removed the per-card favorites request pattern. All favorite buttons now share one authenticated favorites read per page session.
- Parallelized initial Explore business/location loading and made view stats fail safely.
- Removed unnecessary service-role use from public food-category reads.
- Removed the custom Next static cache header that conflicted with framework behavior.
- Replaced the external QR image provider in the navigation drawer with the local QR endpoint.

### UX / Soft Neon 2026

- Added a low-noise purple/gold/cyan ambient background.
- Added internal card glow, lighter hover movement, glass search treatment, cyan live/open state, and consistent SVG favorite state.
- Fixed the actual list layout in Explore and made the filter bar sticky without clipping dropdown menus.
- Added keyboard Escape support and disabled states to custom filter menus.
- Made Back to Top global, reduced-motion aware, and safe-area aware.
- Preserved 44 px mobile interactions and reduced continuous motion on mobile.

## Verification

- `npm run typecheck` — passed.
- `npm run build` — passed; 49 static pages generated.
- `npm audit --omit=dev` — 0 known vulnerabilities.
- Runtime smoke checks — `/`, `/explore`, local QR generation and security headers returned successfully.
- SSRF utility checks — loopback, numeric loopback, localhost, metadata IP and non-HTTP protocols blocked; public HTTPS allowed.
- Search intent samples checked for restaurants, pharmacies, supermarkets, food, nearby and newest sorting.

## Required before production release

1. Apply `20260921230000_atomic_rate_limit.sql` to Supabase through the normal reviewed migration process.
2. Confirm all Cloudinary and Supabase environment variables listed in `.env.example` exist in Vercel.
3. Run authenticated browser tests for customer, merchant and super-admin flows against staging/production data.
4. Run Lighthouse/Web Vitals on a deployed build with real media and fix any production-only regressions.
5. Enable Supabase leaked-password protection and continue the existing RLS/performance lint review.
6. Migrate the remaining abuse-sensitive routes from in-memory rate limiting to the atomic DB limiter where appropriate.

## Notes

This pass reduces concrete risk and fixes high-impact logic/performance issues; it is not a claim that the entire platform is fully audited or penetration-tested.
