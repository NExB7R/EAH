-- EAH pre-launch regression tests for order/contact database hardening.
-- These assertions are expected to pass only after the matching migration is applied.
BEGIN;
SELECT plan(19);

SELECT is(
  has_table_privilege('anon', 'public.ads', 'SELECT'),
  false,
  'anonymous clients cannot query ads directly'
);

SELECT is(
  has_table_privilege('authenticated', 'public.ads', 'SELECT'),
  true,
  'authenticated ad reads are available under ads RLS policies'
);

SELECT is(
  has_table_privilege('authenticated', 'public.ads', 'INSERT'),
  true,
  'authenticated ad submissions are available under ads RLS policies'
);

SELECT is(
  has_table_privilege('authenticated', 'public.ads', 'UPDATE'),
  true,
  'authenticated ad updates are available under ads RLS policies'
);

SELECT is(
  EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ads'
      AND policyname = 'ads_delete_owner_pending'
      AND cmd = 'DELETE'
      AND qual LIKE '%pending%'
      AND qual LIKE '%rejected%'
      AND qual LIKE '%owner_profile_id%'
  ),
  true,
  'merchants may delete only their own pending/rejected ad requests'
);

SELECT is(
  has_table_privilege('anon', 'public.merchant_order_settings', 'SELECT'),
  false,
  'anonymous clients cannot read private merchant order settings'
);

SELECT is(
  has_table_privilege('authenticated', 'public.merchant_order_settings', 'SELECT'),
  true,
  'authenticated order settings reads are governed by owner/admin RLS'
);

SELECT is(
  has_column_privilege('anon', 'public.business_branches', 'phone', 'SELECT'),
  false,
  'anonymous clients cannot select private branch phone numbers'
);

SELECT is(
  has_column_privilege('authenticated', 'public.business_branches', 'whatsapp', 'SELECT'),
  false,
  'authenticated clients cannot select branch WhatsApp columns directly'
);

SELECT is(
  EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'merchant_order_settings'
      AND column_name = 'admin_enabled'
      AND is_nullable = 'NO'
  ),
  true,
  'merchant order settings have a required administrator approval gate'
);

SELECT is(
  NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'merchant_order_settings'
      AND policyname = 'mos_select_authenticated'
      AND qual = 'true'
  ),
  true,
  'broad authenticated order settings read policy is removed'
);

SELECT is(
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'order_requests'
      AND t.tgname = 'trg_notify_merchant_new_order'
      AND NOT t.tgisinternal
  ),
  true,
  'new orders create durable merchant notifications through a database trigger'
);

SELECT is(
  has_function_privilege('anon', 'public.reveal_contact(uuid, text, text)', 'EXECUTE'),
  false,
  'anonymous clients cannot call the contact reveal audit RPC'
);

SELECT is(
  has_function_privilege('authenticated', 'public.reveal_contact(uuid, text, text)', 'EXECUTE'),
  false,
  'authenticated clients must use the validated server endpoint for contact reveal logging'
);

SELECT is(
  has_function_privilege('service_role', 'public.reveal_contact(uuid, text, text)', 'EXECUTE'),
  true,
  'the validated server endpoint can record contact reveals with the service role'
);

SELECT is(
  has_table_privilege('authenticated', 'public.order_requests', 'INSERT'),
  false,
  'authenticated clients cannot insert orders directly'
);

SELECT is(
  has_any_column_privilege('authenticated', 'public.order_requests', 'INSERT'),
  false,
  'legacy column-level order insert grants are also revoked'
);

SELECT is(
  EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'order_requests'
      AND t.tgname = 'aaa_guard_order_request_insert'
      AND NOT t.tgisinternal
  ),
  true,
  'database independently guards order creation'
);

SELECT is(
  pg_get_functiondef('public.assign_order_code_v2()'::regprocedure)
    LIKE '%NEW.order_code := NEW.order_code_v2%',
  true,
  'the generated monthly order code is mirrored into the UI-facing column'
);

SELECT * FROM finish();
ROLLBACK;
