-- EAH — Harden search_path on audited trigger/helper functions.
-- Apply only through the isolated non-production Quality Gate first.
BEGIN;

ALTER FUNCTION public.get_trust_tier(integer)
  SET search_path = pg_catalog;

ALTER FUNCTION public.set_new_until()
  SET search_path = pg_catalog;

CREATE OR REPLACE FUNCTION public.prevent_merchant_toggle_orders_enabled()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.auth_is_admin()
     AND NEW.orders_enabled IS DISTINCT FROM OLD.orders_enabled THEN
    RAISE EXCEPTION 'orders_enabled can only be changed by admin';
  END IF;

  RETURN NEW;
END;
$function$;

COMMIT;
