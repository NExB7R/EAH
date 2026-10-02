-- EAH v0.1.0 initial schema
-- Run in a fresh Supabase Postgres project.
-- This migration intentionally does NOT enable order/reward features.

create extension if not exists pgcrypto;
create extension if not exists postgis;

create schema if not exists app;

-- =========================
-- Enums
-- =========================

do $$ begin
  create type app.profile_role as enum ('customer','merchant','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.profile_status as enum ('active','suspended','deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.area_type as enum ('city','center','village','neighborhood');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.business_status as enum ('draft','pending_review','approved','suspended','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.asset_status as enum ('pending_review','approved','rejected','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.offer_status as enum ('draft','pending_review','approved','expired','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.exclusion_reason as enum ('not_interested','never_show_again','category_dislike','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.rating_status as enum ('visible','pending','hidden','disputed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.offer_reaction as enum ('worth_it','not_for_me');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.contact_kind as enum ('phone','whatsapp','facebook','instagram','website');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.payment_kind as enum ('cash','card','mobile_wallet','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.visibility_scope as enum ('verified_users','admin_only');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.placement_scope as enum ('home','category','area');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.placement_status as enum ('pending','active','expired','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app.report_status as enum ('open','reviewing','resolved','dismissed');
exception when duplicate_object then null; end $$;

-- =========================
-- Utility helpers
-- =========================

create or replace function app.current_profile_id()
returns uuid
language sql
stable
security invoker
as $$
  select auth.uid();
$$;

create or replace function app.has_role(p_role app.profile_role)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select exists (
    select 1
    from app.profiles p
    where p.id = auth.uid()
      and p.role = p_role
      and p.status = 'active'
  );
$$;

create or replace function app.is_verified_customer()
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select exists (
    select 1
    from app.profiles p
    where p.id = auth.uid()
      and p.role = 'customer'
      and p.status = 'active'
      and p.phone_verified_at is not null
  );
$$;

create or replace function app.owns_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app
as $$
  select exists (
    select 1
    from app.businesses b
    where b.id = p_business_id
      and b.owner_profile_id = auth.uid()
      and b.status <> 'archived'
  );
$$;

-- =========================
-- Profiles
-- =========================

create table if not exists app.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app.profile_role not null default 'customer',
  display_name text,
  phone_verified_at timestamptz,
  avatar_url text,
  status app.profile_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- Areas
-- =========================

create table if not exists app.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type app.area_type not null,
  parent_area_id uuid references app.areas(id) on delete set null,
  latitude double precision,
  longitude double precision,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(name, type, parent_area_id)
);

-- =========================
-- Businesses
-- =========================

create table if not exists app.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references app.profiles(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  category_primary text not null,
  status app.business_status not null default 'draft',
  is_open boolean not null default false,
  featured_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.business_categories (
  business_id uuid not null references app.businesses(id) on delete cascade,
  category_id uuid not null,
  primary key (business_id, category_id)
);

create table if not exists app.business_locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references app.businesses(id) on delete cascade,
  area_id uuid references app.areas(id) on delete set null,
  address_text text,
  latitude double precision not null,
  longitude double precision not null,
  location geography(Point, 4326),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint business_locations_lat_ck check (latitude between -90 and 90),
  constraint business_locations_lng_ck check (longitude between -180 and 180)
);

create or replace function app.sync_business_location_geography()
returns trigger
language plpgsql
as $$
begin
  new.location := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  return new;
end;
$$;

drop trigger if exists trg_sync_business_location_geography on app.business_locations;
create trigger trg_sync_business_location_geography
before insert or update of latitude, longitude on app.business_locations
for each row execute function app.sync_business_location_geography();

create table if not exists app.restaurant_menu_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references app.businesses(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  alt_text text,
  status app.asset_status not null default 'pending_review',
  created_at timestamptz not null default now()
);

create table if not exists app.offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references app.businesses(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2),
  teaser_image_path text,
  valid_from timestamptz,
  valid_until timestamptz,
  status app.offer_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint offers_price_ck check (price is null or price >= 0),
  constraint offers_dates_ck check (valid_until is null or valid_from is null or valid_until >= valid_from)
);

create table if not exists app.business_contact_methods (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references app.businesses(id) on delete cascade,
  kind app.contact_kind not null,
  label text,
  value text not null,
  visibility app.visibility_scope not null default 'verified_users',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app.business_payment_methods (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references app.businesses(id) on delete cascade,
  kind app.payment_kind not null,
  label text,
  details text,
  visibility app.visibility_scope not null default 'verified_users',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app.delivery_coverage_areas (
  business_id uuid not null references app.businesses(id) on delete cascade,
  area_id uuid not null references app.areas(id) on delete cascade,
  price_text text,
  eta_text text,
  unique (business_id, area_id)
);

-- =========================
-- Customer profile / preferences
-- =========================

create table if not exists app.customer_preferences (
  profile_id uuid primary key references app.profiles(id) on delete cascade,
  budget_band text,
  food_preferences jsonb not null default '{}'::jsonb,
  notification_preferences jsonb not null default '{}'::jsonb,
  home_area_id uuid references app.areas(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists app.favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references app.profiles(id) on delete cascade,
  business_id uuid not null references app.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(profile_id, business_id)
);

create table if not exists app.exclusions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references app.profiles(id) on delete cascade,
  business_id uuid references app.businesses(id) on delete cascade,
  category_id uuid,
  reason app.exclusion_reason not null default 'not_interested',
  created_at timestamptz not null default now(),
  constraint exclusions_target_ck check (business_id is not null or category_id is not null)
);

-- =========================
-- Ratings and offer reactions
-- =========================

create table if not exists app.restaurant_ratings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references app.businesses(id) on delete cascade,
  profile_id uuid not null references app.profiles(id) on delete cascade,
  overall smallint not null,
  comment text,
  status app.rating_status not null default 'pending',
  verified_interaction boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, business_id),
  constraint restaurant_ratings_overall_ck check (overall between 1 and 5)
);

create table if not exists app.restaurant_rating_dimensions (
  rating_id uuid primary key references app.restaurant_ratings(id) on delete cascade,
  taste smallint,
  value smallint,
  speed smallint,
  experience smallint,
  constraint rating_taste_ck check (taste is null or taste between 1 and 5),
  constraint rating_value_ck check (value is null or value between 1 and 5),
  constraint rating_speed_ck check (speed is null or speed between 1 and 5),
  constraint rating_experience_ck check (experience is null or experience between 1 and 5)
);

create table if not exists app.offer_reactions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references app.offers(id) on delete cascade,
  profile_id uuid not null references app.profiles(id) on delete cascade,
  reaction app.offer_reaction not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, offer_id)
);

-- =========================
-- Notifications
-- =========================

create table if not exists app.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references app.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  deep_link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================
-- Featured placements
-- =========================

create table if not exists app.featured_placements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references app.businesses(id) on delete cascade,
  placement_scope app.placement_scope not null,
  area_id uuid references app.areas(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  boost_cap numeric(8,4) not null default 0.10,
  status app.placement_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint featured_dates_ck check (ends_at > starts_at),
  constraint featured_boost_ck check (boost_cap >= 0 and boost_cap <= 1),
  constraint featured_area_scope_ck check (
    (placement_scope = 'area' and area_id is not null)
    or placement_scope in ('home','category')
  )
);

-- =========================
-- Customer trust
-- =========================

create table if not exists app.customer_trust_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references app.profiles(id) on delete cascade,
  event_type text not null,
  points_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists app.customer_trust_scores (
  profile_id uuid primary key references app.profiles(id) on delete cascade,
  score integer not null default 0,
  tier text not null default 'base',
  updated_at timestamptz not null default now(),
  constraint trust_score_nonnegative_ck check (score >= 0)
);

-- =========================
-- Moderation / Admin
-- =========================

create table if not exists app.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references app.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status app.report_status not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists app.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid not null references app.profiles(id) on delete cascade,
  action_type text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =========================
-- Indexes
-- =========================

create index if not exists idx_businesses_owner on app.businesses(owner_profile_id);
create index if not exists idx_businesses_status_category on app.businesses(status, category_primary);
create index if not exists idx_business_locations_geo on app.business_locations using gist(location);
create index if not exists idx_business_locations_area on app.business_locations(area_id);
create index if not exists idx_menu_images_business_status on app.restaurant_menu_images(business_id, status, sort_order);
create index if not exists idx_offers_business_status_valid on app.offers(business_id, status, valid_from, valid_until);
create index if not exists idx_favorites_profile on app.favorites(profile_id, created_at desc);
create index if not exists idx_exclusions_profile on app.exclusions(profile_id, created_at desc);
create index if not exists idx_ratings_business_status on app.restaurant_ratings(business_id, status, created_at desc);
create index if not exists idx_offer_reactions_offer on app.offer_reactions(offer_id, reaction);
create index if not exists idx_notifications_profile_read on app.notifications(profile_id, read_at, created_at desc);
create index if not exists idx_trust_events_profile_created on app.customer_trust_events(profile_id, created_at desc);
create index if not exists idx_reports_status_created on app.reports(status, created_at desc);

-- =========================
-- Updated-at helper
-- =========================

create or replace function app.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','businesses','offers','customer_preferences',
    'restaurant_ratings','offer_reactions','customer_trust_scores'
  ] LOOP
    execute format('drop trigger if exists %I on app.%I', 'trg_'||t||'_updated_at', t);
    execute format('create trigger %I before update on app.%I for each row execute function app.touch_updated_at()', 'trg_'||t||'_updated_at', t);
  END LOOP;
