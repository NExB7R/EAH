-- EAH: auto-start 30-day trial when a business gets an owner
-- + precise seconds-remaining RPC for countdown UI

-- ═══ 1. Trigger: assign owner → auto-trial ═══
create or replace function public.grant_trial_on_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_trial_days int := 30;
  v_sub_id uuid;
begin
  -- only when owner just got assigned
  if (new.owner_profile_id is not null)
     and (old.owner_profile_id is null or old.owner_profile_id <> new.owner_profile_id)
  then
    -- skip if there's already an active/trial/pending subscription
    if exists (
      select 1 from public.business_subscriptions
      where business_id = new.id
        and status in ('trial', 'active', 'pending')
    ) then
      return new;
    end if;

    -- fallback: use first active plan if exists (for feature flags)
    select id into v_plan_id
    from public.subscription_plans
    where is_active = true
    order by display_order asc
    limit 1;

    insert into public.business_subscriptions (
      business_id, owner_id, plan_id, status, is_trial,
      starts_at, expires_at
    )
    values (
      new.id,
      new.owner_profile_id,
      v_plan_id,
      'trial',
      true,
      now(),
      now() + (v_trial_days || ' days')::interval
    )
    returning id into v_sub_id;

    insert into public.subscription_events (subscription_id, event_type, metadata)
    values (v_sub_id, 'trial_started',
      jsonb_build_object('days', v_trial_days, 'business_id', new.id));
  end if;
  return new;
end $$;

drop trigger if exists businesses_grant_trial on public.businesses;
create trigger businesses_grant_trial
  after insert or update of owner_profile_id on public.businesses
  for each row execute function public.grant_trial_on_owner();

-- ═══ 2. RPC: get_trial_status (seconds precision) ═══
create or replace function public.get_trial_status(p_business_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub record;
  v_seconds_left bigint;
begin
  select id, status, is_trial, starts_at, expires_at
    into v_sub
  from public.business_subscriptions
  where business_id = p_business_id
    and status in ('trial', 'active')
  order by expires_at desc
  limit 1;

  if not found then
    return jsonb_build_object('has_subscription', false);
  end if;

  v_seconds_left := greatest(0, extract(epoch from (v_sub.expires_at - now()))::bigint);

  return jsonb_build_object(
    'has_subscription', true,
    'subscription_id', v_sub.id,
    'status', v_sub.status,
    'is_trial', v_sub.is_trial,
    'starts_at', v_sub.starts_at,
    'expires_at', v_sub.expires_at,
    'seconds_left', v_seconds_left,
    'days_left',   v_seconds_left / 86400,
    'hours_left', (v_seconds_left % 86400) / 3600,
    'minutes_left', (v_seconds_left % 3600) / 60,
    'seconds_rem', v_seconds_left % 60,
    'is_expiring_soon', v_seconds_left < (7 * 86400)
  );
end $$;

revoke all on function public.get_trial_status(uuid) from public;
grant execute on function public.get_trial_status(uuid) to authenticated;
