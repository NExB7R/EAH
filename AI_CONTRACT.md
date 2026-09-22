# EAH — AI Contract (اقرأ ده الأول)

## ⛔ ممنوع منعاً باتاً:
1. تعديل أي ملف بدون ذكر السبب
2. شيل feature موجود (branches, partners, reviews, ...)
3. تعديل unstable_cache بدون إذن صريح
4. commit بدون typecheck
5. deploy بدون أمر صريح من Nour
6. شيل أي فولدر/ملف قبل ما تسأل
7. تعديل Schema/SQL بدون ما تسأل
8. إضافة debug APIs
9. شيل emoji أو icons بدون إذن
10. تعديل home-hero.tsx / section-slider-v2.tsx / home-dynamic-v2.tsx بدون تصريح خاص

## ✅ مسموح:
1. إضافة features جديدة (بعد موافقة)
2. إصلاح bugs (بعد وصفها)
3. تحسين أداء (بعد قياس)
4. تحسين أمان (بعد شرح)
5. تحديث docs
6. تحديث CHANGELOG

## 🔍 قبل أي تعديل:
1. قول: "أنا هعدل X. السبب: Y. الموافقة؟"
2. استنى "موافق"
3. عدّل حاجة واحدة بس
4. اتأكد typecheck
5. قول: "خلص. جرب."
6. استنى

## 📋 Features الأساسية (مش تتشالش):
- 3 فئات: مطاعم, صيدليات, توصيل
- Home: hero + sliders + visitor value
- Business: hero + quick actions + branches + reviews + map
- Admin: shell + businesses + reports + audit
- Merchant: dashboard + reports + partners + branches

## ⚡ الأداء:
- unstable_cache على getPublishedBusinesses + getActiveAdForSlot
- لا cache على user-specific (loadUserProfileTags)

## ⚠️ الأخطاء الشائعة (تجنبها):
- ❌ unstable_cache مع Map + cookies
- ❌ شيل features "لأنها مش مستخدمة"
- ❌ تعديل CSS كامل "للتنظيف"
- ❌ استخدام emoji في UI

## 🚀 Workflow الـ Deploy (إجباري):

### قبل أي deploy:
1. اتأكد كل الـ commits Ready على Vercel (من Dashboard)
2. افتح Preview URL لآخر commit
3. جرّب الحاجات الأساسية:
   - [ ] الصفحة الرئيسية تفتح
   - [ ] Explore يشتغل
   - [ ] Profile يفتح
   - [ ] مفيش أخطاء في console
4. بعدها بس → قول لـ Nour "Preview تمام — موافق أنشر؟"
5. استنى موافقة صريحة

### بعد الـ deploy:
1. افتح Production URL
2. تأكد إن كل حاجة شغالة
3. لو فيه مشكلة → استخدم tag الرجوع

### قواعد إجبارية:
- ⛔ ممنوع deploy بدون Preview
- ⛔ ممنوع deploy بدون tag للحالة الحالية
- ⛔ ممنوع deploy بدون أمر صريح
- ✅ دائماً: tag قبل → preview → تجربة → موافقة → deploy
---

## ⚠️ قاعدة Typecheck (إجبارية)

### قبل أي commit:
`cd ~/EAH/08-web && npx tsc --noEmit`

**لو فيه أي error → ممنوع commit.**

### ليه؟
- `deploy.sh` بيستخدم `|| true` في الـ commit — يعني ممكن يعمل commit رغم الفشل
- ده بيكسر Production بدون ما ناخد بالنا

### القاعدة:
1. شغّل typecheck يدوياً قبل أي commit
2. لو نجح → commit
3. لو فشل → أصلح، وبعدها commit
4. متعتمدش على `deploy.sh` إنه يوقف لوحده

### لو اكتشفت commit فاسد:
- `cd ~/EAH/08-web && npx tsc --noEmit` → شوف الأخطاء
- أصلح
- `git add -A && git commit -m "fix: typecheck errors" && git push origin ui-onlook`
