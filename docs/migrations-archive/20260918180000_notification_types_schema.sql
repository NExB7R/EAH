-- ═══════════════════════════════════════════════════════════════
-- notification_types — Schema + Seed
-- تاريخ: 2026-09-18
-- ═══════════════════════════════════════════════════════════════

-- ═══ 0) إصلاح الـ CHECK constraint — نسمح بـ super_admin ═══
ALTER TABLE public.notification_types 
  DROP CONSTRAINT IF EXISTS notification_types_role_scope_check;

ALTER TABLE public.notification_types 
  ADD CONSTRAINT notification_types_role_scope_check 
  CHECK (role_scope IN ('customer', 'merchant', 'super_admin', 'admin', 'all'));
-- ═══ 1) تأكيد الأعمدة الأساسية ═══
CREATE TABLE IF NOT EXISTS public.notification_types (
  key text PRIMARY KEY,
  label text NOT NULL,
  description text,
  emoji text NOT NULL DEFAULT '',
  role_scope text NOT NULL,
  default_enabled boolean NOT NULL DEFAULT true,
  is_globally_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══ 2) ضيف is_premium_only لو ناقص ═══
ALTER TABLE public.notification_types
  ADD COLUMN IF NOT EXISTS is_premium_only boolean DEFAULT false;

-- ═══ 3) RLS ═══
ALTER TABLE public.notification_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nt read all" ON public.notification_types;
CREATE POLICY "nt read all" ON public.notification_types
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "nt admin write" ON public.notification_types;
CREATE POLICY "nt admin write" ON public.notification_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- ═══ 4) Seed — الأنواع الأساسية ═══
INSERT INTO public.notification_types 
  (key, label, description, emoji, role_scope, default_enabled, is_globally_active, sort_order, is_premium_only)
VALUES
  ('order_updates', 'تحديثات الأوردر', 'اعرف حالة أوردرك في كل خطوة', '', 'customer', true, true, 1, false),
  ('review_replies', 'ردود على تقييماتك', 'لما صاحب النشاط يرد على رأيك', '', 'customer', true, true, 2, false),
  ('new_offers', 'عروض جديدة', 'عروض من الأماكن اللي بتتابعها', '', 'customer', true, true, 3, false),
  ('nearby_recommendations', 'ترشيحات قريبة منك', 'لما يكون في حاجة حواليك على مزاجك', '', 'customer', true, true, 4, false),
  ('points_earned', 'نقاط جديدة', 'لما تكسب نقاط من تفاعلك', '', 'customer', true, true, 5, false),
  ('badge_unlock', 'شارات جديدة', 'لما تفتح شارة من التحديات', '', 'customer', true, true, 6, false),
  ('weekly_digest', 'ملخص الأسبوع', 'أهم اللي حصل على EAH خلال الأسبوع', '', 'customer', false, true, 7, false),
  ('merchant_orders', 'طلبات جديدة', 'لما يجيلك أوردر من عميل', '', 'merchant', true, true, 10, false),
  ('merchant_reviews', 'تقييمات جديدة', 'لما حد يقيّم نشاطك', '', 'merchant', true, true, 11, false),
  ('merchant_analytics', 'تقارير أسبوعية', 'ملخص أداء نشاطك كل أسبوع', '', 'merchant', true, true, 12, true),
  ('merchant_offers', 'انتهاء عروضك', 'تنبيه قبل ما العرض يخلص', '', 'merchant', true, true, 13, false),
  ('merchant_subscription', 'الاشتراك', 'تنبيهات فواتير والانتهاء', '', 'merchant', true, true, 14, false),
  ('admin_alerts', 'تنبيهات الإدارة', 'طلبات معلقة + مشاكل أمنية', '', 'super_admin', true, true, 20, false),
  ('admin_audit', 'سجل العمليات', 'عمليات حساسة تحتاج مراجعة', '', 'super_admin', true, true, 21, false)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  emoji = EXCLUDED.emoji,
  role_scope = EXCLUDED.role_scope,
  is_globally_active = EXCLUDED.is_globally_active,
  sort_order = EXCLUDED.sort_order,
  is_premium_only = EXCLUDED.is_premium_only;

-- ═══ 5) Index ═══
CREATE INDEX IF NOT EXISTS nt_role_scope_idx 
  ON public.notification_types (role_scope, is_globally_active, sort_order);

COMMENT ON TABLE public.notification_types IS 'أنواع الإشعارات القابلة للتحكم (customer/merchant/admin)';
COMMENT ON COLUMN public.notification_types.is_premium_only IS 'الإشعار ده للـ premium بس';
