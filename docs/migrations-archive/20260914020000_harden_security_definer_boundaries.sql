-- EAH security hardening: preserve existing RPC contracts while enforcing caller boundaries.

create or replace function public.admin_daily_analytics(p_days integer default 7)
returns table(day date, views bigint, unique_visitors bigint)
language sql
security definer
set search_path = public, private, pg_temp
as $$
  select gs.day::date, count(e.id), count(distinct e.visitor_id)
  from generate_series(current_date - (greatest(1, least(p_days, 365)) - 1), current_date, interval '1 day') gs(day)
  left join public.page_view_events e
    on e.event_scope = 'site' and e.occurred_at >= gs.day and e.occurred_at < gs.day + interval '1 day'
  where private.is_admin(auth.uid())
     or current_setting('request.jwt.claim.role', true) = 'service_role'
  group by gs.day order by gs.day;
$$;

create or replace function public.admin_top_businesses_analytics(p_days integer default 7)
returns table(business_id uuid, business_name text, views bigint, unique_visitors bigint, live_visitors bigint)
language sql
security definer
set search_path = public, private, pg_temp
as $$
  select b.id, b.name, count(e.id), count(distinct e.visitor_id),
    (select count(distinct s.session_id) from public.live_page_sessions s
      where s.business_id=b.id and s.last_seen_at >= now()-interval '2 minutes')
  from public.businesses b
  left join public.page_view_events e
    on e.business_id=b.id and e.occurred_at >= now()-make_interval(days=>greatest(1,least(p_days,365)))
  where b.is_published=true
    and (private.is_admin(auth.uid()) or current_setting('request.jwt.claim.role', true)='service_role')
  group by b.id,b.name order by count(e.id) desc,count(distinct e.visitor_id) desc limit 25;
$$;

create or replace function public.admin_top_pages_analytics(p_days integer default 7)
returns table(path text, views bigint, unique_visitors bigint, live_visitors bigint)
language sql
security definer
set search_path = public, private, pg_temp
as $$
  select e.path, count(*), count(distinct e.visitor_id),
    (select count(distinct s.session_id) from public.live_page_sessions s
      where s.path=e.path and s.last_seen_at >= now()-interval '2 minutes')
  from public.page_view_events e
  where e.event_scope='site'
    and e.occurred_at >= now()-make_interval(days=>greatest(1,least(p_days,365)))
    and (private.is_admin(auth.uid()) or current_setting('request.jwt.claim.role', true)='service_role')
  group by e.path order by count(*) desc,count(distinct e.visitor_id) desc limit 50;
$$;

create or replace function public.check_verification_eligibility(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_phone_ok boolean; v_age_ok boolean; v_trust_ok boolean; v_not_banned boolean;
  v_activity_ok boolean; v_name_ok boolean; v_display_name text; v_trust int;
  v_created timestamptz; v_review_count int; v_fav_count int; v_banned timestamptz;
  v_phone_verified timestamptz;
begin
  if current_setting('request.jwt.claim.role', true) <> 'service_role'
     and not private.is_admin(auth.uid())
     and auth.uid() is distinct from p_user_id then
    raise exception 'verification_eligibility_forbidden';
  end if;

  select display_name,trust_score,created_at,banned_until,phone_verified_at
    into v_display_name,v_trust,v_created,v_banned,v_phone_verified
  from public.profiles where id=p_user_id;
  if v_created is null then return jsonb_build_object('eligible',false,'reason','user_not_found'); end if;

  select count(*) into v_review_count from public.business_reviews where user_id=p_user_id;
  select count(*) into v_fav_count from public.favorites where user_id=p_user_id;
  v_phone_ok := v_phone_verified is not null;
  v_age_ok := v_created < now()-interval '7 days';
  v_trust_ok := coalesce(v_trust,0) >= 50;
  v_not_banned := v_banned is null or v_banned < now();
  v_activity_ok := v_review_count >= 3 or v_fav_count >= 5;
  v_name_ok := v_display_name is not null and array_length(string_to_array(trim(v_display_name),' '),1) >= 2;

  return jsonb_build_object(
    'eligible',v_phone_ok and v_age_ok and v_trust_ok and v_not_banned and v_activity_ok and v_name_ok,
    'checks',jsonb_build_object('phone_verified',v_phone_ok,'account_age',v_age_ok,'trust_score',v_trust_ok,'not_banned',v_not_banned,'activity',v_activity_ok,'real_name',v_name_ok),
    'stats',jsonb_build_object('trust_score',coalesce(v_trust,0),'review_count',v_review_count,'favorite_count',v_fav_count,'account_age_days',extract(day from now()-v_created)::int)
  );
end;
$$;

create or replace function public.get_business_subscription(p_business_id uuid)
returns table(subscription_id uuid, plan_code text, plan_name text, status text, is_trial boolean, starts_at timestamptz, expires_at timestamptz, days_left integer, features jsonb)
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select s.id,p.code,p.name_ar,s.status,s.is_trial,s.starts_at,s.expires_at,
    case when s.expires_at is null then null else greatest(0,extract(day from (s.expires_at-now()))::int) end,
    coalesce(p.features,'{}'::jsonb)
  from public.business_subscriptions s
  left join public.subscription_plans p on p.id=s.plan_id
  where s.business_id=p_business_id and s.status in ('trial','active')
    and (current_setting('request.jwt.claim.role', true)='service_role'
      or private.is_admin(auth.uid())
      or private.has_business_permission(p_business_id,'business.view',auth.uid()))
  order by s.created_at desc limit 1;
$$;

create or replace function public.expire_old_subscriptions()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_count int:=0; r record;
begin
  if current_setting('request.jwt.claim.role', true)<>'service_role' and not private.is_admin(auth.uid()) then
    raise exception 'admin_required';
  end if;
  for r in select id,business_id from public.business_subscriptions
    where status in ('trial','active') and expires_at is not null and expires_at<=now()
  loop
    update public.business_subscriptions set status='expired',updated_at=now() where id=r.id;
    insert into public.subscription_events(subscription_id,business_id,event_type,metadata)
    values(r.id,r.business_id,'expired','{"reason":"auto"}'::jsonb);
    v_count:=v_count+1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, pg_temp
as $$
begin new.updated_at := now(); return new; end;
$$;

create or replace function public.is_open_now(p_working_hours jsonb)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog, pg_temp
as $$
declare v_day text; v_open text; v_close text; v_now text;
begin
  if p_working_hours is null then return false; end if;
  v_day:=lower(trim(to_char(now() at time zone 'Africa/Cairo','dy')));
  if not (p_working_hours ? v_day) then
    v_day:=lower(to_char(now() at time zone 'Africa/Cairo','day')); v_day:=trim(v_day);
  end if;
  v_open:=p_working_hours->v_day->>'open'; v_close:=p_working_hours->v_day->>'close';
  if v_open is null or v_close is null then return false; end if;
  v_now:=to_char(now() at time zone 'Africa/Cairo','HH24:MI');
  if v_open<=v_close then return v_now>=v_open and v_now<v_close;
  else return v_now>=v_open or v_now<v_close; end if;
end;
$$;
