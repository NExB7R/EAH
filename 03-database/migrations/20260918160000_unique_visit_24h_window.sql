-- 24h Rolling Window for unique visits
ALTER TABLE public.business_unique_visits
  DROP CONSTRAINT IF EXISTS business_unique_visits_user_id_business_id_visit_day_key;

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
  v_last_visit timestamptz;
  v_balance integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  IF p_visit_type NOT IN ('phone_reveal', 'order_confirmed') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_type');
  END IF;

  SELECT role INTO v_role FROM public.user_roles WHERE user_id = v_user;
  IF v_role = 'super_admin' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'admin_excluded');
  END IF;

  SELECT created_at INTO v_last_visit
  FROM public.business_unique_visits
  WHERE user_id = v_user AND business_id = p_business_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_visit IS NOT NULL AND (now() - v_last_visit) < interval '24 hours' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'within_24h');
  END IF;

  INSERT INTO public.business_unique_visits (user_id, business_id, visit_type, points_awarded)
  VALUES (v_user, p_business_id, p_visit_type, 3);

  UPDATE public.profiles
  SET trust_score = COALESCE(trust_score, 0) + 3
  WHERE id = v_user
  RETURNING trust_score INTO v_balance;

  INSERT INTO public.points_log (user_id, delta, reason, balance_after)
  VALUES (v_user, 3, 'زيارة فريدة (24h): ' || p_visit_type, v_balance);

  RETURN jsonb_build_object('ok', true, 'points', 3, 'balance', v_balance);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_unique_visit TO authenticated;
