-- ═══════════════════════════════════════════════════════════════
-- Points Management (Admin)
-- تاريخ: 2026-09-18
-- ═══════════════════════════════════════════════════════════════

-- جدول سجل النقاط
CREATE TABLE IF NOT EXISTS public.points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL,
  balance_after integer NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS points_log_user_idx ON public.points_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS points_log_created_idx ON public.points_log (created_at DESC);

ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "points_log self read" ON public.points_log;
CREATE POLICY "points_log self read" ON public.points_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "points_log admin read" ON public.points_log;
CREATE POLICY "points_log admin read" ON public.points_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- RPC: تعديل نقاط مستخدم (للأدمن فقط)
CREATE OR REPLACE FUNCTION public.admin_adjust_points(
  p_user_id uuid,
  p_delta integer,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid := auth.uid();
  v_is_admin boolean;
  v_new_balance integer;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE user_id = v_admin AND role = 'super_admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_admin');
  END IF;

  IF p_delta = 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'zero_delta');
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) < 2 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'reason_required');
  END IF;

  SELECT COALESCE(trust_score, 0) INTO v_new_balance
  FROM public.profiles WHERE id = p_user_id;

  IF v_new_balance IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'user_not_found');
  END IF;

  v_new_balance := GREATEST(0, v_new_balance + p_delta);

  UPDATE public.profiles
  SET trust_score = v_new_balance
  WHERE id = p_user_id;

  INSERT INTO public.points_log (user_id, delta, reason, balance_after, created_by)
  VALUES (p_user_id, p_delta, p_reason, v_new_balance, v_admin);

  RETURN jsonb_build_object('ok', true, 'balance', v_new_balance);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_adjust_points TO authenticated;

-- RPC: بحث عن مستخدم بالرقم أو الاسم
CREATE OR REPLACE FUNCTION public.admin_search_user(p_query text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid := auth.uid();
  v_is_admin boolean;
  v_results jsonb;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE user_id = v_admin AND role = 'super_admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_admin');
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb) INTO v_results
  FROM (
    SELECT
      p.id,
      p.display_name,
      p.phone,
      p.trust_score,
      p.streak_count,
      COALESCE(r.role, 'customer') as role,
      p.created_at
    FROM public.profiles p
    LEFT JOIN public.user_roles r ON r.user_id = p.id
    WHERE
      p.phone ILIKE '%' || p_query || '%'
      OR p.display_name ILIKE '%' || p_query || '%'
    ORDER BY p.created_at DESC
    LIMIT 30
  ) r;

  RETURN jsonb_build_object('ok', true, 'users', v_results);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_search_user TO authenticated;

COMMENT ON TABLE public.points_log IS 'سجل تعديلات النقاط — من الأدمن والمهام الآلية';
COMMENT ON FUNCTION public.admin_adjust_points IS 'تعديل رصيد نقاط مستخدم (super_admin فقط) + تسجيل في points_log';
COMMENT ON FUNCTION public.admin_search_user IS 'بحث مستخدمين بالرقم أو الاسم (super_admin فقط)';
