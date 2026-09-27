# EAH — TODO

> خطة العمل الكاملة. كل حاجة هنعملها بالترتيب.

**آخر تحديث:** 2026-09-26

---

## 🔴 المرحلة الحالية — Home كامل

### في التقدم:
- [x] Hero (لوجو + شيبين + هوك + search + categories)
- [x] Featured Bento (auto-slide)
- [ ] Floating Capsule (جديد — شغّال جزئياً)
- [ ] Menu Drawer (Avatar + تفاصيل)
- [ ] Trending Strip
- [ ] Offers Strip
- [ ] Nearby Grid (قريب منك)
- [ ] Opportunity Strip (الدعم)
- [ ] Footer

---

## 🟡 المرحلة 2 — Explore + Filters

- [ ] Explore Filters (type + area + sort)
- [ ] Pagination (موجود ✅)
- [ ] Business Page (`/businesses/[slug]`) — موجودة مؤقتاً
- [ ] `/featured` — صفحة
- [ ] `/offers` — صفحة
- [ ] `/trends` — صفحة
- [ ] `/new` — صفحة
- [ ] `/nearby` — صفحة
- [ ] `/support` — صفحة الدعم

---

## 🟢 المرحلة 3 — الصفحات الأساسية

- [ ] `/about` — كامل + Presentation
- [ ] `/updates` — آخر التحديثات
- [ ] `/pricing` — الباقات
- [ ] `/advertise` — أعلن معانا
- [ ] `/contact` — اتصل بنا
- [ ] `/support-palestine` — دعم فلسطين
- [ ] `/terms` — الشروط
- [ ] `/privacy` — الخصوصية
- [ ] `/cookies` — الكوكيز

---

## 🔵 المرحلة 4 — Account

- [ ] `/account` — بروفايل
- [ ] `/account/edit` — تعديل
- [ ] `/account/notifications` — إشعارات
- [ ] `/account/favorites` — مفضلات
- [ ] `/account/orders` — طلبات
- [ ] `/account/points` — نقاط
- [ ] `/account/security` — أمان
- [ ] `/account/verify` — توثيق

---

## 🟣 المرحلة 5 — Merchant

- [ ] `/merchant/apply` — تسجيل نشاط
- [ ] `/merchant` — dashboard
- [ ] `/merchant/business/edit` — تعديل نشاط
- [ ] `/merchant/orders` — طلبات
- [ ] `/merchant/offers` — عروض
- [ ] `/merchant/subscription` — اشتراك
- [ ] `/merchant/settings` — إعدادات

---

## ⚫ المرحلة 6 — Admin

- [ ] `/admin` — dashboard
- [ ] `/admin/businesses`
- [ ] `/admin/users`
- [ ] `/admin/analytics`
- [ ] `/admin/ads`
- [ ] `/admin/moderation`
- [ ] `/admin/subscriptions`
- [ ] `/admin/audit`
- [ ] `/admin/settings`

---

## 💎 نظام النقاط (Phase 2 — بعد Home)

### الحالة: مؤجل — لكن محفوظ بالتفاصيل

### النقاط المفيدة (7):
1. **تقييم (أول مرة لنشاط)** — 20 نقطة
   - مرة واحدة فقط لكل نشاط
   - لو مسح التقييم → مفيش نقاط جديدة

2. **طلب عبر واتساب** — 25 نقطة
   - بشرط: العميل ≠ صاحب النشاط
   - + IP مختلف

3. **دعوة صديق (تسجيل كامل)** — 30 نقطة
   - التسجيل كامل (بروفايل + بيانات)
   - IP مختلف
   - رقم مختلف
   - أول طلب/تقييم (نشاط حقيقي)

4. **دعوة صديق (أول طلب)** — 100 نقطة
   - الصديق يعمل أول طلب مكتمل

5. **أول تقييم لنشاط (من أي حد)** — 50 نقطة
   - مكافأة للعميل الأول

6. **تقييم مفيد (voted up ≥ 5)** — 10 نقاط

7. **التقييمات الموثقة (post-order)** — 30 نقطة

### الرفض (نقاط قابلة للتلاعب):
- ❌ تصفح 5 أنشطة
- ❌ مشاهدة 30s+
- ❌ إضافة للمفضلة
- ❌ متابعة نشاط
- ❌ مشاركة واتساب
- ❌ تسجيل دخول يومي
- ❌ تقييم مع صورة

