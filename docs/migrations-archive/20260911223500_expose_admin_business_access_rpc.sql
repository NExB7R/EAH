begin;

create or replace function public.admin_set_business_owner(p_business_id uuid, p_user_id uuid)
returns void language sql security definer set search_path = ''
as $$ select private.admin_set_business_owner(p_business_id, p_user_id); $$;
revoke all on function public.admin_set_business_owner(uuid, uuid) from public, anon;
grant execute on function public.admin_set_business_owner(uuid, uuid) to authenticated;

create or replace function public.admin_set_business_permission(p_business_id uuid, p_user_id uuid, p_permission text, p_granted boolean)
returns void language sql security definer set search_path = ''
as $$ select private.admin_set_business_permission(p_business_id, p_user_id, p_permission, p_granted); $$;
revoke all on function public.admin_set_business_permission(uuid, uuid, text, boolean) from public, anon;
grant execute on function public.admin_set_business_permission(uuid, uuid, text, boolean) to authenticated;

commit;
