-- ═══════════════════════════════════════════════════════════════
-- Unique Visits + Review Reminder
-- تاريخ: 2026-09-18
-- ═══════════════════════════════════════════════════════════════

-- جدول الزيارات الفريدة
CREATE TABLE IF NOT EXISTS public.business_unique_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  visit_type text NOT NULL CHECK (visit_type IN ('phone_reveal', 'order_confirmed')),
  points_awarded integer NOT NULL DEFAULT 3,
  visit_day date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_id, visit_day)
);

CREATE INDEX IF NOT EXISTS buv_user_idx ON public.business_unique_visits (user_id, visit_day DESC);
CREATE INDEX IF NOT EXISTS buv_business_idx ON public.business_unique_visits (business_id, visit_day DESC);

ALTER TABLE public.business_unique_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buv self read" ON public.business_unique_visits;
CREATE POLICY "buv self read" ON public.business_unique_visits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "buv admin read" ON public.business_unique_visits;
CREATE POLICY "buv admin read" ON public.business_unique_visits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- عمود للـ review reminder
ALTER TABLE public.order_requests
  ADD COLUMN IF NOT EXISTS review_reminder_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS order_review_reminder_idx
  ON public.order_requests (confirmed_at, review_reminder_sent_at)
  WHERE confirmed_at IS NOT NULL AND review_reminder_sent_at IS NULL;

-- RPC: log زيارة فريدة + امنح نقاط
CREATE OR REPLACE FUNCTION public.log_unique_visit(
  p_business_id uuid,
  p_visit_type text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_role text;
  v_inserted boolean := false;
  v_balance integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  IF p_visit_type NOT IN ('phone_reveal', 'order_confirmed') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_type');
  END IF;

  -- السوبر أدمن مش بيجمع نقط
  SELECT role INTO v_role FROM public.user_roles WHERE user_id = v_user;
  IF v_role = 'super_admin' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'admin_excluded');
  END IF;

  -- حاول تسجيل الزيارة (unique constraint هيمنع التكرار)
  BEGIN
    INSERT INTO public.business_unique_visits (user_id, business_id, visit_type, points_awarded)
    VALUES (v_user, p_business_id, p_visit_type, 3);
    v_inserted := true;
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_visited_today');
  END;

  IF v_inserted THEN
    UPDATE public.profiles
    SET trust_score = COALESCE(trust_score, 0) + 3
    WHERE id = v_user
    RETURNING trust_score INTO v_balance;

    INSERT INTO public.points_log (user_id, delta, reason, balance_after)
    VALUES (v_user, 3, 'زيارة فريدة: ' || p_visit_type, v_balance);

    RETURN jsonb_build_object('ok', true, 'points', 3, 'balance', v_balance);
  END IF;

  RETURN jsonb_build_object('ok', false, 'reason', 'unknown');
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_unique_visit TO authenticated;

COMMENT ON TABLE public.business_unique_visits IS 'زيارات فريدة يومية — مستخدم واحد + نشاط واحد = زيارة واحدة باليوم';
COMMENT ON FUNCTION public.log_unique_visit IS 'تسجيل زيارة فريدة + منح 3 نقاط (السوبر أدمن مستثنى)';
