-- EAH: contact reveal audit rows are readable by the sole platform administrator only.
-- The legacy app_role value 'admin' is retired and must not grant data access.
-- Apply only to a dedicated non-production database until explicitly approved.

BEGIN;

ALTER TABLE public.contact_reveals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_read_contact_reveals ON public.contact_reveals;
DROP POLICY IF EXISTS super_admin_read_contact_reveals ON public.contact_reveals;

CREATE POLICY super_admin_read_contact_reveals
ON public.contact_reveals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = (SELECT auth.uid())
      AND ur.role = 'super_admin'::public.app_role
  )
);

COMMIT;

-- Verify on the isolated test database:
-- SELECT policyname, roles, qual FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'contact_reveals';
-- Expected: only super_admin_read_contact_reveals, role authenticated,
-- with a super_admin-only predicate. anon must not have table SELECT privilege.
