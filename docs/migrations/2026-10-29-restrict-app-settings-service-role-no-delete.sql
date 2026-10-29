-- Least privilege for app settings: server can read/upsert but not delete.
REVOKE DELETE ON TABLE public.app_settings FROM service_role;

DO $$
BEGIN
  IF NOT has_table_privilege('service_role','public.app_settings','SELECT') THEN
    RAISE EXCEPTION 'service_role SELECT missing on app_settings';
  END IF;
  IF NOT has_table_privilege('service_role','public.app_settings','INSERT') THEN
    RAISE EXCEPTION 'service_role INSERT missing on app_settings';
  END IF;
  IF NOT has_table_privilege('service_role','public.app_settings','UPDATE') THEN
    RAISE EXCEPTION 'service_role UPDATE missing on app_settings';
  END IF;
  IF has_table_privilege('service_role','public.app_settings','DELETE') THEN
    RAISE EXCEPTION 'service_role must not delete app_settings';
  END IF;
  IF has_table_privilege('anon','public.app_settings','SELECT') THEN
    RAISE EXCEPTION 'anon must not read app_settings';
  END IF;
END $$;
