-- EAH — System Health Monitor
-- يخزّن كل خطأ في الإنتاج للتحليل

CREATE TABLE IF NOT EXISTS public.system_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source text NOT NULL,          -- 'client' | 'server' | 'api' | 'cron'
  path text,                     -- '/businesses/xyz'
  message text NOT NULL,
  stack text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_errors_created ON public.system_errors (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_errors_severity ON public.system_errors (severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_errors_path ON public.system_errors (path) WHERE path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_system_errors_unresolved ON public.system_errors (created_at DESC) WHERE resolved_at IS NULL;

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- صفر وصول للعميل — admin فقط عبر service role
DROP POLICY IF EXISTS "Admins read system_errors" ON public.system_errors;
CREATE POLICY "Admins read system_errors" ON public.system_errors
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = (SELECT auth.uid()) AND role = 'super_admin'
  ));

-- retention: 90 يوم
COMMENT ON TABLE public.system_errors IS 'System error log. Retention 90 days via cron.';
