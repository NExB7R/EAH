-- Protect threaded comment integrity at the database boundary.
-- Apply only after reviewing on an isolated database and validating existing data.
CREATE OR REPLACE FUNCTION public.set_comment_depth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_business_published boolean;
  v_parent_business_id uuid;
  v_parent_depth integer;
  v_parent_status text;
BEGIN
  SELECT b.is_published
  INTO v_business_published
  FROM public.businesses AS b
  WHERE b.id = NEW.business_id
  FOR SHARE;

  IF NOT COALESCE(v_business_published, false) THEN
    RAISE EXCEPTION 'comment_business_not_published'
      USING ERRCODE = '23514';
  END IF;

  -- Do not let a client create a pre-moderated comment or forge counters.
  -- Trusted server jobs and administrators retain their controlled workflow.
  IF v_actor IS NOT NULL AND NOT COALESCE(private.is_admin(v_actor), false) THEN
    IF NEW.user_id IS DISTINCT FROM v_actor THEN
      RAISE EXCEPTION 'comment_insert_actor_mismatch'
        USING ERRCODE = '42501';
    END IF;
    NEW.id := gen_random_uuid();
    NEW.created_at := now();
    NEW.updated_at := now();
    NEW.status := 'approved';
    NEW.likes_count := 0;
    NEW.is_edited := false;
    NEW.edited_at := NULL;

    IF NEW.image_urls IS NULL THEN
      NEW.image_urls := '[]'::jsonb;
    END IF;
    IF jsonb_typeof(NEW.image_urls) IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'comment_images_invalid'
        USING ERRCODE = '23514';
    END IF;
    IF jsonb_array_length(NEW.image_urls) > 3
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(NEW.image_urls) AS image(value)
        WHERE jsonb_typeof(image.value) IS DISTINCT FROM 'string'
          OR (image.value #>> '{}') !~ '^https://'
      )
    THEN
      RAISE EXCEPTION 'comment_images_invalid'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.parent_id IS NULL THEN
    NEW.depth := 0;
    RETURN NEW;
  END IF;

  SELECT c.business_id, c.depth, c.status
  INTO v_parent_business_id, v_parent_depth, v_parent_status
  FROM public.business_comments AS c
  WHERE c.id = NEW.parent_id
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'comment_parent_not_found'
      USING ERRCODE = '23514';
  END IF;

  IF v_parent_business_id IS DISTINCT FROM NEW.business_id THEN
    RAISE EXCEPTION 'comment_parent_business_mismatch'
      USING ERRCODE = '23514';
  END IF;

  IF v_parent_status IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'comment_parent_not_approved'
      USING ERRCODE = '23514';
  END IF;

  NEW.depth := v_parent_depth + 1;

  IF NEW.depth > 2 THEN
    RAISE EXCEPTION 'comment_depth_exceeded'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;


-- Client updates are intentionally narrow: content edits for 15 minutes or a soft delete.
-- likes_count may only be changed by the nested counter trigger; hard deletes are disabled.
CREATE OR REPLACE FUNCTION public.guard_business_comment_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  -- Admin moderation and trusted server-side jobs retain their controlled path.
  IF v_actor IS NULL OR COALESCE(private.is_admin(v_actor), false) THEN
    RETURN NEW;
  END IF;

  -- The existing AFTER INSERT/DELETE comment-like trigger updates only likes_count.
  -- Allow that tightly scoped nested UPDATE even when the liker is not the comment author.
  IF pg_trigger_depth() >= 2
    AND NEW.likes_count IS DISTINCT FROM OLD.likes_count
    AND NEW.id IS NOT DISTINCT FROM OLD.id
    AND NEW.business_id IS NOT DISTINCT FROM OLD.business_id
    AND NEW.user_id IS NOT DISTINCT FROM OLD.user_id
    AND NEW.parent_id IS NOT DISTINCT FROM OLD.parent_id
    AND NEW.depth IS NOT DISTINCT FROM OLD.depth
    AND NEW.content IS NOT DISTINCT FROM OLD.content
    AND NEW.status IS NOT DISTINCT FROM OLD.status
    AND NEW.is_edited IS NOT DISTINCT FROM OLD.is_edited
    AND NEW.edited_at IS NOT DISTINCT FROM OLD.edited_at
    AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at
    AND NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at
    AND NEW.image_urls IS NOT DISTINCT FROM OLD.image_urls
  THEN
    RETURN NEW;
  END IF;

  IF OLD.user_id IS DISTINCT FROM v_actor THEN
    RAISE EXCEPTION 'comment_update_actor_mismatch'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.business_id IS DISTINCT FROM OLD.business_id
    OR NEW.user_id IS DISTINCT FROM OLD.user_id
    OR NEW.parent_id IS DISTINCT FROM OLD.parent_id
    OR NEW.depth IS DISTINCT FROM OLD.depth
    OR NEW.likes_count IS DISTINCT FROM OLD.likes_count
    OR NEW.image_urls IS DISTINCT FROM OLD.image_urls
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
    OR NEW.updated_at IS DISTINCT FROM OLD.updated_at
  THEN
    RAISE EXCEPTION 'comment_mutation_fields_are_server_managed'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IS DISTINCT FROM 'deleted' OR OLD.status = 'deleted' THEN
      RAISE EXCEPTION 'comment_status_is_server_managed'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF NEW.content IS DISTINCT FROM OLD.content THEN
    IF OLD.status IS DISTINCT FROM 'approved' OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'comment_not_editable'
        USING ERRCODE = '42501';
    END IF;
    IF now() > OLD.created_at + interval '15 minutes' THEN
      RAISE EXCEPTION 'comment_edit_window_expired'
        USING ERRCODE = '42501';
    END IF;
    NEW.is_edited := true;
    NEW.edited_at := now();
    NEW.updated_at := now();
  ELSE
    IF NEW.is_edited IS DISTINCT FROM OLD.is_edited
      OR NEW.edited_at IS DISTINCT FROM OLD.edited_at
    THEN
      RAISE EXCEPTION 'comment_edit_metadata_is_server_managed'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      NEW.updated_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_business_comment_update() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_guard_business_comment_update ON public.business_comments;
CREATE TRIGGER trg_guard_business_comment_update
BEFORE UPDATE ON public.business_comments
FOR EACH ROW EXECUTE FUNCTION public.guard_business_comment_update();

-- No user-facing flow needs a physical DELETE; use status='deleted' instead.
DROP POLICY IF EXISTS comments_self_delete ON public.business_comments;
