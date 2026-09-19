# EAH — Launch Checklist

آخر تحديث: 2026-09-20
الحالة: مؤجل — ينتظر اكتمال المنصة

## أولوية عالية — قبل الإطلاق

### 1. Vercel Pro ($20/شهر)
- السبب: Hobby ممنوع للاستخدام التجاري
- الخطر: الحساب يوقف + البيانات تضيع
- الإجراء:
  - ترقية Vercel Pro
  - إعادة ربط GitHub webhook
  - اختبار deploy بعد الترقية

### 2. دومين مخصص
- المقترحات: eah.com / eah-eg.com / eahapp.com / eahsq.com
- الخطوات:
  - شراء دومين
  - Vercel → Settings → Domains
  - نسخ DNS records
  - تحديث NEXT_PUBLIC_SITE_URL
  - تحديث كل الروابط + QR

### 3. صفحة فيسبوك
- الاسم: Eah اللي نفسك فيه ؟
- الحالة: قيد الإنشاء
- بعدها: تحديث contact-channels.ts

### 4. قناة واتساب
- موجودة: 201012892806
- تأكيد التفعيل

## أولوية متوسطة

### 5. ربط فيسبوك في المنصة
- app/contact/contact-channels.ts
- components/site-footer.tsx
- components/floating-capsule.tsx

### 6. تحديث URL الرسمي
- من eah-sq.vercel.app إلى الدومين الجديد
- تحديث QR + Share + Footer

## البايو المقترح

### قصير:
كل اللي نفسك فيه… في مكان واحد
مطاعم • صيدليات • ماركت • توصيل
eah-sq.vercel.app

### عاطفي:
نفسك في إيه دلوقتي؟
كل حاجة حواليك — في مكان واحد
مطاعم • صيدليات • ماركت • توصيل

### Post أول:
أهلاً بيك في EAH
منصة واحدة تجمع كل حاجة حواليك.
مطاعم / صيدليات / ماركت / توصيل
جرّب: eah-sq.vercel.app
اللي نفسك فيه ؟

## التكلفة الشهرية
- Vercel Pro: $20
- Cloudinary: مجاني
- Supabase: مجاني
- الدومين: ~$15/سنة
- الإجمالي: ~$21/شهر

## ترتيب التنفيذ
المرحلة 1: اكتمال المنصة + اختبار + Vercel Pro + دومين
المرحلة 2: صفحة فيسبوك + تحديث الروابط + النشر

## المنجز
- Cloudinary Watermark
- Service Role Key محدّث
- VAPID محدّث
- 2FA مفعل
- Rate limiting
- UI Library
- Search ذكي
- Customer locations
- Explore قريب مني
- Promo campaign
- ISSUES + GROWTH_IDEAS

## المتبقي
- اختبار كامل
- 8 أنشطة حقيقية
- Vercel Pro
- دومين
- صفحة فيسبوك
- تحديث الروابط
