-- EAH: allow customers to read their own orders
-- Also allow them to insert with their own user_id only

-- Customers can read their own orders
drop policy if exists "order_requests_read_customer" on public.order_requests;
create policy "order_requests_read_customer"
  on public.order_requests
  for select
  to authenticated
  using (customer_user_id = auth.uid());

-- Allow customers to insert with themselves as customer_user_id
-- (already allowed by anonymous policy, but enforce null or own id)
drop policy if exists "order_requests_insert_own" on public.order_requests;
create policy "order_requests_insert_own"
  on public.order_requests
  for insert
  to authenticated
  with check (
    customer_user_id is null
    or customer_user_id = auth.uid()
  );

-- Index for customer lookup (already exists, keep)
create index if not exists order_requests_customer_lookup_idx
  on public.order_requests (customer_user_id, created_at desc);
