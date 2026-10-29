-- EAH — harden the currently referenced legacy public.ads table.
-- Applied to the live Supabase project on 2026-10-29 after a BEGIN/ROLLBACK DDL smoke test.
-- Continue migrating application routes toward ad_campaigns/ad_creatives; do not drop ads
-- until all legacy routes have been switched and verified.

DROP POLICY IF EXISTS ads_read ON public.ads;
CREATE POLICY ads_read
ON public.ads
FOR SELECT
TO anon, authenticated
USING (
  (
    status = 'active'
    AND starts_at <= now()
    AND (ends_at IS NULL OR ends_at > now())
  )
  OR owner_profile_id = (SELECT auth.uid())
  OR (SELECT public.auth_is_admin())
);

DROP POLICY IF EXISTS ads_insert ON public.ads;
CREATE POLICY ads_insert
ON public.ads
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT public.auth_is_admin())
  OR (
    owner_profile_id = (SELECT auth.uid())
    AND status = 'pending'
    AND rejected_reason IS NULL
    AND business_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.businesses AS owned_business
      WHERE owned_business.id = public.ads.business_id
        AND owned_business.owner_profile_id = (SELECT auth.uid())
    )
  )
);

DROP POLICY IF EXISTS ads_update ON public.ads;
CREATE POLICY ads_update
ON public.ads
FOR UPDATE
TO authenticated
USING ((SELECT public.auth_is_admin()))
WITH CHECK ((SELECT public.auth_is_admin()));

DROP POLICY IF EXISTS ads_delete ON public.ads;
CREATE POLICY ads_delete
ON public.ads
FOR DELETE
TO authenticated
USING (
  (SELECT public.auth_is_admin())
  OR (
    owner_profile_id = (SELECT auth.uid())
    AND status IN ('pending', 'rejected')
    AND business_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.businesses AS owned_business
      WHERE owned_business.id = public.ads.business_id
        AND owned_business.owner_profile_id = (SELECT auth.uid())
    )
  )
);

COMMENT ON POLICY ads_read ON public.ads IS
  'Public sees only active ads inside their scheduled window; owners/admins can read their own/moderate.';
COMMENT ON POLICY ads_insert ON public.ads IS
  'Sellers can create pending ads only for a business they own; super_admin may create admin ads.';
COMMENT ON POLICY ads_update ON public.ads IS
  'Only super_admin can update advertisement state or fields.';
COMMENT ON POLICY ads_delete ON public.ads IS
  'Owners may delete only their pending/rejected ads; super_admin retains moderation.';
