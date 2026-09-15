-- EAH Order Requests (paid feature — merchant only)
-- Customer fills order form → saves to DB → sends WhatsApp to merchant

create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_area text,
  customer_address text,
  items_summary text not null,
  notes text,
  status text not null default 'sent' check (status in ('sent', 'seen', 'accepted', 'rejected', 'delivered', 'cancelled')),
  merchant_phone text not null,
  whatsapp_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_requests_business_idx on public.order_requests (business_id, created_at desc);
create index if not exists order_requests_customer_idx on public.order_requests (customer_user_id, created_at desc);

-- RLS
alter table public.order_requests enable row level security;

-- Anyone (incl. guests) can insert — the form is public
drop policy if exists "order_requests_insert_anyone" on public.order_requests;
create policy "order_requests_insert_anyone"
  on public.order_requests
  for insert
  to anon, authenticated
  with check (true);

-- Only business owners can read their own business orders
drop policy if exists "order_requests_read_owner" on public.order_requests;
create policy "order_requests_read_owner"
  on public.order_requests
  for select
  to authenticated
  using (
    business_id in (
      select id from public.businesses where owner_profile_id = auth.uid()
    )
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  );

-- Only owner can update status
drop policy if exists "order_requests_update_owner" on public.order_requests;
create policy "order_requests_update_owner"
  on public.order_requests
  for update
  to authenticated
  using (
    business_id in (
      select id from public.businesses where owner_profile_id = auth.uid()
    )
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  );

-- Business subscription check helper
create or replace function public.has_merchant_premium(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.business_subscriptions
    where business_id = p_business_id
      and status = 'active'
      and expires_at > now()
  );
$$;

grant execute on function public.has_merchant_premium(uuid) to authenticated, anon;
