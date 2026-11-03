-- EAH — Add the dedicated supermarket activity type.
-- This migration is intentionally separate from application deployment.
-- Apply to the reviewed non-production DB first, then production through the
-- normal Supabase migration/release process.

BEGIN;

ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS businesses_business_type_check;

ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_business_type_check
  CHECK (
    business_type = ANY (
      ARRAY[
        'restaurant'::text,
        'pharmacy'::text,
        'supermarket'::text,
        'delivery_office'::text,
        'misc'::text
      ]
    )
  ) NOT VALID;

ALTER TABLE public.businesses
  VALIDATE CONSTRAINT businesses_business_type_check;

COMMIT;
