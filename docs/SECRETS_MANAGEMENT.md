# EAH — إدارة المفاتيح (مرحلة التطوير)

> **الحالة:** مرحلة التطوير (Pre-Launch). التدوير الدوري (90 يوم) مؤجل لما بعد الإطلاق.
> **الهدف:** التأكد من عدم تسريب المفاتيح، وفصل بيئة التطوير عن الإنتاج.

## 1. تصنيف المفاتيح

### أ. مفاتيح عامة (Public)
توضع في `.env.local` وتبدأ بـ `NEXT_PUBLIC_`، آمنة للظهور في المتصفح:
- `NEXT_PUBLIC_SUPABASE_URL` (عنوان المشروع).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (مفتاح عام، يعتمد على RLS في الحماية).
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (اسم حساب الصور).
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (مفتاح الإشعارات العام).

### ب. مفاتيح سرية (Secret — Server-Only)
ممنوع تبدأ بـ `NEXT_PUBLIC_`. تُستخدم فقط في الـ API Routes أو Server Actions أو Vercel Environment Variables:
- `SUPABASE_SERVICE_ROLE_KEY` (يتخطى RLS بالكامل — أخطر مفتاح).
- `CLOUDINARY_API_KEY` و `CLOUDINARY_API_SECRET`.
- `VAPID_PRIVATE_KEY` (مفتاح الإشعارات الخاص).
- `ADMIN_EMAIL` / `SMTP_PASS` (لو فيه إيميلات).
- أي مفاتيح ذكاء اصطناعي (OpenAI/Gemini API Keys).

## 2. أين تُحفظ؟
- **محليًا:** في `web/.env.local` فقط. تأكد إنه موجود في `.gitignore`.
- **الإنتاج:** في Vercel → Settings → Environment Variables. (اختر نوع `Secret` مش `Config`).
- **مرجع للمطورين:** في `web/.env.example` (بدون القيم الحقيقية، فقط أسماء المتغيرات).

## 3. قواعد الأمان الحالية (Pre-Launch)
1. **ممنوع `NEXT_PUBLIC_` للأسرار:** أي مفتاح سري لازم يفضل في السيرفر.
2. **التحقق من RLS:** مفتاح `ANON` آمن فقط لأن الجداول محمية بـ RLS. لو الـ RLS اتشال من جدول، الـ ANON يبقى خطر.
3. **مراجعة الـ History:** أي توكن يتسرب في Git History لازم يتغير فورًا (زي ما عملنا مع `VERCEL_OIDC_TOKEN`).
4. **الـ Service Role:** استخدامه فقط في الـ Server Actions المحمية، وممنوع استخدامه في أي Client Component.

## 4. خطة ما بعد الإطلاق (Launch Phase)
- تفعيل تدوير (Rotation) كل 90 يوم لكل المفاتيح السرية (Service Role, Cloudinary Secret, VAPID).
- تفعيل التنبيهات (Alerts) على أي استخدام غير عادي للمفاتيح.
- استخدام Vercel Secrets (Sensitive) لكل المفاتيح الحساسة.
- فصل بيئة `Preview` عن بيئة `Production` (مفاتيح مختلفة).
