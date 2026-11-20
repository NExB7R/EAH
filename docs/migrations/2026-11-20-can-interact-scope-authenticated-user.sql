-- EAH — Restrict can_interact to the caller or trusted server role.
-- The original SECURITY DEFINER RPC accepted arbitrary UUIDs and inherited
-- EXECUTE for PUBLIC, allowing anonymous and signed-in callers to enumerate
-- private standing, reason, and expiry values for other accounts.
-- This additive migration keeps the response shape used by the app.

BEGIN;

CREATE OR REPLACE FUNCTION public.can_interact(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_caller_id uuid := auth.uid();
  v_is_service_role boolean := COALESCE(auth.jwt() ->> 'role', '') = 'service_role';
  v_standing text;
  v_expires timestamptz;
  v_reason text;
BEGIN
  -- Browser JWTs can inspect only their own account. Cross-account checks are
  -- restricted to server-side service_role clients after server authorization.
  IF NOT v_is_service_role THEN
    IF v_caller_id IS NULL THEN
      RAISE EXCEPTION 'Authentication required'
        USING ERRCODE = '42501';
    END IF;

    IF p_user_id IS DISTINCT FROM v_caller_id THEN
      RAISE EXCEPTION 'Not allowed to inspect another account standing'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'can', false,
      'standing', 'unknown',
      'reason', null,
      'expires_at', null
    );
  END IF;

  SELECT
    COALESCE(p.standing, 'good'),
    p.standing_expires_at,
    p.standing_reason
  INTO v_standing, v_expires, v_reason
  FROM public.profiles AS p
  WHERE p.id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can', false,
      'standing', 'unknown',
      'reason', null,
      'expires_at', null
    );
  END IF;

  IF v_standing IN ('restricted', 'suspended') THEN
    RETURN jsonb_build_object(
      'can', false,
      'standing', v_standing,
      'reason', v_reason,
      'expires_at', v_expires
    );
  END IF;

  RETURN jsonb_build_object(
    'can', true,
    'standing', v_standing
  );
END;
$function$;

REVOKE ALL PRIVILEGES
  ON FUNCTION public.can_interact(uuid)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
  ON FUNCTION public.can_interact(uuid)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.can_interact(uuid) IS
  'Caller-scoped standing check: own account for authenticated clients; cross-account checks only for trusted service_role after server authorization.';

COMMIT;
