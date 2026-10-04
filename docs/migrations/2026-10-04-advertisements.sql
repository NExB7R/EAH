-- ============================================================
-- EAH — Migration: Advertisements
-- التاريخ: 2026-10-04
-- ============================================================
-- نظام الإعلانات الفعلية (بعد ad_slots الأماكن)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES public.ad_slots(id) ON DELETE RESTRICT,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text,
  link_url text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'expired', 'paused')),
  price_paid_egp numeric(10, 2) NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  rejection_reason text,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS advertisements_slot_status_idx
  ON public.advertisements (slot_id, status);
CREATE INDEX IF NOT EXISTS advertisements_business_idx
  ON public.advertisements (business_id, status);
CREATE INDEX IF NOT EXISTS advertisements_active_idx
  ON public.advertisements (status, starts_at, ends_at)
  WHERE status = 'active';

ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Public: قراءة الإعلانات النشطة فقط
DROP POLICY IF EXISTS "public_read_active_ads" ON public.advertisements;
CREATE POLICY "public_read_active_ads" ON public.advertisements
  FOR SELECT TO anon, authenticated
  USING (
    status = 'active'
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

-- Owner (merchant): يشوف إعلاناته
DROP POLICY IF EXISTS "owner_read_own_ads" ON public.advertisements;
CREATE POLICY "owner_read_own_ads" ON public.advertisements
  FOR SELECT TO authenticated
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_profile_id = auth.uid()
    )
  );

-- Owner (merchant): يعمل إعلان (pending)
DROP POLICY IF EXISTS "owner_insert_own_ads" ON public.advertisements;
CREATE POLICY "owner_insert_own_ads" ON public.advertisements
  FOR INSERT TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_profile_id = auth.uid()
    )
    AND status = 'pending'
  );

-- Owner: يعدّل إعلانه (مش الـ status)
DROP POLICY IF EXISTS "owner_update_own_ads" ON public.advertisements;
CREATE POLICY "owner_update_own_ads" ON public.advertisements
  FOR UPDATE TO authenticated
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_profile_id = auth.uid()
    )
  );

-- Admin: كل الصلاحيات
DROP POLICY IF EXISTS "admin_all_ads" ON public.advertisements;
CREATE POLICY "admin_all_ads" ON public.advertisements
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_advertisements_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_advertisements_updated_at ON public.advertisements;
CREATE TRIGGER trg_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_advertisements_updated_at();

-- ============================================================
-- نهاية migration
-- ============================================================
