create table if not exists public.page_view_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  path text not null,
  visitor_id uuid not null,
  session_id uuid not null,
  occurred_at timestamptz not null default now(),
  referrer text,
  device_type text,
  constraint page_view_events_path_check check (char_length(path) between 1 and 500)
);

create index if not exists page_view_events_business_time_idx on public.page_view_events (business_id, occurred_at desc);
create index if not exists page_view_events_time_idx on public.page_view_events (occurred_at desc);
create index if not exists page_view_events_visitor_time_idx on public.page_view_events (visitor_id, occurred_at desc);

create table if not exists public.live_page_sessions (
  session_id uuid primary key,
  visitor_id uuid not null,
  business_id uuid references public.businesses(id) on delete cascade,
  path text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists live_page_sessions_last_seen_idx on public.live_page_sessions (last_seen_at desc);
create index if not exists live_page_sessions_business_last_seen_idx on public.live_page_sessions (business_id, last_seen_at desc);

alter table public.page_view_events enable row level security;
alter table public.live_page_sessions enable row level security;

revoke all on table public.page_view_events, public.live_page_sessions from anon, authenticated;
grant select on table public.page_view_events, public.live_page_sessions to authenticated;

drop policy if exists page_view_events_admin_select on public.page_view_events;
drop policy if exists live_sessions_admin_select on public.live_page_sessions;
create policy page_view_events_admin_select on public.page_view_events for select to authenticated using ((select private.is_admin()));
create policy live_sessions_admin_select on public.live_page_sessions for select to authenticated using ((select private.is_admin()));

create or replace function public.record_page_view(p_path text,p_visitor_id uuid,p_session_id uuid,p_business_id uuid default null,p_referrer text default null,p_device_type text default null)
returns void language plpgsql security definer set search_path = public, private, pg_temp as $$
begin
  if p_path is null or char_length(trim(p_path)) = 0 or char_length(p_path) > 500 then raise exception 'invalid_path'; end if;
  if p_business_id is not null and not exists (select 1 from public.businesses b where b.id = p_business_id and b.is_published = true) then raise exception 'business_not_published'; end if;
  insert into public.page_view_events (business_id,path,visitor_id,session_id,referrer,device_type) values (p_business_id,left(trim(p_path),500),p_visitor_id,p_session_id,left(p_referrer,1000),left(p_device_type,50));
  insert into public.live_page_sessions (session_id,visitor_id,business_id,path) values (p_session_id,p_visitor_id,p_business_id,left(trim(p_path),500))
  on conflict (session_id) do update set visitor_id=excluded.visitor_id,business_id=excluded.business_id,path=excluded.path,last_seen_at=now();
end;
$$;

create or replace function public.heartbeat_page_session(p_session_id uuid,p_path text,p_business_id uuid default null)
returns void language plpgsql security definer set search_path = public, private, pg_temp as $$
begin
  update public.live_page_sessions set path=left(trim(p_path),500),business_id=p_business_id,last_seen_at=now() where session_id=p_session_id;
end;
$$;

revoke all on function public.record_page_view(text,uuid,uuid,uuid,text,text) from public;
grant execute on function public.record_page_view(text,uuid,uuid,uuid,text,text) to anon, authenticated;
revoke all on function public.heartbeat_page_session(uuid,text,uuid) from public;
grant execute on function public.heartbeat_page_session(uuid,text,uuid) to anon, authenticated;

create or replace function public.admin_analytics_summary()
returns jsonb language plpgsql security definer set search_path = public, private, pg_temp as $$
declare result jsonb;
begin
  if not private.is_admin(auth.uid()) then raise exception 'admin_required'; end if;
  select jsonb_build_object(
    'views_today',(select count(*) from public.page_view_events where occurred_at >= date_trunc('day',now())),
    'views_7d',(select count(*) from public.page_view_events where occurred_at >= now()-interval '7 days'),
    'views_30d',(select count(*) from public.page_view_events where occurred_at >= now()-interval '30 days'),
    'unique_visitors_today',(select count(distinct visitor_id) from public.page_view_events where occurred_at >= date_trunc('day',now())),
    'unique_visitors_7d',(select count(distinct visitor_id) from public.page_view_events where occurred_at >= now()-interval '7 days'),
    'unique_visitors_30d',(select count(distinct visitor_id) from public.page_view_events where occurred_at >= now()-interval '30 days'),
    'live_visitors',(select count(distinct session_id) from public.live_page_sessions where last_seen_at >= now()-interval '2 minutes'),
    'live_business_visitors',(select count(distinct session_id) from public.live_page_sessions where business_id is not null and last_seen_at >= now()-interval '2 minutes')
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_analytics_summary() from public;
grant execute on function public.admin_analytics_summary() to authenticated;

create or replace function public.admin_top_businesses_analytics(p_days integer default 7)
returns table (business_id uuid,business_name text,views bigint,unique_visitors bigint,live_visitors bigint)
language sql security definer set search_path = public, private, pg_temp as $$
  select b.id,b.name,count(e.id) as views,count(distinct e.visitor_id) as unique_visitors,
    (select count(distinct s.session_id) from public.live_page_sessions s where s.business_id=b.id and s.last_seen_at >= now()-interval '2 minutes') as live_visitors
  from public.businesses b
  left join public.page_view_events e on e.business_id=b.id and e.occurred_at >= now()-make_interval(days => greatest(1,least(p_days,365)))
  where b.is_published=true
  group by b.id,b.name
  order by views desc,unique_visitors desc
  limit 25;
$$;
revoke all on function public.admin_top_businesses_analytics(integer) from public;
grant execute on function public.admin_top_businesses_analytics(integer) to authenticated;

create or replace function public.merchant_business_analytics(p_business_id uuid,p_days integer default 7)
returns jsonb language plpgsql security definer set search_path = public, private, pg_temp as $$
declare result jsonb; v_days integer := greatest(1,least(p_days,365));
begin
  if not private.has_business_permission(p_business_id,'business.view',auth.uid()) then raise exception 'business_view_permission_required'; end if;
  select jsonb_build_object(
    'business_id',p_business_id,'days',v_days,
    'views',(select count(*) from public.page_view_events where business_id=p_business_id and occurred_at >= now()-make_interval(days=>v_days)),
    'unique_visitors',(select count(distinct visitor_id) from public.page_view_events where business_id=p_business_id and occurred_at >= now()-make_interval(days=>v_days)),
    'live_visitors',(select count(distinct session_id) from public.live_page_sessions where business_id=p_business_id and last_seen_at >= now()-interval '2 minutes'),
    'today_views',(select count(*) from public.page_view_events where business_id=p_business_id and occurred_at >= date_trunc('day',now())),
    'yesterday_views',(select count(*) from public.page_view_events where business_id=p_business_id and occurred_at >= date_trunc('day',now())-interval '1 day' and occurred_at < date_trunc('day',now())),
    'week_views',(select count(*) from public.page_view_events where business_id=p_business_id and occurred_at >= date_trunc('week',now())),
    'month_views',(select count(*) from public.page_view_events where business_id=p_business_id and occurred_at >= date_trunc('month',now()))
  ) into result;
  return result;
end;
$$;
revoke all on function public.merchant_business_analytics(uuid,integer) from public;
grant execute on function public.merchant_business_analytics(uuid,integer) to authenticated;
