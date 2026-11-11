-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: 2026-11-11
-- بحث الهاتف (Phone Search) — ميزة الطيار الدليفري + السوبر أدمن
-- ═══════════════════════════════════════════════════════════

-- 1. التحكم في الخصوصية (للعميل)
alter table public.profiles
  add column if not exists allow_driver_search boolean not null default true;

-- 2. علامة "طيار دليفري" (بدل role جديد — أخف وأكثر مرونة)
alter table public.profiles
  add column if not exists is_delivery_driver boolean not null default false;

-- 3. فهرس للبحث السريع
create index if not exists profiles_phone_e164_idx
  on public.profiles (phone_e164) where phone_e164 is not null;

-- 4. RPC — الدور مدرك (role-aware)
create or replace function public.search_customer_by_phone(p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_is_driver boolean;
  v_digits text;
  v_phone_e164 text;
  v_target record;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select role::text into v_role from public.user_roles where user_id = v_user_id;
  select coalesce(is_delivery_driver, false) into v_is_driver
    from public.profiles where id = v_user_id;

  if v_role <> 'super_admin' and not v_is_driver then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  -- Normalize to E.164
  v_digits := regexp_replace(p_phone, '[^0-9]', '', 'g');
  if length(v_digits) > 10 and v_digits like '20%' then
    v_digits := substring(v_digits from 3);
  end if;
  v_digits := ltrim(v_digits, '0');
  if length(v_digits) < 10 then
    return jsonb_build_object('ok', true, 'found', false, 'error', 'invalid_phone');
  end if;
  v_phone_e164 := '+20' || v_digits;

  select id, display_name, avatar_url, trust_score, trust_tier,
         created_at, verified_at, allow_driver_search, phone, phone_e164, is_premium
    into v_target
    from public.profiles
    where phone_e164 = v_phone_e164
    limit 1;

  if not found then
    return jsonb_build_object('ok', true, 'found', false);
  end if;

  -- الطيار: احترام الخصوصية + حقول محدودة
  if v_role <> 'super_admin' then
    if not coalesce(v_target.allow_driver_search, true) then
      return jsonb_build_object('ok', true, 'found', false, 'reason', 'privacy');
    end if;
    return jsonb_build_object(
      'ok', true, 'found', true, 'viewer', 'driver',
      'display_name', v_target.display_name,
      'avatar_url', v_target.avatar_url,
      'trust_score', v_target.trust_score,
      'trust_tier', v_target.trust_tier,
      'member_since', v_target.created_at,
      'is_verified', v_target.verified_at is not null,
      'is_premium', v_target.is_premium
    );
  end if;

  -- super_admin: كل شيء
  return jsonb_build_object(
    'ok', true, 'found', true, 'viewer', 'admin',
    'id', v_target.id,
    'display_name', v_target.display_name,
    'avatar_url', v_target.avatar_url,
    'phone', v_target.phone,
    'trust_score', v_target.trust_score,
    'trust_tier', v_target.trust_tier,
    'member_since', v_target.created_at,
    'is_verified', v_target.verified_at is not null,
    'is_premium', v_target.is_premium,
    'allow_driver_search', v_target.allow_driver_search
  );
end;
$$;

revoke all on function public.search_customer_by_phone(text) from public, anon;
grant execute on function public.search_customer_by_phone(text) to authenticated;

comment on function public.search_customer_by_phone(text) is
  'بحث role-aware: admin يرى كل شيء، driver يرى حقول المصداقية فقط';

-- ═══ نهاية Migration ═══
