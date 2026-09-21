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
