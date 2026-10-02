-- Atomic distributed rate-limit consumption for multi-instance deployments.
-- Only the service role can call this function.

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table(allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
  v_reset_at timestamptz;
begin
  if p_key is null or length(p_key) < 1 or length(p_key) > 300 then
    raise exception 'invalid rate-limit key' using errcode = '22023';
  end if;
  if p_limit < 1 or p_limit > 10000 then
    raise exception 'invalid rate-limit limit' using errcode = '22023';
  end if;
  if p_window_seconds < 1 or p_window_seconds > 604800 then
    raise exception 'invalid rate-limit window' using errcode = '22023';
  end if;

  insert into public.rate_limits as rate_limit (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
  set
    count = case
      when rate_limit.reset_at <= now() then 1
      else rate_limit.count + 1
    end,
    reset_at = case
      when rate_limit.reset_at <= now() then now() + make_interval(secs => p_window_seconds)
      else rate_limit.reset_at
    end
  returning rate_limit.count, rate_limit.reset_at
  into v_count, v_reset_at;

  return query
  select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    v_reset_at;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
revoke all on function public.consume_rate_limit(text, integer, integer) from anon;
revoke all on function public.consume_rate_limit(text, integer, integer) from authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
