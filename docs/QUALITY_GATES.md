# EAH — Quality Gates (5 بوابات جودة)

آخر تحديث: 2026-11-18
الغرض: كل تغيير يمر على 5 بوابات قبل commit.

---

## Gate 1: Type Safety

قبل أي commit:
- cd ~/EAH/web && npx tsc --noEmit > /tmp/tsc.log 2>&1; echo "REAL_EXIT=$?"
- النتيجة يجب أن تكون REAL_EXIT=0
- إذا فشل: اقرأ /tmp/tsc.log، أصلح، أعد

لا commit مع أخطاء TypeScript.

---

## Gate 2: Lint & Format

بعد Gate 1:
- npx prettier --write <changed-files>
- npx eslint <changed-files> — صفر errors
- npx prettier --check <files>

Warnings مقبولة (unused vars في legacy). Errors لا.

---

## Gate 3: Logic Review

قبل commit. Checklist:

لل DB:
- migration idempotent (IF EXISTS)?
- SELECT قبل + بعد?
- rollback ممكن?

لل API/Server Actions:
- requireAdmin/getUserSession في البداية?
- validated مع Zod?
- rate-limited?
- audit_logs مسجل?
- revalidatePath بعد التغيير?

لل UI:
- يعمل 320px?
- keyboard accessible?
- aria-labels?
- loading/empty/error states?

---

## Gate 4: Security Review

قبل commit:
- RLS يمر صحيح (أو service_role مع تبرير)?
- لا sql.raw بدون validation?
- Auth: session + role محقق?
- Rate limiting مستدعى?
- لا expose PII بدون تحقق?
- Server Actions = محمي. API routes = تحقق.
- لا dangerouslySetInnerHTML بدون replace(/</g, '\\u003c')?
- لا secret في NEXT_PUBLIC_*?
- createServiceClient فقط في server-only?
- العمليات الحساسة في audit_logs?

---

## Gate 5: Performance & Vercel Impact

قبل commit (حرج — Vercel paused):
- import جديد < 50KB?
- force-dynamic أم revalidate: N?
- DB queries: N+1?
- الصور unoptimized (لتوفير CPU)?
- unstable_cache للاستعلامات الثقيلة?
- Vercel CPU impact < 0.1h/شهر?

---

## Stop Conditions

STOP-1: فشل أي Gate — لا commit.
STOP-2: > 200 سطر تغيير في commit — قسّم.
STOP-3: تعديل SACRED — يحتاج موافقة (app/layout, app/page, proxy.ts, lib/supabase/*).
STOP-4: > ملف واحد في patch — واحد في كل مرة.
STOP-5: regex شامل على ملفات — ممنوع (سبب 54 خطأ سابقًا).
STOP-6: "تم" بدون إثبات — يحتاج output.

---

## Commit Message Convention

Types: feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert|sec

أمثلة صحيحة:
- fix(csp): add script-src directive for eval
- feat(orders): add accepts_online_orders to DB

أمثلة خاطئة:
- update
- ux(home): ...
- WIP

---

## Definition of Done

Bug Fix:
- bug لا يحدث بعد الإصلاح
- لا regressions (tsc + vitest)
- commit message يوضح السبب

Feature:
- DB + Data + UI + Test
- docs محدّثة
- 320px
- offline-aware

Refactor:
- سلوك متطابق
- tests موجودة
- لا تغيير public API

Docs:
- صحيح ومحدّث
- links تعمل
- أمثلة واقعية

---

## Session Report

نهاية كل جلسة:

## Completed
- [hash] Description

## Gates Passed
- [x] 1-5

## Remaining
- Next task

## Risks
- Concern

---

## بدء جلسة جديدة

1. اقرأ HANDOFF.md
2. اقرأ RULES.md
3. اقرأ COMMON_AI_MISTAKES.md
4. اقرأ QUALITY_GATES.md (هذا)
5. اقرأ WORKFLOW_CONSTRAINED.md
6. git status + git log --oneline -10
7. أعلن: "جاهز. سأتبع QUALITY_GATES."

---

## علامات النجاح

- كل commit يمر على 5 Gates
- لا rework
- المستخدم يفهم من Session Report
- working tree clean
- docs محدّثة
- لا surprise commits

## علامات الفشل

- تجاوز gates لتوفير الوقت
- commits كبيرة
- "تم" بدون إثبات
- patch متعدد الملفات
- تعديل SACRED بدون موافقة
- تجاهل Vercel limits
