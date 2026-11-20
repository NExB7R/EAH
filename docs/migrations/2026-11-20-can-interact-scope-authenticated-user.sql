-- EAH — Restrict can_interact to the caller, platform admins, or trusted server role.
-- The original SECURITY DEFINER RPC accepted any UUID from every authenticated caller.
-- That allowed user-to-user enumeration of private standing, reason, and expiry fields.
-- This additive migration keeps the public contract for legitimate callers unchanged.

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
  v_is_service_role boolean := COALESCE(auth.role(), '') = 'service_role';
  v_is_admin boolean := false;
  v_standing text;
  v_expires timestamptz;
  v_reason text;
BEGIN
  -- The only unrestricted caller is the trusted service role used by server-side
  -- health checks. Browser JWTs may inspect their own standing, while super_admin
  -- may inspect a target user from protected admin workflows.
  IF NOT v_is_service_role THEN
    IF v_caller_id IS NULL THEN
      RAISE EXCEPTION 'Authentication required'
        USING ERRCODE = '42501';
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM public.user_roles AS ur
      WHERE ur.user_id = v_caller_id
        AND ur.role::text = 'super_admin'
    )
    INTO v_is_admin;

    IF p_user_id IS DISTINCT FROM v_caller_id AND NOT v_is_admin THEN
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
  'Caller-scoped standing check: own account, super_admin target lookup, or trusted service_role.';

COMMIT;
