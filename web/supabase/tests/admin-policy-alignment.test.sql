-- EAH targeted regression checks for the 2026-10-29 admin/RLS migrations.
-- Run only on a dedicated non-production database after applying the migration set.
BEGIN;
SELECT plan(55);

SELECT is((SELECT relrowsecurity FROM pg_class WHERE oid='public.businesses'::regclass), true, 'RLS remains enabled on businesses');
SELECT ok((SELECT qual LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='businesses' AND policyname='businesses_admin_all'), 'admin activity policy uses shared admin authorization');
SELECT ok((SELECT with_check LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='businesses' AND policyname='businesses_admin_all'), 'admin activity writes validate admin authorization');

SELECT is((SELECT relrowsecurity FROM pg_class WHERE oid='public.business_insights'::regclass), true, 'RLS remains enabled on business_insights');
SELECT is((SELECT count(*)::int FROM pg_policies WHERE schemaname='public' AND tablename='business_insights'), 4, 'business insights has four owner/admin policies');
SELECT is(has_table_privilege('anon','public.business_insights','SELECT'), false, 'anonymous visitors cannot read private business insights');
SELECT is(has_table_privilege('authenticated','public.business_insights','SELECT'), true, 'authenticated sessions can select insights subject to RLS');
SELECT is(has_table_privilege('authenticated','public.business_insights','INSERT'), true, 'authenticated sessions can create insights subject to RLS');
SELECT is(has_table_privilege('authenticated','public.business_insights','UPDATE'), true, 'authenticated sessions can update insights subject to RLS');
SELECT is(has_table_privilege('authenticated','public.business_insights','DELETE'), true, 'authenticated sessions can delete insights subject to RLS');
SELECT ok((SELECT qual LIKE '%owner_profile_id%' FROM pg_policies WHERE schemaname='public' AND tablename='business_insights' AND policyname='business_insights_select_owner_or_admin'), 'business insight policy checks the linked business owner');

SELECT ok((SELECT qual LIKE '%auth_is_admin()%' AND with_check LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='business_reviews' AND policyname='business_reviews_admin_all'), 'admin review moderation uses shared admin helper');
SELECT ok((SELECT qual LIKE '%auth_is_admin()%' AND with_check LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='reports' AND policyname='reports_admin_all'), 'admin report moderation uses shared admin helper');
SELECT ok((SELECT with_check LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='audit_logs' AND policyname='audit_logs_admin_insert'), 'admin sessions can append audit records');
SELECT ok((SELECT qual LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='audit_logs' AND policyname='audit_logs_admin_select'), 'admin sessions can read admin audit records');
SELECT ok((SELECT qual LIKE '%super_admin%' AND qual NOT LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='audit_logs' AND policyname='audit_logs admin all'), 'audit update/delete remains restricted to super_admin');

SELECT ok((SELECT qual LIKE '%auth_is_admin()%' AND with_check LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='business_subscriptions' AND policyname='subs_admin_all'), 'admins can manage subscriptions subject to RLS');
SELECT ok((SELECT qual LIKE '%auth_is_admin()%' AND qual LIKE '%status = ''active''%' FROM pg_policies WHERE schemaname='public' AND tablename='ads' AND policyname='ads_read'), 'public ad reads remain active-only while admins see moderation states');
SELECT ok((SELECT with_check LIKE '%auth_is_admin()%' AND with_check LIKE '%owner_profile_id%' FROM pg_policies WHERE schemaname='public' AND tablename='ads' AND policyname='ads_insert'), 'ad insertion is limited to owner or admin');
SELECT ok((SELECT qual LIKE '%auth_is_admin()%' AND qual LIKE '%owner_profile_id%' AND with_check LIKE '%auth_is_admin()%' AND with_check LIKE '%owner_profile_id%' FROM pg_policies WHERE schemaname='public' AND tablename='ads' AND policyname='ads_update'), 'ad updates preserve owner boundaries and allow admins');
SELECT ok((SELECT qual LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='ads' AND policyname='ads_delete'), 'ad deletion is restricted to authorized admin');
SELECT ok((SELECT qual LIKE '%owner_profile_id%' AND qual LIKE '%pending%' AND qual LIKE '%rejected%' FROM pg_policies WHERE schemaname='public' AND tablename='ads' AND policyname='ads_delete'), 'ad owners can cancel only pending/rejected ads');
SELECT has_column('public', 'ads', 'approved_by', 'ads records the approving admin');
SELECT has_column('public', 'ads', 'approved_at', 'ads records approval timestamp');
SELECT has_trigger('public', 'ads', 'ads_protect_moderation_fields', 'ad moderation fields are protected by a database trigger');
SELECT ok((SELECT pg_get_functiondef('public.prevent_owner_ad_moderation_update()'::regprocedure) LIKE '%NEW.status IS DISTINCT FROM OLD.status%' AND pg_get_functiondef('public.prevent_owner_ad_moderation_update()'::regprocedure) LIKE '%NEW.approved_at IS DISTINCT FROM OLD.approved_at%'), 'owners cannot change moderation fields with direct table updates');

