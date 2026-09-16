-- EAH: Ads system (ad spaces + ad placements + stats)
-- Supports admin-created slots + partner-created ads (pending approval)

create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_ar text not null,
  description text,
  slot_type text not null default 'home_banner'
    check (slot_type in ('home_banner','home_feed','sidebar','search_top','business_sidebar')),
  max_concurrent int not null default 1,
  base_price_egp numeric(10,2),
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid references public.ad_slots(id) on delete set null,
  owner_profile_id uuid references public.profiles(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  title text not null,
  description text,
  image_url text,
  link_url text,
  link_type text not null default 'external'
    check (link_type in ('external','internal','business')),
  target_business_id uuid references public.businesses(id) on delete set null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending','active','paused','expired','rejected')),
  rejected_reason text,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ads_slot_active_idx on public.ads (slot_id, status, starts_at, ends_at);
create index if not exists ads_owner_idx on public.ads (owner_profile_id);

-- Stats table for daily aggregation (optional but useful)
create table if not exists public.ad_stats_daily (
  ad_id uuid references public.ads(id) on delete cascade,
  day date not null,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  primary key (ad_id, day)
);

-- ═══ RLS ═══
alter table public.ad_slots enable row level security;
alter table public.ads enable row level security;
alter table public.ad_stats_daily enable row level security;

-- ad_slots: read all active, write super_admin only
drop policy if exists ads_slots_read on public.ad_slots;
create policy ads_slots_read on public.ad_slots
  for select to anon, authenticated using (is_active = true);

drop policy if exists ads_slots_admin on public.ad_slots;
create policy ads_slots_admin on public.ad_slots
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'));

-- ads: read own + active only, write own (or admin)
drop policy if exists ads_read on public.ads;
create policy ads_read on public.ads
  for select to anon, authenticated
  using (
    status = 'active' and (ends_at is null or ends_at > now())
    or owner_profile_id = auth.uid()
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  );

drop policy if exists ads_insert on public.ads;
create policy ads_insert on public.ads
  for insert to authenticated
  with check (
    owner_profile_id = auth.uid()
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  );

drop policy if exists ads_update on public.ads;
create policy ads_update on public.ads
  for update to authenticated
  using (
    owner_profile_id = auth.uid()
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  );

drop policy if exists ads_delete on public.ads;
create policy ads_delete on public.ads
  for delete to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'));

-- stats: read own + admin
drop policy if exists ad_stats_read on public.ad_stats_daily;
create policy ad_stats_read on public.ad_stats_daily
  for select to authenticated
  using (
    exists (select 1 from public.ads a where a.id = ad_id and a.owner_profile_id = auth.uid())
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  );

drop policy if exists ad_stats_write on public.ad_stats_daily;
create policy ad_stats_write on public.ad_stats_daily
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'));

-- ═══ Trigger: bump updated_at ═══
drop trigger if exists ad_slots_touch on public.ad_slots;
create trigger ad_slots_touch
  before update on public.ad_slots
  for each row execute function public.touch_updated_at();

drop trigger if exists ads_touch on public.ads;
create trigger ads_touch
  before update on public.ads
  for each row execute function public.touch_updated_at();

-- ═══ RPC: record impression / click ═══
create or replace function public.track_ad_event(p_ad_id uuid, p_event text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event not in ('impression','click') then return; end if;
  if p_event = 'impression' then
    update public.ads set impressions = impressions + 1 where id = p_ad_id;
    insert into public.ad_stats_daily (ad_id, day, impressions, clicks)
      values (p_ad_id, current_date, 1, 0)
      on conflict (ad_id, day) do update set impressions = ad_stats_daily.impressions + 1;
  else
    update public.ads set clicks = clicks + 1 where id = p_ad_id;
    insert into public.ad_stats_daily (ad_id, day, impressions, clicks)
      values (p_ad_id, current_date, 0, 1)
      on conflict (ad_id, day) do update set clicks = ad_stats_daily.clicks + 1;
  end if;
end $$;

revoke all on function public.track_ad_event(uuid, text) from public;
grant execute on function public.track_ad_event(uuid, text) to anon, authenticated;

-- ═══ Seed: 4 ad slots ═══
insert into public.ad_slots (code, name_ar, description, slot_type, max_concurrent, base_price_egp, display_order)
values
  ('home_banner', 'بانر الرئيسية', 'أول بانر يظهر للزائر في الرئيسية', 'home_banner', 1, null, 1),
  ('home_feed', 'إعلان بين الأقسام', 'يظهر بين أقسام الرئيسية', 'home_feed', 3, null, 2),
  ('sidebar', 'شريط جانبي', 'الشريط الجانبي أثناء التصفح', 'sidebar', 2, null, 3),
  ('search_top', 'أول نتيجة بحث', 'أول مكان في نتائج البحث على كلمة معينة', 'search_top', 1, null, 4)
on conflict (code) do nothing;
