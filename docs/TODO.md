# EAH — TODO (الشغل الحالي)

> آخر تحديث: 2026-09-20

## 🔴 أولوية عالية

- [ ] إضافة 5+ أنشطة حقيقية (مطاعم/صيدليات/ماركت)
- [ ] إصلاح /explore — ترتيب الفلاتر + شكل الكارد
- [ ] اختبار Quick Actions في صفحة النشاط
- [ ] اختبار Lightbox للمعرض والمنيو
- [ ] اختبار رفع صور جديدة (watermark يظهر صح)

## 🟠 أولوية متوسطة

- [ ] إصلاح كل كود بيستخدم items_summary (الصح: items)
- [ ] Referral system — تتبع الإحالات + النقاط
- [ ] نقاط قابلة للاستبدال (خصومات/مميز)
- [ ] Business Form (رابط URL بدل رفع)

## 🟡 أولوية منخفضة

- [ ] PWA offline mode
- [ ] Chat بين العميل والتاجر
- [ ] تقارير أسبوعية للتاجر
- [ ] تصدير Excel

## ✅ خلص مؤخراً

- [x] Business page كاملة (Gallery + Menu + Hours + Quick Actions)
- [x] تقييمات auto-approve + flagging
- [x] إشعارات + welcome + NotifLink
- [x] حفظ البروفايل (API-based)
- [x] 8 ملفات حيّة (START_HERE + SECRETS + ARCHITECTURE + LIVE_STATE + CHANGELOG + TODO + ROADMAP + DECISIONS)
- [x] تنظيف 7 ملفات يتيمة
- [x] **cron كل ساعة (GitHub Actions)** ← جديد
- [x] **GRANT service_role على 60 جدول** ← جديد
- [x] **إشعار عميل بعد أوردر (Push)**
- [x] **إشعار تاجر عند أوردر جديد**
- [x] **إشعار تاجر عند تقييم جديد**
- [x] **Fra1 region (Frankfurt) جنب Supabase**
- [x] **Parallel + cached queries**
- [x] **Watermark على الغلاف/المعرض/المنيو**

---

## 📱 قائمة التذكير قبل الإطلاق الرسمي

### Monitoring
- [ ] نزّل تطبيق UptimeRobot على الموبايل (iOS / Android)
- [ ] تأكد من استقبال Push notifications
- [ ] Test كل الأخطاء تعمل على موبايلك
- [ ] Status Page عام (اختياري)

### Vercel Pro Upgrade ($20/شهر)
- [ ] ترقية من Hobby → Pro
- [ ] تفعيل cron دقيق (كل دقيقة)
- [ ] تفعيل Analytics
- [ ] تفعيل Backup
- [ ] رفع حد deployment Storage
- [ ] دومين مخصص (eah-eg.com)

### قبل الإطلاق
- [ ] 20 نشاط حقيقي في الـ DB
- [ ] اختبار كامل على الموبايل
- [ ] Facebook Page مرتبة (شوف `SOCIAL_SETUP.md`)
- [ ] WhatsApp Channel شغالة
- [ ] إشعارات Sentry + UptimeRobot مختبرة

### UptimeRobot — نقاط مستقبلية
- [ ] ترقية UptimeRobot لخطة مدفوعة → Region Europe فقط
  - السبب: Monitor من أمريكا (2222ms) — مش دقيق للمستخدمين المصريين
  - الأولوية: منخفضة (بس ممكن مع Vercel Pro)

---

## 🆕 طلبات جديدة (2026-09-21)

### 🏪 الفروع (Branches)
- [ ] إضافة جدول `business_branches`:
  - `business_id` (النشاط الأصلي)
  - `name` (اسم الفرع — مثلاً "فرع المعادي")
  - `area` + `address_text` + `latitude` + `longitude`
  - `working_hours` (jsonb)
  - `phone` + `whatsapp` (اختياري)
  - `is_primary` (الفرع الرئيسي)
  - `is_active`
- [ ] UI في `/admin/businesses/[slug]/branches` — إضافة/تعديل/حذف فروع
- [ ] UI في `/merchant/businesses/[slug]/branches` — للمالك
- [ ] عرض الفروع في صفحة النشاط
- [ ] الأوردر يحدد الفرع (لو عندهم أكتر من فرع)
- [ ] الخريطة تعرض كل الفروع

### 🚫 منع تكرار الأسماء
- [ ] Unique constraint على `businesses.name` (case-insensitive)
- [ ] Check في actions.ts قبل insert:
  - اسم مطابق تماماً → رفض
  - اسم متشابه (Levenshtein distance ≤ 2) → تحذير
- [ ] رسالة واضحة: "في نشاط بنفس الاسم أو قريب جداً — جرّب اسم مختلف"

### 📞 أرقام تواصل متعددة
- [ ] التأكد إن `business_contact_methods` بيسمح بأكتر من رقم phone
- [ ] UI: زر "+ ضيف رقم تاني"
- [ ] الأرقام تظهر كلها في صفحة النشاط (لو الـ RLS تسمح)

### 🔧 حاجات صغيرة
- [ ] `lib/map-coords.ts` mark as server-only ✅ (اتعمل)
- [ ] `user-avatar.tsx` hydration fix ✅ (اتعمل)

---

