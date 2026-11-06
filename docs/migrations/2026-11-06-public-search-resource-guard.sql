-- Applied to the current EAH pre-launch base on 2026-11-06 (Supabase migration version 20261106042538).
-- Public SECURITY DEFINER search RPC: clamp user-controlled resource bounds.
-- Keep the existing public fields and published-only visibility filter.
-- Applied to the current EAH pre-launch base after a rollback dry-run.

CREATE OR REPLACE FUNCTION public.search_businesses(
  p_query text,
  p_type text DEFAULT NULL::text,
  p_area text DEFAULT NULL::text,
  p_sort text DEFAULT 'relevance'::text,
  p_limit integer DEFAULT 30,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  slug text,
  name text,
  business_type text,
  area text,
  hook text,
  cover_image_url text,
  is_featured boolean,
  is_open boolean,
  created_at timestamptz,
  rank real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_q text := left(coalesce(trim(p_query), ''), 120);
  v_limit integer := least(greatest(coalesce(p_limit, 30), 1), 100);
  v_offset integer := least(greatest(coalesce(p_offset, 0), 0), 5000);
BEGIN
  RETURN QUERY
  SELECT
    b.id, b.slug, b.name, b.business_type, b.area,
    b.hook, b.cover_image_url, b.is_featured, b.is_open,
    b.created_at,
    CASE
      WHEN v_q = '' THEN 0::real
      WHEN lower(b.name) LIKE lower(v_q) || '%' THEN 1.0::real
      WHEN lower(b.name) LIKE '%' || lower(v_q) || '%' THEN 0.8::real
      WHEN lower(coalesce(b.description,'')) LIKE '%' || lower(v_q) || '%' THEN 0.6::real
      WHEN lower(coalesce(b.area,'')) LIKE '%' || lower(v_q) || '%' THEN 0.5::real
      ELSE 0.3::real
    END AS rank
  FROM public.businesses b
  WHERE b.is_published = true
    AND (p_type IS NULL OR b.business_type = p_type)
    AND (p_area IS NULL OR b.area = p_area)
    AND (
      v_q = ''
      OR lower(b.name) LIKE '%' || lower(v_q) || '%'
      OR lower(coalesce(b.description,'')) LIKE '%' || lower(v_q) || '%'
      OR lower(coalesce(b.hook,'')) LIKE '%' || lower(v_q) || '%'
      OR lower(coalesce(b.area,'')) LIKE '%' || lower(v_q) || '%'
    )
  ORDER BY
    CASE p_sort WHEN 'name' THEN b.name ELSE NULL END ASC NULLS LAST,
    CASE p_sort WHEN 'newest' THEN b.created_at ELSE NULL END DESC NULLS LAST,
    b.is_featured DESC,
    rank DESC,
    b.created_at DESC
  LIMIT v_limit
  OFFSET v_offset;
END;
$function$;
