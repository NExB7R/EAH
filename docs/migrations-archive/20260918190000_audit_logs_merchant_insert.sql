-- ═══════════════════════════════════════════════════════════════
-- audit_logs — السماح للمستخدمين بتسجيل عملياتهم
-- تاريخ: 2026-09-18
-- ═══════════════════════════════════════════════════════════════

-- تأكد إن RLS مفعّلة
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- policy: أي مستخدم مسجل يقدر يسجل audit خاص بنفسه
DROP POLICY IF EXISTS "audit_logs self insert" ON public.audit_logs;
CREATE POLICY "audit_logs self insert" ON public.audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = actor_user_id);

-- policy: أي مستخدم يشوف logs بتاعته
DROP POLICY IF EXISTS "audit_logs self read" ON public.audit_logs;
CREATE POLICY "audit_logs self read" ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = actor_user_id);

-- policy: الأدمن يشوف كل حاجة
DROP POLICY IF EXISTS "audit_logs admin all" ON public.audit_logs;
CREATE POLICY "audit_logs admin all" ON public.audit_logs
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

COMMENT ON POLICY "audit_logs self insert" ON public.audit_logs IS 'أي مستخدم يسجل audit خاص بنفسه';
