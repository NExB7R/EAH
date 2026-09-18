# EAH — Security Hardening

## Rotate keys كل 90 يوم
- Service Role Key
- VAPID Keys
- CRON_SECRET
- Cloudinary API Secret

## Headers — موجودة في next.config.ts
- CSP + HSTS + XFO + XCTO + RP + PP

## RLS — كرر دورياً
select tablename from pg_tables t where schemaname=public and not exists (select 1 from pg_policies p where p.tablename=t.tablename);

## Rate limit
- Memory للـ routes السريعة
- DB للـ routes الموزعة

## Backup
- Supabase daily
- Cloudinary خارجياً
- Git + AES256
