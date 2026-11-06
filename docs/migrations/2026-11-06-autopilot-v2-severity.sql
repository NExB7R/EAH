-- EAH — Autopilot v2: Severity + Reset + Expiry + Enforcement
BEGIN;

DROP TRIGGER IF EXISTS trigger_autopilot_penalties ON public.trust_events;
DROP FUNCTION IF EXISTS public.handle_trust_event_autopilot();

CREATE OR REPLACE FUNCTION public.handle_trust_event_autopilot()
RETURNS TRIGGER AS $$
DECLARE
  v_weighted INT := 0;
  v_count INT := 0;
  v_new_standing TEXT;
  v_expires TIMESTAMPTZ;
  v_reason TEXT;
  v_current TEXT;
  v_last TIMESTAMPTZ;
BEGIN
  IF NEW.delta >= 0 OR NEW.event_type NOT IN ('review_rejected', 'report_valid') THEN
    RETURN NEW;
  END IF;

  SELECT standing INTO v_current FROM public.profiles WHERE id = NEW.entity_id;

  SELECT max(created_at) INTO v_last FROM public.trust_events
  WHERE entity_id = NEW.entity_id
    AND event_type IN ('review_rejected', 'report_valid')
    AND created_at < NEW.created_at;

  IF v_last IS NULL OR v_last < NEW.created_at - interval '90 days' THEN
    v_current := 'good';
  END IF;

  SELECT count(*), COALESCE(sum(CASE
    WHEN event_type = 'report_valid' THEN 2
    WHEN event_type = 'review_rejected' THEN 1
    ELSE 0 END), 0)
  INTO v_count, v_weighted
  FROM public.trust_events
  WHERE entity_id = NEW.entity_id
    AND event_type IN ('review_rejected', 'report_valid')
    AND created_at > NEW.created_at - interval '30 days';

  IF v_weighted >= 10 THEN
    v_new_standing := 'suspended'; v_expires := NULL;
    v_reason := 'حظر تلقائي: ' || v_weighted || ' نقطة في 30 يوم';
  ELSIF v_weighted >= 6 THEN
    v_new_standing := 'restricted'; v_expires := NEW.created_at + interval '30 days';
    v_reason := 'تقييد تلقائي: ' || v_weighted || ' نقطة في 30 يوم';
  ELSIF v_weighted >= 3 THEN
    v_new_standing := 'warning'; v_expires := NEW.created_at + interval '7 days';
    v_reason := 'تحذير تلقائي: ' || v_weighted || ' نقطة في 30 يوم';
  ELSE
    RETURN NEW;
  END IF;

  IF v_current = 'good'
     OR (v_current = 'warning' AND v_new_standing IN ('restricted','suspended'))
     OR (v_current = 'restricted' AND v_new_standing = 'suspended') THEN

    UPDATE public.profiles SET standing = v_new_standing,
      standing_expires_at = v_expires, standing_reason = v_reason
    WHERE id = NEW.entity_id;

    INSERT INTO public.standing_events (user_id, action, previous_standing, new_standing, reason, expires_at)
    VALUES (NEW.entity_id, 'auto_penalize', v_current, v_new_standing, v_reason, v_expires);

    INSERT INTO public.notifications (user_id, type, title, body, link)
    SELECT ur.user_id, 'system', '🤖 عقوبة تلقائية', v_reason, '/admin/users/' || NEW.entity_id
    FROM public.user_roles ur WHERE ur.role = 'super_admin';

    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (NEW.entity_id, 'system', 'تم تحديث حالة حسابك', v_reason);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_autopilot_penalties
AFTER INSERT ON public.trust_events
FOR EACH ROW EXECUTE FUNCTION public.handle_trust_event_autopilot();

CREATE OR REPLACE FUNCTION public.expire_standings()
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INT;
BEGIN
  WITH to_expire AS (
    SELECT id, standing FROM public.profiles
    WHERE standing IN ('warning','restricted')
      AND standing_expires_at IS NOT NULL AND standing_expires_at < now()
  ),
  updated AS (
    UPDATE public.profiles p
    SET standing='good', standing_expires_at=NULL, standing_reason=NULL
    FROM to_expire e WHERE p.id = e.id RETURNING p.id
  )
  INSERT INTO public.standing_events (user_id, action, previous_standing, new_standing, reason)
  SELECT e.id, 'auto_expire', e.standing, 'good', 'انتهت مدة العقوبة'
  FROM to_expire e WHERE e.id IN (SELECT id FROM updated);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END; $$;

CREATE OR REPLACE FUNCTION public.can_interact(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = 'public' AS $$
DECLARE v_standing TEXT; v_expires TIMESTAMPTZ; v_reason TEXT;
BEGIN
  SELECT standing, standing_expires_at, standing_reason
  INTO v_standing, v_expires, v_reason
  FROM public.profiles WHERE id = p_user_id;

  IF v_standing IN ('restricted','suspended') THEN
    RETURN jsonb_build_object('can', false, 'standing', v_standing,
      'reason', v_reason, 'expires_at', v_expires);
  END IF;
  RETURN jsonb_build_object('can', true, 'standing', v_standing);
END; $$;

GRANT EXECUTE ON FUNCTION public.can_interact(uuid) TO authenticated;
COMMIT;
