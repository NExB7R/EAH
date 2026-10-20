-- EAH — Public business details security and visibility
-- Public visitors may read only explicitly public contact methods for published
-- businesses. Unpublished business locations stay visible to their owner/admin.

BEGIN;

DROP POLICY IF EXISTS business_contact_methods_public_read ON public.business_contact_methods;
CREATE POLICY business_contact_methods_public_read
  ON public.business_contact_methods
  FOR SELECT
  TO anon, authenticated
  USING (
    is_public = true
    AND EXISTS (
      SELECT 1
      FROM public.businesses AS b
      WHERE b.id = business_contact_methods.business_id
        AND b.is_published = true
    )
  );

DROP POLICY IF EXISTS bl_read ON public.business_locations;
CREATE POLICY bl_read
  ON public.business_locations
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses AS b
      WHERE b.id = business_locations.business_id
        AND (
          b.is_published = true
          OR b.owner_profile_id = (SELECT auth.uid())
          OR (SELECT private.is_admin())
        )
    )
  );

COMMIT;
