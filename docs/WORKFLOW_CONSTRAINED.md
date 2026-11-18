# EAH — Workflow للموارد المحدودة

آخر تحديث: 2026-11-18
الحالة: Vercel paused (حتى 2026-12-15)، جهاز محلي محدود

---

## المبدأ

الموارد محدودة. التركيز على الجودة، ليس السرعة.
هدفان: (1) لا نحرق Vercel مرة أخرى عند العودة، (2) لا نكسر الكود محليًا.

---

## قواعد العمل اليومية

قبل الجلسة:
- git status (clean)
- git log --oneline -3
- free -h

أثناء التطوير:
- npm run dev مرة واحدة، اتركه مفتوح
- لا npm run build محليًا (SIGILL)
- لا npm test كامل، استخدم npx vitest run <file>
- لا agents متوازية

قبل commit:
- npx tsc --noEmit > /tmp/tsc.log 2>&1; echo "REAL_EXIT=$?"
- npx prettier --write <files>
- git status
- commit واحد صغير

بعد commit:
- git push origin main
- لا ملفات ثقيلة (فيديو، صور كبيرة)

---

## حماية Vercel (عند العودة)

مسموح:
- 3-5 commits/يوم
- PR flow (branch > preview > merge)
- preview deployments للمراجعة

ممنوع:
- 10+ commits/يوم
- push مباشر لـ main بدون preview
- dynamic pages بدون cache
- صور ثقيلة غير محسّنة

أفضل ممارسات:
- batch commits
- PR flow
- revalidate: 3600 لأي صفحة
- Edge runtime حيث ممكن
- تجنب force-dynamic

---

## Vercel Hobby limits

| Metric | Limit | Goal |
|---|---|---|
| Fluid CPU | 4h/شهر | < 2h |
| Data Transfer | 100GB | < 50GB |
| Invocations | 1M | < 200K |
| Build Minutes | 6000 | < 500 |
| Deployments | 100/يوم | < 5/يوم |

سبب الـ pause السابق: force-dynamic في / و /admin و /explore.
كل طلب = server invocation = CPU.

---

## خطة 28 يومًا

الأسبوع 1 (18-25 نوفمبر): إكمال online_orders + offline
الأسبوع 2 (25-2 ديسمبر): Home design + 10 أنشطة حقيقية
الأسبوع 3 (2-9 ديسمبر): اختبار شامل
الأسبوع 4 (9-15 ديسمبر): Vercel يعود + مراقبة
بعد 15 ديسمبر: Vercel Pro ($20) + eah.store + 50 نشاط

---

## caching strategy

في الكود:
- bad: export const dynamic = 'force-dynamic'
- good: export const revalidate = 3600

في DB:
- unstable_cache
- revalidate: 300-3600
- tags للـ invalidation

في API:
- GET: revalidate 300
- POST: dynamic (لا cache)
- cron: dynamic (مرة/يوم)

---

## مراقبة (بعد العودة)

يوميًا:
- Vercel Dashboard > Usage
- CPU > 3h: تقليل dynamic
- bandwidth > 50GB: تفعيل unoptimized
- invocations > 500K: تفعيل revalidate

الهدف: البقاء تحت 50% من كل limit.

---

## ملفات حرجة (لا تعدّل بدون مراجعة)

- next.config.ts
- proxy.ts (CSP + auth)
- middleware.ts
- app/layout.tsx
- lib/supabase/*

---

## طوارئ

SIGILL:
- rm -rf .next
- npm run dev
- unoptimized: true (موجود)

Build failure:
- قراءة log
- إصلاح
- لا force push

Vercel paused مرة أخرى:
- مراجعة Usage
- تقليل dynamic
- ترقية Pro

---

## سجل commits مهمة

2026-11-18: unoptimized: true + script-src fix
2026-11-17: online_orders كامل + offline Phase 1
