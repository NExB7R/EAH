-- =========================================================
-- EAH Migration: Subscription System
-- Date: 2026-09-14
-- Purpose: featured/premium subscriptions for businesses
-- Flow: merchant requests → admin approves → 30-day trial
--       → daily notifications in last 7 days → auto-expire
-- =========================================================

-- ═══ Plans (admin-managed) ═══
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  description text,
  duration_days int not null default 30,
  price_egp numeric(10,2),                 -- NULL = contact us
  trial_days int not null default 0,       -- free trial (0 = no trial)
  features jsonb not null default '[]'::jsonb,  -- ["featured_badge","ads","offers_gallery"]
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscription_plans_active_idx
  on public.subscription_plans (display_order) where is_active = true;

-- ═══ Subscriptions ═══
create table if not exists public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  status text not null default 'pending',
  -- status: pending | trial | active | expired | rejected | cancelled
  is_trial boolean not null default false,
  starts_at timestamptz,
  expires_at timestamptz,
  activated_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  rejected_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_subscriptions_status_ck
    check (status in ('pending','trial','active','expired','rejected','cancelled'))
);

create index if not exists business_subscriptions_business_idx
  on public.business_subscriptions (business_id, status);
create index if not exists business_subscriptions_status_idx
  on public.business_subscriptions (status);
create index if not exists business_subscriptions_expires_idx
  on public.business_subscriptions (expires_at) where status in ('trial','active');

-- Only one active subscription per business at a time
create unique index if not exists business_subscriptions_one_active_idx
  on public.business_subscriptions (business_id)
  where status in ('trial','active');

-- ═══ Events (audit log) ═══
create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.business_subscriptions(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type text not null,
  -- event_type: requested | approved | rejected | trial_started | trial_expiring | expired | renewed | cancelled | payment_received
  actor_id uuid references auth.users(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists subscription_events_business_idx
  on public.subscription_events (business_id, created_at desc);
create index if not exists subscription_events_type_idx
  on public.subscription_events (event_type, created_at desc);

-- ═══ RLS ═══
alter table public.subscription_plans enable row level security;
alter table public.business_subscriptions enable row level security;
alter table public.subscription_events enable row level security;

-- Plans: everyone can read active plans
drop policy if exists plans_public_read on public.subscription_plans;
create policy plans_public_read on public.subscription_plans
  for select to anon, authenticated using (is_active = true);

drop policy if exists plans_admin_all on public.subscription_plans;
create policy plans_admin_all on public.subscription_plans
  for all to authenticated using ((select private.is_admin()));

-- Subscriptions: owner can read own, admin full
drop policy if exists subs_owner_read on public.business_subscriptions;
create policy subs_owner_read on public.business_subscriptions
  for select to authenticated using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and b.owner_profile_id = auth.uid()
    )
  );

drop policy if exists subs_admin_all on public.business_subscriptions;
create policy subs_admin_all on public.business_subscriptions
  for all to authenticated using ((select private.is_admin()));

-- Merchant can request subscription (insert pending)
drop policy if exists subs_owner_request on public.business_subscriptions;
create policy subs_owner_request on public.business_subscriptions
  for insert to authenticated with check (
    status = 'pending'
    and exists (
      select 1 from public.businesses b
      where b.id = business_id
        and b.owner_profile_id = auth.uid()
    )
  );

-- Events: owner read own, admin full
drop policy if exists events_owner_read on public.subscription_events;
create policy events_owner_read on public.subscription_events
  for select to authenticated using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and b.owner_profile_id = auth.uid()
    )
  );

drop policy if exists events_admin_all on public.subscription_events;
create policy events_admin_all on public.subscription_events
  for all to authenticated using ((select private.is_admin()));

-- ═══ Seed default plans ═══
insert into public.subscription_plans (code, name_ar, description, duration_days, price_egp, trial_days, features, display_order)
values
  ('featured_monthly', 'مميز شهري', 'شارة مميزة + أولوية عرض + إعلان واحد', 30, null, 30, '["featured_badge","priority_ranking","one_ad"]'::jsonb, 10),
  ('featured_quarterly', 'مميز ربع سنوي', '3 شهور — مميز + 3 إعلانات', 90, null, 30, '["featured_badge","priority_ranking","three_ads","offers_gallery"]'::jsonb, 20),
  ('featured_yearly', 'مميز سنوي', 'سنة كاملة — كل المميزات + أولوية دعم', 365, null, 30, '["featured_badge","priority_ranking","unlimited_ads","offers_gallery","priority_support"]'::jsonb, 30)
on conflict (code) do nothing;

-- ═══ RPC: get business subscription status ═══
create or replace function public.get_business_subscription(p_business_id uuid)
returns table (
  subscription_id uuid,
  plan_code text,
  plan_name text,
  status text,
  is_trial boolean,
  starts_at timestamptz,
  expires_at timestamptz,
  days_left int,
  features jsonb
)
language sql stable security definer
set search_path = public
as $$
  select
    s.id as subscription_id,
    p.code as plan_code,
    p.name_ar as plan_name,
    s.status,
    s.is_trial,
    s.starts_at,
    s.expires_at,
    case
      when s.expires_at is null then null
      else greatest(0, extract(day from (s.expires_at - now()))::int)
    end as days_left,
    coalesce(p.features, '[]'::jsonb) as features
  from public.business_subscriptions s
  left join public.subscription_plans p on p.id = s.plan_id
  where s.business_id = p_business_id
    and s.status in ('trial','active')
  order by s.created_at desc
  limit 1;
$$;

revoke all on function public.get_business_subscription(uuid) from public;
grant execute on function public.get_business_subscription(uuid) to authenticated;

-- ═══ RPC: expire old subscriptions (called by cron) ═══
create or replace function public.expire_old_subscriptions()
returns int
language plpgsql security definer
set search_path = public
as $$
declare
  v_count int := 0;
  r record;
begin
  for r in
    select id, business_id
    from public.business_subscriptions
    where status in ('trial','active')
      and expires_at is not null
      and expires_at <= now()
  loop
    update public.business_subscriptions
       set status = 'expired',
           updated_at = now()
     where id = r.id;

    insert into public.subscription_events (subscription_id, business_id, event_type, metadata)
    values (r.id, r.business_id, 'expired', '{"reason":"auto"}'::jsonb);

    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;

revoke all on function public.expire_old_subscriptions() from public;
grant execute on function public.expire_old_subscriptions() to authenticated;

-- ═══ Trigger: updated_at ═══
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists business_subscriptions_touch on public.business_subscriptions;
create trigger business_subscriptions_touch
  before update on public.business_subscriptions
  for each row execute function public.touch_updated_at();

drop trigger if exists subscription_plans_touch on public.subscription_plans;
create trigger subscription_plans_touch
  before update on public.subscription_plans
  for each row execute function public.touch_updated_at();

-- =========================================================
-- Verification:
-- select * from public.subscription_plans order by display_order;
-- select * from public.get_business_subscription('some-uuid');
