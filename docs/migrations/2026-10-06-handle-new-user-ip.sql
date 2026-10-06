-- ═══════════════════════════════════════════════════════════
-- EAH — Update handle_new_user (signup_ip_hash support)
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  display_name text;
  phone_val text;
  gender_val text;
  area_val text;
  address_val text;
  lat_val double precision;
  lng_val double precision;
  ip_hash_val text;
begin
  display_name := coalesce(
    nullif(new.raw_user_meta_data->>'display_name',''),
    nullif(new.raw_user_meta_data->>'name',''),
    'مستخدم EAH'
  );

  phone_val := coalesce(
    nullif(new.raw_user_meta_data->>'phone_e164',''),
    nullif(new.raw_user_meta_data->>'phone','')
  );

  gender_val := nullif(new.raw_user_meta_data->>'gender','');
  area_val := nullif(new.raw_user_meta_data->>'default_area','');
  address_val := nullif(new.raw_user_meta_data->>'default_address','');
  ip_hash_val := nullif(new.raw_user_meta_data->>'signup_ip_hash','');

  begin
    lat_val := nullif(new.raw_user_meta_data->>'default_latitude','')::double precision;
  exception when others then
    lat_val := null;
  end;

  begin
    lng_val := nullif(new.raw_user_meta_data->>'default_longitude','')::double precision;
  exception when others then
    lng_val := null;
  end;

  insert into public.profiles (
    id, display_name, phone, phone_e164, gender, phone_verified_at,
    default_area, default_address, default_latitude, default_longitude,
    signup_ip_hash
  )
  values (
    new.id, display_name, phone_val, phone_val, gender_val, null,
    area_val, address_val, lat_val, lng_val,
    ip_hash_val
  )
  on conflict (id) do update
    set display_name = coalesce(excluded.display_name, public.profiles.display_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        phone_e164 = coalesce(excluded.phone_e164, public.profiles.phone_e164),
        gender = coalesce(excluded.gender, public.profiles.gender),
        default_area = coalesce(excluded.default_area, public.profiles.default_area),
        default_address = coalesce(excluded.default_address, public.profiles.default_address),
        default_latitude = coalesce(excluded.default_latitude, public.profiles.default_latitude),
        default_longitude = coalesce(excluded.default_longitude, public.profiles.default_longitude),
        signup_ip_hash = coalesce(excluded.signup_ip_hash, public.profiles.signup_ip_hash),
        updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer'::public.app_role)
  on conflict (user_id) do nothing;

  return new;

exception when others then
  raise warning '[handle_new_user] failed for % — %', new.id, sqlerrm;
  return new;
end;
$function$;
