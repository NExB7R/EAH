-- EAH — Allow the visible admin role to manage platform activities.
-- Date: 2026-10-29
--
-- The existing businesses_admin_all policy used private.is_admin(), which checks only
-- the internal super_admin permission. But requireAdmin() intentionally authorizes both
-- admin and super_admin, and the admin activity list/create/update/publish flows use the
-- authenticated session. As a result, ordinary admins could pass the app-level guard yet
-- be denied by RLS when reading unpublished activities or saving activity changes.
--
-- public.auth_is_admin() checks both visible admin permissions and is retained for
-- authenticated callers by 2026-10-29-prelaunch-access-control.sql.
-- Keep business reads/writes restricted to authenticated admins; do not expose anon.
--
-- Test on a dedicated non-production database first. Do not apply directly to production.

DROP POLICY IF EXISTS businesses_admin_all ON public.businesses;

CREATE POLICY businesses_admin_all
ON public.businesses
FOR ALL
TO authenticated
USING ((SELECT public.auth_is_admin()))
WITH CHECK ((SELECT public.auth_is_admin()));

-- Verification:
-- SELECT policyname, cmd, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'businesses'
--   AND policyname = 'businesses_admin_all';
-- Test as a non-super admin: listing unpublished/rejected activities, creating a new
-- activity, linking an existing owner, updating, publishing and archiving must succeed.
-- Test as buyer/seller/anon: those writes must remain denied.
