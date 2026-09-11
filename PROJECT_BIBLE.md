# Project Bible — EAH

## Current status
- Official product name: EAH
- Product: local discovery platform + mobile-first PWA
- Budget: 0 EGP initially
- Launch geography: Shebin El-Qanater + nearby villages/centers, then expansion
- MVP does not receive customer orders inside the platform
- Founder initially collects restaurants, menus, offers, delivery-office, supermarket and pharmacy data manually
- Hosting target: Vercel
- Backend target: Supabase (Postgres/Auth/Storage)
- Source control: GitHub

## Brand / visual identity
- Dark/near-black base with deep neon purple.
- Replace cold pure white UI text with warm food-like off-white / burger-inspired warm highlights where appropriate.
- Background contains subtle blurred, scattered, irregular sticker illustrations representing food, pharmacies, markets, delivery, speed and EAH spirit.
- Stickers are low-contrast, random-feeling, slowly animated and performance-conscious; support reduced-motion/save-data behavior.
- Hero slogan is exactly: `اللي نفسك فيه ؟`
- Recommendation CTA/section name is exactly: `هترشحلي إيه ؟!`
- Logo is the established EAH logo asset and should preserve the agreed identity.

## Homepage / public experience
- Opens on logo + hero.
- Hero includes the slogan, a trendy search experience, and a quick-login/search affordance near `دخول سريع`.
- Smart header stays visually clean at first, then appears during scroll with links such as admin contact, advertising, terms/agreements, about us and other required public pages.
- Professional floating Facebook/social button links to EAH's official page.
- PWA install affordance should make EAH feel like an installed app.
- Public/static pages should be professionally filled with complete product copy and structure.
- Homepage uses domain-specific slow carousels/sliders that pause on hover/touch, support manual swipe, and resume afterward.
- Translucent/blurred card edges should reveal the background/stickers instead of hiding them.
- Core content areas include trends, `هترشحلي إيه ؟!`, `جرب الجديد`, support for projects, and a presentation-like section explaining why users should register/use EAH.
- Domain sections should have their own visual soul: food, pharmacy, supermarket, delivery/speed.

## Categories at launch
- Restaurants
- Delivery offices
- Supermarkets
- Pharmacies
- More local services later

## Core UX principles
- Personalized home for signed-in users.
- Featured businesses can receive paid boosts, but paid placement must not overwhelm relevance/quality.
- Favorites, exclusions and interaction history feed recommendations.
- Location weighting depends on category.
- Menus are image-based in MVP.
- Offers are structured text + teaser image.
- Contact/payment/rating/comment visibility can be gated by account/verification rules.
- Privacy: system can know more than it exposes to businesses/users.
- Every feature must be added without accidentally removing previous functionality.

## Customer account
- Initial registration: name + normalized phone + password + confirmation.
- One normalized phone maps to one account.
- No SMS/OTP initially; do not claim a phone is verified until a real verification flow is enabled.
- The platform maintains a private Customer Trust Score and does not expose the raw score to restaurants.
- Customer can manage favorites, exclusions, preferences and notifications.

## Roles / access control
Application roles:
- `customer`
- `merchant`
- `admin`
- `super_admin`

Rules:
- Customer manages personal data and customer features.
- Merchant manages only owned business data/content and their business studio.
- Admin manages platform businesses, content, reviews, users, offers, studio and operations.
- Super admin has full platform/system control, including roles and system settings.
- Authorization must be enforced server-side and in Postgres RLS; hiding UI controls is never sufficient.

## Admin / merchant experience
Primary admin area: `/admin`

Admin capabilities include:
- Businesses: restaurants, pharmacies, supermarkets, delivery offices
- Users and roles
- Offers
- Reviews/comments and moderation
- Content
- Advertising / featured placements
- Trends/discovery
- Support projects
- Platform pages and copy
- Identity/theme settings
- Notifications
- Analytics
- PWA/install settings
- Contact/settings
- Audit history

Business list should support fast actions:
- `✏️` Quick Edit
- `🎨` Design

Business Design Studio should open directly from Admin at a route such as `/admin/businesses/[slug]/design`.

Merchant dashboard is scoped to the merchant's owned business(es).

## Visual Studio
There are two levels:
- Global Design Studio: edits EAH-wide appearance, homepage composition and shared visual system.
- Business Page Studio: edits one business page without affecting other businesses.

Studio goals:
- Drag/drop
- Insert/delete/duplicate
- Select/edit
- Typography
- Colors/gradients
- Backgrounds/images
- Borders/radius
- Shadows/blur/opacity
- Spacing/sizing/alignment
- Show/hide/lock where supported
- Responsive mobile/tablet/desktop
- Preview
- Publish

Studio must be reachable through Admin and must preserve existing content/features when a visual change is made.

## Recommendations
Signature experience: `هترشحلي إيه ؟!`

