# EAH — Web App

> Next.js 16 + React 19 + TypeScript.
> جزء من مشروع EAH.

## المتطلبات

- Node.js v22+
- npm v10+
- Supabase account

## التشغيل

1. npm install
2. cp .env.example .env.local
3. املأ القيم في .env.local
4. npm run dev

افتح http://localhost:3000

## الأوامر

- npm run dev — dev server
- npm run build — production (SIGILL محلي)
- npm run start — production
- npm run lint — ESLint
- npx tsc --noEmit — typecheck

## البنية

- app/ — App Router
- components/ — مكونات
- lib/ — supabase + data + ranking
- public/ — assets
- proxy.ts — session refresh

## الهوية

- خلفية: #07020D
- بنفسجي: #9D4EDD / #A855F7 / #C77DFF
- ذهبي: #E8C79A / #F5D9A7
- خطوط: Cairo Variable + Tajawal Variable
- ستايل: نيون ناعم، dark-only

## القواعد

1. typecheck قبل كل commit
2. commits صغيرة
3. build محلي ممنوع (SIGILL)
4. استخدم WmImage لكل صورة

## للمزيد

- ../docs/MASTER_BRIEF.md
- ../docs/AI_CONTRACT.md
- ../docs/AI_HANDOFF.md
- ../docs/PROGRESS.md
