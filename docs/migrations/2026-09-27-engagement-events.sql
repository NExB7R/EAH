-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: engagement_events (تحليلات)
-- التاريخ: 2026-09-27
-- الحالة: ✅ تم التنفيذ بنجاح في production
-- الهدف: تتبّع تفاعل العميل (كشف رقم / واتساب / تقييم / تعليق)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('phone_reveal', 'whatsapp', 'review', 'comment')),
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagement_events_business_action
  ON engagement_events(business_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_engagement_events_created
  ON engagement_events(created_at DESC);

ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "engagement_insert_service" ON engagement_events;
CREATE POLICY "engagement_insert_service" ON engagement_events
  FOR INSERT TO service_role WITH CHECK (true);

-- ملاحظة: is_admin() غير موجودة → استخدمنا user_roles مباشرة
DROP POLICY IF EXISTS "engagement_select_admin" ON engagement_events;
CREATE POLICY "engagement_select_admin" ON engagement_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
  );

-- نتيجة التنفيذ: total_events = 0
