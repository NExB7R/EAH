# EAH — بيئة التجربة (Test Environment)

> **الحالة:** مُفعّلة حالياً. البيانات التجريبية موجودة في قاعدة البيانات.
> **آخر تحديث:** 2026-11-08

---

## 🔑 الحسابات التجريبية

**كلمة السر للجميع:** `Test@12345`

| # | Email | Display Name | Role | الحالة |
|---|---|---|---|---|
| 1 | (حساب المالك الحقيقي) | NourEldin | super_admin | نشط |
| 2 | `merchant1@eah.test` | تاجر المطعم | merchant | نشط - يملك مطعم البركة |
| 3 | `merchant2@eah.test` | تاجر الصيدلية | merchant | نشط - يملك صيدلية النور |
| 4 | `customer1@eah.test` | عميل نشط | customer | 100 نقطة + 2 تقييمات |
| 5 | `customer2@eah.test` | عميل مقيد | customer | restricted 30 يوم |

**IDs للحسابات (للاستخدام في SQL):**
- `merchant1`: `b40a2e77-05e3-4e61-8947-1760f0e7d563`
- `merchant2`: `73171870-9f8c-402e-a018-a6a9b990b2f3`
- `customer1`: `89c13f23-01d4-446b-88af-bb3b8c3689a0`
- `customer2`: `9692164d-31b6-4b39-885b-9bb44f84df4e`

---

## 🏢 الأنشطة التجريبية

| Slug | Name | Owner | Flags |
|---|---|---|---|
| `demo-featured-restaurant` | مطعم البركة (تجريبي) | merchant1 | featured=true, is_published=true |
| `demo-new-pharmacy` | صيدلية النور (تجريبي) | merchant2 | is_new_project=true |
| `demo-trending-market` | ماركت الأسرة (تجريبي) | NULL | published only |

**بيانات إضافية:**
- **offers:** 1 (خصم 20% على مطعم البركة)
- **branches:** 1 لكل نشاط
- **merchant_order_settings:** مفعّل للتجاريْن

---

## 📊 بيانات التفاعلات (Seed 3)

| النوع | العدد | التفاصيل |
|---|---|---|
| `order_requests` (delivered) | 2 | customer1 → مطعم + صيدلية |
| `business_reviews` | 2 | customer1 قيّم المطعم والصيدلية |
| `business_follows` | 2 | customer1 يتابع المطعم والصيدلية |
| `favorites` | 1 | customer1 مفضل المطعم |
| `points_log` | 1 | customer1 عنده 100 نقطة |
| `standing_events` | 1 | customer2 مقيد بسبب اختبار |

---

## 🧪 سيناريوهات الاختبار (احفظها للرجوع)

### سيناريو 1: زائر
- [ ] افتح `/` → الأقسام: Featured, Trending, Offers, New, Nearby
- [ ] اضغط نشاط → مفيش أرقام مكشوفة
- [ ] "كشف الرقم" → يطلب تسجيل
- [ ] محاولة تقييم → يطلب تسجيل

### سيناريو 2: عميل نشط (`customer1@eah.test`)
- [ ] تسجيل دخول → `/account` (100 نقطة، مستوى "محترف")
- [ ] كشف الرقم → يشتغل
- [ ] كتابة تعليق → ينجح
- [ ] مراجعة `/account/badges` → شارات
- [ ] `/account/favorites` → مطعم البركة

### سيناريو 3: عميل مقيد (`customer2@eah.test`)
- [ ] تسجيل دخول → ناجح
- [ ] كتابة تقييم → ❌ "حسابك مقيد من التفاعل..."
- [ ] كتابة تعليق → ❌ نفس الرفض
- [ ] كشف رقم → ✅ (الكشف مش تفاعل مسيء)

### سيناريو 4: تاجر (`merchant1@eah.test`)
- [ ] تسجيل دخول → `/merchant`
- [ ] `/merchant/orders` → 1 طلب مكتمل
- [ ] رد على تقييم customer1 → ينجح
- [ ] `/merchant/business` → بيانات المطعم

### سيناريو 5: الأدمن (حسابك)
- [ ] `/admin/users` → 5 حسابات
- [ ] افتح customer2 → Cockpit → "مقيد" + السبب + السجل
- [ ] اضغط "إعفاء" → يرجع good
- [ ] `/admin/businesses` → 3 أنشطة
- [ ] إضافة نشاط من `/admin/businesses/new` → ينجح

### سيناريو 6: الحماية
- [ ] عميل يحاول `/admin` → redirect
- [ ] عميل يحاول `/merchant` → redirect لـ apply
- [ ] anon key يقرأ `profiles` → ممنوع

---

## 🗑️ المسح بعد التجربة

**متى:** بعد ما نخلص كل الاختبارات ونتأكد إن كل الميزات شغالة.

**الملف:** `docs/seeds/cleanup.sql` (جاهز، لا تنفذه قبل الاختبار).

**ماذا يمسح:**
- كل `demo-*` businesses ومتعلقاتها
- كل الحسابات `*@eah.test`
- كل `points_log` و`standing_events` المرتبطة بيهم

---

## 🐛 الأخطاء المكتشفة أثناء التجربة

| التاريخ | المشكلة | الحل | الحالة |
|---|---|---|---|
| 2026-11-08 | `notify_merchant_on_review` بيستخدم `type`/`link` بدل `notification_type`/`deep_link` | Migration: `2026-11-08-fix-notify-merchant-on-review.sql` | ✅ مصلح |
| 2026-11-08 | `items` في `order_requests` نوعه `text` مش `jsonb` | تصحيح الـ Seed | ✅ مصلح |

---

## ⏭️ الخطوات التالية

1. **الآن:** تطوير التصميم وحل مشاكل الواجهة.
2. **بعد التصميم:** تشغيل الاختبارات أعلاه.
3. **بعد الاختبار:** تنفيذ `cleanup.sql` وإضافة بيانات حقيقية.
