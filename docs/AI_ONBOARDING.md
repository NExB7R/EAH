# 🚀 EAH — AI ONBOARDING

> **الملف الأول اللي يقرأه أي شات AI جديد.**
> 5 دقايق قراءة — توفير ساعات لف.
> آخر تحديث: 2026-10-08

---

## 0. اقرأني الأول

**اقرأ بالترتيب (15 دقايق):**
1. **هذا الملف** — كل حاجة أساسية
2. `docs/ROLES_MATRIX.md` — مصفوفة الأدوار (admin/merchant/customer/guest) — ⚠️ **مهم جداً**
3. `docs/CONTEXT_MAP.md` — كل ملف موجود + الغرض منه
4. `docs/AI_CONTRACT.md` — القواعد الإجبارية (§31-§38)
5. `docs/LESSONS.md` — الأخطاء السابقة (خصوصاً §31، §32)
6. `docs/PROGRESS.md` — حالة كل ملف
7. `docs/NEXT_SESSION.md` — المهام المتبقية

**بعدها قول:** "قرأت. جاهز." واستنى تعليمات.

---

## 1. هوية المشروع

- **EAH** — منصة اكتشاف محلية مصرية (مش مطاعم بس — 20+ نوع قادم)
- **المكان:** شبين القناطر + القرى
- **السلوغان:** اللي نفسك فيه ؟
- **الهوك:** شبيك لبيك .. كل حاجة حواليك
- **المبادئ الثابتة:**
  - مجاني 100% للعميل
  - صفر عمولة على التاجر
  - رقم الموبايل ما يظهرش أبداً
  - Verified ≠ مدفوع

---

## 2. الحالة الحالية

| البند | القيمة |
|-------|--------|
| **الإصدار** | v1.0.0 |
| **آخر commit** | شوف `PROGRESS.md` |
| **الإنتاج** | https://eah-sq.vercel.app |
| **الفرع** | main |
| **الجهاز** | SIGILL (ممنوع build محلي) |

---

## 3. القواعد الحرجة (احفظها)

| # | القاعدة | السبب |
|---|---------|-------|
| **31** | مختصر دايماً | المالك طلب — مفيش شرح إلا لو طُلب |
| **32** | ممنوع build محلي | SIGILL على جهاز المالك |
| **33** | اقرأ قبل التعديل | find → read → grep → understand |
| **34** | رؤية 20+ نشاط | EAH مش منصة مطاعم |
| **35** | تزامن الوثائق | كل commit → SESSION_LOG + PROGRESS |
| **36** | Python للملفات الكبيرة | ممنوع nano + heredoc > 50 سطر |
| **37** | بروتوكول المراجعة | 7 فحوصات قبل + 4 بعد |
| **38** | اقرأ CONTEXT_MAP | قبل أي ملف جديد |

**القاعدة الذهبية:** لو شاكك → اسأل. لو مش متأكد → اسأل. لو فيه خطر → اسأل.

---

## 4. طبقات الحماية (13)

| # | الطبقة | مكان | بتمنع إيه |
|---|--------|------|-----------|
| 1 | secrets | pre-commit | مفاتيح مكشوفة |
| 2 | prettier | pre-commit | تنسيق |
| 3 | stylelint | pre-commit | CSS syntax |
| 4 | eslint | pre-commit | كود وحش |
| 5 | commitlint | commit-msg | رسائل commits |
| 6 | typecheck | pre-push | أخطاء أنواع |
| 7 | vitest | pre-commit + CI | منطق |
| 8 | knip | CI | كود ميت |
| 9 | jscpd | CI | تكرار |
| 10 | npm audit | CI | ثغرات |
| 11 | CodeQL | GitHub | أمان |
| 12 | Dependabot | GitHub | تحديثات |
| 13 | build (webpack) | CI | أخطاء build |

**كل الحمايات hard-fail.** ممنوع `--no-verify`.

---

## 5. البنية الأساسية

