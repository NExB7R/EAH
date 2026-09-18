-- ═══════════════════════════════════════════════════════════════
-- Pending Changes + Audit Fix
-- تاريخ: 2026-09-18
-- ═══════════════════════════════════════════════════════════════

-- ═══ 1) audit_logs — تأكيد الأعمدة الناقصة ═══
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS review_note text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs (created_at DESC);

-- ═══ 2) pending_changes ═══
CREATE TABLE IF NOT EXISTS public.pending_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  payload jsonb NOT NULL,
  before_data jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pc_status_idx ON public.pending_changes (status, created_at DESC);
CREATE INDEX IF NOT EXISTS pc_requester_idx ON public.pending_changes (requested_by, created_at DESC);
CREATE INDEX IF NOT EXISTS pc_entity_idx ON public.pending_changes (entity_type, entity_id);

ALTER TABLE public.pending_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pc self read" ON public.pending_changes;
CREATE POLICY "pc self read" ON public.pending_changes
  FOR SELECT USING (auth.uid() = requested_by);

DROP POLICY IF EXISTS "pc admin all" ON public.pending_changes;
CREATE POLICY "pc admin all" ON public.pending_changes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- ═══ 3) RPCs ═══

-- 3a) approve
CREATE OR REPLACE FUNCTION public.approve_pending_change(
  p_id uuid,
  p_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid := auth.uid();
  v_is_admin boolean;
  v_row record;
  v_result jsonb;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE user_id = v_admin AND role = 'super_admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_admin');
  END IF;

  SELECT * INTO v_row FROM public.pending_changes
  WHERE id = p_id AND status = 'pending' FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found_or_not_pending');
  END IF;

  -- سجّل في audit_logs الأول
  INSERT INTO public.audit_logs
    (actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata, reviewed_by, reviewed_at, review_note)
  VALUES
    (v_admin, v_row.action || '.approved', v_row.entity_type, v_row.entity_id,
     v_row.before_data, v_row.payload,
     jsonb_build_object('pending_id', v_row.id, 'requested_by', v_row.requested_by),
     v_admin, now(), p_note);

  -- حدّث الحالة
  UPDATE public.pending_changes
  SET status = 'approved', reviewed_by = v_admin, reviewed_at = now(), review_note = p_note
  WHERE id = p_id;

  RETURN jsonb_build_object('ok', true, 'id', p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_pending_change TO authenticated;

-- 3b) reject
CREATE OR REPLACE FUNCTION public.reject_pending_change(
  p_id uuid,
  p_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin uuid := auth.uid();
  v_is_admin boolean;
  v_row record;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE user_id = v_admin AND role = 'super_admin'
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_admin');
  END IF;

  SELECT * INTO v_row FROM public.pending_changes
  WHERE id = p_id AND status = 'pending' FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found_or_not_pending');
  END IF;

  INSERT INTO public.audit_logs
    (actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata, reviewed_by, reviewed_at, review_note)
  VALUES
    (v_admin, v_row.action || '.rejected', v_row.entity_type, v_row.entity_id,
     v_row.before_data, NULL,
     jsonb_build_object('pending_id', v_row.id, 'requested_by', v_row.requested_by),
     v_admin, now(), p_note);

  UPDATE public.pending_changes
  SET status = 'rejected', reviewed_by = v_admin, reviewed_at = now(), review_note = p_note
  WHERE id = p_id;

  RETURN jsonb_build_object('ok', true, 'id', p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_pending_change TO authenticated;

-- 3c) submit pending (merchant/customer → pending)
CREATE OR REPLACE FUNCTION public.submit_pending_change(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  INSERT INTO public.pending_changes
    (requested_by, action, entity_type, entity_id, payload)
  VALUES
    (v_user, p_action, p_entity_type, p_entity_id, p_payload)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('ok', true, 'id', v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_pending_change TO authenticated;

COMMENT ON TABLE public.pending_changes IS 'طلبات تغيير محتاجة موافقة سوبر أدمن قبل التنفيذ';
COMMENT ON FUNCTION public.approve_pending_change IS 'اعتماد طلب معلق + تسجيل في audit_logs';
COMMENT ON FUNCTION public.reject_pending_change IS 'رفض طلب معلق + تسجيل في audit_logs';
COMMENT ON FUNCTION public.submit_pending_change IS 'تسجيل طلب تغيير جديد للاعتماد';
