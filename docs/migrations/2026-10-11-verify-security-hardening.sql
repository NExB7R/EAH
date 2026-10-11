-- EAH — Post-migration verification for 2026-10-11 security hardening
-- READ-ONLY: run after both 2026-10-11 hardening migrations have been applied.
-- Raises an exception if a protected function is still callable by the wrong role
-- or does not have the expected pinned search_path. This file performs no writes.

do $verify$
declare
  v_check record;
  v_function regprocedure;
  v_config text[];
  v_source text;
begin
  for v_check in
    select *
    from (values
      ('public.apply_trust_decay()', false, false, true),
      ('public.award_points(uuid, integer, text, uuid)', false, false, true),
      ('public.award_trust_points(text, uuid, text, integer, jsonb)', false, false, true),
      ('public.award_trust_badge(text, uuid, text)', false, false, true),
      ('public.check_streak_badges(uuid)', false, true, true),
      ('public.check_reviewer_badges(uuid)', false, true, true),
      ('public.check_social_badges(uuid)', false, true, true),
      ('public.get_multi_account_ips(integer)', false, false, true),
      ('public.count_accounts_from_ip(text, integer)', false, false, true),
      ('public.check_rate_limit(text, integer, integer)', false, false, true),
      ('public.find_by_phone(text)', false, false, true),
      ('public.is_phone_registered(text)', false, false, true),
      ('public.reveal_contact(uuid, text, text)', false, false, true),
      ('public.admin_get_profiles()', false, true, true),
      ('public.admin_get_business_owners()', false, true, true),
      ('public.get_referral_list(uuid, integer)', false, true, null),
      ('public.get_referral_stats(uuid)', false, true, null),
      ('public.apply_wanted_level_on_report()', false, false, false),
      ('public.detect_multi_account_signup()', false, false, false),
      ('public.handle_referral_first_order()', false, false, false),
      ('public.handle_referral_signup()', false, false, false),
      ('public.log_review_changes()', false, false, false),
      ('public.recalc_wanted_level_on_resolve()', false, false, false),
      ('public.refresh_business_counts()', false, false, false),
      ('public.refresh_business_scores()', false, false, false),
      ('public.refresh_comment_likes()', false, false, false),
      ('public.comment_rate_limit()', false, false, false),
      ('public.detect_review_velocity()', false, false, false),
      ('public.on_order_confirmed()', false, false, false),
      ('public.on_review_added()', false, false, false),
      ('public.on_trust_updated()', false, false, false),
      ('public.prevent_self_order()', false, false, false),
      ('public.prevent_self_review()', false, false, false),
      ('public.set_comment_depth()', false, false, false),
      ('public.assign_order_code_v2()', false, false, false),
      ('public.auto_flag_review()', false, false, false),
      ('public.auto_referral_code()', false, false, false),
      ('public.grant_trial_on_owner()', false, false, false),
      ('public.lock_order_message()', false, false, false),
      ('public.notify_partner_invitation()', false, false, false),
      ('public.set_referral_code()', false, false, false)
    ) as expected(signature, anon_exec, authenticated_exec, service_exec)
  loop
    v_function := pg_catalog.to_regprocedure(v_check.signature);

    if v_function is null then
      raise exception 'Expected security-hardened function is missing: %', v_check.signature;
    end if;

    if pg_catalog.has_function_privilege('anon', v_function, 'EXECUTE')
       is distinct from v_check.anon_exec then
      raise exception 'Unexpected anon EXECUTE privilege for %', v_check.signature;
    end if;

    if pg_catalog.has_function_privilege('authenticated', v_function, 'EXECUTE')
       is distinct from v_check.authenticated_exec then
      raise exception 'Unexpected authenticated EXECUTE privilege for %', v_check.signature;
    end if;

    if v_check.service_exec is not null
       and pg_catalog.has_function_privilege('service_role', v_function, 'EXECUTE')
       is distinct from v_check.service_exec then
      raise exception 'Unexpected service_role EXECUTE privilege for %', v_check.signature;
    end if;
  end loop;

  for v_check in
    select signature
    from (values
      ('public.apply_trust_decay()'),
      ('public.award_points(uuid, integer, text, uuid)'),
      ('public.award_trust_points(text, uuid, text, integer, jsonb)'),
      ('public.award_trust_badge(text, uuid, text)'),
      ('public.check_streak_badges(uuid)'),
      ('public.check_reviewer_badges(uuid)'),
      ('public.check_social_badges(uuid)'),
      ('public.get_user_badges(uuid)'),
      ('public.get_multi_account_ips(integer)'),
      ('public.count_accounts_from_ip(text, integer)'),
      ('public.check_rate_limit(text, integer, integer)'),
      ('public.find_by_phone(text)'),
      ('public.is_phone_registered(text)'),
      ('public.reveal_contact(uuid, text, text)'),
      ('public.admin_get_profiles()'),
      ('public.admin_get_business_owners()'),
      ('public.get_referral_list(uuid, integer)'),
      ('public.get_referral_stats(uuid)'),
      ('public.set_new_until()'),
      ('public.get_trust_tier(integer)'),
      ('public.is_admin()'),
      ('public.apply_wanted_level_on_report()'),
      ('public.detect_multi_account_signup()'),
      ('public.handle_referral_first_order()'),
      ('public.handle_referral_signup()'),
      ('public.log_review_changes()'),
      ('public.recalc_wanted_level_on_resolve()'),
      ('public.refresh_business_counts()'),
      ('public.refresh_business_scores()'),
      ('public.refresh_comment_likes()'),
      ('public.comment_rate_limit()'),
      ('public.detect_review_velocity()'),
      ('public.on_order_confirmed()'),
      ('public.on_review_added()'),
      ('public.on_trust_updated()'),
      ('public.prevent_self_order()'),
      ('public.prevent_self_review()'),
      ('public.set_comment_depth()'),
      ('public.assign_order_code_v2()'),
      ('public.auto_flag_review()'),
      ('public.auto_referral_code()'),
      ('public.grant_trial_on_owner()'),
      ('public.lock_order_message()'),
      ('public.notify_partner_invitation()'),
      ('public.set_referral_code()')
    ) as expected(signature)
  loop
    v_function := pg_catalog.to_regprocedure(v_check.signature);

    if v_function is null then
      raise exception 'Expected function is missing while verifying search_path: %', v_check.signature;
    end if;

    select p.proconfig
    into v_config
    from pg_catalog.pg_proc as p
    where p.oid = v_function::oid;

    if not (coalesce(v_config, array[]::text[]) @> array['search_path=pg_catalog, public, pg_temp']) then
      raise exception 'Unexpected search_path on %: %', v_check.signature, v_config;
    end if;
  end loop;
  -- Ensure badge-check RPCs enforce per-user authorization inside the definer body.
  for v_check in
    select signature
    from (values
      ('public.check_streak_badges(uuid)'),
      ('public.check_reviewer_badges(uuid)'),
      ('public.check_social_badges(uuid)')
    ) as expected(signature)
  loop
    v_function := pg_catalog.to_regprocedure(v_check.signature);

    select p.prosrc
    into v_source
    from pg_catalog.pg_proc as p
    where p.oid = v_function::oid;

    if position('auth.uid() is not null' in v_source) = 0
       or position('service_role' in v_source) = 0
       or position('public.is_admin()' in v_source) = 0 then
      raise exception 'Badge-check authorization guard missing from %', v_check.signature;
    end if;
  end loop;

end;
$verify$;

select
  'Security hardening verified' as status,
  now() as verified_at;
