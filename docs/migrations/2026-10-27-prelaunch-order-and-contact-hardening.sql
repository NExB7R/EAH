-- EAH pre-launch hardening: order gates, durable merchant alerts, and private contact access.
-- Review against the live schema; apply only after a verified backup and rollback plan.

BEGIN;

ALTER TABLE public.merchant_order_settings
  ADD COLUMN IF NOT EXISTS admin_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS accepts_orders boolean NOT NULL DEFAULT false;

-- Preserve prior activations only when the business is published and has an owner.
-- Admin-created, unowned businesses remain visible publicly but cannot accept orders.
UPDATE public.merchant_order_settings AS s
SET admin_enabled = (
  s.orders_enabled IS TRUE
  AND EXISTS (
    SELECT 1
    FROM public.businesses AS b
    WHERE b.id = s.business_id
      AND b.is_published IS TRUE
      AND b.owner_profile_id IS NOT NULL
  )
)
WHERE s.admin_enabled IS DISTINCT FROM (
  s.orders_enabled IS TRUE
  AND EXISTS (
    SELECT 1
    FROM public.businesses AS b
    WHERE b.id = s.business_id
      AND b.is_published IS TRUE
      AND b.owner_profile_id IS NOT NULL
  )
);

-- Seed safe-off defaults for historical businesses that have no settings row.
INSERT INTO public.merchant_order_settings (business_id, admin_enabled, orders_enabled, deadline_minutes)
SELECT b.id, false, false, 10
FROM public.businesses b
LEFT JOIN public.merchant_order_settings s ON s.business_id = b.id
WHERE s.business_id IS NULL
ON CONFLICT (business_id) DO NOTHING;

UPDATE public.businesses b
SET accepts_orders = (s.admin_enabled IS TRUE AND s.orders_enabled IS TRUE)
FROM public.merchant_order_settings s
WHERE s.business_id = b.id
  AND b.accepts_orders IS DISTINCT FROM (s.admin_enabled IS TRUE AND s.orders_enabled IS TRUE);

ALTER TABLE public.businesses
  ALTER COLUMN accepts_orders SET DEFAULT false,
  ALTER COLUMN accepts_orders SET NOT NULL;

-- RLS policies are only effective after SQL privileges are granted. Keep this table unavailable to anon.
GRANT SELECT, INSERT, UPDATE ON TABLE public.merchant_order_settings TO authenticated;

-- Restore merchant/admin operations on ads while letting the existing RLS policies restrict each row.
-- Public ad display uses the server-only service client and returns only whitelisted public fields.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ads TO authenticated;

-- Merchants may cancel only their own pending/rejected ad requests.
DROP POLICY IF EXISTS ads_delete_owner_pending ON public.ads;
CREATE POLICY ads_delete_owner_pending
  ON public.ads
  FOR DELETE TO authenticated
  USING (
    status IN ('pending', 'rejected')
    AND owner_profile_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.businesses b
      WHERE b.id = ads.business_id
        AND b.owner_profile_id = (SELECT auth.uid())
    )
  );

-- Only owners and administrators may read the private settings row.
DROP POLICY IF EXISTS mos_select_authenticated ON public.merchant_order_settings;
DROP POLICY IF EXISTS mos_select_own ON public.merchant_order_settings;
CREATE POLICY mos_select_own
  ON public.merchant_order_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = merchant_order_settings.business_id
        AND (b.owner_profile_id = (SELECT auth.uid()) OR public.auth_is_admin())
    )
  );

-- Creating/approving settings is admin-only; owner updates are constrained by the trigger below.
DROP POLICY IF EXISTS mos_insert_admin ON public.merchant_order_settings;
CREATE POLICY mos_insert_admin
  ON public.merchant_order_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.auth_is_admin());

CREATE OR REPLACE FUNCTION public.prevent_merchant_toggle_orders_enabled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.auth_is_admin() THEN
    IF NEW.business_id IS DISTINCT FROM OLD.business_id
       OR NEW.admin_enabled IS DISTINCT FROM OLD.admin_enabled
       OR NEW.deadline_minutes IS DISTINCT FROM OLD.deadline_minutes
       OR NEW.orders_enabled_at IS DISTINCT FROM OLD.orders_enabled_at
       OR NEW.orders_disabled_at IS DISTINCT FROM OLD.orders_disabled_at
       OR NEW.missed_count_today IS DISTINCT FROM OLD.missed_count_today
       OR NEW.missed_count_week IS DISTINCT FROM OLD.missed_count_week
       OR NEW.last_missed_at IS DISTINCT FROM OLD.last_missed_at
       OR NEW.suspended_until IS DISTINCT FROM OLD.suspended_until
       OR NEW.suspension_reason IS DISTINCT FROM OLD.suspension_reason
       OR NEW.auto_accept IS DISTINCT FROM OLD.auto_accept THEN
      RAISE EXCEPTION 'protected order settings can only be changed by an administrator';
    END IF;

    IF NEW.orders_enabled IS DISTINCT FROM OLD.orders_enabled AND OLD.admin_enabled IS NOT TRUE THEN
      RAISE EXCEPTION 'order intake must be enabled by an administrator first';
    END IF;
  END IF;

  IF NEW.orders_enabled IS DISTINCT FROM OLD.orders_enabled THEN
    IF NEW.orders_enabled THEN
      NEW.orders_enabled_at := now();
      NEW.orders_disabled_at := NULL;
    ELSE
      NEW.orders_disabled_at := now();
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_business_accepts_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_accepts boolean := (NEW.admin_enabled IS TRUE AND NEW.orders_enabled IS TRUE);
BEGIN
  UPDATE public.businesses
  SET accepts_orders = v_accepts
  WHERE id = NEW.business_id
    AND accepts_orders IS DISTINCT FROM v_accepts;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_business_accepts_orders_insert ON public.merchant_order_settings;
