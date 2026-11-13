# EAH — Development Rules

> اقرأ هذا قبل أي تعديل. آخر تحديث: 2026-11-11

---

## 1. قبل أي تعديل

- اقرأ الملف كاملا (cat file)
- افحص الاستخدام (grep -rn "function_name")
- تحقق من وجود tests (ls lib/<module>/*.test.ts)
- افهم الـ role (client vs server)

---

## 2. Client vs Server (حرج)

use client لا يمكنه استيراد:
- lib/supabase/server (يستخدم next/headers)
- lib/data/* إن كانت تستورد server client
- server-only
- next/headers

يمكنه استيراد:
- lib/types/* (أنواع فقط)
- lib/actions/* (Server Actions)
- lib/hooks/*
- components/*
- lib/search/* (client-safe)

Server Component → Client: لا تمرر دوال عادية. استخدم Server Action.

---

## 3. قبل commit

cd web && npx tsc --noEmit; echo "EXIT=$?"
npx prettier --write <files>
npx eslint <files>

كل شيء يجب أن يكون EXIT=0 + صفر warnings.

---

## 4. قبل push

- lefthook pre-push يفحص typecheck تلقائيا
- لو رفض — لا force push. أصلح المشكلة.
- لو remote تفوقك — git pull --rebase origin main ثم push.

---

## 5. Migrations (SQL)

في terminal (لإنشاء الملف):
cat > docs/migrations/YYYY-MM-DD-name.sql << 'EOF'
-- SQL هنا
EOF

لتطبيق الـ migration:
1. افتح https://supabase.com/dashboard
2. اختر مشروع EAH
3. SQL Editor → New query
4. الصق محتوى الملف
5. Run

لا تلصق SQL في terminal. terminal = bash. SQL Editor = Postgres.

بعد التطبيق — تحقق:
select column_name from information_schema.columns 
where table_schema='public' and table_name='<table>' 
  and column_name='<col>';

---

## 6. الملفات الحساسة (لا تلمسها بدون قراءة)

- lib/supabase/server.ts — server-only
- lib/supabase/service.ts — service_role (يتجاوز RLS)
- middleware.ts — redirects
- next.config.ts — build config
- app/layout.tsx — root layout (force-dynamic)

---

## 7. قبل أي push على main

- tsc = 0
- prettier نظيف
- eslint نظيف
- لا server-only imports في client
- اختبرت الصفحة (أو طلبت اختبارها)
- commit message وفق feat|fix|docs|chore(scope): description

---

## 8. عند مواجهة خطأ

لا تكتب "جرب تاني" — اقرأ الخطأ:
- EXIT=2 + TS2339 = نوع مفقود
- EXIT=1 + Cannot find module = import خاطئ
- Vercel "Failed to compile" = client/server boundary
- Vercel "runtime error" = RLS أو data

---

## 9. القواعد الذهبية (12)

1. اقرأ قبل تكتب — cat + grep قبل patch
2. tsc بعد كل patch — لا تتراكم الأخطاء
3. commit واحد لكل feature — ليس 10 commits
4. لا force push أبدا — أصلح بدل تتجاوز
5. الملف ≤ 300 سطر — إن كبر، قسّمه
6. الدالة ≤ 50 سطر — إن كبر، بسّطها
7. use client في أول سطر — دائما
8. export const dynamic في Server Pages — دائما
9. Type not any — unknown + تحقق أفضل من any
10. RLS قبل service_role — service_role آخر حل
11. Prettier قبل commit — ليس بعده
12. الوثّق أثناء الكتابة — ليس بعد أسبوع

---

## 10. commit message types (commitlint)

**القائمة المسموحة فقط:**
`feat | fix | docs | style | refactor | perf | test | chore | ci | build | revert | sec`

**الأمثلة:**
- `feat(scope): new feature`
- `fix(scope): bug fix`
- `style(scope): UI/UX/formatting (no logic change)`
- `refactor(scope): code restructure`
- `perf(scope): performance improvement`
- `chore: cleanup, deps, configs`
- `docs: documentation only`
- `sec(scope): security-related fix`

**⚠️ ممنوع:** `ux`, `update`, `change`, `wip`, `temp` — commitlint يرفضها.

---

## 11. عند فشل Vercel build

1. افتح Vercel Dashboard → Deployments → آخر deployment
2. ابحث عن Failed to compile أو Error:
3. اقرأ السطر بعد ./path/file.ts — هذا مكان الخطأ
4. تحقق من client/server boundary
5. أرسل اللوج للـ AI (لا تخمّن)


---

## 11. ممنوعات معمارية (قرارات مُلزمة)

### ❌ ممنوع: Command Palette / Ctrl+K

**القرار:** 2026-11-13 — حُذفت command-palette نهائيًا من المنصة.

**السبب:**

- لم تكن مستدعاة في app/layout.tsx — dead code
- تجربة UX مشوشة (أوامر مخفية خلف Ctrl+K)
- المنصة تعتمد على بحث /explore + المساعد الذكي العائم
- زر البحث في admin-topbar كان يستدعي event لا مستمع له

**لا تفعل:**

- لا تُضِف CommandPalette في أي layout
- لا تستدعِ eah:open-command-palette event
- لا تُضِف Ctrl+K كاختصار
- لا تُنشئ components/ui/command-palette.* أو lib/command-palette/*

**البديل المعتمد:**

- بحث المستخدم: /explore مع lib/search/* (fuzzy + synonyms)
- بحث الهاتف: يُفعَّل تلقائيًا في /explore عند 11 رقم
- المساعد الذكي: ai-widget.tsx (عائم)
- التنقل: sidebar + topbar مباشر
