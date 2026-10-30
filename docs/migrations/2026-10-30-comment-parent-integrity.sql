-- Protect threaded comment integrity at the database boundary.
-- Apply only after reviewing on an isolated database and validating existing data.
CREATE OR REPLACE FUNCTION public.set_comment_depth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
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
