# Architecture — Initial

## Proposed stack
- Frontend/PWA: Next.js or equivalent React framework
- Hosting: Vercel initially; Netlify is fallback
- Backend/database/auth/storage: Supabase
- Git/source control: GitHub
- Maps/location: browser Geolocation + PostGIS in Supabase
- Notifications: browser/PWA notification layer first; provider selected when implementation starts
- WhatsApp ordering: future integration only

## Core principles
- Database and backend rules are authoritative
- RLS for tenant/user access
- Secrets never shipped to client
- Idempotent server-side actions for points, reactions and future orders
- Auditable changes for high-risk data
- Structured domain model prepared for future orders/rewards without enabling them in MVP

## Main domains
Auth, Customers, Businesses, Menus, Offers, Ratings, Reactions, Favorites, Exclusions, Notifications, FeaturedPlacement, TrustScore, Admin, Analytics.

## Location model
Store latitude/longitude for businesses. For customers, prefer current location or selected area; do not persist precise location longer than needed unless a justified product feature requires it.

## Ordering readiness
Reserve domain concepts for Orders, OrderItems, OrderEvents and RestaurantChannels, but keep disabled until a later version.
