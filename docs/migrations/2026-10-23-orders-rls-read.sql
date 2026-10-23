-- ═══════════════════════════════════════════════════════════════════
-- EAH — Allow authenticated users to read order settings (for placing orders)
-- Date: 2026-10-23
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- Allow any authenticated user to read merchant_order_settings
-- (needed by submitOrder to check orders_enabled + delivery_eta_minutes)
DROP POLICY IF EXISTS mos_select_authenticated ON merchant_order_settings;
CREATE POLICY mos_select_authenticated ON merchant_order_settings FOR SELECT
TO authenticated
USING (true);

-- Also: customer needs to read business_branches (for phone/whatsapp)
DROP POLICY IF EXISTS branches_select_authenticated ON business_branches;
CREATE POLICY branches_select_authenticated ON business_branches FOR SELECT
TO authenticated
USING (is_active = true);

COMMIT;

-- Verification:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'merchant_order_settings';
-- Expected: mos_select_own, mos_select_authenticated (and mos_select_admin if exists)
