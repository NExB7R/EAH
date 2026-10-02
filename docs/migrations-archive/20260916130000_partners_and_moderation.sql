-- EAH: business partners + comment moderation

-- ═══ 1. Business partners table ═══
create table if not exists public.business_partners (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'partner' check (role in ('owner','partner')),
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(business_id, profile_id)
);

create index if not exists business_partners_biz_idx on public.business_partners (business_id);
create index if not exists business_partners_profile_idx on public.business_partners (profile_id);

alter table public.business_partners enable row level security;

-- read: own partners + business owner + admin
drop policy if exists bp_read on public.business_partners;
create policy bp_read on public.business_partners
  for select to authenticated
  using (
    profile_id = auth.uid()
    or exists (select 1 from public.businesses b where b.id = business_id and b.owner_profile_id = auth.uid())
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  );

-- write: business owner or admin
drop policy if exists bp_write on public.business_partners;
create policy bp_write on public.business_partners
  for all to authenticated
  using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_profile_id = auth.uid())
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  )
  with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_profile_id = auth.uid())
    or exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  );

-- ═══ 2. RPC: transfer ownership ═══
create or replace function public.transfer_business_ownership(
  p_business_id uuid,
  p_new_owner_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_current_owner uuid;
  v_new_profile uuid;
  v_business_name text;
begin
  if v_caller is null then
    return jsonb_build_object('ok', false, 'error', 'unauthorized');
  end if;

  select owner_profile_id, name into v_current_owner, v_business_name
  from public.businesses where id = p_business_id;

  if v_current_owner is null then
    return jsonb_build_object('ok', false, 'error', 'no_owner');
  end if;

  if v_current_owner <> v_caller
    and not exists (select 1 from public.user_roles where user_id = v_caller and role = 'super_admin')
  then
    return jsonb_build_object('ok', false, 'error', 'not_owner');
  end if;

  select id into v_new_profile
  from public.profiles where phone = p_new_owner_phone
  limit 1;

  if v_new_profile is null then
    return jsonb_build_object('ok', false, 'error', 'profile_not_found');
  end if;

  if v_new_profile = v_current_owner then
    return jsonb_build_object('ok', false, 'error', 'already_owner');
  end if;

  -- clear old partners, set new owner
  delete from public.business_partners where business_id = p_business_id;

  update public.businesses set owner_profile_id = v_new_profile where id = p_business_id;

  insert into public.business_partners (business_id, profile_id, role, added_by)
  values (p_business_id, v_new_profile, 'owner', v_caller)
  on conflict (business_id, profile_id) do update set role = 'owner';

  return jsonb_build_object('ok', true, 'new_owner', v_new_profile, 'business', v_business_name);
end $$;

revoke all on function public.transfer_business_ownership(uuid, text) from public;
grant execute on function public.transfer_business_ownership(uuid, text) to authenticated;

-- ═══ 3. Auto-flag reviews for moderation ═══
-- If review contains links, phone numbers, or profanity → status='pending', flagged_reason
alter table public.business_reviews
  add column if not exists flagged_reason text;

create or replace function public.auto_flag_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lower text := lower(coalesce(new.comment, ''));
  v_flags text[] := '{}';
begin
  -- URLs
  if v_lower ~ 'https?://|www\.|\.com|\.net|\.org' then
    v_flags := v_flags || 'يحتوي على رابط';
  end if;
  -- phone numbers
  if v_lower ~ '01[0-9]{9}|\\+20[0-9]{10}' then
    v_flags := v_flags || 'يحتوي على رقم';
  end if;
  -- common profanity (short list)
  if v_lower ~ '(زفت|وسخ|قذر|عرص|خول|حمار|كلب|حقير|تافه|فاشل|نصاب|حرامي)' then
    v_flags := v_flags || 'ألفاظ مسيئة';
  end if;
  -- all caps (shouting)
  if length(new.comment) > 20 and upper(new.comment) = new.comment then
    v_flags := v_flags || 'كتابة بحروف كبيرة';
  end if;

  if array_length(v_flags, 1) > 0 then
    new.status := 'pending';
    new.flagged_reason := array_to_string(v_flags, ' • ');
  end if;
  return new;
end $$;

drop trigger if exists reviews_auto_flag on public.business_reviews;
create trigger reviews_auto_flag
  before insert or update of comment on public.business_reviews
  for each row execute function public.auto_flag_review();

-- ═══ 4. RPC: get pending reviews (admin) ═══
create or replace function public.get_flagged_reviews()
returns table (
  id uuid, business_id uuid, business_name text, business_slug text,
  rating int, comment text, flagged_reason text, created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select r.id, r.business_id, b.name, b.slug, r.rating, r.comment, r.flagged_reason, r.created_at
  from public.business_reviews r
  join public.businesses b on b.id = r.business_id
  where r.status = 'pending' and r.flagged_reason is not null
    and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'super_admin')
  order by r.created_at desc
  limit 100;
$$;

revoke all on function public.get_flagged_reviews() from public;
grant execute on function public.get_flagged_reviews() to authenticated;
