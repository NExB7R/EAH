-- ═══════════════════════════════════════════════════════════
-- EAH — Migration v2: 2026-11-11
-- بحث الهاتف — أي مستخدم authenticated (بحدود صارمة)
-- الطيار/الدليفري = عميل عادي، ليس دورًا مخصصًا
-- ═══════════════════════════════════════════════════════════

-- 1. إعادة تسمية العمود ليعكس المعنى العام
alter table public.profiles
  rename column allow_driver_search to allow_phone_lookup;

-- 2. حذف flag غير ضروري (الدليفري ليس دورًا)
alter table public.profiles
  drop column if exists is_delivery_driver;

-- 3. جدول rate limit + audit (بسيط، لا يعتمد على Redis)
create table if not exists public.phone_search_log (
  id uuid primary key default gen_random_uuid(),
  searcher_id uuid not null references auth.users(id) on delete cascade,
  searched_phone_hash text not null, -- hash، لا الرقم نفسه
  found boolean not null default false,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists phone_search_log_searcher_time_idx
  on public.phone_search_log (searcher_id, created_at desc);

alter table public.phone_search_log enable row level security;

-- المستخدم يرى سجلاته فقط (شفافية)
drop policy if exists "phone_search_log: user reads own" on public.phone_search_log;
create policy "phone_search_log: user reads own"
  on public.phone_search_log for select
  using (searcher_id = auth.uid());

-- الأدمن يرى الكل
drop policy if exists "phone_search_log: admins read all" on public.phone_search_log;
create policy "phone_search_log: admins read all"
  on public.phone_search_log for select
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'super_admin'
  ));

-- لا INSERT من المستخدم — فقط عبر service_role (من الـ RPC)
revoke insert on public.phone_search_log from authenticated, anon;

-- 4. RPC v2 — أي مستخدم authenticated، حدود صارمة
create or replace function public.search_customer_by_phone(p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_is_admin boolean;
  v_digits text;
  v_phone_e164 text;
  v_target record;
  v_hour_count int;
  v_day_count int;
  v_phone_hash text;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  -- الدور
  select role::text into v_role from public.user_roles where user_id = v_user_id;
  v_is_admin := (v_role = 'super_admin');

  -- Rate limit (10/ساعة، 30/يوم للمستخدم العادي)
  if not v_is_admin then
    select count(*) into v_hour_count
      from public.phone_search_log
      where searcher_id = v_user_id
        and created_at > now() - interval '1 hour';

    select count(*) into v_day_count
      from public.phone_search_log
      where searcher_id = v_user_id
        and created_at > now() - interval '24 hours';

    if v_hour_count >= 10 then
      return jsonb_build_object('ok', false, 'error', 'rate_limit_hour');
    end if;
    if v_day_count >= 30 then
      return jsonb_build_object('ok', false, 'error', 'rate_limit_day');
    end if;
  end if;

  -- Normalize
  v_digits := regexp_replace(p_phone, '[^0-9]', '', 'g');
  if length(v_digits) > 10 and v_digits like '20%' then
    v_digits := substring(v_digits from 3);
  end if;
  v_digits := ltrim(v_digits, '0');
  if length(v_digits) < 10 then
    return jsonb_build_object('ok', true, 'found', false, 'error', 'invalid_phone');
  end if;
  v_phone_e164 := '+20' || v_digits;
  v_phone_hash := encode(digest(v_phone_e164, 'sha256'), 'hex');

  -- البحث
  select id, display_name, avatar_url, trust_score, trust_tier,
         created_at, verified_at, allow_phone_lookup, phone, is_premium
    into v_target
    from public.profiles
    where phone_e164 = v_phone_e164
    limit 1;

  -- سجّل البحث في كل الحالات
  insert into public.phone_search_log (searcher_id, searched_phone_hash, found)
    values (v_user_id, v_phone_hash, found);

  if not found then
    return jsonb_build_object('ok', true, 'found', false);
  end if;

  -- المستخدم العادي: محدود + احترام الخصوصية
  if not v_is_admin then
    if not coalesce(v_target.allow_phone_lookup, true) then
      return jsonb_build_object('ok', true, 'found', false, 'reason', 'privacy');
    end if;
    return jsonb_build_object(
      'ok', true, 'found', true, 'viewer', 'user',
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
    'allow_phone_lookup', v_target.allow_phone_lookup
  );
end;
$$;

revoke all on function public.search_customer_by_phone(text) from public, anon;
grant execute on function public.search_customer_by_phone(text) to authenticated;

comment on function public.search_customer_by_phone(text) is
  'بحث role-aware: أي مستخدم authenticated (بحدود 10/ساعة، 30/يوم) يرى حقول المصداقية فقط، الأدمن يرى كل شيء';

-- ═══ نهاية v2 ═══