SELECT ok((SELECT qual LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='page_view_events' AND policyname='page_view_events_admin_select'), 'admin analytics can read page views');
SELECT ok((SELECT qual LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='live_page_sessions' AND policyname='live_sessions_admin_select'), 'admin analytics can read live sessions');
SELECT ok((SELECT qual LIKE '%auth_is_admin()%' FROM pg_policies WHERE schemaname='public' AND tablename='daily_visits' AND policyname='visits_admin_select'), 'admin analytics can read daily visits');

SELECT is(has_function_privilege('anon','public.auth_is_admin()','EXECUTE'), true, 'anon can evaluate boolean helper used by PUBLIC RLS policies');
SELECT is(has_function_privilege('anon','public.is_admin()','EXECUTE'), true, 'anon can evaluate boolean super-admin helper used by PUBLIC RLS policies');
SELECT is(public.auth_is_admin(), false, 'admin RLS helper returns false without an authenticated UID');
SELECT is(public.is_admin(), false, 'super-admin RLS helper returns false without an authenticated UID');
SELECT is((
  has_function_privilege('anon','public.can_signup_with_phone(text)','EXECUTE')
  OR has_function_privilege('anon','public.check_business_name_unique(text, uuid)','EXECUTE')
  OR has_function_privilege('anon','public.get_business_view_stats(text[], integer)','EXECUTE')
  OR has_function_privilege('anon','public.reveal_contact(uuid, text, text)','EXECUTE')
  OR has_function_privilege('anon','public.validate_coupon(text, uuid)','EXECUTE')
), false, 'sensitive RPCs are not callable anonymously');
SELECT is((
  has_function_privilege('service_role','public.can_signup_with_phone(text)','EXECUTE')
  AND has_function_privilege('service_role','public.check_business_name_unique(text, uuid)','EXECUTE')
  AND has_function_privilege('service_role','public.get_business_view_stats(text[], integer)','EXECUTE')
  AND has_function_privilege('service_role','public.reveal_contact(uuid, text, text)','EXECUTE')
  AND has_function_privilege('service_role','public.validate_coupon(text, uuid)','EXECUTE')
), true, 'service_role retains sensitive RPC execution');
SELECT is((
  has_function_privilege('authenticated','public.can_signup_with_phone(text)','EXECUTE')
  OR has_function_privilege('authenticated','public.check_business_name_unique(text, uuid)','EXECUTE')
  OR has_function_privilege('authenticated','public.get_business_view_stats(text[], integer)','EXECUTE')
  OR has_function_privilege('authenticated','public.reveal_contact(uuid, text, text)','EXECUTE')
  OR has_function_privilege('authenticated','public.validate_coupon(text, uuid)','EXECUTE')
), false, 'sensitive RPCs cannot be called directly by authenticated browser sessions');

SELECT ok(
  has_function_privilege('service_role','public.admin_set_business_owner(uuid, uuid)','EXECUTE')
  AND has_function_privilege('service_role','private.admin_set_business_owner(uuid, uuid)','EXECUTE')
  AND NOT has_function_privilege('anon','public.admin_set_business_owner(uuid, uuid)','EXECUTE')
  AND NOT has_function_privilege('authenticated','public.admin_set_business_owner(uuid, uuid)','EXECUTE')
  AND NOT has_function_privilege('anon','private.admin_set_business_owner(uuid, uuid)','EXECUTE')
  AND NOT has_function_privilege('authenticated','private.admin_set_business_owner(uuid, uuid)','EXECUTE'),
  'activity-owner mutation RPCs are server-role only'
);
SELECT is((
  has_function_privilege('anon','public.comment_rate_limit()','EXECUTE')
  OR has_function_privilege('anon','public.detect_review_velocity()','EXECUTE')
  OR has_function_privilege('anon','public.handle_referral_first_order()','EXECUTE')
  OR has_function_privilege('anon','public.handle_referral_signup()','EXECUTE')
  OR has_function_privilege('anon','public.log_review_changes()','EXECUTE')
  OR has_function_privilege('anon','public.on_review_added()','EXECUTE')
  OR has_function_privilege('anon','public.prevent_self_order()','EXECUTE')
  OR has_function_privilege('anon','public.prevent_self_review()','EXECUTE')
  OR has_function_privilege('anon','public.refresh_business_counts()','EXECUTE')
  OR has_function_privilege('anon','public.refresh_business_scores()','EXECUTE')
  OR has_function_privilege('anon','public.refresh_comment_likes()','EXECUTE')
  OR has_function_privilege('anon','public.set_comment_depth()','EXECUTE')
  OR has_function_privilege('anon','public.set_referral_code()','EXECUTE')
  OR has_function_privilege('anon','public.update_customer_stats_on_delivered()','EXECUTE')
  OR has_function_privilege('anon','public.update_customer_stats_on_insert()','EXECUTE')
), false, 'trigger-only functions are not callable through anonymous RPC');
SELECT is(has_function_privilege('anon','public.generate_referral_code()','EXECUTE'), false, 'referral-code generator is not callable anonymously');
SELECT is(has_function_privilege('authenticated','public.generate_referral_code()','EXECUTE'), false, 'referral-code generator is not callable by authenticated browser sessions');
SELECT is((
  has_function_privilege('anon','public.record_ad_event(uuid, text, uuid, uuid, text)','EXECUTE')
  OR has_function_privilege('anon','public.record_page_view(text, uuid, uuid, uuid, text, text)','EXECUTE')
  OR has_function_privilege('anon','public.heartbeat_page_session(uuid, text, uuid)','EXECUTE')
), false, 'anonymous clients cannot call analytics write RPCs directly');
SELECT is((
  has_function_privilege('authenticated','public.record_ad_event(uuid, text, uuid, uuid, text)','EXECUTE')
  OR has_function_privilege('authenticated','public.record_page_view(text, uuid, uuid, uuid, text, text)','EXECUTE')
  OR has_function_privilege('authenticated','public.heartbeat_page_session(uuid, text, uuid)','EXECUTE')
), false, 'authenticated browser clients cannot call analytics write RPCs directly');
SELECT is((
  has_function_privilege('service_role','public.record_ad_event(uuid, text, uuid, uuid, text)','EXECUTE')
  AND has_function_privilege('service_role','public.record_page_view(text, uuid, uuid, uuid, text, text)','EXECUTE')
  AND has_function_privilege('service_role','public.heartbeat_page_session(uuid, text, uuid)','EXECUTE')
), true, 'trusted server retains analytics RPC execution');

