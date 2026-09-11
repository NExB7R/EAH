begin;

create table if not exists public.business_change_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  entity_type text not null,
  operation text not null,
  target_id uuid,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  admin_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_change_requests_entity_check check (entity_type in ('business','business_contact_method','business_media','offer')),
  constraint business_change_requests_operation_check check (operation in ('insert','update','delete')),
  constraint business_change_requests_status_check check (status in ('pending','approved','rejected','cancelled')),
  constraint business_change_requests_payload_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists business_change_requests_business_idx on public.business_change_requests (business_id, created_at desc);
create index if not exists business_change_requests_status_idx on public.business_change_requests (status, created_at desc);
create index if not exists business_change_requests_submitted_by_idx on public.business_change_requests (submitted_by, created_at desc);

alter table public.business_change_requests enable row level security;

drop policy if exists business_change_requests_admin_all on public.business_change_requests;
drop policy if exists business_change_requests_submitter_select on public.business_change_requests;
drop policy if exists business_change_requests_submitter_insert on public.business_change_requests;

create policy business_change_requests_admin_select on public.business_change_requests
for select to authenticated using ((select private.is_admin()));

create policy business_change_requests_submitter_select on public.business_change_requests
for select to authenticated using ((select auth.uid()) = submitted_by);

create policy business_change_requests_submitter_insert on public.business_change_requests
for insert to authenticated
with check (
  (select auth.uid()) = submitted_by
  and exists (
    select 1 from public.businesses b
    where b.id = business_change_requests.business_id
      and ((select private.has_business_permission(b.id, 'business.edit', (select auth.uid()))) or b.owner_profile_id = (select auth.uid()))
  )
);

drop policy if exists businesses_merchant_delete_own on public.businesses;
drop policy if exists businesses_merchant_insert_own on public.businesses;
drop policy if exists businesses_merchant_update_own on public.businesses;
drop policy if exists business_media_staff_all on public.business_media;
drop policy if exists business_contact_methods_staff_all on public.business_contact_methods;
drop policy if exists offers_staff_all on public.offers;

create policy businesses_owner_select on public.businesses
for select to authenticated using ((owner_profile_id = (select auth.uid())) or (select private.is_admin()));

create policy business_media_owner_select on public.business_media
for select to authenticated using (
  is_published = true
  or exists (select 1 from public.businesses b where b.id = business_media.business_id and (b.owner_profile_id = (select auth.uid()) or (select private.is_admin())))
);

create policy business_contact_methods_owner_select on public.business_contact_methods
for select to authenticated using (
  is_public = true
  or exists (select 1 from public.businesses b where b.id = business_contact_methods.business_id and (b.owner_profile_id = (select auth.uid()) or (select private.is_admin())))
);

create policy offers_owner_select on public.offers
for select to authenticated using (
  ((is_published = true) and ((starts_at is null) or (starts_at <= now())) and ((ends_at is null) or (ends_at >= now())))
  or exists (select 1 from public.businesses b where b.id = offers.business_id and (b.owner_profile_id = (select auth.uid()) or (select private.is_admin())))
);

create or replace function private.submit_business_change_request(p_business_id uuid,p_entity_type text,p_operation text,p_target_id uuid,p_payload jsonb)
returns uuid language plpgsql security definer set search_path = public, private, pg_temp as $$
declare v_user uuid := auth.uid(); v_id uuid;
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if p_entity_type not in ('business','business_contact_method','business_media','offer') then raise exception 'invalid_entity_type'; end if;
  if p_operation not in ('insert','update','delete') then raise exception 'invalid_operation'; end if;
  if jsonb_typeof(coalesce(p_payload, '{}'::jsonb)) <> 'object' then raise exception 'invalid_payload'; end if;
  if not private.has_business_permission(p_business_id, 'business.edit', v_user) then raise exception 'business_edit_permission_required'; end if;
  insert into public.business_change_requests (business_id, submitted_by, entity_type, operation, target_id, payload)
  values (p_business_id, v_user, p_entity_type, p_operation, p_target_id, coalesce(p_payload, '{}'::jsonb)) returning id into v_id;
  return v_id;
end;
$$;

