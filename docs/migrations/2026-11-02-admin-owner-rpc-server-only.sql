-- EAH — Make direct activity-owner mutation RPC server-only.
-- The supported admin interface performs ownership changes through reviewed
-- server actions that validate role, single-activity constraints and order state.
-- This legacy RPC is not called by application code and must not bypass that flow.

BEGIN;

REVOKE ALL PRIVILEGES
ON FUNCTION public.admin_set_business_owner(uuid, uuid)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE
ON FUNCTION public.admin_set_business_owner(uuid, uuid)
TO service_role;

REVOKE ALL PRIVILEGES
ON FUNCTION private.admin_set_business_owner(uuid, uuid)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE
ON FUNCTION private.admin_set_business_owner(uuid, uuid)
TO service_role;

COMMIT;
