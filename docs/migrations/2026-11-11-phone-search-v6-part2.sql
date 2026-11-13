-- ═══════════════════════════════════════════════════════════
-- EAH — Migration v6 part2: RPC v6
-- احترام display_name_mode + hide_avatar + hide_comments/reviews
-- إزالة super_admin bypass — الأدمن يتبع phone_lookup_mode
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
  v_branch record;
  v_hour_count int;
  v_day_count int;
  v_phone_hash text;
  v_business jsonb;
  v_mode text;
  v_show_name boolean;
  v_show_avatar boolean;
  v_show_comments boolean;
  v_show_reviews boolean;
  v_effective_name text;
  v_effective_avatar text;
  v_comment_count int;
  v_rating_avg numeric;
  v_rating_count int;
  v_error_msg text;
  v_error_detail text;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  begin
    select role::text into v_role from public.user_roles where user_id = v_user_id;
    v_is_admin := (v_role = 'super_admin');

    if not v_is_admin then
      select count(*) into v_hour_count from public.phone_search_log
        where searcher_id = v_user_id and created_at > now() - interval '1 hour';
      select count(*) into v_day_count from public.phone_search_log
        where searcher_id = v_user_id and created_at > now() - interval '24 hours';
      if v_hour_count >= 10 then
        return jsonb_build_object('ok', false, 'error', 'rate_limit_hour');
      end if;
      if v_day_count >= 30 then
        return jsonb_build_object('ok', false, 'error', 'rate_limit_day');
      end if;
    end if;

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

    select p.id, p.display_name, p.avatar_url, p.trust_score, p.trust_tier,
           p.created_at, p.verified_at, p.is_premium, p.phone, p.bio,
           p.display_name_mode, p.alias,
           p.hide_avatar, p.hide_comments, p.hide_reviews,
           p.phone_lookup_mode::text as mode,
           ur.role::text as target_role
      into v_target
      from public.profiles p
      left join public.user_roles ur on ur.user_id = p.id
      where p.phone_e164 = v_phone_e164
      limit 1;

    select b.id, b.name, b.slug, b.business_type::text as business_type,
           b.is_verified, b.rating_avg, b.rating_count, b.is_open, b.area
      into v_branch
      from public.branches br
      join public.businesses b on b.id = br.business_id
      where (br.phone = v_phone_e164 or br.whatsapp = v_phone_e164)
        and b.is_published = true
      limit 1;

    insert into public.phone_search_log (searcher_id, searched_phone_hash, found)
      values (v_user_id, v_phone_hash, (v_target.id is not null or v_branch.id is not null));

    if v_target.id is null and v_branch.id is null then
      return jsonb_build_object('ok', true, 'found', false);
    end if;

    if v_branch.id is not null then
      v_business := jsonb_build_object(
        'id', v_branch.id,
        'name', v_branch.name,
        'slug', v_branch.slug,
        'type', v_branch.business_type,
        'is_verified', v_branch.is_verified,
        'rating_avg', v_branch.rating_avg,
        'rating_count', v_branch.rating_count,
        'is_open', v_branch.is_open,
        'area', v_branch.area
      );
    end if;

    -- admin: everything
    if v_is_admin then
      return jsonb_build_object(
        'ok', true, 'found', true, 'viewer', 'admin',
        'id', v_target.id,
        'display_name', v_target.display_name,
        'avatar_url', v_target.avatar_url,
        'phone', v_target.phone,
        'bio', v_target.bio,
        'role', v_target.target_role,
        'trust_score', v_target.trust_score,
        'trust_tier', v_target.trust_tier,
        'member_since', v_target.created_at,
        'is_verified', v_target.verified_at is not null,
        'is_premium', v_target.is_premium,
        'privacy_mode', v_target.mode,
        'business', v_business
      );
    end if;

    -- Regular user: respect privacy mode
    v_mode := coalesce(v_target.mode, 'full');
    if v_target.id is null then
      v_mode := 'full';
    end if;

    if v_mode = 'anonymous' then
      return jsonb_build_object(
        'ok', true, 'found', true, 'viewer', 'user',
        'privacy_mode', 'anonymous',
        'role', v_target.target_role,
        'business', v_business
      );
    end if;

    if v_mode = 'trust_only' then
      return jsonb_build_object(
        'ok', true, 'found', true, 'viewer', 'user',
        'privacy_mode', 'trust_only',
        'trust_score', coalesce(v_target.trust_score, 50),
        'trust_tier', coalesce(v_target.trust_tier, 'fel'),
        'is_verified', v_target.verified_at is not null,
        'is_premium', v_target.is_premium,
        'role', v_target.target_role,
        'business', v_business
      );
    end if;

    -- full mode: احترم display_name_mode + hide_avatar
    v_show_name := v_target.display_name_mode in ('real', 'both', 'alias');
    v_show_avatar := not coalesce(v_target.hide_avatar, false);
    v_show_comments := not coalesce(v_target.hide_comments, false);
    v_show_reviews := not coalesce(v_target.hide_reviews, false);

    if v_target.display_name_mode = 'alias' and v_target.alias is not null then
      v_effective_name := v_target.alias;
    elsif v_target.display_name_mode = 'both' and v_target.alias is not null then
      v_effective_name := v_target.display_name || ' (' || v_target.alias || ')';
    else
      v_effective_name := v_target.display_name;
    end if;

    v_effective_avatar := case when v_show_avatar then v_target.avatar_url else null end;

    if v_show_comments then
      select count(*) into v_comment_count
        from public.business_comments where user_id = v_target.id;
    end if;

    if v_show_reviews then
      select coalesce(avg(rating), 0), count(*) into v_rating_avg, v_rating_count
        from public.business_reviews where user_id = v_target.id;
    end if;

    return jsonb_build_object(
      'ok', true, 'found', true, 'viewer', 'user',
      'privacy_mode', 'full',
      'display_name', case when v_show_name then v_effective_name else null end,
      'avatar_url', v_effective_avatar,
      'bio', v_target.bio,
      'role', v_target.target_role,
      'trust_score', v_target.trust_score,
      'trust_tier', v_target.trust_tier,
      'member_since', v_target.created_at,
      'is_verified', v_target.verified_at is not null,
      'is_premium', v_target.is_premium,
      'comment_count', case when v_show_comments then v_comment_count else null end,
      'rating_avg', case when v_show_reviews and v_rating_count > 0 then round(v_rating_avg, 1) else null end,
      'rating_count', case when v_show_reviews then v_rating_count else null end,
      'business', v_business
    );
  exception when others then
    get stacked diagnostics v_error_msg = message_text;
    get stacked diagnostics v_error_detail = pg_exception_detail;
    return jsonb_build_object(
      'ok', false, 'error', 'rpc_exception',
      'detail', v_error_msg,
      'hint', coalesce(v_error_detail, '')
    );
  end;
end;
$$;

revoke all on function public.search_customer_by_phone(text) from public, anon;
grant execute on function public.search_customer_by_phone(text) to authenticated;

comment on function public.search_customer_by_phone(text) is
  'بحث v6 — 3 modes (full/trust_only/anonymous) + display_name_mode + counts';
