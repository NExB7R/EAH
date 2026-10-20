-- ═══════════════════════════════════════════════════════════════
-- EAH — Fix contact_methods CHECK (supersede 2026-10-20)
-- 2026-10-20
--
-- Problem: previous migration narrowed method_type CHECK to 6 values,
-- but wizard saves 10 types including manager/shift_morning/shift_evening/additional.
-- Fix: expand CHECK to full canonical list.
--
-- Rollback: restore previous 6-value CHECK (only if no rows use new types).
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE business_contact_methods
  DROP CONSTRAINT IF EXISTS business_contact_methods_method_type_check;

ALTER TABLE business_contact_methods
  ADD CONSTRAINT business_contact_methods_method_type_check
  CHECK (method_type IN (
    'phone',
    'whatsapp',
    'complaints',
    'facebook',
    'instagram',
    'website',
    'manager',
    'shift_morning',
    'shift_evening',
    'additional'
  ));

COMMENT ON CONSTRAINT business_contact_methods_method_type_check 
  ON business_contact_methods IS
  'Canonical contact types. manager = مسئول النشاط; shift_* = مسئول شفت; additional = رقم إضافي.';