END $$;

-- =========================
-- Auth profile bootstrap
-- =========================

create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, app
as $$
begin
  insert into app.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function app.handle_new_user();

-- =========================
-- RLS
-- =========================

alter table app.profiles enable row level security;
alter table app.areas enable row level security;
alter table app.businesses enable row level security;
alter table app.business_categories enable row level security;
alter table app.business_locations enable row level security;
alter table app.restaurant_menu_images enable row level security;
alter table app.offers enable row level security;
alter table app.business_contact_methods enable row level security;
alter table app.business_payment_methods enable row level security;
alter table app.delivery_coverage_areas enable row level security;
alter table app.customer_preferences enable row level security;
alter table app.favorites enable row level security;
alter table app.exclusions enable row level security;
alter table app.restaurant_ratings enable row level security;
alter table app.restaurant_rating_dimensions enable row level security;
alter table app.offer_reactions enable row level security;
alter table app.notifications enable row level security;
alter table app.featured_placements enable row level security;
alter table app.customer_trust_events enable row level security;
alter table app.customer_trust_scores enable row level security;
alter table app.reports enable row level security;
alter table app.admin_actions enable row level security;

-- Profiles: user sees self only; admin sees all.
create policy profiles_self_select on app.profiles for select using (id = auth.uid() or app.has_role('admin'));
create policy profiles_self_update on app.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on app.profiles for all using (app.has_role('admin')) with check (app.has_role('admin'));

