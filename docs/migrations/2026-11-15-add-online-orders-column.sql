-- ═══════════════════════════════════════════════════════════
-- EAH — Migration v10: 2026-11-15
-- إضافة accepts_online_orders بجانب accepts_whatsapp_orders
-- لا حذف — legacy يبقى
-- ═══════════════════════════════════════════════════════════

-- 1. إضافة العمود الجديد (default = accepts_orders الموجود)
alter table public.businesses 
  add column if not exists accepts_online_orders boolean not null default false;

-- 2. نسخ القيمة الحالية من accepts_orders (الموجود)
update public.businesses
set accepts_online_orders = accepts_orders
where accepts_online_orders = false and accepts_orders = true;

-- 3. فهرس للأداء
create index if not exists businesses_accepts_online_orders_idx 
  on public.businesses (accepts_online_orders) 
  where accepts_online_orders = true;

comment on column public.businesses.accepts_online_orders is
  'استقبال الطلبات داخل EAH — يستبدل accepts_orders تدريجيًا';
