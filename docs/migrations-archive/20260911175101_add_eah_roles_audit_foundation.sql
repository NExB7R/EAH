begin;

create schema if not exists private;

do $$
begin
  create type public.app_role as enum ('customer','merchant','admin','super_admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role public.app_role not null,
  permission text not null,
  created_at timestamptz not null default now(),
  primary key (role, permission)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_roles_role_idx on public.user_roles(role);
create index if not exists role_permissions_permission_idx on public.role_permissions(permission);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_user_id, created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

alter table public.user_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.audit_logs enable row level security;

create or replace function private.has_role(check_user_id uuid, required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = check_user_id
      and ur.role = required_role
  );
$$;

create or replace function private.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = check_user_id
      and ur.role in ('admin'::public.app_role, 'super_admin'::public.app_role)
  );
$$;

create or replace function private.authorize(requested_permission text, check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = check_user_id
      and rp.permission = requested_permission
  );
$$;

revoke all on function private.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke all on function private.is_admin(uuid) from public, anon, authenticated;
revoke all on function private.authorize(text, uuid) from public, anon, authenticated;

grant execute on function private.has_role(uuid, public.app_role) to authenticated;
grant execute on function private.is_admin(uuid) to authenticated;
grant execute on function private.authorize(text, uuid) to authenticated;

create or replace function private.ensure_customer_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer'::public.app_role)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.ensure_customer_role() from public, anon, authenticated;

drop trigger if exists profiles_assign_customer_role on public.profiles;
create trigger profiles_assign_customer_role
after insert on public.profiles
for each row execute function private.ensure_customer_role();

insert into public.role_permissions (role, permission)
values
  ('customer','profile.self'),
  ('customer','favorite.self'),
  ('customer','exclusion.self'),
  ('customer','review.self'),
  ('customer','notification.self'),
  ('merchant','business.own.manage'),
  ('merchant','business.own.media.manage'),
  ('merchant','business.own.offers.manage'),
  ('merchant','business.own.contacts.manage'),
  ('merchant','business.own.reviews.read'),
  ('merchant','studio.own.manage'),
  ('admin','business.all.manage'),
  ('admin','business.all.media.manage'),
  ('admin','business.all.offers.manage'),
  ('admin','business.all.contacts.manage'),
  ('admin','reviews.moderate'),
  ('admin','users.manage'),
  ('admin','content.manage'),
  ('admin','studio.all.manage'),
  ('admin','audit.read'),
  ('super_admin','business.all.manage'),
  ('super_admin','business.all.media.manage'),
  ('super_admin','business.all.offers.manage'),
  ('super_admin','business.all.contacts.manage'),
  ('super_admin','reviews.moderate'),
  ('super_admin','users.manage'),
  ('super_admin','content.manage'),
  ('super_admin','studio.all.manage'),
  ('super_admin','audit.read'),
  ('super_admin','roles.manage'),
  ('super_admin','system.manage')
on conflict (role, permission) do nothing;

drop policy if exists user_roles_self_select on public.user_roles;
create policy user_roles_self_select
on public.user_roles for select
to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));

drop policy if exists user_roles_admin_insert on public.user_roles;
create policy user_roles_admin_insert
on public.user_roles for insert
to authenticated
with check ((select private.is_admin()));

drop policy if exists user_roles_admin_update on public.user_roles;
create policy user_roles_admin_update
on public.user_roles for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists user_roles_admin_delete on public.user_roles;
create policy user_roles_admin_delete
on public.user_roles for delete
to authenticated
using ((select private.is_admin()));

drop policy if exists role_permissions_admin_select on public.role_permissions;
create policy role_permissions_admin_select
on public.role_permissions for select
to authenticated
using ((select private.is_admin()));

drop policy if exists role_permissions_super_admin_write on public.role_permissions;
create policy role_permissions_super_admin_write
on public.role_permissions for all
to authenticated
using ((select private.has_role((select auth.uid()), 'super_admin'::public.app_role)))
with check ((select private.has_role((select auth.uid()), 'super_admin'::public.app_role)));

drop policy if exists audit_logs_admin_select on public.audit_logs;
create policy audit_logs_admin_select
on public.audit_logs for select
to authenticated
using ((select private.is_admin()));

drop policy if exists businesses_admin_all on public.businesses;
create policy businesses_admin_all
on public.businesses for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists businesses_merchant_insert_own on public.businesses;
create policy businesses_merchant_insert_own
on public.businesses for insert
to authenticated
with check (
  owner_profile_id = (select auth.uid())
  and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
);

drop policy if exists businesses_merchant_update_own on public.businesses;
create policy businesses_merchant_update_own
on public.businesses for update
to authenticated
using (
  owner_profile_id = (select auth.uid())
  and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
)
with check (
  owner_profile_id = (select auth.uid())
  and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
);

drop policy if exists businesses_merchant_delete_own on public.businesses;
create policy businesses_merchant_delete_own
on public.businesses for delete
to authenticated
using (
  owner_profile_id = (select auth.uid())
  and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
);

drop policy if exists business_media_staff_all on public.business_media;
create policy business_media_staff_all
on public.business_media for all
to authenticated
using (
  (select private.is_admin())
  or exists (
    select 1 from public.businesses b
    where b.id = business_media.business_id
      and b.owner_profile_id = (select auth.uid())
      and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
  )
)
with check (
  (select private.is_admin())
  or exists (
    select 1 from public.businesses b
    where b.id = business_media.business_id
      and b.owner_profile_id = (select auth.uid())
      and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
  )
);

drop policy if exists offers_staff_all on public.offers;
create policy offers_staff_all
on public.offers for all
to authenticated
using (
  (select private.is_admin())
  or exists (
    select 1 from public.businesses b
    where b.id = offers.business_id
      and b.owner_profile_id = (select auth.uid())
      and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
  )
)
with check (
  (select private.is_admin())
  or exists (
    select 1 from public.businesses b
    where b.id = offers.business_id
      and b.owner_profile_id = (select auth.uid())
      and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
  )
);

drop policy if exists business_contact_methods_staff_all on public.business_contact_methods;
create policy business_contact_methods_staff_all
on public.business_contact_methods for all
to authenticated
using (
  (select private.is_admin())
  or exists (
    select 1 from public.businesses b
    where b.id = business_contact_methods.business_id
      and b.owner_profile_id = (select auth.uid())
      and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
  )
)
with check (
  (select private.is_admin())
  or exists (
    select 1 from public.businesses b
    where b.id = business_contact_methods.business_id
      and b.owner_profile_id = (select auth.uid())
      and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
  )
);

drop policy if exists business_reviews_admin_all on public.business_reviews;
create policy business_reviews_admin_all
on public.business_reviews for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists business_reviews_merchant_select_own on public.business_reviews;
create policy business_reviews_merchant_select_own
on public.business_reviews for select
to authenticated
using (
  exists (
    select 1 from public.businesses b
    where b.id = business_reviews.business_id
      and b.owner_profile_id = (select auth.uid())
      and (select private.has_role((select auth.uid()), 'merchant'::public.app_role))
  )
);

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  claims jsonb;
  user_role public.app_role;
begin
  select ur.role into user_role
  from public.user_roles ur
  where ur.user_id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(
    claims,
    '{user_role}',
    case when user_role is null then 'null'::jsonb else to_jsonb(user_role) end,
    true
  );

  return jsonb_build_object('claims', claims);
end;
$$;

revoke execute on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
grant select on public.user_roles to supabase_auth_admin;

commit;