CREATE TRIGGER trg_sync_business_accepts_orders_insert
AFTER INSERT ON public.merchant_order_settings
FOR EACH ROW EXECUTE FUNCTION public.sync_business_accepts_orders();

DROP TRIGGER IF EXISTS trg_sync_business_accepts_orders_update ON public.merchant_order_settings;
CREATE TRIGGER trg_sync_business_accepts_orders_update
AFTER UPDATE OF admin_enabled, orders_enabled ON public.merchant_order_settings
FOR EACH ROW EXECUTE FUNCTION public.sync_business_accepts_orders();

-- Protect the denormalized public flag from direct owner/client writes, but allow the synchronized
-- nested update from sync_business_accepts_orders() and administrator/service operations.
CREATE OR REPLACE FUNCTION public.prevent_direct_accepts_orders_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF NEW.accepts_orders IS DISTINCT FROM OLD.accepts_orders
     AND pg_trigger_depth() = 1
     AND auth.uid() IS NOT NULL
     AND NOT public.auth_is_admin() THEN
    RAISE EXCEPTION 'accepts_orders is managed by merchant_order_settings';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_direct_accepts_orders_update ON public.businesses;
CREATE TRIGGER trg_prevent_direct_accepts_orders_update
BEFORE UPDATE OF accepts_orders ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.prevent_direct_accepts_orders_update();

CREATE OR REPLACE FUNCTION public.seed_merchant_order_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.merchant_order_settings (business_id, admin_enabled, orders_enabled, deadline_minutes)
  VALUES (NEW.id, false, false, 10)
  ON CONFLICT (business_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_seed_merchant_order_settings ON public.businesses;
CREATE TRIGGER trg_seed_merchant_order_settings
AFTER INSERT ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.seed_merchant_order_settings();

-- Every in-app order produces a durable merchant bell notification transactionally.
CREATE OR REPLACE FUNCTION public.notify_merchant_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT owner_profile_id INTO v_owner_id
  FROM public.businesses WHERE id = NEW.business_id;

  IF v_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, notification_type, title, body, deep_link)
    VALUES (
      v_owner_id, 'order_new',
      'طلب جديد #' || COALESCE(NEW.order_code, ''),
      LEFT(
        COALESCE(NULLIF(NEW.customer_name, ''), 'عميل') || ': ' ||
        COALESCE(NULLIF(NEW.items, ''), 'تفاصيل الطلب داخل المنصة'),
        220
      ),
      '/merchant/orders?order=' || NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_notify_merchant_new_order ON public.order_requests;
CREATE TRIGGER trg_notify_merchant_new_order
AFTER INSERT ON public.order_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_merchant_new_order();

-- Branch edits already verify ownership in server actions; restore DML privileges under the
-- existing branches_owner_write RLS policy. SELECT remains column-limited below.
GRANT INSERT, UPDATE, DELETE ON TABLE public.business_branches TO authenticated;

-- Remove public REST access to private branch phone numbers. Server-only loaders validate access
-- before using the service client; public pages still receive branch names and locations.
REVOKE SELECT ON TABLE public.business_branches FROM PUBLIC, anon, authenticated;
REVOKE SELECT (phone, whatsapp) ON TABLE public.business_branches FROM PUBLIC, anon, authenticated;
GRANT SELECT (
  id, business_id, name, area, address_text, latitude, longitude, working_hours,
  is_primary, is_active, sort_order, created_at, updated_at
) ON TABLE public.business_branches TO anon, authenticated;

-- Public contact rows are limited to social/profile links. Phone/WhatsApp values are revealed via
-- the authenticated, rate-limited /api/track-contact endpoint after the user clicks.
DROP POLICY IF EXISTS business_contact_methods_public_read ON public.business_contact_methods;
CREATE POLICY business_contact_methods_public_read
  ON public.business_contact_methods
  FOR SELECT TO anon, authenticated
  USING (
    is_public IS TRUE
    AND method_type IN ('facebook', 'instagram', 'website')
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_contact_methods.business_id AND b.is_published IS TRUE
    )
  );

REVOKE UPDATE (accepts_orders) ON TABLE public.businesses FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_business_accepts_orders() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_merchant_order_settings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_merchant_new_order() FROM PUBLIC, anon, authenticated;

-- The API route validates the signed-in user and calls this audit RPC with service-role credentials.
-- Prevent direct anonymous/authenticated calls that could poison contact-reveal analytics.
REVOKE EXECUTE ON FUNCTION public.reveal_contact(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reveal_contact(uuid, text, text) TO service_role;

COMMIT;
