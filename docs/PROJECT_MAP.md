# EAH — Project Map

> آخر تحديث: 2026-11-20

---

## 1. البنية العامة

~/EAH/
├── web/                    ← Next.js 16 (App Router)
│   ├── app/                ← Routes (Server Components)
│   ├── components/         ← Client + Server Components
│   ├── lib/                ← Logic (server-only + client-safe)
│   └── public/             ← Static assets
├── docs/                   ← Documentation
│   └── migrations/         ← SQL files (100 ملف)
└── .github/                ← CI workflows

---

## 2. الأدوار

- super_admin → الأدمن → /admin/*
- merchant → التاجر → /merchant/*
- customer → العميل → /account/*
- الزائر حالة وصول عامة، وليس دورًا مستقلًا

---

## 3. المسارات الرئيسية

- / — الرئيسية (public)
- /explore — البحث والفلاتر
- /businesses/[slug] — صفحة النشاط
- /auth — تسجيل دخول
- /account — مساحة العميل
- /merchant — مساحة التاجر
- /admin — لوحة الأدمن
- بحث الهاتف داخل /explore عند إدخال 11 رقمًا

---

## 4. الحدود الحرجة

### Client vs Server
- use client → لا server-only imports
- Server Pages → export const dynamic = 'force-dynamic'

### RLS (Supabase)
- يجب تفعيل RLS وسياسات مقيدة لكل جداول التطبيق في public.
- service_role يتجاوز RLS — مسموح به في السيرفر فقط وبعد تحقق الصلاحية.
- لا تستخدم service_role لإثبات أن RLS يعمل؛ اختبر بصلاحيات anon/authenticated على قاعدة QA.
- RPCs الحساسة: get_my_profile, search_customer_by_phone, find_by_phone

### Migrations
- كل تعديل DB = ملف في docs/migrations/
- التطبيق يدوي عبر SQL Editor
- لا rollback automations

---

## 5. الملفات الأكثر تغييرا

- lib/data/user.ts — session (يستخدم في كل مكان)
- app/layout.tsx — root layout (force-dynamic)
- lib/search/index.ts — محرك البحث
- components/profile/* — بروفايل

---

## 6. قبل البدء بجلسة جديدة

1. اقرأ docs/HANDOFF.md
2. اقرأ docs/RULES.md
3. اقرأ docs/PROFILE_SYSTEM.md (إن كنت تعدل بروفايل)
4. اقرأ docs/SEARCH_SYSTEM.md (إن كنت تعدل بحث)
5. git log --oneline -10 — ماذا حدث؟
6. cd web && npx tsc --noEmit — هل الأساس سليم؟

---

## 7. الاختبار السريع

cd web && npx tsc --noEmit
npx eslint app/ lib/ components/
npx prettier --check app/ lib/

---

## 8. النشر

- Branch: main فقط
- Production branch: main؛ أي push قد يطلق نشرًا تلقائيًا بحسب حالة مشروع Vercel.
- تحقق من حالة النشر الفعلية قبل اعتبار commit منشورًا.
- Region: iad1 (US East)
- Root: web/
- Production: https://eah-sq.vercel.app

---

## 9. ما لا تفعله

- npm run build محليا (SIGILL)
- npm test كامل (بطيء)
- git push --force
- تعديل migrations قديمة
- commit .env.local
- لصق SQL في terminal

---

## 10. عند الحاجة لتوثيق إضافي

- docs/HANDOFF.md — بداية الجلسة
- docs/CONSTITUTION.md — القواعد الدستورية
- docs/AI_CONTRACT.md — عقد الـ AI
- docs/DESIGN_SYSTEM.md — التصميم
- docs/DATABASE_RULES.md — قواعد الـ DB
