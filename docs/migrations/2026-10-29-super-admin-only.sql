-- EAH: enforce a single super_admin platform owner.
-- Existing legacy 'admin' role remains in the enum for backwards-compatible reads,
-- but may not be assigned to new users or set by role updates.

CREATE OR REPLACE FUNCTION public.auth_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text = 'super_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION private.guard_super_admin_role_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  remaining bigint;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin'::public.app_role THEN
      RAISE EXCEPTION 'Legacy admin role is disabled; only super_admin is the platform administrator.';
    END IF;

    IF NEW.role = 'super_admin'::public.app_role THEN
      SELECT count(*) INTO remaining
      FROM public.user_roles
      WHERE role = 'super_admin'::public.app_role;
      IF remaining > 0 THEN
        RAISE EXCEPTION 'Only one super_admin account is allowed.';
      END IF;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.role = 'super_admin'::public.app_role THEN
      SELECT count(*) INTO remaining
      FROM public.user_roles
      WHERE role = 'super_admin'::public.app_role
        AND user_id <> OLD.user_id;
      IF remaining = 0 THEN
        RAISE EXCEPTION 'Cannot remove the last super_admin.';
      END IF;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role = 'admin'::public.app_role
       AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Legacy admin role is disabled; only super_admin is the platform administrator.';
    END IF;

    IF NEW.role = 'super_admin'::public.app_role
       AND NEW.role IS DISTINCT FROM OLD.role THEN
      SELECT count(*) INTO remaining
      FROM public.user_roles
      WHERE role = 'super_admin'::public.app_role
        AND user_id <> OLD.user_id;
      IF remaining > 0 THEN
        RAISE EXCEPTION 'Only one super_admin account is allowed.';
      END IF;
    END IF;

    IF OLD.role = 'super_admin'::public.app_role
       AND NEW.role IS DISTINCT FROM OLD.role THEN
      SELECT count(*) INTO remaining
      FROM public.user_roles
      WHERE role = 'super_admin'::public.app_role
        AND user_id <> OLD.user_id;
      IF remaining = 0 THEN
        RAISE EXCEPTION 'Cannot demote the last super_admin.';
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$;

DO $$
DECLARE
  super_admin_count bigint;
BEGIN
  SELECT count(*) INTO super_admin_count
  FROM public.user_roles
  WHERE role = 'super_admin'::public.app_role;

  IF super_admin_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one super_admin before installing owner-only guard; found %', super_admin_count;
  END IF;
END $$;

DROP TRIGGER IF EXISTS guard_super_admin_role_mutation ON public.user_roles;
CREATE TRIGGER guard_super_admin_role_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION private.guard_super_admin_role_mutation();

-- End-of-migration checks to run after applying:
-- SELECT count(*) FROM public.user_roles WHERE role = 'super_admin';
-- SELECT has_function_privilege('authenticated', 'public.auth_is_admin()', 'EXECUTE');
-- Verify this returns false for any role other than super_admin.
