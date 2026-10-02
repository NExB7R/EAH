# ⛔ EAH — AI_CONTRACT.md

> القواعد الإجبارية لأي AI أو مطور يشتغل على EAH.
> اقرأ ده قبل MASTER_BRIEF.md.

**آخر تحديث:** 2026-09-24
**الإصدار:** 1.0

---

## 0. القاعدة الصفرية

قبل أي سطر كود:
1. اقرأ الملف ده كامل
2. اقرأ MASTER_BRIEF.md + SACRED.md
3. قول: "قرأت. جاهز."
4. استنى التعليمات
5. ممنوع أي تعديل بدون سؤال صريح

لو مش فاهم حاجة → اسأل. ممنوع تخمّن.

---

## 1. الممنوعات المطلقة

### 1.1 في الكود
- any بدون سبب موثّق
- @ts-ignore بدون تعليق
- console.log في الإنتاج
- img بدون Cloudinary transforms
- unstable_cache جوه component
- content-visibility على العناصر الأساسية
- createClient في public reads
- emojis في UI (SVG فقط)
- تعديل Schema/SQL بدون سؤال
- build محلي (SIGILL)

### 1.2 في التصميم
- animations مستمرة (infinite)
- backdrop-filter على الكروت
- will-change دائم
- ألوان خارج الهوية
- خطوط غير Cairo + Tajawal
- light mode

### 1.3 في Git
- secrets في commit
- commit بدون typecheck
- push بدون اختبار
- force push بدون backup
- commit كبير (يخلط ميزات)

### 1.4 في Deploy
- deploy بدون preview
- deploy بدون موافقة صريحة
- deploy بدون tag
- deploy محلي

### 1.5 في Schema
- تعديل migration موجودة
- RLS بدون اختبار
- queries بدون indexes
- تعديل production DB مباشرة

---

## 2. المسموحات

### 2.1 من غير سؤال
- إصلاح typo في النص
- إصلاح bug بسيط
- تحديث docs
- تحديث CHANGELOG
- إضافة تعليقات

### 2.2 بعد سؤال صريح
- إضافة feature جديدة
- تعديل UI/UX
- تعديل Schema
- تغيير تصميم
- تعديل ملفات مقدسة
- تعديل dependencies

---

## 3. سير العمل

### 3.1 قبل التعديل
قول بالحرف:
> هعدل [اسم الملف]. السبب: [السبب]. موافق؟

استنى:
> موافق

بعدها ابدأ.

### 3.2 أثناء التعديل
- عدّل حاجة واحدة بس
- متفتحش ملفات تانية بدون داعي
- سجّل كل خطوة

### 3.3 بعد التعديل
- typecheck:
  cd ~/EAH/web && npx tsc --noEmit
- لو نظيف → commit
- لو فيه أخطاء → أصلح، وبعدين commit
- قول: خلص. اختبر.

### 3.4 بعد الاختبار
- لو تمام → نكمل
- لو فيه مشكلة → revert، وأصلح

---

## 4. عند الخطأ

### 4.1 لو لقيت خطأ في الكود
1. وقف فوراً — لا تكمل
2. بلّغ: فيه مشكلة في X
3. استنى تعليمات
4. بعد الموافقة → أصلح
5. typecheck + commit منفصل

### 4.2 لو كسرت حاجة
1. git revert فوراً
2. push
3. بلّغ
4. استنى

### 4.3 لو حاجة غامضة
- متخمّنش
- اسأل
- استنى الرد

---

## 5. الحالات الطارئة

### 5.1 الموقع وقع
1. ما تعدّلش أي حاجة
2. افحص Vercel logs
3. ابلغ بالتشخيص
4. استنى تعليمات

### 5.2 Production data اتمسحت
1. ما تعدّلش أي حاجة
2. افحص Supabase backups
3. ابلغ
4. استنى تعليمات

### 5.3 Secret اتكشف
1. غيّره فوراً (Supabase/Cloudinary/Vercel)
2. امسح من Git history
3. ابلغ
4. راجع كل الـ secrets

