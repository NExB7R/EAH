# EAH! — Supabase Schema v0.1.0

## Goals
- Multi-category local discovery.
- Strict separation of public business content and gated content.
- Private customer preferences/history/Trust Score.
- Merchant isolation by ownership/management.
- Future-ready for orders without enabling ordering in MVP.

## Core entities
### profiles
- id uuid PK = auth.users.id
- role enum: customer | merchant | admin
- display_name text
- phone_verified_at timestamptz
- avatar_url text nullable
- status enum: active | suspended | deleted
- created_at, updated_at

### businesses
- id uuid PK
- owner_profile_id uuid FK profiles.id
- name text
- slug text UNIQUE
- description text
- category_primary enum
- status enum: draft | pending_review | approved | suspended | archived
- is_open boolean
- featured_enabled boolean DEFAULT false
- created_at, updated_at

### business_locations
- id uuid PK
- business_id uuid FK businesses.id
- area_id uuid nullable
- address_text text
- latitude double precision
- longitude double precision
- location geography(Point,4326)
- is_primary boolean

### business_categories
- business_id uuid FK
- category_id uuid FK
- PRIMARY KEY (business_id, category_id)

### areas
- id uuid PK
- name text
- type enum: city | center | village | neighborhood
- parent_area_id uuid nullable
- latitude/longitude nullable
- active boolean

### restaurant_menu_images
- id uuid PK
- business_id uuid FK
- storage_path text
- sort_order int
- alt_text text
- status enum: pending_review | approved | rejected | archived
- created_at

### offers
- id uuid PK
- business_id uuid FK
- title text
- description text
- price numeric nullable
- teaser_image_path text nullable
- valid_from/valid_until timestamptz nullable
- status enum: draft | pending_review | approved | expired | archived
- created_at, updated_at

### profiles/private customer data
Keep sensitive fields out of merchant-readable tables whenever possible.
### customer_preferences
- profile_id uuid PK/FK profiles.id
- budget_band text nullable
- food_preferences jsonb DEFAULT '{}'
- notification_preferences jsonb DEFAULT '{}'
- home_area_id uuid nullable
- updated_at

### favorites
- id uuid PK
- profile_id uuid FK
- business_id uuid FK
- created_at
- UNIQUE(profile_id, business_id)

### exclusions
- id uuid PK
- profile_id uuid FK
- business_id uuid nullable
- category_id uuid nullable
- reason enum: not_interested | never_show_again | category_dislike | other
- created_at
- Constraint: at least one of business_id/category_id non-null

### restaurant_ratings
- id uuid PK
- business_id uuid FK
- profile_id uuid FK
- overall smallint 1..5
- comment text nullable
- status enum: visible | pending | hidden | disputed
- verified_interaction boolean DEFAULT false
- created_at, updated_at
- UNIQUE(profile_id, business_id) for MVP; future history can be enabled if needed

### restaurant_rating_dimensions
- rating_id uuid PK/FK
- taste smallint 1..5
- value smallint 1..5
- speed smallint 1..5
- experience smallint 1..5

### offer_reactions
- id uuid PK
- offer_id uuid FK
- profile_id uuid FK
- reaction enum: worth_it | not_for_me
- created_at
- updated_at
- UNIQUE(profile_id, offer_id)

### business_contact_methods
- id uuid PK
- business_id uuid FK
- kind enum: phone | whatsapp | facebook | instagram | website
- label text
- value text
- visibility enum: verified_users | admin_only
- approved boolean

### business_payment_methods
- id uuid PK
- business_id uuid FK
- kind enum: cash | card | mobile_wallet | other
- label text
- details text nullable
- visibility enum: verified_users | admin_only
- approved boolean

### delivery_coverage_areas
- business_id uuid FK
- area_id uuid FK
- price_text text nullable
- eta_text text nullable
- UNIQUE(business_id, area_id)

### notifications
- id uuid PK
- profile_id uuid FK
- type text
- title text
- body text
- deep_link text nullable
- read_at timestamptz nullable
- created_at

### featured_placements
- id uuid PK
- business_id uuid FK
- placement_scope enum: home | category | area
- area_id uuid nullable
- starts_at/ends_at timestamptz
- boost_cap numeric
- status enum: pending | active | expired | cancelled

### customer_trust_events
- id uuid PK
- profile_id uuid FK
- event_type text
- points_delta integer
- metadata jsonb DEFAULT '{}'
- created_at

### customer_trust_scores
- profile_id uuid PK/FK
- score integer DEFAULT 0
- tier text DEFAULT 'base'
- updated_at

### reports
- id uuid PK
- reporter_profile_id uuid FK
- target_type text
- target_id uuid
- reason text
- details text nullable
- status enum: open | reviewing | resolved | dismissed
- created_at

### admin_actions
- id uuid PK
- admin_profile_id uuid FK
- action_type text
- target_type text
- target_id uuid nullable
- metadata jsonb DEFAULT '{}'
- created_at

## RLS policy direction
1. Public: read approved business directory fields only.
2. Verified customer: read gated contact/payment/rating content.
3. Customer: own profile/preferences/favorites/exclusions/trust history only; trust score raw value is not merchant-readable.
4. Merchant: only businesses they own/manage; no direct select on customer private tables.
5. Admin: controlled access through role-based policies/functions, with audited high-risk changes.
6. Storage: separate public business assets from private/admin assets; signed URLs where needed.

## Important implementation rule
Do not expose Supabase service-role key in the frontend. Any privileged operation must run server-side (Route Handler/Server Action/Edge Function).

## Future-ready, disabled in MVP
orders, order_items, order_events, restaurant_channels, rewards, customer_benefits.
