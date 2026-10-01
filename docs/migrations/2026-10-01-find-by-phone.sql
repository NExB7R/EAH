-- ============================================================
-- EAH — Migration 4: Find by Phone (Truecaller Style)
-- Date: 2026-10-01
-- Purpose: البحث بالرقم الكامل للتحقق من التسجيل
-- ============================================================

CREATE OR REPLACE FUNCTION public.find_by_phone(p_phone text)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  alias text,
  avatar_url text,
  impact_score integer,
  impact_level text,
  trust_score integer,
  trust_tier text,
  wanted_level integer,
  is_premium boolean,
  is_business boolean,
  business_slug text,
  business_name text,
  member_since timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH normalized AS (
    SELECT
      CASE
        WHEN p_phone LIKE '0%' THEN p_phone
        WHEN p_phone LIKE '+20%' THEN '0' || substring(p_phone from 4)
        WHEN p_phone LIKE '20%' THEN '0' || substring(p_phone from 3)
        ELSE p_phone
      END AS phone_local
  ),
  found AS (
    SELECT p.*
    FROM public.profiles p, normalized n
    WHERE p.phone = n.phone_local
    LIMIT 1
  )
  SELECT
    f.id AS user_id,
    f.display_name,
    f.alias,
    f.avatar_url,
    f.impact_score,
    f.impact_level,
    f.trust_score,
    f.trust_tier,
    f.wanted_level,
    f.is_premium,
    (b.id IS NOT NULL) AS is_business,
    b.slug AS business_slug,
    b.name AS business_name,
    f.created_at AS member_since
  FROM found f
  LEFT JOIN public.businesses b ON b.owner_profile_id = f.id AND b.is_published = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_by_phone(text) TO anon, authenticated;
