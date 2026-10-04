-- ============================================================
-- EAH — Migration: app_settings + business_locations GRANT
-- التاريخ: 2026-10-04
-- ============================================================
-- 
-- السبب:
-- 1) جدول app_settings اتضاف يدوي في Supabase (لـ Feature Flags)
--    لكن مش موثّق في migrations
-- 2) business_locations كان ممنوع SELECT من anon بسبب REVOKE 
--    في migration 2026-09-25-normalize-profiles.sql
--    ده خلّى getPublishedBusinesses يفشل بصمت -> الأقسام تختفي
--
-- المرجع: docs/LESSONS.md §28
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- 1. جدول app_settings (لـ Feature Flags)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- policy: قراءة فقط للأدمن
DROP POLICY IF EXISTS "admin_read_settings" ON public.app_settings;
CREATE POLICY "admin_read_settings" ON public.app_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- policy: كتابة فقط للأدمن
DROP POLICY IF EXISTS "admin_write_settings" ON public.app_settings;
CREATE POLICY "admin_write_settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- القيم الافتراضية للـ Feature Flags
INSERT INTO public.app_settings (key, value)
VALUES (
  'features',
  '{
    "featured_enabled": true,
    "trends_enabled": true,
    "offers_enabled": true,
    "new_enabled": true,
    "nearby_enabled": true,
    "ai_agent_enabled": true,
    "support_bot_enabled": true,
    "push_enabled": true,
    "qr_enabled": true,
    "announcements_enabled": true,
    "reviews_enabled": true,
    "orders_enabled": true
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- 2. GRANT SELECT على business_locations (إصلاح REVOKE)
-- ═══════════════════════════════════════════════════════════

GRANT SELECT (
  id,
  business_id,
  address_text,
  latitude,
  longitude,
  is_primary,
  created_at
)
ON public.business_locations
TO anon, authenticated;

-- ============================================================
-- نهاية migration
-- ============================================================
