create or replace function public.admin_top_pages_analytics(p_days integer default 7)
returns table (path text, views bigint, unique_visitors bigint, live_visitors bigint)
language sql security definer set search_path = public, private, pg_temp as $$
  select e.path,
    count(*) as views,
    count(distinct e.visitor_id) as unique_visitors,
    (select count(distinct s.session_id) from public.live_page_sessions s where s.path=e.path and s.last_seen_at >= now()-interval '2 minutes') as live_visitors
  from public.page_view_events e
  where e.event_scope='site'
    and e.occurred_at >= now()-make_interval(days=>greatest(1,least(p_days,365)))
  group by e.path
  order by views desc, unique_visitors desc
  limit 50;
$$;
revoke all on function public.admin_top_pages_analytics(integer) from public;
grant execute on function public.admin_top_pages_analytics(integer) to authenticated;
