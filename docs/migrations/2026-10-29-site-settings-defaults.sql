-- Seed safe defaults only if the central site settings row is missing.
-- Do not overwrite owner-configured values on an existing installation.
INSERT INTO public.app_settings (key, value, updated_at)
VALUES (
  'site',
  jsonb_build_object(
    'site_name', 'EAH',
    'support_email', '',
    'support_whatsapp', '',
    'support_facebook_url', '',
    'whatsapp_channel_url', '',
    'public_contacts_enabled', false,
    'announcement_banner', '',
    'maintenance_mode', false,
    'new_signups_enabled', true,
    'featured_enabled', true
  ),
  now()
)
ON CONFLICT (key) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.app_settings
    WHERE key = 'site'
      AND COALESCE((value ->> 'public_contacts_enabled')::boolean, false) = false
      AND COALESCE(value ->> 'support_email', '') = ''
      AND COALESCE(value ->> 'support_whatsapp', '') = ''
      AND COALESCE(value ->> 'support_facebook_url', '') = ''
      AND COALESCE(value ->> 'whatsapp_channel_url', '') = ''
  ) THEN
    RAISE EXCEPTION 'Expected site settings row with no public contacts enabled';
  END IF;
END $$;
