# EAH Web

واجهة الويب/PWA الأولية لمشروع EAH.

## Stack

- Next.js 16.3.4 (App Router)
- React 19.2.8
- Supabase SSR 0.12.7
- Supabase JS 2.116.0
- TypeScript
- Mobile-first / Dark-first
- Web App Manifest + Service Worker shell

## Environment

انسخ `.env.example` إلى `.env.local` وأدخل:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

لا تضع أي `service_role` أو `sb_secret` key في متغير يبدأ بـ `NEXT_PUBLIC_`.

## Run

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:3000`.

> ملاحظة: تثبيت الحزم لم يكتمل داخل بيئة البناء الحالية بسبب timeout في الوصول إلى npm registry؛ `package.json` مثبت بإصدارات محددة، ويجب توليد/تحديث `package-lock.json` على جهاز التطوير عند أول `npm install` ناجح.
