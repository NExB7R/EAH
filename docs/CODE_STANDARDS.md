# EAH — CODE_STANDARDS.md

> معايير الكود الإجبارية. مأخوذة من تجارب حقيقية.
> اقرأه قبل أي سطر كود.

**آخر تحديث:** 2026-09-27

---

## 1. التفكير قبل الكود

### 1.1 Problem Decomposition

قبل أي feature:
1. افهم المشكلة — إيه اللي المستخدم عايزه؟
2. قسّمها — لمهام صغيرة.
3. حدّد الأولويات — إيه الأساسي؟
4. اختار الـ Approach — إيه أسرع طريقة؟
5. نفّذ — واحدة واحدة.

### 1.2 IPO Model

لكل function:
- Input: إيه اللي بيدخل؟
- Process: إيه اللي بيحصل؟
- Output: إيه اللي بيخرج؟

---

## 2. كتابة الكود

### 2.1 قبل الكتابة

- افحص — grep على الاسم/الوظيفة.
- اقرأ الملفات المتعلقة.
- افهم السياق.
- اسأل لو مش واضح.

### 2.2 أثناء الكتابة

- TypeScript strict — صفر any.
- Server Components افتراضي.
- CSS Modules (مفيش Tailwind).
- CSS Variables للألوان.
- تعليقات عربي للـ WHY.

### 2.3 بعد الكتابة

- typecheck — npx tsc --noEmit.
- اختبر في المتصفح.
- commit برسالة واضحة.

---

## 3. أنماط الكود

### 3.1 Components

Structure:
1. Imports
2. Types
3. Constants
4. Helpers
5. Component (Hooks → Handlers → Early returns → JSX)

### 3.2 Functions

Naming:
- fetchX / getX — للجلب.
- handleX — للـ events.
- isX / hasX / canX — للـ booleans.
- formatX — للتنسيق.

Size:
- أقل من 50 سطر — لو أكتر، قسّمها.

---

## 4. Git Workflow

### 4.1 Commit Messages

Format: type(scope): description

Types:
- feat — feature جديدة.
- fix — bug fix.
- refactor — إعادة هيكلة.
- style — تنسيق.
- docs — وثائق.
- chore — مهام عامة.
- perf — تحسين أداء.
- test — اختبارات.

### 4.2 Commit Size

- commit صغير — feature واحدة.
- ممنوع commit كبير.
- ممنوع commit بدون typecheck.

### 4.3 Rollback

لو حصل خطأ:
git revert <commit-hash>
git push origin main

---

## 5. Performance Rules

### 5.1 Server Components

- افتراضي — Server Component.
- use client — للتفاعل فقط.
- Client Components صغيرة.

### 5.2 Data Fetching

- unstable_cache للـ public reads.
- React.cache للـ session.
- Promise.all للـ parallel.
- صفر requests مكررة.

### 5.3 Images

- next/image دايماً.
- WmImage للمنصة.
- Lazy loading افتراضي.

### 5.4 Animations

- CSS-only للأنيميشن.
- صفر JS animations (إلا لضرورة).
- prefers-reduced-motion دايماً.

---

## 6. Security Rules

### 6.1 Input

- كل input → Zod schema.
- Server-side validation.
- ممنوع trust على client.

### 6.2 Secrets

- .env.local — ممنوع في Git.
- Service Role — server only.
- ممنوع NEXT_PUBLIC_ لحاجة حساسة.

### 6.3 Database

- RLS على كل جدول.
- Parameterized queries.
- Service Role للـ admin فقط.

---

## 7. Testing

### 7.1 Manual

قبل كل commit:
- الصفحة تفتح.
- الأزرار شغّالة.
- Console نظيف.
- Mobile + Desktop.

### 7.2 Automated (مستقبلاً)

- Vitest للـ unit tests.
- Playwright للـ E2E.
- Lighthouse CI للأداء.

---

## 8. Debugging

### 8.1 خطوات التشخيص

1. افهم المشكلة — إيه اللي حصل؟
2. اجمع الأدلة — Console + Network.
3. حدّد السبب — إيه اللي بيكسر؟
4. اقترح حل — إيه الحل؟
5. نفّذ — واحدة واحدة.
6. اختبر — كل خطوة.

### 8.2 أدوات

- Chrome DevTools — Console + Network + Elements.
- Vercel Logs — للـ deployment.
- Supabase Logs — للـ DB.

### 8.3 Red Flags

- بدون أدلة → متخمّنش.
- بدون سبب → متعدّلش.
- بدون اختبار → متكمّلش.

---

## 9. Documentation

### 9.1 إيه اللي يتوثّق

- كل feature — في PROGRESS.md.
- كل bug — في LESSONS.md.
- كل قرار — في AI_CONTRACT.md.
- كل migration — في migrations/.

### 9.2 إزاي يتوثّق

- WHY مش WHAT — ليه عملنا كده.
- عربي بسيط — مش معقّد.
- أمثلة — لو ممكن.

---

## 10. الخلاصة

القاعدة الذهبية:
- لو مش فاهم → اسأل.
- لو مش متأكد → اتأكد.
- لو فيه خطر → قف.

الهدف: كود نظيف + احترافي + قابل للتوسّع.

---

آخر تحديث: 2026-09-27
