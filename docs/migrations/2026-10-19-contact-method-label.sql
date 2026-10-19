-- ═══════════════════════════════════════════════════════════
-- 2026-10-19 — business_contact_methods: add label + sort_order
-- ═══════════════════════════════════════════════════════════
-- Goal: support multiple phone numbers per business with
-- custom labels (شكاوى / شيفت صباحي / إلخ).
--
-- method_type values now:
--   phone          — direct call (multiple allowed, one is_primary)
--   whatsapp       — WhatsApp (multiple allowed)
--   complaints     — complaints line
--   manager        — first manager
--   shift_morning  — morning shift manager
--   shift_evening  — evening shift manager
--   additional     — extra numbers
--
-- label: optional free-text (e.g. "أحمد - المدير")
-- sort_order: display order
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.business_contact_methods
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Unique constraint: one number = one business only (cross-business prevention)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_contact_methods_value_unique'
  ) THEN
    ALTER TABLE public.business_contact_methods
      ADD CONSTRAINT business_contact_methods_value_unique UNIQUE (value);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contact_methods_business
  ON public.business_contact_methods (business_id, sort_order);