create or replace function private.apply_business_change_request(p_request_id uuid,p_decision text,p_admin_note text default null)
returns public.business_change_requests language plpgsql security definer set search_path = public, private, pg_temp as $$
declare v_admin uuid := auth.uid(); r public.business_change_requests;
begin
  if v_admin is null or not private.is_admin(v_admin) then raise exception 'admin_required'; end if;
  if p_decision not in ('approved','rejected') then raise exception 'invalid_decision'; end if;
  select * into r from public.business_change_requests where id = p_request_id for update;
  if r.id is null then raise exception 'change_request_not_found'; end if;
  if r.status <> 'pending' then raise exception 'change_request_already_reviewed'; end if;

  if p_decision = 'approved' then
    if r.entity_type = 'business' and r.operation = 'update' then
      update public.businesses set
        business_type = case when r.payload ? 'business_type' then r.payload->>'business_type' else business_type end,
        name = case when r.payload ? 'name' then r.payload->>'name' else name end,
        slug = case when r.payload ? 'slug' then r.payload->>'slug' else slug end,
        description = case when r.payload ? 'description' then r.payload->>'description' else description end,
        latitude = case when r.payload ? 'latitude' then (r.payload->>'latitude')::double precision else latitude end,
        longitude = case when r.payload ? 'longitude' then (r.payload->>'longitude')::double precision else longitude end,
        address_text = case when r.payload ? 'address_text' then r.payload->>'address_text' else address_text end,
        city = case when r.payload ? 'city' then r.payload->>'city' else city end,
        area = case when r.payload ? 'area' then r.payload->>'area' else area end,
        is_open = case when r.payload ? 'is_open' then (r.payload->>'is_open')::boolean else is_open end,
        updated_at = now() where id = r.business_id;
    elsif r.entity_type = 'business_contact_method' and r.operation = 'insert' then
      insert into public.business_contact_methods (business_id, method_type, value, is_primary, is_public)
      values (r.business_id, r.payload->>'method_type', r.payload->>'value', coalesce((r.payload->>'is_primary')::boolean,false), coalesce((r.payload->>'is_public')::boolean,true));
    elsif r.entity_type = 'business_contact_method' and r.operation = 'update' then
      update public.business_contact_methods set
        method_type = case when r.payload ? 'method_type' then r.payload->>'method_type' else method_type end,
        value = case when r.payload ? 'value' then r.payload->>'value' else value end,
        is_primary = case when r.payload ? 'is_primary' then (r.payload->>'is_primary')::boolean else is_primary end,
        is_public = case when r.payload ? 'is_public' then (r.payload->>'is_public')::boolean else is_public end,
        updated_at = now() where id = r.target_id and business_id = r.business_id;
    elsif r.entity_type = 'business_contact_method' and r.operation = 'delete' then
      delete from public.business_contact_methods where id = r.target_id and business_id = r.business_id;
    elsif r.entity_type = 'business_media' and r.operation = 'insert' then
      insert into public.business_media (business_id, media_type, storage_path, alt_text, sort_order, is_published)
      values (r.business_id, r.payload->>'media_type', r.payload->>'storage_path', nullif(r.payload->>'alt_text',''), coalesce((r.payload->>'sort_order')::integer,0), true);
    elsif r.entity_type = 'business_media' and r.operation = 'update' then
      update public.business_media set
        media_type = case when r.payload ? 'media_type' then r.payload->>'media_type' else media_type end,
        storage_path = case when r.payload ? 'storage_path' then r.payload->>'storage_path' else storage_path end,
        alt_text = case when r.payload ? 'alt_text' then nullif(r.payload->>'alt_text','') else alt_text end,
        sort_order = case when r.payload ? 'sort_order' then (r.payload->>'sort_order')::integer else sort_order end
      where id = r.target_id and business_id = r.business_id;
    elsif r.entity_type = 'business_media' and r.operation = 'delete' then
      delete from public.business_media where id = r.target_id and business_id = r.business_id;
    elsif r.entity_type = 'offer' and r.operation = 'insert' then
      insert into public.offers (business_id,title,description,price,teaser_image_path,starts_at,ends_at,is_published)
      values (r.business_id,r.payload->>'title',nullif(r.payload->>'description',''),case when r.payload ? 'price' and r.payload->>'price' <> '' then (r.payload->>'price')::numeric else null end,nullif(r.payload->>'teaser_image_path',''),case when r.payload ? 'starts_at' and r.payload->>'starts_at' <> '' then (r.payload->>'starts_at')::timestamptz else null end,case when r.payload ? 'ends_at' and r.payload->>'ends_at' <> '' then (r.payload->>'ends_at')::timestamptz else null end,true);
    elsif r.entity_type = 'offer' and r.operation = 'update' then
      update public.offers set
        title = case when r.payload ? 'title' then r.payload->>'title' else title end,
        description = case when r.payload ? 'description' then nullif(r.payload->>'description','') else description end,
        price = case when r.payload ? 'price' then case when r.payload->>'price' = '' then null else (r.payload->>'price')::numeric end else price end,
        teaser_image_path = case when r.payload ? 'teaser_image_path' then nullif(r.payload->>'teaser_image_path','') else teaser_image_path end,
        starts_at = case when r.payload ? 'starts_at' then case when r.payload->>'starts_at' = '' then null else (r.payload->>'starts_at')::timestamptz end else starts_at end,
        ends_at = case when r.payload ? 'ends_at' then case when r.payload->>'ends_at' = '' then null else (r.payload->>'ends_at')::timestamptz end else ends_at end,
        updated_at = now() where id = r.target_id and business_id = r.business_id;
    elsif r.entity_type = 'offer' and r.operation = 'delete' then
      delete from public.offers where id = r.target_id and business_id = r.business_id;
    else
      raise exception 'unsupported_change_operation';
    end if;
  end if;

  update public.business_change_requests set status=p_decision,admin_note=p_admin_note,reviewed_by=v_admin,reviewed_at=now(),updated_at=now() where id=r.id returning * into r;
  insert into public.notifications (user_id,notification_type,title,body,deep_link)
  values (r.submitted_by,'business_change_review',case when p_decision='approved' then 'تم اعتماد تعديل نشاطك ✅' else 'تم رفض تعديل نشاطك' end,case when p_decision='approved' then 'تمت مراجعة التعديل ونشره على EAH.' else coalesce(nullif(p_admin_note,''),'التعديل لم يتم نشره بعد المراجعة.') end,'/merchant');
  return r;
