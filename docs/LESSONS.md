# EAH — LESSONS.md

> كل تجربة فاشلة + السبب + الحل.
> اقرأه قبل أي شغل عشان متكررش الأخطاء.
> آخر تحديث: 2026-09-25

---

## 1. v1 — ليه اتمسح؟

**القرار:** مسح كامل للكود القديم → بدء v2 نظيف.

**الأسباب المحتملة (من السياق):**
- تصميم متراكم بأخطاء شكل/تنسيق.
- كود مش منظم (features متداخلة).
- صعوبة التعديل بدون كسر حاجة.
- مشاكل أداء (animations مستمرة، إلخ).

**الدرس:** نبدأ نظيف من الأول أسهل من إصلاح تراكمي.

**القاعدة:** أي feature جديدة → commit صغير → typecheck → اختبار.

---

## 2. طرق جرّبناها وفشلت (تقني)

### 2.1 heredoc بيفشل مع العربي + الملفات الكبيرة

**المحاولة:** `cat > file << 'EOF'` بمحتوى 100+ سطر فيه عربي.

**النتيجة:** الـ terminal بيعمل truncate — الملف يتكتب ناقص.

**السبب:** terminal buffer بيفصل الـ paste الطويل.

**الحل:**
- chunks صغيرة (30-50 سطر) بأوامر `cat >>`.
- أو `nano` + لصق صغير (10-15 سطر).
- دايماً تحقق بـ `wc -l` + `tail -3`.

**المرات:** 10+ مرات في جلسة 2026-09-25.

---

### 2.2 nano بيتقطع + بيفضل شغّال في الخلفية

**المحاولة:** `nano file.md` + لصق محتوى كبير.

**النتيجة:** الـ paste بيتقطع + nano بيفضل مفتوح + "being edited by..." في المحاولة التانية.

**الحل:**
- اقفل nano دايماً بـ `Ctrl+X`.
- لصق صغير (10-15 سطر).
- احفظ بعد كل 30 سطر (`Ctrl+O` → Enter).

---

### 2.3 CSP script-src 'self' بيكسر Next.js 16

**المحاولة:** `script-src 'self'` (صارم).

**النتيجة:** Server Actions + hydration بيفشلوا (React error #412).

**السبب:** Next.js 16 App Router بيحقن inline scripts.

**الحل:** `script-src 'self' 'unsafe-inline'` (مؤقت لحد ما نعمل nonce).

---

## 3. قرارات معمارية (chose X over Y)

### 3.1 CSS Modules بدل Tailwind

**القرار:** CSS Modules.

**السبب:**
- متوافق مع SACRED §16 (ممنوع Tailwind).
- صفر runtime overhead.
- scoped by default.

---

### 3.2 Supabase بدل Firebase

**القرار:** Supabase.

**السبب:**
- Postgres (SQL كامل + RLS).
- مفتوح المصدر.
- مجاني بسخاء.

---

### 3.3 4 clients لـ Supabase (مش 1)

**القرار:** public / server / service / browser.

**السبب:**
- public → للقراءات العامة (بدون cookies → caching).
- server → مع cookies (auth-aware).
- service → bypass RLS (admin only).
- browser → client components.

**الفايدة:** كل واحد ليه استخدام واضح.

---

### 3.4 Server Components أولاً

**القرار:** RSC افتراضي، `use client` عند الحاجة.

**السبب:**
- صفر JS للعميل (أسرع).
- أقل bundle size.
- AI_CONTRACT §8.2.

---

### 3.5 مفيش i18n دلوقتي

**القرار:** عربي (لهجة مصرية) بس.

**السبب:** الجمهور المستهدف مصري محلي.

**مستقبلاً:** نضيف إنجليزي لو توسّعنا.

---

## 4. الـ gotchas (Next.js / Supabase / Vercel)

### 4.1 build محلي = SIGILL

**المحاولة:** `npm run build` على جهاز Nour.

**النتيجة:** SIGILL error.

**السبب:** معالج قديم مش بيدعم بعض التعليمات.

**الحل:** Vercel Preview فقط للـ build.

---

### 4.2 `'unsafe-inline'` في CSP — مؤقت

**السبب:** Next.js 16 محتاج (زي 2.3).

**الحل الدائم:** nonce-based CSP (مؤجل).

---

### 4.3 Unsplash مش Cloudinary

**المحاولة:** استخدام Unsplash في البيانات التجريبية.

**النتيجة:** مخالف لـ SACRED §10 (img بدون Cloudinary).

**الحل المؤقت:** إضافة `images.unsplash.com` في `next.config.ts` + علامة مائية CSS overlay.

**الحل الدائم:** نقل Cloudinary (Phase 2).

---

### 4.4 Cloudinary يتلغى دلوقتي

**القرار:** مش هنستخدم Cloudinary في البداية.

**السبب:** Free tier محدود (25 credit/شهر) + مش ضروري.

**البديل:** `next/image` + Supabase Storage.

**لما نكبر:** ImageKit أو Cloudinary.

---

### 4.5 Vercel Hobby = ممنوع تجاري

**المشكلة:** EAH منصة تجارية (إعلانات + باقات).

**الخطر:** Vercel يقفل الحساب لو اكتشف.

**الحل:** Vercel Pro ($20/شهر) أول ما تبدأ تربح.

---

### 4.6 الدومين — `eah.app`

**القرار:** `eah.app` (مش `.com`).

**السبب:**
- `.app` = Web App (متوافق مع الهوية).
- مجاني أول سنة مع Vercel Pro.
- HTTPS إجباري (أمان).
- رخيص (~$13-15/سنة بعد السنة).

---

## 5. قواعد ذهبية

### 5.1 للـ terminal

1. **متستخدمش heredoc > 50 سطر.**
2. **اقفل nano دايماً** (`Ctrl+X` → `Y`/`N`).
3. **تحقق بعد كل كتابة:** `wc -l` + `tail -3`.
4. **chunks صغيرة** (30-50 سطر).

### 5.2 للـ Git

1. **typecheck قبل كل commit.**
2. **commits صغيرة** (feature واحد).
3. **رسالة واضحة:** `type(scope): desc`.

### 5.3 للكود

1. **مفيش `any`** بدون تعليق.
2. **مفيش `console.log`** في الإنتاج.
3. **مفيش inline styles** (إلا dynamic).
4. **مفيش animations مستمرة.**
5. **استخدم `WmImage`** لكل صورة.

### 5.4 للقرارات

1. **اسأل قبل التعديل** على SACRED files.
2. **مفيش تخمين** — اتأكد.
3. **commits صغيرة** أفضل من الكبيرة.
4. **لو حصل خطأ → قف + بلّغ.**

---

## 6. الأخطاء اللي لسه محتاجة حل

- **nonce-based CSP** (مؤجل).
- **Sentry** (مش مستخدم).
- **Testing** (Vitest/Playwright) — مؤجل.
- **`SCHEMA.sql`** — قديم (ينقص columns).
- **`lib/supabase/types.ts`** — generated (مؤجل).

---

## 7. الخلاصة

**لو لقيت حاجة فشلت → ضيفها هنا.**
**لو لقيت حل جديد → ضيفه هنا.**
**لو لقيت gotcha → ضيفه هنا.**

**الهدف:** أي شات/AI جديد يقرأه → **ميعيدش الأخطاء**.

---

آخر تحديث: 2026-09-25
