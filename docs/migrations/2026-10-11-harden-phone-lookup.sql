-- EAH — Security hardening: phone lookup
-- Date: 2026-10-11
-- Apply only after reviewing this migration against the current production schema.
-- Rollout order: deploy the matching server-side application changes first, then apply this SQL.
-- Keep the fields required by the existing UI, but require authentication and
-- prevent anonymous RPC calls.

begin;

create or replace function public.find_by_phone(p_phone text)
returns table (
  user_id uuid,
  display_name text,
  alias text,
  avatar_url text,
  trust_score integer,
  trust_tier text,
  legend_points integer,
  is_premium boolean,
  is_business boolean,
  business_slug text,
  business_name text,
  member_since timestamptz
)
language sql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
  with normalized as (
    select case
      when p_phone like '0%' then p_phone
      when p_phone like '+20%' then '0' || pg_catalog.substring(p_phone from 4)
      when p_phone like '20%' then '0' || pg_catalog.substring(p_phone from 3)
      else p_phone
    end as phone_local
  ),
  found as (
    select p.*
    from public.profiles as p
    cross join normalized as n
    where p.phone = n.phone_local
    limit 1
  )
  select
    f.id as user_id,
    f.display_name,
    f.alias,
    f.avatar_url,
    f.trust_score,
    f.trust_tier,
    f.legend_points,
    f.is_premium,
    (b.id is not null) as is_business,
    b.slug as business_slug,
    b.name as business_name,
    f.created_at as member_since
  from found as f
  left join public.businesses as b
    on b.owner_profile_id = f.id
   and b.is_published = true
  limit 1;
$$;

revoke all on function public.find_by_phone(text) from public, anon, authenticated;
grant execute on function public.find_by_phone(text) to service_role;

notify pgrst, 'reload schema';

commit;
