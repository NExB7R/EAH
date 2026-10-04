-- ============================================================
-- EAH — Migration: Announcements
-- التاريخ: 2026-10-04
-- ============================================================
-- نظام إعلانات الإدارة — banner أعلى الصفحة
-- ============================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  theme text NOT NULL DEFAULT 'gold'
    CHECK (theme IN ('gold', 'purple', 'orange', 'teal')),
  is_active boolean NOT NULL DEFAULT true,
  dismissible boolean NOT NULL DEFAULT true,
  link_url text,
  link_label text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS announcements_active_idx
  ON public.announcements (is_active, starts_at, ends_at);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public: قراءة الإعلانات النشطة فقط
DROP POLICY IF EXISTS "public_read_active_announcements" ON public.announcements;
CREATE POLICY "public_read_active_announcements" ON public.announcements
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

-- Admin: كل الصلاحيات
DROP POLICY IF EXISTS "admin_all_announcements" ON public.announcements;
CREATE POLICY "admin_all_announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_announcements_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_announcements_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_announcements_updated_at();

-- ============================================================
-- نهاية migration
-- ============================================================
