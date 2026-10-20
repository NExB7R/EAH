-- ═══════════════════════════════════════════════════════════════
-- EAH — Offers admin write policy
-- 2026-10-20
--
-- Problem: offers has SELECT policies only. Admin edit-actions use
-- user client (RLS-enforced) → INSERT/UPDATE/DELETE fail silently.
-- Fix: add admin-only policy for full CRUD.
--
-- Rollback: DROP POLICY IF EXISTS "offers_admin_all" ON offers;
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "offers_admin_all" ON offers;

CREATE POLICY "offers_admin_all"
  ON offers
  FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

COMMENT ON POLICY "offers_admin_all" ON offers IS
  'Admin full CRUD. Public reads via offers_public_select; owner reads via offers_owner_select.';
