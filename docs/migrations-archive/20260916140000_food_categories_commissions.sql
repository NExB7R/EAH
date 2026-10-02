-- EAH: Food categories + per-business commission + trial config

-- ═══ 1. Food categories (per business, multi) ═══
create table if not exists public.business_food_categories (
  business_id uuid not null references public.businesses(id) on delete cascade,
  category_key text not null,
  created_at timestamptz not null default now(),
  primary key (business_id, category_key)
);

create index if not exists bfc_key_idx on public.business_food_categories (category_key);
create index if not exists bfc_biz_idx on public.business_food_categories (business_id);

alter table public.business_food_categories enable row level security;

drop policy if exists bfc_read on public.business_food_categories;
create policy bfc_read on public.business_food_categories
  for select to anon, authenticated using (true);

drop policy if exists bfc_write on public.business_food_categories;
create policy bfc_write on public.business_food_categories
  for all to authenticated
  using (
    business_id in (select id from public.businesses where owner_profile_id = auth.uid())
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  )
  with check (
    business_id in (select id from public.businesses where owner_profile_id = auth.uid())
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  );

-- ═══ 2. Commission per business (admin controlled) ═══
create table if not exists public.business_commissions (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  commission_percent numeric(4,2) not null default 0 check (commission_percent >= 0 and commission_percent <= 100),
  notes text,
  set_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.business_commissions enable row level security;

drop policy if exists bc_read on public.business_commissions;
create policy bc_read on public.business_commissions
  for select to authenticated
  using (
    business_id in (select id from public.businesses where owner_profile_id = auth.uid())
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  );

drop policy if exists bc_write on public.business_commissions;
create policy bc_write on public.business_commissions
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'));

-- RPC: set commission
create or replace function public.set_business_commission(
  p_business_id uuid, p_percent numeric, p_notes text default null
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_caller uuid := auth.uid();
begin
  if v_caller is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  if not exists (select 1 from public.user_roles where user_id = v_caller and role = 'super_admin') then
    return jsonb_build_object('ok', false, 'error', 'not_admin');
  end if;
  if p_percent < 0 or p_percent > 100 then
    return jsonb_build_object('ok', false, 'error', 'invalid_percent');
  end if;
  insert into public.business_commissions (business_id, commission_percent, notes, set_by, updated_at)
  values (p_business_id, p_percent, p_notes, v_caller, now())
  on conflict (business_id) do update
    set commission_percent = p_percent, notes = p_notes, set_by = v_caller, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.set_business_commission(uuid, numeric, text) from public;
grant execute on function public.set_business_commission(uuid, numeric, text) to authenticated;

-- ═══ 3. Platform settings (trial days etc) ═══
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

drop policy if exists ps_read on public.platform_settings;
create policy ps_read on public.platform_settings
  for select to anon, authenticated using (true);

drop policy if exists ps_write on public.platform_settings;
create policy ps_write on public.platform_settings
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'));

-- default settings
insert into public.platform_settings (key, value) values
  ('trial_days', '30'::jsonb),
  ('trial_days_display', '"30 يوم"'::jsonb)
on conflict (key) do nothing;

-- helper: get setting
create or replace function public.get_setting(p_key text)
returns jsonb
language sql security definer set search_path = public stable
as $$ select value from public.platform_settings where key = p_key; $$;

revoke all on function public.get_setting(text) from public;
grant execute on function public.get_setting(text) to anon, authenticated;

-- ═══ 4. Update grant_trial_on_owner to read trial_days from settings ═══
create or replace function public.grant_trial_on_owner()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_plan_id uuid;
  v_trial_days int;
  v_sub_id uuid;
begin
  if (new.owner_profile_id is not null)
     and (old.owner_profile_id is null or old.owner_profile_id <> new.owner_profile_id)
  then
    if exists (
      select 1 from public.business_subscriptions
      where business_id = new.id and status in ('trial', 'active', 'pending')
    ) then
      return new;
    end if;

    select coalesce((value::text)::int, 30) into v_trial_days
    from public.platform_settings where key = 'trial_days';

    select id into v_plan_id from public.subscription_plans
    where is_active = true order by display_order asc limit 1;

    insert into public.business_subscriptions (
      business_id, plan_id, status, is_trial, starts_at, expires_at
    ) values (
      new.id, v_plan_id, 'trial', true, now(),
      now() + (v_trial_days || ' days')::interval
    ) returning id into v_sub_id;
  end if;
  return new;
end $$;

