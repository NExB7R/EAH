# EAH - MIGRATION_GUIDE.md

> دليل البناء من جديد على نفس قاعدة البيانات والبنية التحتية.

آخر تحديث: 2026-09-24
الإصدار: 1.0

---

## 1. الفلسفة

إحنا مش بنبني DB جديد. إحنا بنبني كود جديد على DB موجود.

الفرق:
- Supabase الحالي: يفضل زي ما هو
- Vercel: يفضل مربوط
- Cloudinary: يفضل مربوط
- Domain: يفضل شغال
- الكود فقط هو اللي بيتبني من الصفر

ليه؟
- صفر مخاطرة على البيانات
- صفر downtime
- Auth شغال
- RLS مختبر
- البيانات موجودة (53 نشاط)

---

## 2. البنية الحالية

### Supabase
- Project ID: npmpiivmdksdirrumbmt
- Region: Frankfurt (eu-central-1)
- URL: https://npmpiivmdksdirrumbmt.supabase.co
- Tables: 20+
- Functions: 95
- RLS: 100% enabled
- Storage buckets: business-media, avatars, order-images, order-voice

### Vercel
- Team: eah-74a0
- Project: eah
- Production URL: https://eah-sq.vercel.app
- Region: fra1
- Root Directory: web
- Branch: v2
- Auto-deploy: on every push to v2

### Cloudinary
- Cloud name: zlgcimmg
- Folder structure: eah/{business_id}/{type}
- Auto-transforms: WebP + AVIF

### Git
- Repo: NExB7R/EAH (private)
- Branch: v2 (default)
- Old code: archive/v1
- Old code backup: backup-4ffe42d
- Old tags: v0.2.0 through v1.4.0

---

## 3. الحالة الحالية

### الكود
- Next.js 16 (Turbopack)
- React 19
- TypeScript strict
- صفحة placeholder واحدة
- صفر مكونات
- صفر API routes

### الـ DB
- كل الجداول موجودة
- كل الـ Functions شغالة
- كل الـ RLS مضبوطة
- 53 نشاط حقيقي
- بيانات جاهزة للاستخدام

### Vercel
- Production live
- Auto-deploy على push
- Root Directory = web
- Region fra1

---

## 4. المبادئ الأساسية

1. صفر migration على الـ DB الحالي
2. صفر downtime
3. الكود الجديد يستخدم الـ DB زي ما هو
4. أي إضافة جديدة = migration جديدة في SQL Editor
5. Backup قبل أي تعديل كبير

---

## 5. خطة البناء

المرحلة 1 (4 أسابيع): الأساس
المرحلة 2 (4 أسابيع): التفاعل
المرحلة 3 (4 أسابيع): الإطلاق

التفاصيل: docs/ROADMAP.md

---

## 3. الملفات الحساسة

### 3.1 .env.local
الموقع: ~/EAH/web/.env.local

المحتوى المطلوب:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- NEXT_PUBLIC_VAPID_PUBLIC_KEY
- VAPID_SUBJECT
- CRON_SECRET
- EAH_VISITOR_SALT

القواعد:
- ممنوع commit
- ممنوع share
- backup في مكان آمن

---

## 4. خطوات البدء

### 4.1 تحقق من البيئة
- cd ~/EAH/web
- ls -la .env.local
- node -v (v22+)
- npm -v (v10+)

### 4.2 اختبر Supabase
نفذ من ~/EAH/web اختبار count businesses
المتوقع: 53

### 4.3 تشغيل Dev
npm run dev
http://localhost:3000

### 4.4 ربط Vercel
vercel link
اختيار: eah-74a0 / eah

---

## 5. ما تم إنجازه سابقاً

### Auth
- Supabase Auth شغال
- handle_new_user موجود
- proxy.ts pattern معروف

### RLS
- كامل
- is_admin() موجودة
- grants مضبوطة

### Storage
- 4 buckets
- Policies جاهزة
- Cloudinary مربوط

### Data
- 53 نشاط حقيقي
- صور موجودة
- تقييمات مختبرة

---

## 6. ما يحتاج بناء جديد

### الكود
- Next.js app
- كل الصفحات
- كل الـ components
- كل الـ API routes

### Migrations (اختياري)
- كتابة migration في Supabase SQL Editor
- اختبر على staging
- بعدها production

---

## 7. قواعد الـ DB

1. Supabase الحالي يفضل زي ما هو
2. أي تعديل جديد = migration جديدة
3. ممنوع تعديل الجداول مباشرة
4. RLS يفضل شغّال دايماً
5. Service Role للـ server فقط

---

## 8. قواعد الـ Deploy

1. Preview على كل push (تلقائي)
2. Production فقط بعد اختبار
3. Rollback فوري متاح
4. Backup قبل أي migration

---

## 9. قواعد الـ Backup

1. Backup DB قبل migration كبيرة
2. Supabase PITR مفعّل
3. نسخة من .env.local في مكان آمن
4. Tag في Git قبل deploy كبير

---

## 10. المشاكل المعروفة

### SIGILL عند npm run build محلي
- السبب: معالج قديم
- الحل: نعتمد على Vercel Preview

### Vercel build يفشل بدون سبب
- السبب: root directory غلط
- الحل: تأكد من Vercel settings

### Secrets في Git
- السبب: .gitignore ناقص
- الحل: git rm --cached + filter-branch

---

## 11. Checklist قبل deploy

- [ ] typecheck نظيف
- [ ] preview على Vercel جاهز
- [ ] اختبرت على الموبايل
- [ ] اختبرت على Desktop
- [ ] لا regressions
- [ ] موافقة صريحة
- [ ] tag جاهز

---

## 12. الملفات المرتبطة

- docs/MASTER_BRIEF.md
- docs/ARCHITECTURE.md
- docs/SCHEMA.sql
- docs/ROADMAP.md
- docs/AI_CONTRACT.md

---

آخر تحديث: 2026-09-24
الإصدار: 1.0
المالك: NourEldin B7R - فلسطين في القلب
