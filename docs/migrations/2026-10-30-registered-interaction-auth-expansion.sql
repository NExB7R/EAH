-- EAH — Extend registered-account mutation guards to personal preferences and change requests.
-- Mutation-only guards; existing SELECT behavior is intentionally untouched.
BEGIN;

DO $registered_interaction_auth_expansion$
DECLARE
  target record;
  policy_name text;
  guard_expression constant text :=
    'auth.uid() IS NOT NULL AND COALESCE((auth.jwt() ->> ''is_anonymous'')::boolean, false) = false';
BEGIN
  FOR target IN
    SELECT * FROM (VALUES
      ('exclusions', 'INSERT'),
      ('exclusions', 'UPDATE'),
      ('exclusions', 'DELETE'),
      ('user_preferences', 'INSERT'),
      ('user_preferences', 'UPDATE'),
      ('user_preferences', 'DELETE'),
      ('business_change_requests', 'INSERT')
    ) AS policies(table_name, command_name)
  LOOP
    policy_name := 'registered_account_only_' || target.table_name || '_' || lower(target.command_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, target.table_name);

    IF target.command_name = 'INSERT' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR INSERT TO public WITH CHECK (%s)',
        policy_name, target.table_name, guard_expression
      );
    ELSIF target.command_name = 'UPDATE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR UPDATE TO public USING (%s) WITH CHECK (%s)',
        policy_name, target.table_name, guard_expression, guard_expression
      );
    ELSIF target.command_name = 'DELETE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR DELETE TO public USING (%s)',
        policy_name, target.table_name, guard_expression
      );
    END IF;
  END LOOP;
END
$registered_interaction_auth_expansion$;

COMMIT;
