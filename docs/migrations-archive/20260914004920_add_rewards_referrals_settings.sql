-- =========================================================
-- EAH: reward_redemptions + referral_settings
-- =========================================================

-- ═══ Reward redemptions (when user redeems points) ═══
create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_id uuid not null references public.reward_catalog(id) on delete restrict,
  points_spent int not null check (points_spent > 0),
  status text not null default 'pending',
  -- status: pending | approved | rejected | delivered | cancelled
  voucher_code text,
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reward_redemptions_status_ck
    check (status in ('pending','approved','rejected','delivered','cancelled'))
);

create index if not exists reward_redemptions_status_idx
  on public.reward_redemptions (status, created_at desc);
create index if not exists reward_redemptions_user_idx
  on public.reward_redemptions (user_id, created_at desc);

alter table public.reward_redemptions enable row level security;

drop policy if exists rr_own_read on public.reward_redemptions;
create policy rr_own_read on public.reward_redemptions
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists rr_admin_all on public.reward_redemptions;
create policy rr_admin_all on public.reward_redemptions
  for all to authenticated using ((select private.is_admin()));

-- ═══ Referral settings (singleton) ═══
create table if not exists public.referral_settings (
  id int primary key default 1 check (id = 1),
  referrer_bonus int not null default 50,
  referred_bonus int not null default 25,
  min_days_between int not null default 0,
  max_referrals_per_user int,
  require_verification boolean not null default false,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- seed default row
insert into public.referral_settings (id, referrer_bonus, referred_bonus)
values (1, 50, 25)
on conflict (id) do nothing;

alter table public.referral_settings enable row level security;

drop policy if exists rs_public_read on public.referral_settings;
create policy rs_public_read on public.referral_settings
  for select to anon, authenticated using (true);

drop policy if exists rs_admin_all on public.referral_settings;
create policy rs_admin_all on public.referral_settings
  for all to authenticated using ((select private.is_admin()));

-- ═══ RPC: get referral settings (public read) ═══
create or replace function public.get_referral_settings()
returns table (
  referrer_bonus int,
  referred_bonus int,
  min_days_between int,
  max_referrals_per_user int,
  require_verification boolean,
  is_active boolean
)
language sql stable security definer
set search_path = public
as $$
  select referrer_bonus, referred_bonus, min_days_between,
         max_referrals_per_user, require_verification, is_active
  from public.referral_settings
  where id = 1;
$$;

revoke all on function public.get_referral_settings() from public;
grant execute on function public.get_referral_settings() to anon, authenticated;

-- Verify:
-- select * from public.referral_settings;
-- select * from public.reward_redemptions limit 1;
