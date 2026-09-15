-- EAH Rate Limiting Table (distributed fallback)
-- Complements in-memory rate limiting for multi-instance deployments.
-- Idempotent.

create table if not exists public.rate_limits (
  key        text primary key,
  count      integer not null default 1,
  reset_at   timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limits_reset_at_idx on public.rate_limits (reset_at);

-- Service role only — لا يوجد وصول للعميل
alter table public.rate_limits enable row level security;

-- Cleanup old entries periodically (cron-friendly RPC)
create or replace function public.cleanup_rate_limits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits where reset_at < now() - interval '1 hour';
$$;

revoke all on function public.cleanup_rate_limits() from public;
grant execute on function public.cleanup_rate_limits() to service_role;
