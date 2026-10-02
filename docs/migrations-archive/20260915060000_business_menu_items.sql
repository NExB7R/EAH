-- EAH: structured menu items
-- replaces raw image-based menu with proper items

create table if not exists public.business_menu_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category text not null default 'عام',
  name text not null,
  description text,
  price numeric(10, 2),
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_menu_items_business_idx
  on public.business_menu_items (business_id, category, sort_order);

alter table public.business_menu_items enable row level security;

-- anyone can read
drop policy if exists "menu_read_all" on public.business_menu_items;
create policy "menu_read_all"
  on public.business_menu_items
  for select
  to anon, authenticated
  using (true);

-- only owner can insert/update/delete
drop policy if exists "menu_write_owner" on public.business_menu_items;
create policy "menu_write_owner"
  on public.business_menu_items
  for all
  to authenticated
  using (
    business_id in (
      select id from public.businesses where owner_profile_id = auth.uid()
    )
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  )
  with check (
    business_id in (
      select id from public.businesses where owner_profile_id = auth.uid()
    )
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  );

-- auto-update updated_at
create or replace function public.menu_items_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_items_touch_trigger on public.business_menu_items;
create trigger menu_items_touch_trigger
  before update on public.business_menu_items
  for each row execute function public.menu_items_touch_updated_at();
