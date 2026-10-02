-- EAH v0.1.0 — Security hardening after initial foundation bootstrap
-- Applied to Supabase project npmpiivmdksdirrumbmt as migration foundation_security_hardening.

create table if not exists public.business_contact_methods (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  method_type text not null check (method_type in ('phone','whatsapp','facebook','instagram','website')),
  value text not null,
  is_primary boolean not null default false,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_contact_methods enable row level security;
revoke all on public.business_contact_methods from anon, authenticated;
grant select on public.business_contact_methods to authenticated;

drop policy if exists "contact methods verified users" on public.business_contact_methods;
create policy "contact methods verified users"
on public.business_contact_methods
for select
to authenticated
using (
  is_public = true
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.phone_verified_at is not null
  )
);

create index if not exists idx_business_contact_methods_business
  on public.business_contact_methods(business_id);

alter table public.businesses
  add column if not exists owner_profile_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_businesses_owner
  on public.businesses(owner_profile_id);

create or replace function public.sync_profile_phone_verified()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.profiles
  set phone_verified_at = new.phone_confirmed_at,
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_phone_confirmed on auth.users;
create trigger on_auth_user_phone_confirmed
after insert or update of phone_confirmed_at on auth.users
for each row
execute function public.sync_profile_phone_verified();
