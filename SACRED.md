# EAH — Sacred Items 🔒

## 🔴 ممنوع اللمس:

### Features:
- 3 فئات: مطاعم + صيدليات + توصيل
- السلوغان: "اللي نفسك فيه ؟"
- Trust System
- Branches
- Partners
- Monthly Reports
- Message Lock

### تصميم:
- الألوان: #A855F7 (بنفسجي) + #E8C79A (ذهبي)
- الخط: Cairo
- Dark theme
- ممنوع emoji — SVG icons فقط

### تقنية:
- Next.js 16 + proxy.ts (مش middleware.ts)
- Supabase RLS
- deploy.sh (مش push.sh)
- main = ui-onlook (mirror)

### ملفات لا تلمس بدون إذن:
- home-dynamic-v2.tsx
- home-hero.tsx + .css
- section-slider-v2.tsx + .css
- business-hero.tsx + .css
- explore-card-v5.tsx + .css
- data.ts

## 🚀 Deploy Rules (إجباري):

1. قبل أي deploy — tag للحالة الحالية:
   git tag -a vX.Y.Z-pre-deploy -m "Before deploy"
   git push origin vX.Y.Z-pre-deploy

2. دائماً Preview الأول — من Vercel Dashboard:
   - افتح Preview URL لآخر commit
   - جرّب: home, explore, profile, business page
   - لو تمام → deploy
   - لو مشكلة → أصلح

3. بعد الـ deploy — تأكد من Production:
   - افتح الموقع
   - جرّب نفس الحاجات
   - لو مشكلة → rollback بالـ tag

4. ممنوع:
   - deploy بدون Preview
   - deploy بدون tag
   - deploy بدون أمر صريح من Nour
