-- ═══════════════════════════════════════════════════════════
-- EAH — Migration v4a: 2026-11-11
-- نظام خصوصية البحث بالرقم
--   full: يظهر كل شيء (اسم، صورة، نشاط)
--   anonymous: يظهر trust + شارات فقط، بدون هوية
-- trust_score يظهر دائمًا (حتى anonymous) — عشان الطيار يعرف "هو تمام"
-- ═══════════════════════════════════════════════════════════

-- 1. Enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'phone_lookup_visibility') then
    create type public.phone_lookup_visibility as enum ('full', 'anonymous');
  end if;
end $$;

-- 2. عمود mode
alter table public.profiles
  add column if not exists phone_lookup_mode public.phone_lookup_visibility
    not null default 'full';

-- 3. ترحيل من allow_phone_lookup (إن كان موجودًا)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name='allow_phone_lookup'
  ) then
    update public.profiles
      set phone_lookup_mode = 'anonymous'
      where allow_phone_lookup = false;
    alter table public.profiles drop column allow_phone_lookup;
  end if;
end $$;

comment on column public.profiles.phone_lookup_mode is
  'full = يظهر كل شيء للطيار، anonymous = trust فقط بدون هوية';
