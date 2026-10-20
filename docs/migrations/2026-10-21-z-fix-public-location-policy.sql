-- EAH — Keep public location reads independent of admin-only functions.
-- The anonymous policy must not invoke private.is_admin(); authenticated owners
-- and admins retain their intended access through a separate policy.

BEGIN;

DROP POLICY IF EXISTS bl_read ON public.business_locations;
DROP POLICY IF EXISTS bl_read_public ON public.business_locations;
DROP POLICY IF EXISTS bl_read_owner_admin ON public.business_locations;

CREATE POLICY bl_read_public
  ON public.business_locations
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM public.businesses AS b
      WHERE b.id = business_locations.business_id
        AND b.is_published = true
    )
  );

CREATE POLICY bl_read_owner_admin
  ON public.business_locations
  FOR SELECT
  TO authenticated
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
