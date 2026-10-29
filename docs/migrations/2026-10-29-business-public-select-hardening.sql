-- EAH — anonymous business-row column hardening, 2026-10-29
-- Prevent unauthenticated PostgREST clients from reading ownership and moderation fields
-- from otherwise public published-business rows. Authenticated grants are intentionally
-- left unchanged in this phase because server actions still use owner_profile_id filters.
-- Follow-up required: replace those checks with authenticated server-side ownership checks,
-- then remove the broader authenticated SELECT grant after verifying each user journey.

BEGIN;

REVOKE SELECT ON TABLE public.businesses FROM anon;
GRANT SELECT (
  id, business_type, name, slug, description, latitude, longitude, address_text, city, area,
  is_open, is_featured, is_published, created_at, updated_at, hook, working_hours,
  cover_image_url, map_url, accepts_whatsapp_orders, successful_orders,
  response_time_avg_seconds, response_rate, last_activity_at, is_new_project,
  sub_category, subcategory, featured_order, featured_until, featured_pin, new_until,
  is_opportunity, opportunity_until, opportunity_note, branches_count, offers_count,
  rating_avg, rating_count, is_verified, verified_at, open_now_override,
  accepts_orders
) ON TABLE public.businesses TO anon;

DO $$
BEGIN
  IF has_table_privilege('anon', 'public.businesses', 'SELECT') THEN
    RAISE EXCEPTION 'anon unexpectedly retains table SELECT on businesses';
  END IF;
  IF has_column_privilege('anon', 'public.businesses', 'owner_profile_id', 'SELECT') THEN
    RAISE EXCEPTION 'anon can still select businesses.owner_profile_id';
  END IF;
  IF has_column_privilege('anon', 'public.businesses', 'rejected_by', 'SELECT') THEN
    RAISE EXCEPTION 'anon can still select businesses.rejected_by';
  END IF;
  IF NOT has_column_privilege('anon', 'public.businesses', 'name', 'SELECT') THEN
    RAISE EXCEPTION 'anon lost public business name access';
  END IF;
  IF NOT has_column_privilege('anon', 'public.businesses', 'slug', 'SELECT') THEN
    RAISE EXCEPTION 'anon lost public business slug access';
  END IF;
END $$;

COMMIT;

-- Authenticated still has legacy table-wide SELECT as this phase intentionally only
-- restricts anonymous access. Complete the authenticated privilege migration after
-- all owner-filtered server actions have been converted and tested.
