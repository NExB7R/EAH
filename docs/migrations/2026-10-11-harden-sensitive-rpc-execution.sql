-- EAH — Harden privileged RPC execution and referral privacy
-- Date: 2026-10-11
-- Apply only after reviewing this migration against the current production schema.
-- Rollout order: deploy the matching server-side application changes first, then apply this SQL.

begin;

-- These mutation/admin helpers must never be callable directly by public clients.
-- This bulk mutation must be cron/service-only; public calls could repeatedly reduce trust scores.
revoke all on function public.apply_trust_decay() from public, anon, authenticated;
grant execute on function public.apply_trust_decay() to service_role;
alter function public.apply_trust_decay() set search_path = pg_catalog, public, pg_temp;

-- Signup runs the duplicate-phone check on the server with a service client;
-- never expose this existence check directly through the anon/authenticated RPC API.
revoke all on function public.is_phone_registered(text) from public, anon, authenticated;
grant execute on function public.is_phone_registered(text) to service_role;
alter function public.is_phone_registered(text) set search_path = pg_catalog, public, pg_temp;

-- Business-name validation must not enumerate unpublished businesses to anonymous callers.
-- When excluding an existing business ID, honour it only if the caller owns that
-- business or is a super-admin. Publicly published matches remain discoverable.
create or replace function public.check_business_name_unique(
  p_name text,
  p_exclude_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, extensions, pg_temp
as $
declare
  v_normalized text;
  v_exact_match record;
  v_similar_match record;
  v_exclude_id uuid := null;
begin
  if auth.uid() is null
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  v_normalized := public.normalize_business_name(p_name);

  if v_normalized = '' then
    return jsonb_build_object('ok', true);
  end if;

  if p_exclude_id is not null and (
    coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    or exists (
      select 1
      from public.businesses as owned_business
      where owned_business.id = p_exclude_id
        and (
          owned_business.owner_profile_id = auth.uid()
          or private.is_admin()
        )
    )
  ) then
    v_exclude_id := p_exclude_id;
  end if;

  select b.id, b.name
  into v_exact_match
  from public.businesses as b
  where public.normalize_business_name(b.name) = v_normalized
    and (b.is_published = true
         or b.owner_profile_id = auth.uid()
         or private.is_admin()
         or coalesce(auth.jwt() ->> 'role', '') = 'service_role')
    and (v_exclude_id is null or b.id <> v_exclude_id)
  limit 1;

  if found then
    return jsonb_build_object(
      'ok', false,
      'reason', 'exact_match',
      'matched_name', v_exact_match.name,
      'matched_id', v_exact_match.id,
      'message', 'في نشاط بنفس الاسم — جرّب اسم مختلف أو أضف كلمة تمييز'
    );
  end if;

  select b.id, b.name
  into v_similar_match
  from public.businesses as b
  where extensions.levenshtein(public.normalize_business_name(b.name), v_normalized) <= 2
    and length(public.normalize_business_name(b.name)) >= 4
    and (b.is_published = true
         or b.owner_profile_id = auth.uid()
         or private.is_admin()
         or coalesce(auth.jwt() ->> 'role', '') = 'service_role')
    and (v_exclude_id is null or b.id <> v_exclude_id)
  limit 1;

  if found then
    return jsonb_build_object(
      'ok', false,
      'reason', 'similar',
      'matched_name', v_similar_match.name,
      'message', 'في نشاط قريب جداً في الاسم — جرّب اسم أوضح'
    );
  end if;

  return jsonb_build_object('ok', true, 'normalized', v_normalized);
end;
$;

revoke all on function public.check_business_name_unique(text, uuid) from public, anon;
grant execute on function public.check_business_name_unique(text, uuid) to authenticated, service_role;
alter function public.check_business_name_unique(text, uuid) set search_path = pg_catalog, public, private, extensions, pg_temp;

-- Contact-reveal tracking is reached through the authenticated server route, which
-- derives the visitor hash from the verified user. Do not let direct RPC callers
-- forge arbitrary hashes to inflate public contact counters.
revoke all on function public.reveal_contact(uuid, text, text) from public, anon, authenticated;
grant execute on function public.reveal_contact(uuid, text, text) to service_role;
alter function public.reveal_contact(uuid, text, text) set search_path = pg_catalog, public, pg_temp;

revoke all on function public.award_points(uuid, integer, text, uuid) from public, anon, authenticated;
grant execute on function public.award_points(uuid, integer, text, uuid) to service_role;

revoke all on function public.award_trust_points(text, uuid, text, integer, jsonb) from public, anon, authenticated;
grant execute on function public.award_trust_points(text, uuid, text, integer, jsonb) to service_role;

revoke all on function public.get_multi_account_ips(integer) from public, anon, authenticated;
grant execute on function public.get_multi_account_ips(integer) to service_role;

-- Internal multi-account detection helper; do not expose IP-correlation queries over RPC.
revoke all on function public.count_accounts_from_ip(text, integer) from public, anon, authenticated;
grant execute on function public.count_accounts_from_ip(text, integer) to service_role;
alter function public.count_accounts_from_ip(text, integer) set search_path = pg_catalog, public, pg_temp;

-- The application uses Upstash for rate limiting. Do not allow arbitrary callers to
-- grow or manipulate the database-backed rate_limits table through this RPC.
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- Keep privileged functions away from caller-controlled schemas during name resolution.
alter function public.award_points(uuid, integer, text, uuid) set search_path = pg_catalog, public, pg_temp;
alter function public.award_trust_points(text, uuid, text, integer, jsonb) set search_path = pg_catalog, public, pg_temp;
alter function public.get_multi_account_ips(integer) set search_path = pg_catalog, public, pg_temp;
alter function public.check_rate_limit(text, integer, integer) set search_path = pg_catalog, public, pg_temp;

-- Badge awards are mutations. Clients may request eligibility checks, but only the
-- server/service role may insert an arbitrary badge key for any entity.
revoke all on function public.award_trust_badge(text, uuid, text) from public, anon, authenticated;
grant execute on function public.award_trust_badge(text, uuid, text) to service_role;
alter function public.award_trust_badge(text, uuid, text) set search_path = pg_catalog, public, pg_temp;

-- Badge-check RPCs must reject anonymous callers and validate the target user inside
-- the definer body: self, super-admin, or trusted service-role calls only.
revoke all on function public.check_streak_badges(uuid) from public, anon;
grant execute on function public.check_streak_badges(uuid) to authenticated, service_role;
alter function public.check_streak_badges(uuid) set search_path = pg_catalog, public, pg_temp;

revoke all on function public.check_reviewer_badges(uuid) from public, anon;
grant execute on function public.check_reviewer_badges(uuid) to authenticated, service_role;
alter function public.check_reviewer_badges(uuid) set search_path = pg_catalog, public, pg_temp;

revoke all on function public.check_social_badges(uuid) from public, anon;
grant execute on function public.check_social_badges(uuid) to authenticated, service_role;
alter function public.check_social_badges(uuid) set search_path = pg_catalog, public, pg_temp;

-- Badge reads are public by design, but the definer function still needs a pinned path.
alter function public.get_user_badges(uuid) set search_path = pg_catalog, public, pg_temp;

-- The badge checks accept a user ID, so enforce self/admin/service authorization
-- inside the SECURITY DEFINER functions, not just at the API boundary.
create or replace function public.check_streak_badges(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_streak integer;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and not (auth.uid() is not null and auth.uid() = p_user_id)
     and not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select streak_days into v_streak from public.profiles where id = p_user_id;
  if v_streak is null then return; end if;

  if v_streak >= 7 then
    perform public.award_trust_badge('user', p_user_id, 'streak_7');
  end if;
  if v_streak >= 30 then
    perform public.award_trust_badge('user', p_user_id, 'streak_30');
  end if;
  if v_streak >= 100 then
    perform public.award_trust_badge('user', p_user_id, 'streak_100');
  end if;
end;
$$;

create or replace function public.check_reviewer_badges(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_count integer;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and not (auth.uid() is not null and auth.uid() = p_user_id)
     and not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select count(*) into v_count
  from public.business_reviews
  where user_id = p_user_id and status = 'approved';

  if v_count >= 1 then
    perform public.award_trust_badge('user', p_user_id, 'first_review');
  end if;
  if v_count >= 10 then
    perform public.award_trust_badge('user', p_user_id, 'reviewer_10');
  end if;
  if v_count >= 50 then
    perform public.award_trust_badge('user', p_user_id, 'reviewer_50');
  end if;
  if v_count >= 100 then
    perform public.award_trust_badge('user', p_user_id, 'reviewer_100');
  end if;
end;
$$;

create or replace function public.check_social_badges(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_follows integer;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and not (auth.uid() is not null and auth.uid() = p_user_id)
     and not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select count(*) into v_follows
  from public.business_follows where user_id = p_user_id;

  if v_follows >= 1 then
    perform public.award_trust_badge('user', p_user_id, 'first_follow');
  end if;
  if v_follows >= 10 then
    perform public.award_trust_badge('user', p_user_id, 'follower_10');
  end if;
end;
$$;

-- These SECURITY DEFINER functions are trigger-only, not client RPCs.
-- PostgreSQL checks EXECUTE when a trigger is created; revoking it here keeps
-- untrusted roles from attaching these privileged functions to attacker-owned temp tables.
-- Existing triggers continue to fire.
revoke all on function public.apply_wanted_level_on_report() from public, anon, authenticated, service_role;
revoke all on function public.detect_multi_account_signup() from public, anon, authenticated, service_role;
revoke all on function public.handle_referral_first_order() from public, anon, authenticated, service_role;
revoke all on function public.handle_referral_signup() from public, anon, authenticated, service_role;
revoke all on function public.log_review_changes() from public, anon, authenticated, service_role;
revoke all on function public.recalc_wanted_level_on_resolve() from public, anon, authenticated, service_role;
revoke all on function public.refresh_business_counts() from public, anon, authenticated, service_role;
revoke all on function public.refresh_business_scores() from public, anon, authenticated, service_role;
revoke all on function public.refresh_comment_likes() from public, anon, authenticated, service_role;
revoke all on function public.comment_rate_limit() from public, anon, authenticated, service_role;
revoke all on function public.detect_review_velocity() from public, anon, authenticated, service_role;
revoke all on function public.on_order_confirmed() from public, anon, authenticated, service_role;
revoke all on function public.on_review_added() from public, anon, authenticated, service_role;
revoke all on function public.on_trust_updated() from public, anon, authenticated, service_role;
revoke all on function public.prevent_self_order() from public, anon, authenticated, service_role;
revoke all on function public.prevent_self_review() from public, anon, authenticated, service_role;
revoke all on function public.set_comment_depth() from public, anon, authenticated, service_role;

-- Pin trusted schemas for trigger-only SECURITY DEFINER functions as defence in depth.
alter function public.apply_wanted_level_on_report() set search_path = pg_catalog, public, pg_temp;
alter function public.detect_multi_account_signup() set search_path = pg_catalog, public, pg_temp;
alter function public.handle_referral_first_order() set search_path = pg_catalog, public, pg_temp;
alter function public.handle_referral_signup() set search_path = pg_catalog, public, pg_temp;
alter function public.log_review_changes() set search_path = pg_catalog, public, pg_temp;
alter function public.recalc_wanted_level_on_resolve() set search_path = pg_catalog, public, pg_temp;
alter function public.refresh_business_counts() set search_path = pg_catalog, public, pg_temp;
alter function public.refresh_business_scores() set search_path = pg_catalog, public, pg_temp;
alter function public.refresh_comment_likes() set search_path = pg_catalog, public, pg_temp;
alter function public.comment_rate_limit() set search_path = pg_catalog, public, pg_temp;
alter function public.detect_review_velocity() set search_path = pg_catalog, public, pg_temp;
alter function public.on_order_confirmed() set search_path = pg_catalog, public, pg_temp;
alter function public.on_review_added() set search_path = pg_catalog, public, pg_temp;
alter function public.on_trust_updated() set search_path = pg_catalog, public, pg_temp;
alter function public.prevent_self_order() set search_path = pg_catalog, public, pg_temp;
alter function public.prevent_self_review() set search_path = pg_catalog, public, pg_temp;
alter function public.set_comment_depth() set search_path = pg_catalog, public, pg_temp;

-- Additional SECURITY DEFINER trigger handlers are executable by authenticated today.
-- Revoke client EXECUTE so only trusted database owners can attach them to triggers.
revoke all on function public.assign_order_code_v2() from public, anon, authenticated, service_role;
revoke all on function public.auto_flag_review() from public, anon, authenticated, service_role;
revoke all on function public.auto_referral_code() from public, anon, authenticated, service_role;
revoke all on function public.grant_trial_on_owner() from public, anon, authenticated, service_role;
revoke all on function public.lock_order_message() from public, anon, authenticated, service_role;
revoke all on function public.notify_partner_invitation() from public, anon, authenticated, service_role;
revoke all on function public.set_referral_code() from public, anon, authenticated, service_role;
alter function public.assign_order_code_v2() set search_path = pg_catalog, public, pg_temp;
alter function public.auto_flag_review() set search_path = pg_catalog, public, pg_temp;
alter function public.auto_referral_code() set search_path = pg_catalog, public, pg_temp;
alter function public.grant_trial_on_owner() set search_path = pg_catalog, public, pg_temp;
alter function public.lock_order_message() set search_path = pg_catalog, public, pg_temp;
alter function public.notify_partner_invitation() set search_path = pg_catalog, public, pg_temp;
alter function public.set_referral_code() set search_path = pg_catalog, public, pg_temp;

-- Admin RPCs already check private.is_admin() internally. Remove anonymous execution
-- and keep the authenticated check as defense in depth.
revoke all on function public.admin_get_profiles() from public, anon;
grant execute on function public.admin_get_profiles() to authenticated, service_role;

revoke all on function public.admin_get_business_owners() from public, anon;
grant execute on function public.admin_get_business_owners() to authenticated, service_role;

alter function public.admin_get_profiles() set search_path = pg_catalog, public, pg_temp;
alter function public.admin_get_business_owners() set search_path = pg_catalog, public, pg_temp;

-- Referral data is private to the referrer. A caller must own the requested user ID
-- or pass the existing server-side admin check.
create or replace function public.get_referral_list(p_user_id uuid, p_limit integer default 50)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  signup_at timestamptz,
  first_order_at timestamptz,
  points_awarded integer
)
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select
    r.id,
    p.display_name,
    p.avatar_url,
    r.signup_at,
    r.first_order_at,
    (r.points_awarded_signup + r.points_awarded_first_order)::integer
  from public.referrals as r
  join public.profiles as p on p.id = r.referred_id
  where r.referrer_id = p_user_id
    and (auth.uid() = p_user_id or public.is_admin())
  order by r.signup_at desc
  limit greatest(0, least(coalesce(p_limit, 20), 100));
$$;

create or replace function public.get_referral_stats(p_user_id uuid)
returns table (
  total_invited bigint,
  signed_up bigint,
  first_order bigint,
  total_points bigint
)
language sql
stable
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  select
    count(*)::bigint,
    count(*) filter (where r.signup_at is not null)::bigint,
    count(*) filter (where r.first_order_at is not null)::bigint,
    coalesce(sum(r.points_awarded_signup + r.points_awarded_first_order), 0)::bigint
  from public.referrals as r
  where r.referrer_id = p_user_id
    and (auth.uid() = p_user_id or public.is_admin());
$$;

revoke all on function public.get_referral_list(uuid, integer) from public, anon;
grant execute on function public.get_referral_list(uuid, integer) to authenticated;

revoke all on function public.get_referral_stats(uuid) from public, anon;
grant execute on function public.get_referral_stats(uuid) to authenticated;

-- Pin default search paths for functions flagged by Supabase, including the temp schema last.
alter function public.set_new_until() set search_path = pg_catalog, public, pg_temp;
alter function public.get_trust_tier(integer) set search_path = pg_catalog, public, pg_temp;
alter function public.is_admin() set search_path = pg_catalog, public, pg_temp;

notify pgrst, 'reload schema';

commit;