---

## 6. الملفات المقدسة (SACRED)

**القائمة الكاملة في SACRED.md قسم 4** — المصدر الوحيد.
ممنوع تكرار القائمة هنا.

قبل أي تعديل:
> هعدل [الملف]. السبب: [السبب]. موافق؟

---

## 7. الملفات الممنوعة تماماً

ممنوع لمس أي من دول تحت أي ظرف:

- .env.local (secrets)
- .env.production (secrets)
- .vercel/ (project link)
- package-lock.json (إلا بعد npm install)
- tsconfig.json (إلا بعد موافقة صريحة)
- schema SQL في production

---

## 8. أنماط الكود

### 8.1 TypeScript
- strict mode دايماً
- مفيش any بدون تعليق
- مفيش as unknown as X بدون سبب
- استخدم discriminated unions

### 8.2 React
- Server Components أولاً
- use client فقط عند الحاجة
- useMemo/useCallback عند الحاجة فقط
- keys دايماً في map

### 8.3 CSS
- CSS Modules
- مفيش inline styles (إلا dynamic)
- مفيش !important بدون سبب
- استخدم CSS variables

### 8.4 Naming
- Components: PascalCase
- Files: kebab-case
- Variables: camelCase
- Constants: UPPER_SNAKE
- Arabic في النص، إنجليزي في الكود

---

## 9. Style Guide

### 9.1 Comments
- عربي بسيط
- واضح ومختصر
- يشرح WHY مش WHAT
- مفيش تعليق يقول نفس الكود

### 9.2 Function Names
- describeAction (fetchBusinesses)
- handleEvent (handleClick)
- is/has/can (isOpen, hasOwner)
- get/set للـ props

### 9.3 Component Structure
1. imports
2. types
3. helpers
4. component
5. export

---

## 10. Communication

### 10.1 لما تسأل
- سؤال واحد في المرة
- واضح ومحدد
- مع سياق
- بدون تخمين

### 10.2 لما ترد
- مختصر ومباشر
- بالعامية المصرية
- بدون إيموجي كتير
- مع أمثلة لو محتاج

### 10.3 لما تعمل commit
- رسالة واضحة
- نوع: feat / fix / docs / perf / chore
- نطاق: (home) (explore) (auth) ...
- وصف قصير

مثال:
> feat(home): add bento grid for featured
> fix(explore): correct misc filter
> perf(layer5): kill 60+ infinite animations

---

## 11. توقيعك

**كل AI يشتغل على EAH يلتزم بـ:**

- احترام الملفات المقدسة
- عدم التخمين
- السؤال قبل التعديل
- Backup قبل أي تعديل كبير
- typecheck قبل أي commit
- اختبار قبل أي deploy
- الحفاظ على الهوية (نيون بنفسجي + ذهبي)
- الحفاظ على السرعة (Lighthouse 95+)

---

## 12. الخلاصة

**القاعدة الذهبية:**
> لو شاكك → اسأل.
> لو مش متأكد → اسأل.
> لو فيه خطر → اسأل.

**التزامك بالقواعد دي = مشروع نظيف.**
**تجاهلك ليها = مشروع ملخبط.**

**الهدف:** منصة نظيفة تخدم الناس لسنين.

---

**آخر تحديث:** 2026-09-24
**الإصدار:** 1.0
**المالك:** NourEldin B7R — فلسطين في القلب

---

## 13. Terminal Safety (إجباري)

**⚠️ في جلسة 2026-09-25، حصلت 10+ مشاكل بسبب paste في terminal. القواعد دي إجبارية:**

### 13.1 heredoc

- **ممنوع** `cat > file << 'EOF'` لأكتر من **50 سطر**.
- **مسموح** chunks صغيرة (30-50 سطر) بأوامر `cat >>`.
- **السبب:** terminal buffer بيفصل الـ paste الطويل.

### 13.2 nano

