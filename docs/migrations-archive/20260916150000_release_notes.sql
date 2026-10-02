-- EAH: release notes + targeted notifications

create table if not exists public.release_notes (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  title text not null,
  body text,
  audience text not null default 'all' check (audience in ('all','customers','merchants','admins')),
  published_at timestamptz default now(),
  published_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists release_notes_version_idx on public.release_notes (version);
create index if not exists release_notes_audience_idx on public.release_notes (audience, published_at desc);

alter table public.release_notes enable row level security;

drop policy if exists rn_read on public.release_notes;
create policy rn_read on public.release_notes
  for select to authenticated using (true);

drop policy if exists rn_write on public.release_notes;
create policy rn_write on public.release_notes
  for all to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin'));

-- RPC: publish release + notify audience
create or replace function public.publish_release(
  p_version text,
  p_title text,
  p_body text,
  p_audience text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_release_id uuid;
  v_affected int := 0;
begin
  if v_caller is null then return jsonb_build_object('ok', false, 'error', 'unauthorized'); end if;
  if not exists (select 1 from public.user_roles where user_id = v_caller and role = 'super_admin') then
    return jsonb_build_object('ok', false, 'error', 'not_admin');
  end if;
  if p_audience not in ('all','customers','merchants','admins') then
    return jsonb_build_object('ok', false, 'error', 'invalid_audience');
  end if;

  insert into public.release_notes (version, title, body, audience, published_by)
  values (p_version, p_title, p_body, p_audience, v_caller)
  returning id into v_release_id;

  -- notify audience
  insert into public.notifications (profile_id, type, title, body, deep_link)
  select
    ur.user_id,
    'release_note',
    coalesce(p_title, 'تحديث جديد') || ' — v' || p_version,
    coalesce(p_body, ''),
    '/notifications'
  from public.user_roles ur
  where (
    p_audience = 'all'
    or (p_audience = 'customers' and ur.role = 'customer')
    or (p_audience = 'merchants' and ur.role = 'merchant')
    or (p_audience = 'admins' and ur.role = 'super_admin')
  );

  get diagnostics v_affected = row_count;

  return jsonb_build_object('ok', true, 'release_id', v_release_id, 'notified', v_affected);
end $$;

revoke all on function public.publish_release(text, text, text, text) from public;
grant execute on function public.publish_release(text, text, text, text) to authenticated;
