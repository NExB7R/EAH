-- Applied to the current EAH pre-launch base on 2026-11-06 (Supabase migration version 20261106043104).
-- Optimize RLS policy auth lookups without changing policy logic.
-- The migration wraps direct auth.uid()/auth.jwt()/auth.role() calls in
-- scalar subqueries so Postgres can evaluate them once per statement rather
-- than once per row. Existing policy predicates/roles/commands are preserved.
-- Applied to the current EAH pre-launch base on 2026-11-06 after a rollback dry-run.

DO $$
DECLARE
  r record;
  v_using text;
  v_check text;
  v_sql text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        coalesce(qual, '') ~* 'auth\.(uid|jwt|role)\('
        OR coalesce(with_check, '') ~* 'auth\.(uid|jwt|role)\('
      )
      AND regexp_replace(
            regexp_replace(
              coalesce(qual, '') || ' ' || coalesce(with_check, ''),
              '\(\s*SELECT\s+auth\.uid\(\)\s+AS\s+uid\s*\)',
              '', 'gi'
            ),
            '\(\s*SELECT\s+auth\.jwt\(\)\s+AS\s+jwt\s*\)',
            '', 'gi'
          ) ~* 'auth\.(uid|jwt|role)\('
  LOOP
    v_using := r.qual;
    v_check := r.with_check;

    IF v_using IS NOT NULL THEN
      v_using := regexp_replace(v_using, 'auth\.uid\(\)', '(SELECT auth.uid())', 'gi');
      v_using := regexp_replace(v_using, 'auth\.jwt\(\)', '(SELECT auth.jwt())', 'gi');
      v_using := regexp_replace(v_using, 'auth\.role\(\)', '(SELECT auth.role())', 'gi');
    END IF;

    IF v_check IS NOT NULL THEN
      v_check := regexp_replace(v_check, 'auth\.uid\(\)', '(SELECT auth.uid())', 'gi');
      v_check := regexp_replace(v_check, 'auth\.jwt\(\)', '(SELECT auth.jwt())', 'gi');
      v_check := regexp_replace(v_check, 'auth\.role\(\)', '(SELECT auth.role())', 'gi');
    END IF;

    v_sql := format('ALTER POLICY %I ON %I.%I',
                    r.policyname, r.schemaname, r.tablename);

    IF v_using IS NOT NULL THEN
      v_sql := v_sql || format(' USING (%s)', v_using);
    END IF;

    IF v_check IS NOT NULL THEN
      v_sql := v_sql || format(' WITH CHECK (%s)', v_check);
    END IF;

    EXECUTE v_sql;
  END LOOP;
END
$$;
