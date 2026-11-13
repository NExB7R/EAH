-- ═══════════════════════════════════════════════════════════
-- EAH — Migration v6: 2026-11-11
--   1. trust_only: قيمة enum جديدة (يظهر trust فقط، بلا هوية)
--   2. hide_comments, hide_reviews: تحكم العميل
--   3. RPC v6: احترام display_name_mode + hide_avatar + counts
--   4. إزالة super_admin bypass — الأدمن يتحكم بخصوصيته
-- ═══════════════════════════════════════════════════════════

-- 1. أضف trust_only للـ enum
alter type public.phone_lookup_visibility add value if not exists 'trust_only';

-- 2. أعمدة الخصوصية
alter table public.profiles
  add column if not exists hide_comments boolean not null default false;

alter table public.profiles
  add column if not exists hide_reviews boolean not null default false;

comment on column public.profiles.hide_comments is
  'إذا true: لا تظهر عدد تعليقات العميل في بحث الهاتف';
comment on column public.profiles.hide_reviews is
  'إذا true: لا تظهر تقييمات العميل في بحث الهاتف';