-- Areas are public directory metadata.
create policy areas_public_select on app.areas for select using (active = true or app.has_role('admin'));
create policy areas_admin_write on app.areas for all using (app.has_role('admin')) with check (app.has_role('admin'));

-- Businesses: public can read approved businesses; owner/admin can manage own.
create policy businesses_public_select on app.businesses for select
using (status = 'approved' or owner_profile_id = auth.uid() or app.has_role('admin'));
create policy businesses_owner_insert on app.businesses for insert
with check (owner_profile_id = auth.uid() or app.has_role('admin'));
create policy businesses_owner_update on app.businesses for update
using (owner_profile_id = auth.uid() or app.has_role('admin'))
with check (owner_profile_id = auth.uid() or app.has_role('admin'));
create policy businesses_owner_delete on app.businesses for delete
using (owner_profile_id = auth.uid() or app.has_role('admin'));

-- Business metadata.
create policy business_categories_public_select on app.business_categories for select
using (exists (select 1 from app.businesses b where b.id = business_id and b.status='approved') or app.owns_business(business_id) or app.has_role('admin'));
create policy business_categories_owner_write on app.business_categories for all
using (app.owns_business(business_id) or app.has_role('admin'))
with check (app.owns_business(business_id) or app.has_role('admin'));

create policy business_locations_public_select on app.business_locations for select
using (exists (select 1 from app.businesses b where b.id = business_id and b.status='approved') or app.owns_business(business_id) or app.has_role('admin'));
create policy business_locations_owner_write on app.business_locations for all
using (app.owns_business(business_id) or app.has_role('admin'))
with check (app.owns_business(business_id) or app.has_role('admin'));