It behaves like a fast, friendly recommendation bot. It should gather a few high-value signals rather than presenting a long form:
- intent / what the user wants
- category
- budget
- mood
- time/urgency
- new vs familiar
- proximity preference
- offers
- preferences
- exclusions

Ranking evolves toward a Fit Score using:
- preferences
- favorites
- exclusions
- behavior
- intent/open-now
- budget
- category distance
- ratings/quality
- offers
- freshness
- diversity
- explanation/reason

Each recommendation should be able to explain why it was chosen.

## Discovery / new businesses
- `جرب الجديد` gives limited discovery exposure to new/small businesses.
- New-business boost is temporary, then the business returns to normal relevance/quality ranking.
- Paid featured placement is capped and clearly distinguished.
- Support Projects section highlights new/small projects without destroying ranking fairness.

## Ratings / comments
Restaurant rating is multi-dimensional:
- taste
- value for money
- speed
- experience

Additional rules:
- Separate offer reactions from business ratings.
- Support useful/helpful reactions later.
- Support reporting and moderation.
- Prevent obvious spam/manipulation.
- Review status can be pending/approved/rejected/hidden.
- Future EAH Quality Score can influence ranking.

## Location / maps / delivery coverage
Business data should support:
- country
- governorate
- city
- area
- address
- latitude
- longitude
- stable internal `business_id`

Planned geospatial direction: PostGIS for scalable geo queries and indexes.

Category weighting:
- Restaurants: distance is useful but not dominant.
- Pharmacies: proximity is highly important.
- Supermarkets: proximity + need matter strongly.
- Delivery offices: service/coverage area is more important than office point alone.

Future delivery coverage/service-area modeling is required.

## Business data model
Business data should remain modular:
- business/profile
- location
- media
- menu
- offers
- contacts
- reviews
- availability
- design

Use stable internal IDs instead of relying on business names/slugs for relationships.

## Data entry / operations
Founder needs very fast business onboarding.
Planned business entry wizard:
1. name
2. type
3. area/location
4. contact
5. photos
6. menu
7. offers
8. publish

Future import paths:
- CSV/Excel import
- menu image/OCR assistance with human review

## Audit / accountability
Sensitive admin and content operations should eventually create audit records containing:
- actor
- action
- entity type/id
- before data
- after data
- metadata
- timestamp

## Storage / security
- Supabase Auth for authentication.
- Supabase RLS for database authorization.
- Server-side authorization in Next.js routes/pages.
- Storage protected by Storage RLS policies.
- No service-role secrets in browser code.
- Admin/security-sensitive operations should eventually require MFA for privileged accounts.
- HTTPS in production.
- Follow least privilege.

## Current Supabase live state
- Project ref: `npmpiivmdksdirrumbmt`
- Region: Frankfurt (`eu-central-1`)
- Status: ACTIVE_HEALTHY
- Public foundation tables include profiles, businesses, business_media, offers, favorites, exclusions, offer_reactions, business_reviews, user_preferences, notifications and business_contact_methods.
- `businesses.owner_profile_id` exists for merchant ownership.
- RLS is enabled on the public foundation tables.
- Admin foundation was added remotely on 2026-09-11:
  - `public.app_role`
  - `public.user_roles`
  - `public.role_permissions`
  - `public.audit_logs`
  - `private.has_role`, `private.is_admin`, `private.authorize`
  - customer-role bootstrap trigger for profiles
  - server-only `public.custom_access_token_hook` function ready to propagate `user_role`
- Migration history currently includes:
  - `20260911175101_add_eah_roles_audit_foundation`
  - `20260911175125_add_eah_fk_performance_indexes`

## SEO / social / PWA
- Every public business has a stable public URL.
- Prepare title, description, Open Graph, canonical, structured data, sitemap and robots.
- Business sharing should generate a useful social preview.
- PWA install flow, manifest, icons, deep links and notifications are first-class concerns.

## Future ordering
Later phase only:
- In-platform bot gathers structured order details.
- EAH stores the structured order as the system of record.
- Order is sent to restaurant WhatsApp.
- Restaurant pays for ordering service.
- WhatsApp is a communication channel, not the database of record.

## Future monetization
- Featured placement
- Restaurant ordering service subscription
- Delivery-office featured placement/subscription
- Ads
- Future search/CRM products
- Future partner-funded customer rewards/benefits

## Non-goals for initial MVP
- In-platform ordering
- Online payments
- Complex AI infrastructure
- Full CRM
- Customer rewards/discounts as a core dependency

## Versioning / release discipline
Use semantic-style versions:
- v0.1.x = foundation and bug fixes
- v0.2.x = major UX/recommendation improvements
- v0.3.x = merchant/admin improvements
- v0.5.x = stronger recommendation engine
- v0.9.x = beta
- v1.0.0 = public launch

Rule: a new version must preserve prior verified functionality unless an explicit product decision says otherwise. Prefer additive migrations and reversible changes.

## Critical rule
Repository documents and checked-in migrations are the project's source of truth. Important decisions must not live only in chat.
