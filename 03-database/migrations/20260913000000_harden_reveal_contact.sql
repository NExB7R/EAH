-- ============================================================
-- EAH — Contact Reveals Hardening
-- Applied manually via Supabase SQL Editor on 2026-09-13
-- ============================================================

-- 1) نظّف صفوف الاختبار اللي مخالفة للـ constraints
delete from public.contact_reveals
where visitor_hash !~ '^[a-f0-9]{64}$'
   or method_type not in ('phone','whatsapp','email','website','instagram','facebook');

-- 2) شيل أي بقايا constraints قديمة (لو موجودة)
alter table public.contact_reveals
  drop constraint if exists contact_reveals_method_type_check;
alter table public.contact_reveals
  drop constraint if exists contact_reveals_visitor_hash_check;
drop index if exists public.contact_reveals_dedup_uidx;

-- 3) ضيف الـ CHECK constraints
alter table public.contact_reveals
  add constraint contact_reveals_method_type_check
  check (method_type in ('phone','whatsapp','email','website','instagram','facebook'));

alter table public.contact_reveals
  add constraint contact_reveals_visitor_hash_check
  check (visitor_hash ~ '^[a-f0-9]{64}$');

-- 4) index عادي لتسريع الاستعلامات
create index if not exists contact_reveals_dedup_idx
  on public.contact_reveals (business_id, method_type, visitor_hash, created_at desc);

-- 5) استبدل الدالة بالنسخة الآمنة
create or replace function public.reveal_contact(
  p_business_id uuid,
  p_method_type text,
  p_visitor_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duplicate boolean := false;
  v_total int;
begin
  -- validation
  if p_method_type not in ('phone','whatsapp','email','website','instagram','facebook') then
    raise exception 'invalid method_type: %', p_method_type
      using errcode = '22023';
  end if;
  if p_visitor_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid visitor_hash'
      using errcode = '22023';
  end if;

  -- قفل على (business + method + visitor) — يمنع race condition
  perform pg_advisory_xact_lock(
    hashtextextended(
      p_business_id::text || ':' || p_method_type || ':' || p_visitor_hash,
      0
    )
  );

  -- هل نفس الزائر كشف نفس النوع خلال آخر 24 ساعة؟
  select exists(
    select 1 from public.contact_reveals
    where business_id  = p_business_id
      and method_type  = p_method_type
      and visitor_hash = p_visitor_hash
      and created_at   > now() - interval '24 hours'
  ) into v_duplicate;

  if not v_duplicate then
    insert into public.contact_reveals (business_id, method_type, visitor_hash)
    values (p_business_id, p_method_type, p_visitor_hash);
  end if;

  select count(*) into v_total
  from public.contact_reveals
  where business_id = p_business_id and method_type = p_method_type;

  return jsonb_build_object('duplicate', v_duplicate, 'total', v_total);
end;
$$;

-- 6) صلاحيات
revoke all on function public.reveal_contact(uuid, text, text) from public;
grant execute on function public.reveal_contact(uuid, text, text) to authenticated, anon;
