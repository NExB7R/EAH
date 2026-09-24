---

## 3. الملفات الحساسة

### 3.1 .env.local
الموقع: ~/EAH-V2/web/.env.local

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
- cd ~/EAH-V2/web
- ls -la .env.local
- node -v (v22+)
- npm -v (v10+)

### 4.2 اختبر Supabase
نفذ من ~/EAH-V2/web اختبار count businesses
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