-- Menu images: only approved public assets are readable to visitors; owner/admin manage.
create policy menu_images_public_select on app.restaurant_menu_images for select
using ((status='approved' and exists (select 1 from app.businesses b where b.id=business_id and b.status='approved')) or app.owns_business(business_id) or app.has_role('admin'));
create policy menu_images_owner_write on app.restaurant_menu_images for all
using (app.owns_business(business_id) or app.has_role('admin'))
with check (app.owns_business(business_id) or app.has_role('admin'));

-- Offers: approved public; owner/admin manage.
create policy offers_public_select on app.offers for select
using ((status='approved' and exists (select 1 from app.businesses b where b.id=business_id and b.status='approved')) or app.owns_business(business_id) or app.has_role('admin'));
create policy offers_owner_write on app.offers for all
using (app.owns_business(business_id) or app.has_role('admin'))
with check (app.owns_business(business_id) or app.has_role('admin'));

-- Gated contact/payment: only verified customers, owner/admin.
create policy contacts_verified_read on app.business_contact_methods for select
using ((app.is_verified_customer() and visibility='verified_users' and approved=true)
       or app.owns_business(business_id) or app.has_role('admin'));
create policy contacts_owner_write on app.business_contact_methods for all
using (app.owns_business(business_id) or app.has_role('admin'))
with check (app.owns_business(business_id) or app.has_role('admin'));

create policy payments_verified_read on app.business_payment_methods for select
using ((app.is_verified_customer() and visibility='verified_users' and approved=true)
       or app.owns_business(business_id) or app.has_role('admin'));
create policy payments_owner_write on app.business_payment_methods for all
using (app.owns_business(business_id) or app.has_role('admin'))
with check (app.owns_business(business_id) or app.has_role('admin'));

create policy delivery_coverage_public_select on app.delivery_coverage_areas for select
using (exists (select 1 from app.businesses b where b.id=business_id and b.status='approved') or app.owns_business(business_id) or app.has_role('admin'));
create policy delivery_coverage_owner_write on app.delivery_coverage_areas for all
using (app.owns_business(business_id) or app.has_role('admin'))
with check (app.owns_business(business_id) or app.has_role('admin'));

-- Preferences/favorites/exclusions private to customer.
create policy preferences_self_all on app.customer_preferences for all
using (profile_id = auth.uid() and app.is_verified_customer() or app.has_role('admin'))
with check (profile_id = auth.uid() and app.is_verified_customer() or app.has_role('admin'));

create policy favorites_self_all on app.favorites for all
using (profile_id = auth.uid() and app.is_verified_customer() or app.has_role('admin'))
with check (profile_id = auth.uid() and app.is_verified_customer() or app.has_role('admin'));

create policy exclusions_self_all on app.exclusions for all
using (profile_id = auth.uid() and app.is_verified_customer() or app.has_role('admin'))
with check (profile_id = auth.uid() and app.is_verified_customer() or app.has_role('admin'));

-- Ratings: verified users can read; users can create/update own; business owners can read ratings for their business; admin all.
create policy ratings_verified_read on app.restaurant_ratings for select
using ((app.is_verified_customer() and status in ('visible','pending'))
       or exists (select 1 from app.businesses b where b.id=business_id and b.owner_profile_id=auth.uid())
       or app.has_role('admin'));
create policy ratings_self_insert on app.restaurant_ratings for insert
with check (profile_id=auth.uid() and app.is_verified_customer());
create policy ratings_self_update on app.restaurant_ratings for update
using (profile_id=auth.uid() and app.is_verified_customer())
with check (profile_id=auth.uid() and app.is_verified_customer());
create policy ratings_owner_read on app.restaurant_ratings for select
using (exists (select 1 from app.businesses b where b.id=business_id and b.owner_profile_id=auth.uid()));
create policy ratings_admin_all on app.restaurant_ratings for all using (app.has_role('admin')) with check (app.has_role('admin'));