### المستويات:
- Bronze: 0-499 (1x)
- Silver: 500-1999 (1.25x + 5% خصم)
- Gold: 2000-4999 (1.5x + 10%)
- Platinum: 5000-9999 (2x + 15%)
- Diamond: 10000+ (3x + 25%)

### Anti-Abuse:
- IP tracking
- Device fingerprint
- Rate limiting
- تحقق يدوي من الأدمن للنقاط الكبيرة

### الـ DB:
- `user_loyalty` (مش موجود)
- `points_log` (مش موجود)
- `award_points()` function (مش موجود)
- `get_loyalty_tier()` function (مش موجود)

---

## 🔒 الأمان (Phase 2 — قبل الإطلاق)

- [ ] Rate Limiting (Upstash Redis)
  - `/auth/login` — 5 محاولات/15 دقيقة
  - `/auth/signup` — 3 محاولات/ساعة
  - `/api/*` — حسب الـ endpoint
- [ ] Turnstile على `/auth/signup`
- [ ] Audit Logs شاملة
- [ ] nonce-based CSP (بدل `unsafe-inline`)
- [ ] Sentry (error tracking)

---

## 💰 التكاليف (مستقبلاً)

- [ ] Vercel Pro ($20/شهر) — لما نبدأ نربح
- [ ] دومين `eah.app` — بعد 3 شهور (مجاني مع Pro)
- [ ] Supabase Pro ($25/شهر) — لما نوصل 50K مستخدم
- [ ] Cloudinary — لما ننقل (Phase 3)

---

## 🎯 ميزات مستقبلية

### بعد 6 شهور:
- [ ] Bottom Navigation للموبايل
- [ ] Audio Reviews
- [ ] Video Reviews
- [ ] Stories

### بعد سنة:
- [ ] تطبيق iOS Native
- [ ] تطبيق Android Native
- [ ] WhatsApp Business API
- [ ] Telegram Bot

### بعد سنتين:
- [ ] CRM متقدم
- [ ] Analytics متقدم (AI)
- [ ] Recommendation Engine (ML)
- [ ] Multi-language

---

## ✨ أفكار (من رسايل NourEldin)

- [ ] **Scroll to top** (سهم نيون)
- [ ] **QR Code** للمنصة + لكل نشاط
- [ ] **مشاركة النشاط** (بوست احترافي)
- [ ] **"شارك تجربتك"** → بوست تلقائي
- [ ] **Google Places API** — بديل عن Overpass (مؤجل)
- [ ] **Cloudinary migration** (Phase 3)
- [ ] **بيانات تجريبية** → نشاطات حقيقية (بعد لوحة التحكم)

---

## 📝 قواعد ذهبية

1. **صفر تكرار** في الكود.
2. **الاستدعاء** بس (مش كتابة من الأول).
3. **CSS-only** للأنيميشن.
4. **صفر Vibe Coding Errors.**
5. **السرعة** أولوية.
6. **الأداء** أولوية (10K مستخدم).

---

## 🔗 روابط محتاجة

- [ ] **فيسبوك** — NourEldin هيبعت
- [ ] **قناة واتساب** — NourEldin هيبعت
- [x] **واتساب خاص** (للتواصل): `201012892806`

---

آخر تحديث: 2026-09-26

---

## ✅ خلص (2026-09-27) — Featured Redesign

- [x] Featured Bento (Hero + 4 صغيرة + دوران عادل)
- [x] /featured page
- [x] Round-Robin rotation
- [x] شيل dailyShuffle من المميزين

## ⏳ جاي (بالأولوية)

- [ ] Trending Strip
- [ ] Offers Strip
- [ ] Nearby Grid
- [ ] Opportunity Strip
- [ ] Footer كامل
- [ ] Explore Filters

### جاي — Featured Card Extend (بعد migration)
- [ ] `branches_count` في Business
- [ ] `offers_count` في Business
- [ ] `rating_avg` + `rating_count` (بدل trust_score/20)
- [ ] `category` (تصنيف المطعم: بيتزا، مشويات...)
- [ ] Badges إضافية: 🏢 فروع + 🎁 عروض + 🍕 تصنيف
