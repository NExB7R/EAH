alter table public.page_view_events add column if not exists event_scope text not null default 'site';
alter table public.page_view_events add constraint page_view_events_scope_check check (event_scope in ('site','business'));
create index if not exists page_view_events_scope_time_idx on public.page_view_events (event_scope, occurred_at desc);

create or replace function public.record_page_view(p_path text,p_visitor_id uuid,p_session_id uuid,p_business_id uuid default null,p_referrer text default null,p_device_type text default null)
returns void language plpgsql security definer set search_path = public, private, pg_temp as $$
begin
  if p_path is null or char_length(trim(p_path)) = 0 or char_length(p_path) > 500 then raise exception 'invalid_path'; end if;
  if p_business_id is not null and not exists (select 1 from public.businesses b where b.id = p_business_id and b.is_published = true) then raise exception 'business_not_published'; end if;
  insert into public.page_view_events (business_id,path,visitor_id,session_id,event_scope,referrer,device_type)
  values (p_business_id,left(trim(p_path),500),p_visitor_id,p_session_id,case when p_business_id is null then 'site' else 'business' end,left(p_referrer,1000),left(p_device_type,50));
  insert into public.live_page_sessions (session_id,visitor_id,business_id,path)
  values (p_session_id,p_visitor_id,p_business_id,left(trim(p_path),500))
  on conflict (session_id) do update set visitor_id=excluded.visitor_id,business_id=excluded.business_id,path=excluded.path,last_seen_at=now();
end;
$$;

create or replace function public.admin_analytics_summary()
returns jsonb language plpgsql security definer set search_path = public, private, pg_temp as $$
declare result jsonb;
begin
  if not private.is_admin(auth.uid()) then raise exception 'admin_required'; end if;
  select jsonb_build_object(
    'site_views_today',(select count(*) from public.page_view_events where event_scope='site' and occurred_at >= date_trunc('day',now())),
    'site_views_7d',(select count(*) from public.page_view_events where event_scope='site' and occurred_at >= now()-interval '7 days'),
    'site_unique_visitors_today',(select count(distinct visitor_id) from public.page_view_events where event_scope='site' and occurred_at >= date_trunc('day',now())),
    'site_unique_visitors_7d',(select count(distinct visitor_id) from public.page_view_events where event_scope='site' and occurred_at >= now()-interval '7 days'),
    'business_views_today',(select count(*) from public.page_view_events where event_scope='business' and occurred_at >= date_trunc('day',now())),
    'business_views_7d',(select count(*) from public.page_view_events where event_scope='business' and occurred_at >= now()-interval '7 days'),
    'live_visitors',(select count(distinct session_id) from public.live_page_sessions where last_seen_at >= now()-interval '2 minutes'),
    'live_business_visitors',(select count(distinct session_id) from public.live_page_sessions where business_id is not null and last_seen_at >= now()-interval '2 minutes')
  ) into result;
  return result;
end;
$$;

create or replace function public.admin_daily_analytics(p_days integer default 7)
returns table (day date, views bigint, unique_visitors bigint)
language sql security definer set search_path = public, private, pg_temp as $$
  select gs.day::date,count(e.id) as views,count(distinct e.visitor_id) as unique_visitors
  from generate_series(current_date - (greatest(1,least(p_days,365))-1),current_date,interval '1 day') gs(day)
  left join public.page_view_events e on e.event_scope='site' and e.occurred_at >= gs.day and e.occurred_at < gs.day+interval '1 day'
  group by gs.day order by gs.day;
$$;

revoke all on function public.admin_analytics_summary() from public;
grant execute on function public.admin_analytics_summary() to authenticated;
revoke all on function public.admin_daily_analytics(integer) from public;
grant execute on function public.admin_daily_analytics(integer) to authenticated;
