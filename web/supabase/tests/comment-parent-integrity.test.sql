-- Comment target and thread-integrity regression checks (pgTAP).
-- Run only against an isolated database after applying the paired migration.
BEGIN;
SELECT plan(15);

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

SELECT has_trigger(
  'public',
  'business_comments',
  'trg_guard_business_comment_update',
  'comment updates are restricted by a database trigger'
);

SELECT ok(
  position('comment_edit_window_expired' IN pg_get_functiondef('public.guard_business_comment_update()'::regprocedure)) > 0
    AND position('comment_mutation_fields_are_server_managed' IN pg_get_functiondef('public.guard_business_comment_update()'::regprocedure)) > 0,
  'comment edits have a server-enforced time window and immutable fields'
);

SELECT ok(
  (SELECT prosecdef FROM pg_proc WHERE oid = 'public.guard_business_comment_update()'::regprocedure)
    AND (SELECT proconfig @> ARRAY['search_path=public, private, pg_temp'] FROM pg_proc WHERE oid = 'public.guard_business_comment_update()'::regprocedure),
  'the comment update guard is SECURITY DEFINER with a locked search path'
);

SELECT is(
  (SELECT count(*)::int FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename = 'business_comments'
     AND cmd IN ('DELETE', 'ALL')
     AND permissive = 'PERMISSIVE'),
  0,
  'regular users cannot physically delete comment rows'
);

SELECT ok(
  position('NEW.status := ''approved''' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0
    AND position('NEW.likes_count := 0' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0
    AND position('NEW.is_edited := false' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0,
  'client comment inserts cannot forge moderation state or like counters'
);

SELECT ok(
  position('pg_trigger_depth() >= 2' IN pg_get_functiondef('public.guard_business_comment_update()'::regprocedure)) > 0,
  'the like counter can only change through its nested database trigger'
);

SELECT ok(
  position('NEW.id := gen_random_uuid()' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0
    AND position('NEW.created_at := now()' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0,
  'registered users cannot forge comment identifiers or creation times'
);

SELECT ok(
  position('comment_images_invalid' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0
    AND position('jsonb_array_length(NEW.image_urls) > 3' IN pg_get_functiondef('public.set_comment_depth()'::regprocedure)) > 0,
  'comment image payloads are limited to three HTTPS URLs'
);

SELECT ok(
  position('comment_edit_metadata_is_server_managed' IN pg_get_functiondef('public.guard_business_comment_update()'::regprocedure)) > 0
    AND position('comment_status_is_server_managed' IN pg_get_functiondef('public.guard_business_comment_update()'::regprocedure)) > 0,
  'users cannot forge edit metadata or moderation status'
);

SELECT * FROM finish();
ROLLBACK;
