# EAH — Master Redesign Plan (2026)

## 📅 تاريخ البداية: 2026-09-13
## 🎯 الهدف: منصة production-ready احترافية 2026

---

## 🔴 المرحلة 1: Hot Fixes (Critical)

### العناوين والأيقونات
- [ ] 1.1 إصلاح كل عناوين الصفحات في الـ tab (EAH | X بدل X | EAH | EAH)
- [ ] 1.2 أيقونة super admin: تاج مزخرف + verified (مش تاج عادي)
- [ ] 1.3 إزالة زر "لوحة التحكم" من الهيدر
- [ ] 1.4 إزالة "1 يوم بدأت" streak badge (مزعجة)
- [ ] 1.5 شيل "EAH" المنفصلة من الفوتر

### الصفحات العامة
- [ ] 1.6 `/contact` — إزالة الإيميل + كل التواصل WhatsApp/FB فقط
- [ ] 1.7 `/contact` — أيقونات موحدة مع الهيدر (شكل جديد)
- [ ] 1.8 Share box redesign (لوجيك + مبهر + ترندي)

### PWA
- [ ] 1.9 إزالة "1 يوم بدأت" streak bubble
- [ ] 1.10 شيل صورة النقط العبيطة

---

## 🟠 المرحلة 2: Admin Panel Redesign

### 2.1 /admin/change-requests (BAYED)
- [ ] إعادة بناء كاملة
- [ ] عرض التغييرات diff قبل/بعد
- [ ] Approve/Reject مع سبب
- [ ] Timeline للمراجعة
- [ ] شارة "جديد" + إشعار

### 2.2 /admin/merchants (غبي)
- [ ] Card design كامل جديد
- [ ] Quick actions (Approve/Reject/Suspend/Contact)
- [ ] Filter by status
- [ ] Stats per merchant (views/offers/reviews)
- [ ] Search

### 2.3 /admin/users
- [ ] قائمة احترافية
- [ ] فلترة بالدور (customer/merchant/admin)
- [ ] Trust score ظاهر
- [ ] Ban controls (24h → 7d → permanent)
- [ ] Search by phone/name

### 2.4 /admin/analytics
- [ ] إعادة تصميم كاملة
- [ ] Charts حقيقية (Recharts/Chart.js)
- [ ] Real-time visitors counter
- [ ] Export CSV/Excel
- [ ] Date range picker
- [ ] Comparison (week over week)

### 2.5 /admin/audit (سجل العمليات)
- [ ] تحويل لـ timeline احترافي
- [ ] Filter by actor/action/entity
- [ ] Detailed view لكل event
- [ ] تحميل ملف
- [ ] سجل تاجر منفصل (تاريخ نشاطه + الموافقات/الرفض)

### 2.6 /admin/studio
- [ ] لو مش هيبقى احترافي → إزالة
- [ ] أو تحويل لـ Visual Editor حقيقي (drag/drop)

### 2.7 /admin/referrals (الإحالات)
- [ ] قسم واضح في Admin
- [ ] تحكم كامل (نِسب/شروط/مدد)
- [ ] تقارير

### 2.8 المكافآت والنقاط
- [ ] قسم كامل في Admin للتحكم
- [ ] تحديد قيم النقاط
- [ ] شروط كل مكافأة
- [ ] Pending approval flow
- [ ] Audit trail للمكافآت

### 2.9 الباقات والأسعار
- [ ] صفحة منطقية حسب السوق المصري 2026
- [ ] تحديد مدة مجانية (configurable من Admin)
- [ ] تحكم كامل (تعديل/إلغاء)
- [ ] مميزات واضحة

### 2.10 الـ Sidebar العائم
- [ ] إعادة تصميم ليكون لافت + احترافي
- [ ] animations جديدة

---

## 🟡 المرحلة 3: Public Pages

### 3.1 /about
- [ ] إعادة كتابة كاملة (لوجيك + مقنع + منسق)
- [ ] Story + Vision + Team + Numbers
- [ ] Design أنيق

### 3.2 /privacy + /terms
- [ ] محتوى قانوني احترافي 2026
- [ ] Layout جديد (Sticky TOC)
- [ ] Read time + last update

### 3.3 /cookies (جديدة)
- [ ] صفحة كاملة إذا محتاجة
- [ ] Cookie consent banner

### 3.4 /explore
- [ ] فلاتر متقدمة (type/area/rating/price/open-now/offers)
- [ ] Sort options (quality/activity/distance/new)
- [ ] عنوان "X مكان — مرتبة بذكاء حسب الجودة والنشاط" يتحسن
- [ ] Grid/List view toggle
- [ ] Map view (اختياري)

### 3.5 /trends
- [ ] "مولعة" - animations + colors
- [ ] Top 3 podium view
- [ ] Real-time updates
- [ ] Category-specific trends

### 3.6 /recommend
- [ ] إضافة اللوجو
- [ ] "اشرب حاجة" → "اشترى حاجة من الماركت"
- [ ] تجربة بوت حقيقية

### 3.7 /merchant/apply
- [ ] إضافة خيار "أخرى" لنوع النشاط
- [ ] Custom category + custom icon
- [ ] خطوات أوضح

---

## 🔵 المرحلة 4: Design System

### 4.1 Cards + Sliders
- [ ] حركات بطيئة عشوائية (ما تتشابهش)
- [ ] Pause on hover/touch بالظبط
- [ ] Modern 2026 aesthetic
- [ ] Glassmorphism
- [ ] Micro-interactions

### 4.2 Scrollbar
- [ ] بألوان المنصة (نيون بنفسجي)

### 4.3 Spacing
- [ ] إعادة ضبط المسافات (sections/footer/hero)
- [ ] منع المسافات "الواسعة بغباء"

### 4.4 الفوتر
- [ ] شيل "EAH" المنفصلة
- [ ] إعادة تنسيق

### 4.5 زر الخروج
- [ ] إعادة تنسيق

### 4.6 SEO
- [ ] مراجعة شاملة لكل metadata
- [ ] og:image لكل صفحة
- [ ] Structured data (JSON-LD)
- [ ] Sitemap محدّث
- [ ] Canonical URLs

### 4.7 التجاوب
- [ ] جولة كاملة موبايل/تابلت/ديسكتوب
- [ ] كل صف يتظبط

---

## 📞 معلومات التواصل الجديدة
- [ ] WhatsApp Channel: (يُرسل لاحقاً)
- [ ] Facebook Page: (يُرسل لاحقاً)
- [ ] إزالة أي إيميل

---

## ⚠️ قواعد ذهبية
1. **Git = source of truth**
2. **مفيش فرح** — احترافي بدون over-design
3. **متجاوب دايماً**
4. **Dark theme بألوان نيون بنفسجي**
5. **سرعة + خفة**
6. **مفيش بيانات ديمو**
7. **اختبار يدوي قبل commit**

