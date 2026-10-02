begin;

-- Only super_admin may create, change, or delete role assignments.
-- Ordinary admins can manage users, but cannot grant themselves or others admin/super_admin.
drop policy if exists user_roles_admin_insert on public.user_roles;
create policy user_roles_super_admin_insert
on public.user_roles for insert
to authenticated
with check ((select private.has_role((select auth.uid()), 'super_admin'::public.app_role)));

drop policy if exists user_roles_admin_update on public.user_roles;
create policy user_roles_super_admin_update
on public.user_roles for update
to authenticated
using ((select private.has_role((select auth.uid()), 'super_admin'::public.app_role)))
with check ((select private.has_role((select auth.uid()), 'super_admin'::public.app_role)));

drop policy if exists user_roles_admin_delete on public.user_roles;
create policy user_roles_super_admin_delete
on public.user_roles for delete
to authenticated
using ((select private.has_role((select auth.uid()), 'super_admin'::public.app_role)));

commit;
