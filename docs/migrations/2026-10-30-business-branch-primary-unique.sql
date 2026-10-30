-- Enforce at most one primary branch per activity.
-- The preflight check intentionally fails without modifying data if duplicates exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.business_branches
    WHERE is_primary = true
    GROUP BY business_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce one primary branch: duplicate primary branches exist. Resolve them explicitly before retrying.';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS business_branches_one_primary_per_business
  ON public.business_branches (business_id)
  WHERE is_primary = true;
