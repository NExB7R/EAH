-- Regression test: media rows must drive the URL fields used by public cards.
-- This test creates a temporary row only inside the enclosing transaction.
BEGIN;
SELECT plan(3);

SELECT has_trigger(
  'public',
  'business_media',
  'business_media_sync_business_images',
  'business media keeps denormalized business image URLs synchronized'
);

SELECT ok(
  pg_get_functiondef('private.sync_business_media_image_columns()'::regprocedure)
    LIKE '%refresh_business_media_image_column%',
  'the trigger delegates to the shared image URL synchronizer'
);

DO $$
DECLARE
  test_id uuid;
  current_logo text;
  current_cover text;
BEGIN
  test_id := gen_random_uuid();

  INSERT INTO public.businesses (
    id, name, slug, business_type, source, is_published, owner_profile_id,
    logo_url, cover_image_url
  )
  VALUES (
    test_id,
    'EAH media sync rollback test',
    'eah-media-sync-' || replace(test_id::text, '-', ''),
    'misc',
    'admin',
    true,
    NULL,
    'https://example.invalid/legacy-logo.webp',
    'https://example.invalid/legacy-cover.webp'
  );

  INSERT INTO public.business_media (business_id, media_type, storage_path, sort_order, is_published)
  VALUES (test_id, 'gallery', 'https://example.invalid/gallery.webp', 1, true);

  SELECT logo_url, cover_image_url INTO current_logo, current_cover
  FROM public.businesses WHERE id = test_id;

  IF current_logo IS DISTINCT FROM 'https://example.invalid/legacy-logo.webp'
     OR current_cover IS DISTINCT FROM 'https://example.invalid/legacy-cover.webp' THEN
    RAISE EXCEPTION 'Non-logo media unexpectedly changed legacy image URLs';
  END IF;

  INSERT INTO public.business_media (business_id, media_type, storage_path, sort_order, is_published)
  VALUES
    (test_id, 'logo', 'https://example.invalid/logo-v1.webp', 0, true),
    (test_id, 'cover', 'https://example.invalid/cover-v1.webp', 0, true);

  SELECT logo_url, cover_image_url INTO current_logo, current_cover
  FROM public.businesses WHERE id = test_id;

  IF current_logo IS DISTINCT FROM 'https://example.invalid/logo-v1.webp'
     OR current_cover IS DISTINCT FROM 'https://example.invalid/cover-v1.webp' THEN
    RAISE EXCEPTION 'Media insertion did not synchronize the business image URLs';
  END IF;

  UPDATE public.business_media
  SET storage_path = 'https://example.invalid/logo-v2.webp'
  WHERE business_id = test_id AND media_type = 'logo';

  SELECT logo_url INTO current_logo FROM public.businesses WHERE id = test_id;
  IF current_logo IS DISTINCT FROM 'https://example.invalid/logo-v2.webp' THEN
    RAISE EXCEPTION 'Media update did not synchronize logo_url';
  END IF;

  DELETE FROM public.business_media WHERE business_id = test_id AND media_type = 'logo';
  SELECT logo_url INTO current_logo FROM public.businesses WHERE id = test_id;
  IF current_logo IS NOT NULL THEN
    RAISE EXCEPTION 'Deleting the final logo did not clear logo_url';
  END IF;

  DELETE FROM public.business_media WHERE business_id = test_id AND media_type = 'cover';
  SELECT cover_image_url INTO current_cover FROM public.businesses WHERE id = test_id;
  IF current_cover IS NOT NULL THEN
    RAISE EXCEPTION 'Deleting the final cover did not clear cover_image_url';
  END IF;
END $$;

SELECT pass('logo/cover insert, update, and delete stay synchronized');

ROLLBACK;