end;
$$;

create or replace function public.submit_business_change_request(p_business_id uuid,p_entity_type text,p_operation text,p_target_id uuid,p_payload jsonb)
returns uuid language sql security definer set search_path = public, private, pg_temp as $$ select private.submit_business_change_request($1,$2,$3,$4,$5); $$;

create or replace function public.admin_review_business_change_request(p_request_id uuid,p_decision text,p_admin_note text default null)
returns public.business_change_requests language sql security definer set search_path = public, private, pg_temp as $$ select private.apply_business_change_request($1,$2,$3); $$;

revoke all on function public.submit_business_change_request(uuid,text,text,uuid,jsonb) from public;
grant execute on function public.submit_business_change_request(uuid,text,text,uuid,jsonb) to authenticated;
revoke all on function public.admin_review_business_change_request(uuid,text,text) from public;
grant execute on function public.admin_review_business_change_request(uuid,text,text) to authenticated;

create or replace function private.notify_business_change_request()
returns trigger language plpgsql security definer set search_path = public, private, pg_temp as $$
declare admin_row record; business_name text; submitter_name text;
begin
  select name into business_name from public.businesses where id=new.business_id;
  select coalesce(display_name,phone,'صاحب النشاط') into submitter_name from public.profiles where id=new.submitted_by;
  for admin_row in select user_id from public.user_roles where role in ('admin','super_admin') loop
    insert into public.notifications (user_id,notification_type,title,body,deep_link)
    values (admin_row.user_id,'business_change_pending','تعديل جديد يحتاج مراجعة 🔔',coalesce(business_name,'نشاط') || ' — ' || submitter_name || ' قدم تعديلًا يحتاج موافقتك قبل النشر.','/admin/change-requests/' || new.id::text);
  end loop;
  return new;
end;
$$;

drop trigger if exists business_change_request_notify on public.business_change_requests;
create trigger business_change_request_notify after insert on public.business_change_requests for each row execute function private.notify_business_change_request();

commit;
