# EAH — DEBUGGING.md

> منهجية تشخيص المشاكل. مأخوذة من تجارب حقيقية.
> اقرأه قبل أي debugging.

**آخر تحديث:** 2026-09-27

---

## 0. القاعدة الصفرية

قبل أي تشخيص:
1. متخمّنش.
2. اجمع أدلة.
3. افهم السبب.
4. بعدها نفّذ.

لو مش فاهم المشكلة → اسأل.

---

## 1. خطوات التشخيص

### 1.1 افهم المشكلة

اسأل:
- إيه اللي المفروض يحصل؟
- إيه اللي بيحصل فعلاً؟
- إمتى بدأت؟
- إيه اللي اتغير؟

### 1.2 اجمع الأدلة

من:
- Console (أخطاء JavaScript).
- Network (requests فاشلة).
- Elements (DOM).
- Vercel Logs (deployment).
- Supabase Logs (DB).

### 1.3 حدّد السبب

- إيه اللي بيكسر؟
- إمتى؟
- ليه؟

---

## 2. أدوات التشخيص

### 2.1 Chrome DevTools

- Console: أخطاء JavaScript + console.log.
- Network: requests + responses.
- Elements: DOM + CSS.
- Application: localStorage + cookies.

### 2.2 Firefox DevTools

- نفس Chrome، بس فيه أدوات إضافية.
- مفيد لو Chrome مش شغّال.

### 2.3 Vercel Dashboard

- Deployments: حالة كل deploy.
- Functions: logs للـ API.
- Analytics: أداء الموقع.

### 2.4 Supabase Dashboard

- Table Editor: البيانات.
- SQL Editor: queries.
- Logs: auth + DB.
- Functions: PostgreSQL functions.

---

## 3. أنواع المشاكل الشائعة

### 3.1 Hydration Mismatch (React #418)

الأعراض:
- Uncaught Error: Minified React error #418.
- الصفحة بتعمل render مرتين.

الأسباب:
- Date/Math.random() في server component.
- useState + useEffect + window بدون mounted guard.
- بيانات مختلفة بين server/client.

الحل:
- استخدم mounted state.
- أو نقل للـ client component كامل.

### 3.2 Console.log مش بيظهر

الأعراض:
- console.log('test') → undefined.
- مفيش output في Console.

الأسباب:
- الكود مش بيتنفّذ (JavaScript crash).
- Console مش بينفذ JS (متصفح).
- الخطأ في مكان تاني.

الحل:
- افتح tab جديد.
- جرب Console على about:blank.
- تحقق من typeof React.
- استخدم Chrome بدل Firefox.

### 3.3 الأزرار مش بتشتغل

الأعراض:
- تدوس على زر → مفيش حاجة.
- onClick مش بينفّذ.

الأسباب:
- pointer-events: none على الأب.
- z-index منخفض.
- JavaScript مش hydrated.
- onClick موجود بس مش بيتنفّذ.

الحل:
- تحقق من CSS في DevTools.
- جرب dispatchEvent من Console.
- تحقق من React fiber على العنصر.

### 3.4 الصور مش بتظهر

الأعراض:
- img مكسورة.
- 404 أو 502 على الصور.

الأسباب:
- دومين مش في next.config.ts.
- CSP بيمنع.
- الصورة نفسها مش موجودة.

الحل:
- أضف الدومين في remotePatterns.
- أضف في CSP.
- استخدم placeholder.

### 3.5 Build فشل على Vercel

الأعراض:
- Deployment Error.
- Build failed with exit code 1.

الأسباب:
- CSS غير صالح (خطأ في syntax).
- Module not found (import غلط).
- TypeScript errors.
- package.json ناقص dependency.

الحل:
- اقرأ build logs كاملة.
- تحقق من CSS (بالأقواس).
- تحقق من imports.
- typecheck محلي.

---

## 4. Red Flags (قف فوراً)

### 4.1 في الـ debugging

- متخمّنش — جمع أدلة.
- متعدّلش بدون سبب — افهم الأول.
- متكمّلش بدون اختبار — اختبر كل خطوة.
- متتجاهلش الأخطاء — كل خطأ ليه سبب.

### 4.2 في الكود

- console.log في الإنتاج.
- any بدون سبب.
- @ts-ignore بدون تعليق.
- CSS غير صالح.
- imports مكسورة.

### 4.3 في النشر

- deploy بدون preview.
- deploy بدون اختبار.
- deploy بدون موافقة.
- rollback بدون backup.

---

## 5. خطوات الإصلاح

### 5.1 قبل الإصلاح

- افهم السبب 100%.
- اقترح حل.
- استنى موافقة.
- اعمل backup.

### 5.2 أثناء الإصلاح

- عدّل حاجة واحدة.
- اختبر كل خطوة.
- typecheck.
- commit.

### 5.3 بعد الإصلاح

- اختبر في المتصفح.
- تحقق من السجلات.
- سجّل المشكلة في LESSONS.md.
- commit + push.

---

## 6. الخلاصة

القاعدة الذهبية:
- بدون أدلة → متخمّنش.
- بدون سبب → متعدّلش.
- بدون اختبار → متكمّلش.

الهدف: تشخيص سريع + إصلاح دقيق + صفر تكرار.

---

آخر تحديث: 2026-09-27
