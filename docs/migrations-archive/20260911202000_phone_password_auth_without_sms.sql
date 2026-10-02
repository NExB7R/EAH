begin;

alter table public.profiles
  add column if not exists phone_e164 text;

create unique index if not exists profiles_phone_e164_uidx
  on public.profiles(phone_e164)
  where phone_e164 is not null;

revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name, phone_e164, phone_verified_at)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'مستخدم EAH'),
    nullif(new.raw_user_meta_data->>'phone_e164', ''),
    new.phone_confirmed_at
  )
  on conflict (id) do update
    set display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
        phone_e164 = coalesce(excluded.phone_e164, public.profiles.phone_e164),
        updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer'::public.app_role)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created_bootstrap on auth.users;

commit;
