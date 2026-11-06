-- Restrict ownership helper probes to the caller, admin, or trusted service role.
-- RLS policies call is_business_owner(..., auth.uid()); server-side partner flows
-- retain their trusted checks. The target-owner check in invite_partner is made
-- an internal direct lookup because it intentionally compares another profile.
-- is_active_partner has no direct browser/RLS call sites; its trusted nested use
-- from invite_partner remains available to the SECURITY DEFINER function owner.

BEGIN;

CREATE OR REPLACE FUNCTION public.is_business_owner(
  p_business_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NOT NULL
     AND p_user_id IS DISTINCT FROM v_caller
     AND NOT private.is_admin(v_caller) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.businesses
    WHERE id = p_business_id
      AND owner_profile_id = p_user_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.invite_partner(
  p_business_id uuid,
  p_phone text,
  p_role text,
  p_notes text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_target_id uuid;
  v_is_owner boolean;
  v_is_manager boolean;
  v_partner_id uuid;
BEGIN
  IF v_caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  IF p_role NOT IN ('manager','editor','viewer') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_role');
  END IF;

  v_is_owner := public.is_business_owner(p_business_id, v_caller);
  v_is_manager := public.is_active_partner(p_business_id, v_caller, 'manager');
  IF NOT (v_is_owner OR v_is_manager) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'forbidden');
  END IF;

  IF NOT v_is_owner AND p_role = 'manager' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'manager_cannot_invite_manager');
  END IF;

  SELECT id INTO v_target_id
  FROM public.profiles
  WHERE phone = p_phone OR phone_e164 = p_phone
  LIMIT 1;

  IF v_target_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'user_not_found');
  END IF;

  IF v_target_id = v_caller THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'self_invite');
  END IF;

  -- Trusted function checks target ownership internally; the public helper no
  -- longer acts as an oracle for arbitrary user IDs.
  IF EXISTS (
    SELECT 1
    FROM public.businesses
    WHERE id = p_business_id
      AND owner_profile_id = v_target_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'already_owner');
  END IF;

  INSERT INTO public.business_partners (
    business_id, profile_id, role, status,
    invited_by, invited_at, notes, permissions
  ) VALUES (
    p_business_id, v_target_id, p_role, 'pending',
    v_caller, now(), p_notes,
    CASE p_role
      WHEN 'manager' THEN '{"orders":true,"edit":true,"reports":true,"partners":false,"delete":false}'::jsonb
      WHEN 'editor'  THEN '{"orders":true,"edit":true,"reports":false,"partners":false,"delete":false}'::jsonb
      ELSE               '{"orders":false,"edit":false,"reports":true,"partners":false,"delete":false}'::jsonb
    END
  )
  ON CONFLICT (business_id, profile_id) DO UPDATE
    SET role = EXCLUDED.role,
        status = 'pending',
        invited_by = v_caller,
        invited_at = now(),
        notes = EXCLUDED.notes,
        permissions = EXCLUDED.permissions,
        rejected_at = NULL,
        revoked_at = NULL,
        updated_at = now()
  RETURNING id INTO v_partner_id;

  RETURN jsonb_build_object('ok', true, 'partner_id', v_partner_id);
END;
$function$;

REVOKE ALL PRIVILEGES
ON FUNCTION public.is_active_partner(uuid, uuid, text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE
ON FUNCTION public.is_active_partner(uuid, uuid, text)
TO service_role;

COMMIT;
