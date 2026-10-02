-- EAH: order status history for timeline
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.order_requests(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_idx
  on public.order_status_history (order_id, created_at asc);

alter table public.order_status_history enable row level security;

-- Owner + customer can read
drop policy if exists "osh_read_owner_or_customer" on public.order_status_history;
create policy "osh_read_owner_or_customer"
  on public.order_status_history
  for select
  to authenticated
  using (
    order_id in (
      select id from public.order_requests
      where customer_user_id = auth.uid()
        or business_id in (
          select id from public.businesses where owner_profile_id = auth.uid()
        )
    )
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  );

-- Only system (via trigger) or owner can insert
drop policy if exists "osh_insert_owner" on public.order_status_history;
create policy "osh_insert_owner"
  on public.order_status_history
  for insert
  to authenticated
  with check (
    order_id in (
      select id from public.order_requests
      where business_id in (
        select id from public.businesses where owner_profile_id = auth.uid()
      )
    )
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'super_admin'
    )
  );

-- Trigger: auto-log status changes
create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'UPDATE' and old.status is distinct from new.status) then
    insert into public.order_status_history
      (order_id, old_status, new_status, changed_by)
    values
      (new.id, old.status, new.status, auth.uid());
  elsif (tg_op = 'INSERT') then
    insert into public.order_status_history
      (order_id, old_status, new_status, changed_by, note)
    values
      (new.id, null, new.status, auth.uid(), 'تم إنشاء الطلب');
  end if;
  return new;
end;
$$;

drop trigger if exists order_status_change_trigger on public.order_requests;
create trigger order_status_change_trigger
  after insert or update of status on public.order_requests
  for each row execute function public.log_order_status_change();
