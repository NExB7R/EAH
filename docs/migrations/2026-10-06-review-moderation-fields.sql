-- ============================================================
-- EAH — Migration: Review Moderation Fields
-- التاريخ: 2026-10-06
-- ============================================================
-- السبب: الأدمن محتاج يوثّق مين راجع التقييم ومتى
-- ============================================================

ALTER TABLE public.business_reviews
  ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

CREATE INDEX IF NOT EXISTS business_reviews_moderated_idx
  ON public.business_reviews (moderated_at DESC)
  WHERE moderated_at IS NOT NULL;

-- ============================================================
-- نهاية migration
-- ============================================================
