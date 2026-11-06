-- EAH policy: sellers are not charged commission.
-- The legacy table currently exists but is empty; this migration deliberately
-- does not drop the table or delete rows. The obsolete RPC is not called by
-- application code and must not be exposed to browser sessions.
-- Applied to the current EAH pre-launch base on 2026-11-06.

BEGIN;

REVOKE ALL PRIVILEGES
ON FUNCTION public.set_business_commission(uuid, numeric, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.set_business_commission(uuid, numeric, text)
TO service_role;

COMMIT;
