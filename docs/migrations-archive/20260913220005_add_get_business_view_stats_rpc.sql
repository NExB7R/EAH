-- =========================================================
-- EAH: RPC get_business_view_stats
-- Purpose: public aggregate view stats (no visitor_id leak)
-- Safe: security definer + bounded input + RLS bypass
-- =========================================================

create or replace function public.get_business_view_stats(
  p_slugs text[],
  p_days int default 7
)
returns table (
  slug text,
  views bigint,
  unique_visitors bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select
      greatest(1, least(coalesce(p_days, 7), 90)) as days,
      coalesce(p_slugs, '{}'::text[]) as slugs
  )
  select
    b.slug,
    count(e.id)::bigint as views,
    count(distinct e.visitor_id)::bigint as unique_visitors
  from public.businesses b
  cross join bounds
  left join public.page_view_events e
    on e.business_id = b.id
   and e.occurred_at >= now() - make_interval(days => bounds.days)
  where b.slug = any(bounds.slugs)
  group by b.slug;
$$;

revoke all on function public.get_business_view_stats(text[], int) from public;
grant execute on function public.get_business_view_stats(text[], int) to anon, authenticated;

-- Verify:
-- select * from public.get_business_view_stats(array['your-slug'], 7);
