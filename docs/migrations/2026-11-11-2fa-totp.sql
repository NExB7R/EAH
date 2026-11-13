-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: 2026-11-11
-- 2FA (TOTP) — مجاني 100%
--   - secret: مشفر في DB (يُنشأ مرة واحدة)
--   - backup_codes: 10 أكواد (hashed) للطوارئ
--   - enabled_at: تاريخ التفعيل (null = غير مفعّل)
-- ═══════════════════════════════════════════════════════════

create table if not exists public.user_2fa (
  user_id uuid primary key references auth.users(id) on delete cascade,
  secret text not null,
  backup_codes text[] not null default '{}',
  enabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_2fa enable row level security;

-- المستخدم لا يرى صفه مباشرة (نستخدم RPC)
-- لا policy — فقط service_role + RPC security definer

comment on table public.user_2fa is
  '2FA TOTP secrets — لا تُقرأ مباشرة، فقط عبر RPC';

-- Trigger لتحديث updated_at
create or replace function public.touch_2fa_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists user_2fa_touch on public.user_2fa;
create trigger user_2fa_touch
  before update on public.user_2fa
  for each row execute function public.touch_2fa_updated_at();
