-- EAH: is_open_now depends on current time and must not be IMMUTABLE.
-- STABLE is the correct volatility class for a function that reads now().

create or replace function public.is_open_now(p_working_hours jsonb)
returns boolean
language plpgsql
stable
set search_path = pg_catalog, pg_temp
as $$
declare
  v_day text;
  v_open text;
  v_close text;
  v_now text;
begin
  if p_working_hours is null then return false; end if;

  v_day := lower(trim(to_char(now() at time zone 'Africa/Cairo', 'dy')));
  if not (p_working_hours ? v_day) then
    v_day := lower(to_char(now() at time zone 'Africa/Cairo', 'day'));
    v_day := trim(v_day);
  end if;

  v_open := p_working_hours->v_day->>'open';
  v_close := p_working_hours->v_day->>'close';
  if v_open is null or v_close is null then return false; end if;

  v_now := to_char(now() at time zone 'Africa/Cairo', 'HH24:MI');

  if v_open <= v_close then
    return v_now >= v_open and v_now < v_close;
  else
    return v_now >= v_open or v_now < v_close;
  end if;
end;
$$;
