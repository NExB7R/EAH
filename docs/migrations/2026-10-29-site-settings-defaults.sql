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

DO $
BEGIN
  -- The seed is intentionally non-destructive: it must never overwrite contacts
  -- after the owner configures them. Assert row existence only, not empty values.
  IF NOT EXISTS (
    SELECT 1 FROM public.app_settings
    WHERE key = 'site'
      AND jsonb_typeof(value) = 'object'
  ) THEN
    RAISE EXCEPTION 'Expected central site settings row with a JSON object value';
  END IF;
END $;
