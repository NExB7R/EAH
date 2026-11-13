-- ═══════════════════════════════════════════════════════════
-- EAH — Migration v3: 2026-11-11
-- إصلاح search_customer_by_phone:
--   - استبدال digest(sha256) بـ md5 (لا يحتاج pgcrypto)
--   - إضافة exception handling (يرجع الأخطاء بوضوح)
-- ═══════════════════════════════════════════════════════════

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
  v_error_msg text;
  v_error_detail text;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  begin
    -- الدور
    select role::text into v_role from public.user_roles where user_id = v_user_id;
    v_is_admin := (v_role = 'super_admin');

    -- Rate limit
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
    v_phone_hash := md5(v_phone_e164);

    -- البحث
    select id, display_name, avatar_url, trust_score, trust_tier,
           created_at, verified_at, allow_phone_lookup, phone, is_premium
      into v_target
      from public.profiles
      where phone_e164 = v_phone_e164
      limit 1;

    -- سجّل البحث
    insert into public.phone_search_log (searcher_id, searched_phone_hash, found)
      values (v_user_id, v_phone_hash, found);

    if not found then
      return jsonb_build_object('ok', true, 'found', false);
    end if;

    -- المستخدم العادي
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

    -- super_admin
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
  exception when others then
    get stacked diagnostics v_error_msg = message_text;
    get stacked diagnostics v_error_detail = pg_exception_detail;
    return jsonb_build_object(
      'ok', false,
      'error', 'rpc_exception',
      'detail', v_error_msg,
      'hint', coalesce(v_error_detail, '')
    );
  end;
end;
$$;

revoke all on function public.search_customer_by_phone(text) from public, anon;
grant execute on function public.search_customer_by_phone(text) to authenticated;

comment on function public.search_customer_by_phone(text) is
  'بحث role-aware — v3: md5 بدل digest + exception handling';
