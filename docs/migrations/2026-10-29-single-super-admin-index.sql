-- Enforce exactly one super_admin role even for concurrent inserts.
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_single_super_admin_idx
ON public.user_roles (role)
WHERE role = 'super_admin'::public.app_role;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.user_roles WHERE role = 'super_admin'::public.app_role) <> 1 THEN
    RAISE EXCEPTION 'Expected one super_admin after enforcing unique index';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND indexname = 'user_roles_single_super_admin_idx'
  ) THEN
    RAISE EXCEPTION 'Single super_admin unique index was not created';
  END IF;
END $$;
