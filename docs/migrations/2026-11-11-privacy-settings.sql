-- ═══════════════════════════════════════════════════════════
-- EAH — Migration v7: 2026-11-11
-- RPC لجلب إعدادات الخصوصية الحالية للمستخدم
-- (منفصل عن get_my_profile لتجنب كسره)
-- ═══════════════════════════════════════════════════════════

create or replace function public.get_my_privacy_settings()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_result jsonb;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'unauthenticated');
  end if;

  select jsonb_build_object(
    'ok', true,
    'phone_lookup_mode', coalesce(phone_lookup_mode::text, 'full'),
    'hide_avatar', coalesce(hide_avatar, false),
    'hide_favorites', coalesce(hide_favorites, false),
    'hide_following', coalesce(hide_following, false),
    'hide_comments', coalesce(hide_comments, false),
    'hide_reviews', coalesce(hide_reviews, false),
    'display_name_mode', coalesce(display_name_mode, 'real')
  ) into v_result
  from public.profiles
  where id = v_user_id;

  return coalesce(v_result, jsonb_build_object('ok', false, 'error', 'profile_not_found'));
end;
$$;

revoke all on function public.get_my_privacy_settings() from public, anon;
grant execute on function public.get_my_privacy_settings() to authenticated;

comment on function public.get_my_privacy_settings() is
  'جلب إعدادات الخصوصية للمستخدم الحالي';

-- ═══ نهاية Migration v7 ═══
