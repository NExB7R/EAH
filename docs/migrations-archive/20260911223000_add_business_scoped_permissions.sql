begin;

create table if not exists public.business_access_permissions (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  permission text not null check (permission in ('business.view','business.edit','business.publish','media.manage','offers.manage','reviews.manage','contacts.manage','page.manage')),
  granted boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (business_id, user_id, permission)
);

create index if not exists business_access_permissions_user_idx on public.business_access_permissions(user_id, business_id);
alter table public.business_access_permissions enable row level security;
grant select on public.business_access_permissions to authenticated;
revoke insert, update, delete on public.business_access_permissions from authenticated;

drop policy if exists business_access_permissions_select_self_or_admin on public.business_access_permissions;
create policy business_access_permissions_select_self_or_admin on public.business_access_permissions for select to authenticated using (user_id = (select auth.uid()) or private.is_admin((select auth.uid())));

create or replace function private.has_business_permission(p_business_id uuid, p_permission text, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = ''
as $$ select private.is_admin(p_user_id) or exists (select 1 from public.business_access_permissions bap where bap.business_id = p_business_id and bap.user_id = p_user_id and bap.permission = p_permission and bap.granted = true); $$;
revoke all on function private.has_business_permission(uuid, text, uuid) from public, anon, authenticated;
grant execute on function private.has_business_permission(uuid, text, uuid) to authenticated;

create or replace function private.admin_set_business_owner(p_business_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare actor uuid := auth.uid(); perm text;
begin
  if not private.is_admin(actor) then raise exception 'not authorized'; end if;
  update public.businesses set owner_profile_id = p_user_id, updated_at = now() where id = p_business_id;
  if not found then raise exception 'business not found'; end if;
  insert into public.user_roles (user_id, role) values (p_user_id, 'merchant'::public.app_role)
  on conflict (user_id) do update set role = case when public.user_roles.role in ('admin'::public.app_role, 'super_admin'::public.app_role) then public.user_roles.role else 'merchant'::public.app_role end, updated_at = now();
  foreach perm in array array['business.view','business.edit','business.publish','media.manage','offers.manage','reviews.manage','contacts.manage','page.manage'] loop
    insert into public.business_access_permissions (business_id, user_id, permission) values (p_business_id, p_user_id, perm) on conflict (business_id, user_id, permission) do update set granted = true, updated_at = now();
  end loop;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata) values (actor, 'business.owner_assigned', 'business', p_business_id, jsonb_build_object('user_id', p_user_id));
end; $$;
revoke all on function private.admin_set_business_owner(uuid, uuid) from public, anon, authenticated;
grant execute on function private.admin_set_business_owner(uuid, uuid) to authenticated;

create or replace function private.admin_set_business_permission(p_business_id uuid, p_user_id uuid, p_permission text, p_granted boolean)
returns void language plpgsql security definer set search_path = ''
as $$
declare actor uuid := auth.uid();
begin
  if not private.is_admin(actor) then raise exception 'not authorized'; end if;
  if p_permission not in ('business.view','business.edit','business.publish','media.manage','offers.manage','reviews.manage','contacts.manage','page.manage') then raise exception 'invalid permission'; end if;
  insert into public.business_access_permissions (business_id, user_id, permission, granted) values (p_business_id, p_user_id, p_permission, p_granted)
  on conflict (business_id, user_id, permission) do update set granted = excluded.granted, updated_at = now();
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata) values (actor, 'business.permission_changed', 'business', p_business_id, jsonb_build_object('user_id', p_user_id, 'permission', p_permission, 'granted', p_granted));
end; $$;
revoke all on function private.admin_set_business_permission(uuid, uuid, text, boolean) from public, anon, authenticated;
grant execute on function private.admin_set_business_permission(uuid, uuid, text, boolean) to authenticated;

commit;
