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
  cd ~/EAH-V2/08-web && npx tsc --noEmit
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

ممنوع تعديل بدون تصريح خاص:

- components/home-hero.tsx + .css
- components/home-dynamic-v2.tsx
- components/section-slider-v2.tsx + .css
- components/simple-flip-card.tsx + .css
- components/floating-capsule.tsx + .css
- lib/data.ts
- lib/ranking.ts
- lib/supabase-server.ts
- app/layout.tsx
- app/page.tsx
- app/globals.css
- proxy.ts
- next.config.ts

قبل أي تعديل عليها:
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

أي AI/مطور جديد لازم يقرأ بالترتيب:
1. `MASTER_BRIEF.md`
2. `AI_CONTRACT.md` (هذا الملف)
3. `SACRED.md`
4. `LESSONS.md`
5. `STRUCTURE.md`
6. `SECURITY.md`
7. `AI_HANDOFF.md`
8. `PROGRESS.md`

بعدها: "قرأت. جاهز." واستنى.

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
- git pull origin v2
- npx tsc --noEmit

بعد كل تعديل:
- npx tsc --noEmit (نظيف)
- git add + git commit (رسالة واضحة)
- git push origin main:v2

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
