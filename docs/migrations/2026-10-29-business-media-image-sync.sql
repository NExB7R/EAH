-- Keep businesses.logo_url and businesses.cover_image_url in sync with published
-- business_media logo/cover records. Cards read the denormalized fields while the
-- detail page reads media rows; without this sync an uploaded logo could disappear
-- from public cards.
CREATE OR REPLACE FUNCTION private.refresh_business_media_image_column(
  p_business_id uuid,
  p_media_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  selected_url text;
BEGIN
  IF p_business_id IS NULL OR p_media_type NOT IN ('logo', 'cover') THEN
    RETURN;
  END IF;

  SELECT storage_path
  INTO selected_url
  FROM public.business_media
  WHERE business_id = p_business_id
    AND media_type = p_media_type
    AND is_published = true
  ORDER BY sort_order ASC, created_at ASC, id ASC
  LIMIT 1;

  IF p_media_type = 'logo' THEN
    UPDATE public.businesses
    SET logo_url = selected_url
    WHERE id = p_business_id;
  ELSE
    UPDATE public.businesses
    SET cover_image_url = selected_url
    WHERE id = p_business_id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION private.sync_business_media_image_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'UPDATE'
     AND (OLD.business_id IS DISTINCT FROM NEW.business_id
          OR OLD.media_type IS DISTINCT FROM NEW.media_type) THEN
    PERFORM private.refresh_business_media_image_column(OLD.business_id, OLD.media_type);
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM private.refresh_business_media_image_column(OLD.business_id, OLD.media_type);
    RETURN OLD;
  END IF;

  PERFORM private.refresh_business_media_image_column(NEW.business_id, NEW.media_type);
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS business_media_sync_business_images ON public.business_media;
CREATE TRIGGER business_media_sync_business_images
AFTER INSERT OR UPDATE OR DELETE ON public.business_media
FOR EACH ROW
EXECUTE FUNCTION private.sync_business_media_image_columns();

-- Backfill current image pointers from existing published media records.
-- Businesses with no media row keep any legacy URL until the image is explicitly
-- replaced or removed.
UPDATE public.businesses b
SET logo_url = (
  SELECT bm.storage_path
  FROM public.business_media bm
  WHERE bm.business_id = b.id
    AND bm.media_type = 'logo'
    AND bm.is_published = true
  ORDER BY bm.sort_order ASC, bm.created_at ASC, bm.id ASC
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM public.business_media bm
  WHERE bm.business_id = b.id AND bm.media_type = 'logo'
);

UPDATE public.businesses b
SET cover_image_url = (
  SELECT bm.storage_path
  FROM public.business_media bm
  WHERE bm.business_id = b.id
    AND bm.media_type = 'cover'
    AND bm.is_published = true
  ORDER BY bm.sort_order ASC, bm.created_at ASC, bm.id ASC
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM public.business_media bm
  WHERE bm.business_id = b.id AND bm.media_type = 'cover'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'business_media_sync_business_images'
      AND tgrelid = 'public.business_media'::regclass
      AND NOT tgisinternal
  ) THEN
    RAISE EXCEPTION 'Business media image sync trigger was not created';
  END IF;
END $$;
