-- Regression coverage for caller-scoped can_interact(uuid).
-- Run only on the dedicated non-production database used by the RLS workflow.
BEGIN;

SELECT plan(9);

SELECT ok(
  to_regprocedure('public.can_interact(uuid)') IS NOT NULL,
  'can_interact(uuid) exists'
);

SELECT ok(
  (SELECT proconfig @> ARRAY['search_path=pg_catalog, public']
   FROM pg_proc
   WHERE oid = 'public.can_interact(uuid)'::regprocedure),
  'can_interact uses a fixed search_path'
);

SELECT ok(
  NOT has_function_privilege('anon', 'public.can_interact(uuid)', 'EXECUTE'),
  'anonymous callers cannot execute can_interact'
);

SELECT ok(
  has_function_privilege('authenticated', 'public.can_interact(uuid)', 'EXECUTE'),
  'authenticated callers retain own-account standing checks'
);

SELECT ok(
  has_function_privilege('service_role', 'public.can_interact(uuid)', 'EXECUTE'),
  'trusted server-side health checks retain execution'
);

SELECT ok(
  position('p_user_id IS DISTINCT FROM v_caller_id' IN
    pg_get_functiondef('public.can_interact(uuid)'::regprocedure)) > 0
  AND position('auth.jwt()' IN
    pg_get_functiondef('public.can_interact(uuid)'::regprocedure)) > 0
  AND position('user_roles' IN
    pg_get_functiondef('public.can_interact(uuid)'::regprocedure)) = 0,
  'only the caller or trusted service_role can inspect a target'
);

SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SET LOCAL ROLE authenticated;

SELECT lives_ok(
  $$ SELECT public.can_interact('11111111-1111-4111-8111-111111111111'::uuid) $$,
  'a registered caller may inspect their own standing'
);

SELECT throws_ok(
  $$ SELECT public.can_interact('22222222-2222-4222-8222-222222222222'::uuid) $$,
  '42501',
  NULL,
  'a registered caller cannot inspect another user standing'
);

RESET ROLE;

SELECT set_config('request.jwt.claim.sub', '', true);
SELECT set_config('request.jwt.claim.role', 'service_role', true);
SET LOCAL ROLE service_role;

SELECT lives_ok(
  $$ SELECT public.can_interact('33333333-3333-4333-8333-333333333333'::uuid) $$,
  'the trusted service role may inspect a target for server-side health checks'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
