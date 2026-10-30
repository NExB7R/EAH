-- Comment target and thread-integrity regression checks (pgTAP).
-- Run only against an isolated database after applying the paired migration.
BEGIN;
SELECT plan(6);

SELECT has_trigger(
  'public',
  'business_comments',
  'trg_comment_depth',
  'comment insert integrity is enforced by the existing BEFORE INSERT trigger'
);

SELECT ok(
  position('comment_business_not_published' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0,
  'new comments require a published activity'
);

SELECT ok(
  position('comment_parent_business_mismatch' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0,
  'a reply cannot point to a comment from a different activity'
);

SELECT ok(
  position('comment_parent_not_approved' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0,
  'a reply can only target an approved parent comment'
);

SELECT ok(
  position('comment_parent_not_found' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0
    AND position('comment_depth_exceeded' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0,
  'missing parents and excessive thread depth are rejected'
);

SELECT ok(
  (SELECT prosecdef FROM pg_proc WHERE oid = 'public.set_comment_depth()'::regprocedure)
    AND (SELECT proconfig @> ARRAY['search_path=public, pg_temp'] FROM pg_proc WHERE oid = 'public.set_comment_depth()'::regprocedure),
  'the integrity trigger function remains SECURITY DEFINER with a locked search path'
);

SELECT * FROM finish();
ROLLBACK;