- **اقفل nano دايماً** بـ `Ctrl+X` (→ `Y` للحفظ / `N` للإلغاء).
- **لصق صغير** (10-15 سطر في المرة).
- **احفظ بعد كل 30 سطر** (`Ctrl+O` → Enter).
- **لو ظهر "being edited by..."** → `kill <PID>` أو اقفل الـ nano القديم.

### 13.3 التحقق (إجباري)

**بعد كل كتابة ملف:**
```bash
wc -l file && tail -3 file

---

## 15. Code Principles

### 15.1 DRY (Don't Repeat Yourself)
- 3 مرات تكرار → استخرج Helper/Component/Function.
- 3 مرات CSS → CSS Variable أو Utility.
- 3 مرات Query → دالة في `lib/data.ts`.
- 3 مرات Validation → Zod schema مشترك.

### 15.2 KISS (Keep It Simple)
- أبسط حل = الأحسن.
- مفيش over-engineering.
- مفيش abstractions قبل الحاجة.

### 15.3 YAGNI (You Aren't Gonna Need It)
- متضيفش features لم تُطلب.
- متضيفش flexibility قبل الحاجة.

### 15.4 Single Responsibility
- ملف واحد = مسؤولية واحدة.
- Component واحد = غرض واحد.
- Function واحدة = مهمة واحدة.
- لو الملف > 300 سطر → قسّمه.

### 15.5 عتبات
| القاعدة | العتبة |
|---------|--------|
| استخرج Helper | 3 تكرارات |
| استخرج Component | 3 استخدامات |
| اقسم الملف | > 300 سطر |
| اقسم Function | > 50 سطر |

---

## 16. Security Rules

### 16.1 Input Validation
- كل input → Zod schema.
- Validation on server-side دايماً.
- ممنوع trust على client.

### 16.2 Rate Limiting
- `/auth/login` → 5 محاولات/15 دقيقة.
- `/auth/signup` → 3 محاولات/ساعة.
- `/api/*` → حسب الـ endpoint.

### 16.3 CSRF
- Server Actions → Next.js بيعملها تلقائي.
- API routes → تحقق Origin header.

### 16.4 XSS
- React بيمنع HTML غير موثوق.
- `dangerouslySetInnerHTML` → ممنوع بدون sanitize.
- CSP → طبقة إضافية.

### 16.5 SQL Injection
- Supabase parameterized queries.
- `.from().select()` آمن.

### 16.6 Secrets
- `.env.local` → Git ممنوع.
- Service Role → server only.
- ممنوع `NEXT_PUBLIC_` لأي حاجة حساسة.

### 16.7 Authentication
- `getUser()` (مش `getSession()`) في middleware.
- `proxy.ts` → session refresh.
- Protected routes → في `proxy.ts`.

### 16.8 Authorization
- RLS → 100% على كل الجداول.
- `is_admin()` → SECURITY DEFINER.

### 16.9 Audit Logging
- كل عملية إدارية → `audit_logs`.
- ممنوع حذف audit logs.

### 16.10 المراجع
- `docs/SECURITY.md`
- `docs/ARCHITECTURE.md §15`
- `docs/SACRED.md §11`

---

## 17. المراجع للقراءة الأولى

**الترتيب الكامل في FILE_ORDER.md** — المصدر الوحيد.
ممنوع تكرار القائمة هنا.

بعد القراءة: "قرأت. جاهز." واستنى.

---

آخر تحديث: 2026-09-25
---

## 18. Zero Tolerance Rules

### 18.1 Zero Duplication

قبل أي كود جديد:
1. افحص: grep -rn "functionName" components/ lib/ app/
2. لو موجود → استخدمه.
3. لو مش موجود → اكتبه.

ممنوع:
- دالة بنفس الاسم في ملفين.
- Component بنفس الوظيفة.
- CSS class مكرر.
- Import مكرر.

العتبة: 3 تكرارات → استخرج Helper.

### 18.2 Zero Vibe Errors

ممنوع:
- any / @ts-ignore / as unknown as
- useState في Server Components
- useEffect بدون cleanup
- 'use client' بدون حاجة
- inline styles (إلا dynamic)
- key={index} في lists
- dangerouslySetInnerHTML بدون sanitize
- console.log في production

مسموح:
- as بعد Zod validation
- unknown للـ catch errors

### 18.3 Security 2026

كل:
- input → Zod
- form → Server Action
- API → Rate limit
- admin action → Audit log
- صورة → WmImage
- secret → .env.local (server only)

ممنوع:
- NEXT_PUBLIC_ لحاجة حساسة
- Service Role على client
- RLS متعطّل
- HTML غير موثوق

### 18.4 Sync All

قبل أي تعديل:
- git pull origin main
- npx tsc --noEmit

بعد كل تعديل:
- npx tsc --noEmit (نظيف)
- git add + git commit (رسالة واضحة)
- git push origin main

### 18.5 Check Before Build

قبل أي feature:
1. افحص الموجود: grep -rn "featureName"
2. حدد المسؤولية
3. اعمل الملفات
4. اختبر

قبل أي component: ls components/ + grep
قبل أي function: grep -rn "functionName" lib/

### 18.6 Quality Standards

كل ملف:
- مسؤولية واحدة
- أقل من 300 سطر
- أقل من 50 سطر/function

كل component:
- غرض واحد
- Props واضحة
- مفيش side effects مخفية

كل function:
- مهمة واحدة
- اسم واضح
- تعليق WHY (مش WHAT)

### 18.7 الفحص الدوري

أوامر الفحص:
- grep -rc "^export function" components/ lib/
- grep -rn "export function" components/ lib/ | awk uniq -d
- grep -rn "any\|@ts-ignore" components/ lib/ app/
- npx tsc --noEmit

أي نتيجة → إصلاح فوري.

---

آخر تحديث: 2026-09-25

---

## 19. Pre-Edit Protocol (إجباري)

### 19.1 قبل أي تعديل

1. دوّر: find web -name "filename.tsx"
2. اقرأ: cat web/components/file.tsx
3. افهم: الوظيفة + الاستخدامات
4. دوّر: grep -rn "ComponentName" web/
5. استنى التعليمات. متعدّلش ولا تعمل جديد.

### 19.2 ممنوعات مطلقة

- إنشاء ملف قبل التأكد من عدم وجوده.
- تعديل بدون قراءة كامل.
- تخمين مكان الملف.
- تكرار component/dalة.
- إنشاء ملف مشابه لموجود.

### 19.3 قبل إنشاء ملف جديد

1. ls web/components/
2. grep -rn "ComponentName" web/
3. لو موجود → عدّل.
4. لو مش موجود → اسأل الأول.

### 19.4 عند الخطأ

1. سجّل في docs/LESSONS.md.
2. رقّمه.
3. اكتب: الغلطة + السبب + الحل.

---

## 20. ممنوعات Chat جديدة

### 20.1 Terminal
- heredoc > 50 سطر
- nano لمحتوى طويل
- paste CSS/JS في terminal
- npx tsc من ~/ (لازم من web/)

### 20.2 SSR
- useState + useEffect + window بدون mounted guard
- Date/Math.random() في server component

### 20.3 CSP/Next.js
- script-src 'self' بدون 'unsafe-inline'
- NextResponse.next({ request })
- lib/data.ts + lib/data/ في نفس الوقت

### 20.4 Imports
- import أيقونة مش موجودة
- عدم التحقق من grep قبل import

### 20.5 التنسيق
- inline styles
- key={index}
- ملف > 300 سطر

### 20.6 قبل أي شغل

اقرأ: MASTER_BRIEF → AI_CONTRACT → SACRED → LESSONS → STRUCTURE → SECURITY → AI_HANDOFF → PROGRESS

بعدها: "قرأت. جاهز." واستنى.

---

آخر تحديث: 2026-09-25

---

## 21. Unified Resources (صفر تكرار)

### 21.1 القاعدة الذهبية

ملف موحد + نعدّل فيه + نستدعيه.
مش: نضيف ملف جديد لكل حاجة.

### 21.2 الموارد الموحدة

- أيقونات: components/icons/index.tsx
- Design tokens: app/globals.css
- Keyframes: app/globals.css (eah-*)
- Utilities: app/globals.css (eah-*)
- Data: lib/data/*.ts
- Validations: lib/validations/*.ts
- Helpers: lib/utils/*.ts

### 21.3 قبل إضافة أي حاجة جديدة

1. grep للبحث (في الملف الموحد).
2. لو موجود → استخدمه.
3. لو مش موجود → أضفه في الملف الموحد.

### 21.4 ممنوع

- keyframes جديد بدون فحص globals.css.
- utility class جديد بدون فحص globals.css.
- دالة جديدة قبل فحص lib/utils/.
- component جديد قبل فحص components/ui/.
- icon جديد قبل فحص components/icons/index.tsx.

### 21.5 الـ Utilities الموحدة

في globals.css:
- .eah-backdrop — modal overlay
- .eah-modal — modal card
- .eah-close — close button
- .eah-btn-primary — primary button
- .eah-btn-secondary — secondary button

### 21.6 الـ Keyframes الموحدة

في globals.css:
- eah-fade-in
- eah-fade-up
- eah-slide-up
- eah-slide-in-start
- eah-scale-in

### 21.7 الفحص الدوري

- grep -rh "@keyframes" components/ app/ | sort | uniq -c
- grep -rh "^import" components/ | sort | uniq -c

أي تكرار → إصلاح فوري.

---

آخر تحديث: 2026-09-25

---

## 22. Reading Order (إجباري)

**شوف FILE_ORDER.md** — المصدر الوحيد.

بعد القراءة: "قرأت. جاهز." واستنى.

---

## 23. القواعد الذهبية النهائية

### 23.1 قبل أي شغل

- اقرأ كل الملفات الـ 13.
- افحص الموجود — grep.
- افهم السياق.
- اسأل لو مش واضح.

### 23.2 أثناء الشغل

- عدّل حاجة واحدة.
- typecheck بعد كل تعديل.
- commit صغير + واضح.
- اختبر كل خطوة.

### 23.3 بعد الشغل

- اختبر في المتصفح.
- تحقق من Console.
- سجّل المشاكل في LESSONS.md.
- commit + push.

### 23.4 ممنوعات مطلقة

- ممنوع تعديل بدون سؤال.
- ممنوع commit بدون typecheck.
- ممنوع deploy بدون preview.
- ممنوع تخمين.
- ممنوع تكرار كود.
- ممنوع تخمين حل بدون أدلة.
- ممنوع build محلي (SIGILL).
- ممنوع secrets في Git.

### 23.5 عند الخطأ

- قف فوراً.
- اجمع أدلة.
- افهم السبب.
- اقترح حل.
- استنى موافقة.
- نفّذ.
- اختبر.
- سجّل في LESSONS.md.

---

## 24. الخلاصة النهائية

EAH مشروع احترافي.
القواعد دي مش شكليات — دي تجارب حقيقية.

الالتزام = مشروع نظيف.
التجاهل = مشروع ملخبط.

الهدف: منصة نظيفة تخدم الناس لسنين.

---

آخر تحديث: 2026-09-27

---

## 25. Auto-Doc Updates (إجباري — 2026-09-27)

**قاعدة دائمة:** أي تعديل كود → تحديث docs تلقائياً بدون انتظار تذكير.

### كل تعديل لازم يحدّث:
- `SESSION_LOG.md` — سطر عن الجلسة
- `PROGRESS.md` — حالة الملفات
- `CHANGELOG.md` — تحت النسخة الحالية

### عند مشكلة/خطأ:
- `LESSONS.md` — قسم جديد + السبب + الحل
- `AI_HANDOFF.md` — "المشاكل المعروفة"

### المبدأ:
Doc-to-Code = 1:1. لو الكود اتغير وما اتوثّقش → الشغل ناقص.

### الهدف:
أي شات جديد يقدر يكمّل من غير سؤال — التوثيق دايماً محدّث.

---

## 26. Single Source of Truth (إجباري)

**كل معلومة لها مصدر واحد. الباقي بيشاور عليه.**

| المعلومة | المصدر الوحيد |
|---------|--------------|
| آخر commit كود | PROGRESS.md |
| الإصدار الحالي | PROGRESS.md |
| حالة الملفات | PROGRESS.md |
| Sacred files | SACRED.md قسم 4 |
| Reading order | FILE_ORDER.md |
| المشاكل المعروفة | AI_HANDOFF.md قسم 7 |
| التطويرات المستقبلية + أسعارها | FUTURE.md |

### ممنوع
- تكرار قيمة في أكتر من ملف.
- ملف بيقول commit قديم.
- ملف بيقول version قديم.

### بعد كل commit
1. حدّث PROGRESS.md (commit + version + status)
2. حدّث SESSION_LOG.md (سطر الجلسة)
3. حدّث CHANGELOG.md (لو version جديد)
4. حدّث NEW_CHAT_MESSAGE.md (commit + version)
5. حدّث AI_HANDOFF.md (لو في مشكلة جديدة)

### فحص دوري
ابحث في docs/ عن أي قيمة commit أو version خارج PROGRESS.md.
أي نتيجة = خطأ.

---

## 28. Quality Gate (إجباري — 2026-09-30)

**أي كود جديد → يمر من البوابة.**

### الطبقات (7)
1. **secrets** (gitleaks) — ممنوع أي secret
2. **tests** (vitest) — أي logic جديد لازم اختبار
3. **prettier** — التنسيق موحّد
4. **eslint** — صفر errors + warnings
5. **typecheck** (tsc) — صفر أخطاء أنواع
6. **npm audit** — صفر ثغرات high
7. **knip** — صفر كود ميت جديد

### القواعد الإجبارية
- أي دالة logic جديدة → معاها اختبار
- أي component → بدون منطق معقّد
- أي commit → lefthook يفحص آلي
- أي push → GitHub Actions يفحص
- ممنوع `git commit --no-verify`

### عند الفشل
1. اقرأ الخطأ كامل
2. صلّح
3. جرّب تاني
4. **متتخطاش** البوابة

### المراجع
- `QUALITY.md` — النظام الكامل
- `LESSONS.md §18` — ليه النظام ده

---

## 29. شرح للمالك (إجباري — 2026-09-30)

**NourEldin (صاحب المشروع) عايز يفهم — مش بس ينفّذ.**

### القاعدة
بعد كل خطوة مهمة (migration / trigger / RPC / security fix) — اشرح:

1. **بنعمل إيه دلوقتي** (سطر واحد)
2. **ليه** (المشكلة اللي بنحلها)
3. **المخاطر** (لو ما اتعملتش)
4. **إزاي الحل بيشتغل** (بساطة)

### الأسلوب
- **عامية مصرية** — مش فصحى
- **جمل قصيرة** — مش فقرات
- **أمثلة حقيقية** من المشروع
- **مفيش رغي** — بس الضروري
- **مفيش مصطلحات إنجليزية بدون شرح**

### مثال صح
> "دلوقتي بمنع أي حد يشوف رقم تليفونك.
> ليه؟ لأن Supabase بيسيب كل الأعمدة مفتوحة افتراضياً — أي حد يقدر يجيب أرقام كل المستخدمين.
> المخاطرة: تسريب كل الأرقام + العناوين.
> الحل: منعنا القراءة على 5 أعمدة — بس صاحب الحساب يشوفها عبر دالة آمنة."

### مثال غلط
> "Applied column-level REVOKE on sensitive columns within the profiles table to mitigate unauthorized data exposure via anon/authenticated roles."

### متى
- **بعد كل migration** — تشرح إيه اللي اتغير
- **بعد كل security fix** — تشرح إيه الثغرة
- **بعد كل feature كبيرة** — تشرح إيه اللي بتحققه

### ليه
- المالك لازم **يفهم** مش بس **ينفّذ**
- عشان لو حد سأله → يعرف يجاوب
- عشان **يتعلم** — يبقى محترف مع الوقت

---

## 30. فحص AI Code (إجباري — 2026-10-01)

**قبل أي commit، لازم تتأكد من الحمايات دي.**

### 1. RLS
- [ ] كل جدول عليه RLS
- [ ] كل policy فيها `auth.uid()`
- [ ] مفيش `USING (true)`
- [ ] كل INSERT policy فيها `WITH CHECK`

### 2. Authorization
- [ ] كل query بتتحقق من الملكية (`.eq('user_id', user.id)`)
- [ ] كل server action بتتحقق من `auth.getUser()`
- [ ] مفيش IDOR

### 3. Secrets
- [ ] مفيش secrets في الكود
- [ ] كل secret في `.env.local`
- [ ] Service Role server-only

### 4. Input Validation
- [ ] كل input → Zod
- [ ] Server-side validation
- [ ] مفيش trust على client

### 5. SSRF
- [ ] مفيش fetch لـ URL من المستخدم
- [ ] allowlist للـ domains
- [ ] مفيش `dangerouslySetInnerHTML`

### 6. CSRF
- [ ] `serverActions.allowedOrigins` في `next.config.ts`
- [ ] API routes بتتحقق من Origin

### 7. Dependencies
- [ ] `npm audit` نظيف
- [ ] مفيش حزم وهمية (تحقق من npm registry)
- [ ] مفيش حزم مكررة

### 8. Error Handling
- [ ] مفيش تسريب معلومات في errors
- [ ] `console.error` مش بيرجع للـ client
- [ ] Errors عامة للمستخدم

### 9. الأدوات
- [ ] Next.js محدّث (إصلاحات أمنية)
- [ ] الحزم محدّثة

### 10. الفحص الدوري
- [ ] `npx knip` (كود ميت)
- [ ] `npx jscpd` (تكرار)
- [ ] `npm audit`

### المراجع
- `AI_LESSONS.md` — الأخطاء الشائعة بالأرقام
- `SECURITY.md` — الحمايات الكاملة
- `QUALITY.md` — نظام الجودة

---

## 31. تواصل مختصر (إجباري — 2026-10-01)

**NourEldin طلب:**
> "مش عايز شرح دلوقتى ولا كلام كتير، وقت لما اعوز افهم حاجة هسئلك"

**القاعدة:**
- **مفيش شرح** إلا لو هو طلب
- **مفيش مقدمات** ("تمام، هنعمل...")
- **مفيش خلاصات** طويلة
- **الأوامر مباشرة**
- **النتائج بس** بدون تفسير

**الاستثناء الوحيد:** §29 (شرح للمالك) لو طلب صريح.

**الأسلوب:**
- أمر → نتيجة → أمر → نتيجة
- خلاص

---

## 32. جهاز المالك (إجباري — 2026-10-02)

**NourEldin بيشتغل على جهاز ضعيف (RAM قليلة + معالج قديم).**

### ممنوع أشغّل أوامر تقيلة على جهازه

**ممنوع:**
- `npm run build` محلي (SIGILL أصلاً)
- `npm install` لحزم كبيرة بدون داعي
- `npx vercel build` محلي
- Test suites كاملة (>30s)
- Watchers دائمة
- IDE / language servers تقيلة

**البديل:**
- Build → Vercel (سيرفر)
- Test → GitHub Actions (سيرفر)
- النتائج: تقرأ من Vercel Dashboard + GitHub Actions UI

### على جهاز المالك — المسموح فقط

- `git` (add/commit/push)
- `npx tsc --noEmit` (خفيف)
- `npx prettier --check`
- `npx eslint <ملف>`
- كتابة/قراءة ملفات
- `npx vitest run <ملف واحد>` (ملف واحد مش كله)

### الأوامر اللي أنا مسؤول عنها

**كل أمر أقترحه → أسأل نفسي 3 مرات:**
1. ده تقيل؟ (RAM/CPU/time)
2. ينفع يتعمل على السيرفر بدلاً منه؟
3. لو اتشغل، هيوقف جهاز المالك؟

**لو أي إجابة "أيوه" → أبحث عن بديل.**

### التذكير الدائم

- قبل أي أمر → ذكر التكلفة لو معروفة
- لو الأمر > 10 ثواني → أحذّر
- لو > 30 ثانية → أطلب موافقة
- لو SIGILL محتمل → مش أطلبها أصلاً

---

آخر تحديث: 2026-10-02

---

## 33. قواعد الشات الجديد (إجباري — 2026-10-02)

**أي شات AI جديد يشتغل على EAH يلتزم بالآتي:**

### 1. قبل أي شغل
- اقرأ HANDOFF.md → AI_CONTRACT.md → SACRED.md → LESSONS.md → PROGRESS.md → SESSION_LOG.md
- قول: "قرأت. جاهز." واستنى
- ممنوع تبدأ بدون قراءة

### 2. قبل أي تعديل
- §19 Pre-Edit Protocol: find → read → understand → grep usages
- §3.1: "هعدل [الملف]. السبب: [السبب]. موافق؟"
- استنى "موافق" صريح
- عدّل ملف واحد بس

### 3. أثناء التعديل
- خلي الأوامر كبيرة ومراجَعة ومظبوطة
- تحقق 3 مرات قبل أي خطوة حرجة (path، محتوى، نتيجة)
- لو فيه شك → اسأل، متخمّنش
- Commit صغير + واضح

### 4. بعد التعديل
- typecheck (`npx tsc --noEmit`)
- lefthook pre-commit (secrets + prettier + eslint)
- لو فشل → صلّح → commit تاني (مش amend)
- push (SSH over 443)

### 5. الجودة
- §28 Quality Gate — ممنوع `git commit --no-verify`
- أي دالة logic جديدة → اختبار
- أي feature → تحديث PROGRESS.md + SESSION_LOG.md + CHANGELOG.md

### 6. §26 Single Source of Truth
- version: `web/package.json` → `web/lib/version.ts`
- CHANGELOG: `web/CHANGELOG.md` (root pointer)
- Sacred files: SACRED.md §4
- commit + version: PROGRESS.md
- Reading order: FILE_ORDER.md

### 7. §29 الشرح للمالك
- لو طلب شرح → عامية مصرية، جمل قصيرة
- بدون شرح = الافتراضي
- §31 مختصر دايماً

### 8. §32 جهاز المالك
- ممنوع أوامر تقيلة (build/test suite)
- Vercel + GitHub Actions هم اللي بيبنوا

### 9. عند الخطأ
- قف فوراً
- اجمع أدلة (مفيش تخمين)
- بلّغ
- استنى موافقة
- بعدها أصلح
- سجّل في LESSONS.md

### 10. الحفاظ على المشروع "لا يقدر بثمن"
- ممنوع تكرار كود (§18.1)
- ممنوع any / @ts-ignore (§18.2)
- ممنوع تعديل ملف بلا قراءة كاملة
- ممنوع commit بلا typecheck
- ممنوع push بلا pre-push hooks
- ممنوع deploy بلا preview
- ممنوع force push
- ممنوع secrets في Git
- ممنوع حذف بدون backup
- أتفه تعديل = يستحق تفكير
- أي تعديل "بسيط" = يحتاج تأكيد 3 مرات إنه صح فعلاً

### 11. المصادر (Source of Truth) — تُقرأ دايماً من مكانها الأصلي
- version → `web/package.json`
- CHANGELOG → `web/CHANGELOG.md`
- حالة الملفات → PROGRESS.md
- آخر commit → PROGRESS.md
- Sacred → SACRED.md §4
- Reading order → FILE_ORDER.md
- المشاكل المعروفة → AI_HANDOFF.md §7

### 12. اتساق الأوامر (Command Consistency)
- أي أمر terminal → ناتج فوري
- أي ملف → `wc -l` + `tail -3` بعد الكتابة
- أي تعديل متعدد → commit واحد بس
- أي git op → تحقق من `git status --short` قبل
- أي push → الفرع الوحيد: `main`

---

آخر تحديث: 2026-10-02
