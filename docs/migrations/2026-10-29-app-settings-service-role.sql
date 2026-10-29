-- Fix least-privilege grants required by server-side app settings reads/writes.
-- Only the server-only service role gets these privileges; anon remains denied.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO service_role;

DO $$
BEGIN
  IF NOT has_table_privilege('service_role','public.app_settings','SELECT') THEN
    RAISE EXCEPTION 'service_role SELECT was not granted on app_settings';
  END IF;
  IF NOT has_table_privilege('service_role','public.app_settings','INSERT') THEN
    RAISE EXCEPTION 'service_role INSERT was not granted on app_settings';
  END IF;
  IF NOT has_table_privilege('service_role','public.app_settings','UPDATE') THEN
    RAISE EXCEPTION 'service_role UPDATE was not granted on app_settings';
  END IF;
  IF NOT has_table_privilege('service_role','public.app_settings','DELETE') THEN
    RAISE EXCEPTION 'service_role DELETE was not granted on app_settings';
  END IF;
  IF has_table_privilege('anon','public.app_settings','SELECT') THEN
    RAISE EXCEPTION 'anon must not read app_settings directly';
  END IF;
END $$;