SELECT is((
  SELECT count(*)::int FROM pg_proc AS p JOIN pg_namespace AS n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname IN ('get_trust_tier','set_new_until','prevent_merchant_toggle_orders_enabled')
    AND EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig,ARRAY[]::text[])) AS setting WHERE setting LIKE 'search_path=%')
), 3, 'mutable search_path functions have explicit settings');
SELECT is((
  SELECT count(*)::int FROM pg_indexes WHERE schemaname='public' AND indexname=ANY(ARRAY[
    'idx_announcements_created_by','idx_ads_approved_by','idx_area_requests_business_id','idx_area_requests_requested_by',
    'idx_area_requests_reviewed_by','idx_business_insights_generated_by','idx_business_reviews_moderated_by',
    'idx_businesses_claimed_by_user_id','idx_businesses_rejected_by','idx_businesses_verified_by',
    'idx_comment_thread_follows_business_id','idx_engagement_events_user_id','idx_moderation_queue_reviewed_by',
    'idx_system_errors_resolved_by','idx_system_errors_user_id'
  ])
), 15, 'foreign-key indexes include the new ad approver index');

SELECT ok(EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reports' AND policyname='reports_self_insert'), 'reporters can still submit their own reports');
SELECT ok((SELECT qual LIKE '%owner_profile_id%' FROM pg_policies WHERE schemaname='public' AND tablename='ads' AND policyname='ads_read'), 'ad owners retain visibility to their own ads');

SELECT is((SELECT relrowsecurity FROM pg_class WHERE oid='public.contact_reveals'::regclass), true, 'RLS remains enabled on contact reveal audit rows');
SELECT ok((SELECT qual LIKE '%super_admin%' AND qual NOT LIKE '%''admin''::app_role%' FROM pg_policies WHERE schemaname='public' AND tablename='contact_reveals' AND policyname='super_admin_read_contact_reveals'), 'contact reveal audit reads are restricted to super_admin');
SELECT is((SELECT count(*)::int FROM pg_policies WHERE schemaname='public' AND tablename='contact_reveals' AND policyname='admin_read_contact_reveals'), 0, 'legacy admin policy is removed');
SELECT is(has_table_privilege('anon','public.contact_reveals','SELECT'), false, 'anonymous visitors cannot read contact reveal audit rows');
SELECT is(has_table_privilege('authenticated','public.contact_reveals','SELECT'), true, 'authenticated sessions can query contact reveal rows subject to super_admin-only RLS');


SELECT ok(
  pg_get_functiondef('public.request_promo_post(uuid, text, text)'::regprocedure) LIKE '%owner_profile_id%'
  AND pg_get_functiondef('public.request_promo_post(uuid, text, text)'::regprocedure) LIKE '%not_owner%',
  'promo request RPC enforces linked business ownership'
);
SELECT ok(
  pg_get_functiondef('public.redeem_reward(uuid)'::regprocedure) LIKE '%reward_catalog%FOR UPDATE%'
  AND pg_get_functiondef('public.redeem_reward(uuid)'::regprocedure) LIKE '%profiles%FOR UPDATE%',
  'reward redemption locks reward stock and user balance rows'
);
SELECT is(has_function_privilege('anon','public.request_promo_post(uuid, text, text)','EXECUTE'), false, 'anonymous users cannot request promo posts');

SELECT * FROM finish();
ROLLBACK;
