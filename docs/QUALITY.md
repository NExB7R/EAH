# EAH — QUALITY.md

> نظام الجودة الكامل. المصدر الوحيد للحقيقة.
> آخر تحديث: 2026-09-30

---

## 0. ليه النظام ده؟

**المشكلة:**
- كود بيتراكم بدون فحص = ديون تقنية
- أخطاء بتوصل للـ production
- secrets ممكن تتسرب
- صعوبة التطوير بعدين

**الحل:**
بوابة واحدة (lefthook) بتفحص كل حاجة قبل الـ commit.

---

## 1. الطبقات الست

| # | الطبقة | الأداة | بتفحص إيه |
|---|--------|--------|-----------|
| 1 | Type Safety | tsc | أخطاء الأنواع |
| 2 | Code Quality | eslint | كود وحش |
| 3 | Formatting | prettier | التنسيق |
| 4 | Secrets | gitleaks | مفاتيح وكلمات سر |
| 5 | Dependencies | npm audit | ثغرات الحزم |
| 6 | Dead Code | knip | ملفات ودوال ميتة |
| 7 | Unit Tests | vitest | منطق الأعمال |
| 8 | CI | GitHub Actions | بوابة على السيرفر |

---

## 2. إمتى بتشتغل

### Pre-commit
- secrets (gitleaks): 0.4s
- tests (vitest): 6s
- prettier: 3s
- eslint: 9s
- typecheck: 11s
- المجموع: 11 ثانية (parallel)

### Pre-push
- eslint-full: 25s
- npm-audit: 2s
- prettier-full: 12s
- tests-full: 3s
- typecheck-full: 6s
- المجموع: 46 ثانية

### يدوي
cd web
npm run lint
npm run format
npm run typecheck
npm run test
npm run knip
npm run secrets

---

## 3. الملفات

- /lefthook.yml
- web/knip.json
- web/.jscpd.json
- web/.prettierrc.json
- web/.prettierignore
- web/vitest.config.mts
- .github/workflows/quality.yml

---

## 4. إصلاح المشاكل

- typecheck: npx tsc --noEmit
- eslint: npx eslint . --fix
- prettier: npx prettier --write
- secrets: شيل الsecret وغيّره
- knip: احذف او ضيف لـ ignore
- vitest: اقرأ الخطأ، صلّح الكود أو الاختبار

---

## 5. القواعد

ممنوع:
- git commit --no-verify
- @ts-ignore بدون تعليق
- secrets في الكود
- unused imports
- commit بدون اختبار للـ logic الجديد

مسموح:
- eslint-disable مع تعليق
- ignore في knip لو false positive
- skip test لو tricky (بحذر)

---

## 6. قبل أي feature

1. اكتب الكود
2. git commit
3. لو فشل صلّح
4. git push
5. لو فشل صلّح

---

## 7. الصيانة

اسبوعياً:
npm run test
npm run knip
npm run dup
npm audit

شهرياً:
npx npm-check-updates

---

## 8. اللي النظام مش بيمنعه

- الأداء (محتاج Lighthouse)
- التصميم (محتاج مراجعة بشرية)
- التجاوب (محتاج اختبار أجهزة)
- السلاسة (محتاج إحساس يدوي)
- الأمان العميق (محتاج مراجعة كود)

---

## 9. الأدوات

| الأداة | الدور |
|--------|-------|
| TypeScript | type safety |
| ESLint | كود |
| Prettier | تنسيق |
| lefthook | بوابة Git |
| gitleaks | secrets |
| knip | كود ميت |
| Vitest | unit tests |
| GitHub Actions | CI |

---

## 10. عند الفشل

1. اقرأ الخطأ
2. افهم السبب
3. صلّح
4. جرّب تاني

---

آخر تحديث: 2026-09-30
