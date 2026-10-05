-- ============================================================
-- EAH — Migration: Business Rejection Fields
-- التاريخ: 2026-10-05
-- ============================================================
-- السبب: الأدمن محتاج يرفض نشاط مع سبب واضح
-- ============================================================

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- فهرس للبحث السريع عن المرفوضين
CREATE INDEX IF NOT EXISTS businesses_rejected_idx
  ON public.businesses (rejected_at DESC)
  WHERE rejected_at IS NOT NULL;

-- ============================================================
-- نهاية migration
-- ============================================================
