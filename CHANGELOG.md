# EAH — سجل التعديلات

## 🔄 Auto-Log (بيتحدّث تلقائياً)

> كل `./deploy.sh "msg"` بيضيف سطر هنا.

<!-- AUTO_START -->

### 2026-09-20

<!-- AUTO_END -->

---

## 📔 سجل تفصيلي (يدوي)

### 2026-09-20

#### الملفات الحيّة
- START_HERE.md — نقطة دخول
- SECRETS.md — دليل الأسرار (بدون قيم)
- ARCHITECTURE.md — الجداول + APIs + Triggers
- docs/LIVE_STATE.md — الحالة الحيّة
- clean.sh + sync-docs.sh — أدوات

#### التقييمات
- auto-approve افتراضي (pending لو flag)
- إصلاح malformed array literal في auto_flag_review

#### صفحة النشاط
- شريط أزرار عائم (اتصال/واتساب/شارك/احفظ)
- معرض صور + Lightbox
- منيو + Lightbox
- أوقات عمل (اليوم الحالي مميز)
- اللوجو + الغلاف في Hero
- التقييم + الفورم side-by-side

#### الإشعارات
- إصلاح أعمدة (notification_type + deep_link)
- NotifLink — يقفل عند الضغط
- زر اقرأ الكل
- أيقونة ترحيب مخصصة (تاج)
- اللوجو في الصفحة

#### الحساب
- إصلاح حفظ البروفايل (API-based)
- ترتيب إجراءات سريعة
- شيل الأوسمة

#### صفحة التسجيل
- تصميم جديد بـ 3 كروت
- عين كلمة السر
- إصلاح trigger handle_new_user

#### الأداء
- Parallel queries في الرئيسية
- WebP للوجو (175KB → 40KB)
- Watermark fix في Cloudinary

#### Migrations
- business_media.media_type: + 'logo'
- business_reviews.status default = 'approved'
- welcome_new_user: إصلاح أسماء الأعمدة
- handle_new_user: gender + phone_e164

### 2026-09-19

#### Business Form
- 7 أقسام (أساسيات → وصف → صور → تواصل → أوقات → موقع → حالة)
- رفع logo/cover/gallery/menu منفصلين

---

**ملاحظة:** أي تعديل كبير → سطر في Auto-Log (تلقائي) + شرح في السجل التفصيلي (يدوي).
