-- EAH contact privacy hardening — 2026-10-29
-- Remove direct anon/authenticated reads of private phone/WhatsApp columns.
-- Public branch details remain selectable; private numbers are read by server actions
-- only after authentication/ownership checks, then revealed through controlled flows.
--
-- IMPORTANT: test in a dedicated staging database before applying to production.

BEGIN;

-- Stop table-level SELECT, then grant only branch fields needed for public display.
REVOKE SELECT ON TABLE public.business_branches FROM anon, authenticated;
REVOKE SELECT (phone, whatsapp) ON TABLE public.business_branches FROM anon, authenticated;
GRANT SELECT (
  id, business_id, name, area, address_text, latitude, longitude, working_hours,
  is_primary, is_active, sort_order, created_at, updated_at
) ON TABLE public.business_branches TO anon, authenticated;

-- Unrelated authenticated users need only the public, published branch policy.
-- Owners/admins still use the owner/admin policy; private phone fields are read
-- by server-side code after checking ownership.
DROP POLICY IF EXISTS branches_select_authenticated ON public.business_branches;

-- Expose only contact channels that are intended to be public. Phone, WhatsApp,
-- complaint lines and internal shift/manager contacts stay behind owner/RPC APIs.
DROP POLICY IF EXISTS business_contact_methods_public_read ON public.business_contact_methods;
CREATE POLICY business_contact_methods_public_read
ON public.business_contact_methods
FOR SELECT
TO anon, authenticated
USING (
  is_public = true
  AND method_type IN ('facebook', 'instagram', 'website')
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id = business_contact_methods.business_id
      AND b.is_published = true
  )
);

-- Assertions for migration testing:
-- SELECT has_table_privilege('anon', 'public.business_branches', 'SELECT'); -- must be false
-- SELECT has_column_privilege('anon', 'public.business_branches', 'phone', 'SELECT'); -- false
-- SELECT has_column_privilege('authenticated', 'public.business_branches', 'whatsapp', 'SELECT'); -- false
-- SELECT has_column_privilege('anon', 'public.business_branches', 'name', 'SELECT'); -- true
-- SELECT policyname, qual FROM pg_policies
--  WHERE schemaname='public' AND tablename='business_contact_methods'
--    AND policyname='business_contact_methods_public_read';
-- After verifying, COMMIT the migration. During a dry run, ROLLBACK instead.

COMMIT;