## 🏪 نظام الشركاء — المصباح السحري 🪄

### 🎯 الرؤية
لوحة تحكم كاملة للمالك — يتحكم في الشركاء زي مصباح علاء الدين.
كل شريك له **دور محدد + صلاحيات دقيقة**.

### 👥 الأدوار

| الدور | الصلاحيات |
|---|---|
| **👑 مالك (owner)** | كل حاجة — محمي — لا يتشالش إلا بنقل ملكية |
| **⭐ مدير (manager)** | تعديل بيانات + رد أوردرات + تقارير — مش يشيل شركاء |
| **📝 محرر (editor)** | تعديل + رفع صور — مش يشيل شركاء ولا يحذف |
| **👁️ مشاهد (viewer)** | يشوف بس (تقارير + أوردرات) |

### 🔄 دورة الحياة

**1. المالك يدعي:**
- `/merchant/businesses/[slug]/partners`
- يدخل **رقم الشريك** + يحدد **الدور**
- شاشة تأكيد: "إنت هتدعي [الاسم] كـ [مدير]"

**2. الشريك يستقبل:**
- 🔔 إشعار في `/notifications`
- 📩 دعوة في `/account/partners/invitations`
- **قبول ✅ / رفض ❌**

**3. بعد القبول:**
- النشاط يظهر في `/merchant` عند الشريك
- الصلاحيات **حسب الدور**
- **إشعارات الأوردرات** تروح **لكل الشركاء النشطين**
- **Audit log** يسجّل قبول الدعوة

**4. المالك يتحكم:**
- **تغيير الدور** (manager → viewer)
- **إيقاف مؤقت** (بدون حذف)
- **حذف نهائي** (بضغطة، بدون تأثير على النشاط)
- **سجل كامل** لكل حاجة عملها الشريك

### 🛡️ الحمايات

**المالك لا يتشالش:**
- دور owner **محمي** بالكامل
- محدش يقدر يشيله حتى لو manager
- البديل: **"نقل ملكية"** (transfer_business_ownership موجود)

**منع التسريب:**
- شريك مايقدرش:
  - ❌ ينقل الملكية
  - ❌ يحذف النشاط
  - ❌ يشيل شركاء تانيين
  - ❌ يعدّل بيانات الفوترة

**Audit Trail كامل:**
- كل حركة **مسجّلة**:
  - مين عدّل؟
  - مين رد على أوردر؟
  - مين أضاف صورة؟
  - إمتى؟

### 📋 اللي موجود vs المطلوب

**موجود حالياً:**
- ✅ جدول `business_partners`
- ✅ صفحة `/merchant/businesses/[slug]/partners`
- ✅ `PartnersClient.tsx`
- ✅ دالة `transfer_business_ownership`

**مطلوب إضافته:**
- [ ] Migration: أعمدة `role`, `status`, `permissions`, `invited_at`, `accepted_at`
- [ ] RPC: `invite_partner`, `accept_invitation`, `reject_invitation`, `remove_partner`, `update_partner_role`
- [ ] UI: شاشة دعوة (برقم + دور)
- [ ] UI: صفحة `/account/partners/invitations`
- [ ] إشعارات الدعوة (push + email)
- [ ] صلاحيات حسب الدور في كل صفحة
- [ ] Audit log dashboard للمالك
- [ ] "إيقاف مؤقت" للشريك
- [ ] Sender: إشعار لكل الشركاء عند أوردر جديد

### 🎨 لوحة التحكم "المصباح السحري"
- كل شريك في **كارت أنيق** — اسم + صورة + رقم + دوره
- **زرار تحكم** لكل شريك (تعديل دور / إيقاف / حذف)
- **شارة ملونة** للدور (👑 ذهبي / ⭐ بنفسجي / 📝 أزرق / 👁️ رمادي)
- **آخر نشاط** لكل شريك (من audit log)
- **إحصائيات** لكل شريك (كام أوردر رد؟ كام تعديل؟)

### ⏰ الترتيب الزمني
- **بعد** ما نخلّص:
  - ✅ 20 نشاط حقيقي
  - ✅ اختبار رحلة العميل
  - ✅ اختبار رحلة التاجر
- **بعدها** نبدأ نظام الشركاء (3 ساعات)


## ✅ خلص (2026-09-21)

### Legal Pages
- [x] LegalPage component موحّد (hero + TOC + sections)
- [x] Terms / Privacy / Cookies بتصميم 2026
- [x] أرقام تلقائية للأقسام (01, 02, 03...)
- [x] Card-based للكوكيز (required/optional)

### Home Sliders
- [x] 3 سلايدرات بستايل مختلف (مميز/ترند/جديد)
- [x] الكل بـ personality مختلفة
- [x] أيقونات الفئات 2026 (gradients + neon)

### VisitorValue Cards
- [x] 3 كروت فخمة (purple/gold/green)
- [x] gradient accents + hover animations

### General
- [x] شيل SmartBot
- [x] deploy.sh build واحد بس (Vercel Hobby)
- [x] مرجع main sync يدوي

## 🔜 الجاي
- [ ] الفروع (Branches) — جدول + UI + عرض
- [ ] الشركاء (Aladdin's lamp) — نظام كامل
- [ ] التقارير الشهرية
- [ ] إضافة 20 نشاط