create policy rating_dimensions_verified_read on app.restaurant_rating_dimensions for select
using (exists (select 1 from app.restaurant_ratings r where r.id=rating_id and app.is_verified_customer()) or app.has_role('admin'));
create policy rating_dimensions_self_write on app.restaurant_rating_dimensions for all
using (exists (select 1 from app.restaurant_ratings r where r.id=rating_id and r.profile_id=auth.uid()) or app.has_role('admin'))
with check (exists (select 1 from app.restaurant_ratings r where r.id=rating_id and r.profile_id=auth.uid()) or app.has_role('admin'));

-- Offer reactions: public aggregated counts can be computed by server; raw reactions verified-only.
create policy offer_reactions_self_all on app.offer_reactions for all
using (profile_id=auth.uid() and app.is_verified_customer() or app.has_role('admin'))
with check (profile_id=auth.uid() and app.is_verified_customer() or app.has_role('admin'));

-- Notifications: user own only.
create policy notifications_self_select on app.notifications for select using (profile_id=auth.uid() or app.has_role('admin'));
create policy notifications_self_update on app.notifications for update using (profile_id=auth.uid() or app.has_role('admin')) with check (profile_id=auth.uid() or app.has_role('admin'));
create policy notifications_admin_write on app.notifications for insert with check (app.has_role('admin'));

-- Featured placements: effect is visible publicly via server query/view, raw rows read by owner/admin only.
create policy featured_owner_read on app.featured_placements for select
using (app.owns_business(business_id) or app.has_role('admin'));
create policy featured_owner_write on app.featured_placements for all
using (app.has_role('admin'))
with check (app.has_role('admin'));

-- Trust data never readable by merchants.
create policy trust_events_self_read on app.customer_trust_events for select using (profile_id=auth.uid() or app.has_role('admin'));
create policy trust_scores_self_read on app.customer_trust_scores for select using (profile_id=auth.uid() or app.has_role('admin'));
create policy trust_admin_write on app.customer_trust_events for insert with check (app.has_role('admin'));
create policy trust_score_admin_write on app.customer_trust_scores for all using (app.has_role('admin')) with check (app.has_role('admin'));

-- Reports: reporter can create/read own; merchant can see relevant reports only via target-side workflow later; admin all.
create policy reports_self_insert on app.reports for insert with check (reporter_profile_id=auth.uid() and app.is_verified_customer());
create policy reports_self_read on app.reports for select using (reporter_profile_id=auth.uid() or app.has_role('admin'));
create policy reports_admin_all on app.reports for all using (app.has_role('admin')) with check (app.has_role('admin'));

create policy admin_actions_admin_only on app.admin_actions for all using (app.has_role('admin')) with check (app.has_role('admin'));

-- =========================
-- Public helper views
-- =========================

create or replace view app.public_business_directory as
select
  b.id,
  b.name,
  b.slug,
  b.description,
  b.category_primary,
  b.is_open,
  b.featured_enabled,
  bl.id as location_id,
  bl.area_id,
  bl.address_text,
  bl.latitude,
  bl.longitude,
  bl.location
from app.businesses b
left join app.business_locations bl
  on bl.business_id = b.id
 and bl.is_primary = true
where b.status = 'approved';

create or replace view app.public_offer_directory as
select
  o.id,
  o.business_id,
  o.title,
  o.description,
  o.price,
  o.teaser_image_path,
  o.valid_from,
  o.valid_until,
  o.created_at
from app.offers o
join app.businesses b on b.id = o.business_id
where o.status = 'approved'
  and b.status = 'approved'
  and (o.valid_from is null or o.valid_from <= now())
  and (o.valid_until is null or o.valid_until >= now());

-- Prevent direct selects on private helper objects through views if exposed later; use explicit grants in Supabase as needed.

comment on schema app is 'EAH application schema for v0.1.0';