EAH/
  ├── docs/              ← 27 ملف
  │   ├── AI_ONBOARDING.md   ← (هذا)
  │   ├── CONTEXT_MAP.md     ← auto-generated
  │   ├── AI_CONTRACT.md
  │   ├── LESSONS.md
  │   ├── PROGRESS.md        ← commit + version
  │   └── ...
  ├── web/               ← Next.js 16
  │   ├── app/           ← 90 route
  │   ├── components/    ← 71 component
  │   ├── lib/           ← 72 utility
  │   ├── proxy.ts       ← session refresh
  │   └── next.config.ts
  └── .github/workflows/ ← 4 workflows

**المرجع الكامل:** docs/CONTEXT_MAP.md

---

## 6. الأدوات المتاحة

مسموح (سريع — على جهاز المالك):
- npm run dev
- npx tsc --noEmit
- npx eslint FILE
- npx stylelint FILE
- npx prettier --check FILE
- npx vitest run FILE

ممنوع (ثقيل — SIGILL أو بطيء):
- npm run build
- npm run test (الكامل)
- npx knip
- npx jscpd

مفيد:
- npm run context-map
- curl -H "Authorization: Bearer $CRON_SECRET" URL

---

## 7. الممنوعات المطلقة

في الكود:
- any بدون تعليق
- @ts-ignore بدون سبب
- console.log في production
- img بدون Cloudinary/WmImage
- unstable_cache جوه component
- CSS body بدون :global() في module
- تعديل Schema بدون migration

في Git:
- secrets في commit
- commit بدون typecheck
- --no-verify
- force push
- amend لـ commit متدفع

في Deploy:
- build محلي (SIGILL)
- deploy بدون موافقة
- تعديل DB مباشرة

---

## 8. مشاكل معروفة (آخر تحديث)

| المشكلة | الحالة |
|---------|--------|
| AI models deprecation | محمي بـ test |
| Vercel Git integration | شغال |
| ads FK ambiguity | fixed |
| announcements RLS | fixed |
| Build (Turbopack/Serwist) | --webpack |
| Service role على Vercel cron | يحتاج CRON_SECRET |
| Turnstile على Production | ⚠️ Test Keys — يحتاج domain في Cloudflare |

للقائمة الكاملة: docs/LESSONS.md

---

## 9. سير العمل (من أي شات)

قبل أي تعديل:
1. اقرأ docs/CONTEXT_MAP.md — إيه موجود؟
2. grep -rn "اسم" web/ — تأكد إنه مش موجود
3. grep -rn "اسم" docs/ — اقرأ السياق
4. لو تعديل على SACRED → اسأل المالك
5. قول: "هعدل [الملف]. السبب. موافق؟"

أثناء التعديل:
- عدّل ملف واحد بس
- لا تعدّل ملفات جانبية بدون داعي
- سجّل كل خطوة

بعد التعديل:
1. npx tsc --noEmit — نظيف
2. npx prettier --write FILES
3. npx eslint FILES
4. commit برسالة type(scope): desc
5. push
6. Vercel هيبني تلقائياً (2-3 دقائق)

تحديث الوثائق:
- كود اتغير → SESSION_LOG.md + PROGRESS.md
- feature → CHANGELOG.md
- bug → LESSONS.md
- migration → docs/migrations/
- قرار → VISION.md

---

## 10. الـ Secrets (تذكير)

- .env.local — ممنوع في Git
- .env.local — ممنوع share في الشات
- Service role key — server-only
- CRON_SECRET — لـ Vercel cron فقط

للتحقق (بدون طباعة):
- grep "^KEY_NAME=" .env.local | head -c 20

ممنوع تماماً:
- cat .env.local
- grep .* .env.local

---

## 11. جهات الاتصال

- المالك: NourEldin B7R
- الإيميل: nexb7r@gmail.com
- WhatsApp: +20 101 289 2806
- GitHub: NExB7R/EAH

---

## 12. الحالة الأخيرة

آخر جلسة: Session 20 — UI Polish + Safety Layers
آخر feature: Free trial system (merchant + admin + cron)
التالي: إضافة أنشطة حقيقية + اختبار ميداني

اقرأ آخر سطر في SESSION_LOG.md عشان تعرف آخر شغل.

---

قول: "قرأت. جاهز." واستنى تعليمات المالك.
