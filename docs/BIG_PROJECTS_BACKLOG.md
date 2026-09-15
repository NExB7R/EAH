# EAH — Big Projects Backlog (2026)

> **مشاريع استراتيجية كبيرة** — كل واحدة محتاجة تخطيط + بحث + تنفيذ متعدد الجلسات.
> **ترتيب التنفيذ:** من الأعلى للأقل حسب الأولوية.
> **آخر تحديث:** 2026-09-15

---

## 🎯 #1 — AI Smart Bot (أولوية عليا)

**الهدف:**
بوت ذكي خفيف جداً يفهم المنصة بالكامل ويساعد الزائر بأي حاجة.

**المتطلبات:**
- ✅ يفهم المنصة كلها (الأماكن، العروض، التسجيل، الأسعار، التواصل)
- ✅ يعرف كل معلومات التواصل وطرق الإعلان
- ✅ يفهم العميل + التاجر + المميزات
- ✅ سكرول behavior + intent detection (يفهم اللي الزائر محتاجه من غير ما يسأل)
- ✅ واجهة عائمة 2026 فخمة (floating bubble, mobile-first)
- ✅ على الهاتف والويب (responsive)
- ✅ لو ما عرفش → يبعت رسالة تلقائية لك على WhatsApp
- ✅ مكان مميز وجذاب للبوت في المنصة (تسويق واضح)
- ✅ خفيف جداً — بدون مكتبات ثقيلة

**التقنية المقترحة:**
- **Rule-based + intent detection** (مش LLM ثقيل) — عشان الخفة
- قواعد ذكية (if/then) + keyword matching + context awareness
- Knowledge base ثابت (كل معلومات المنصة في JSON)
- Fallback → WhatsApp deep link
- React Portal + Framer Motion-less (CSS transitions فقط)

**السيناريوهات:**
1. زائر جديد — "المنصة إيه؟" → شرح سريع
2. عميل — "عايز أطلب" → ترشيح + شرح عملية الطلب
3. تاجر — "عايز أسجل" → خطوات + رابط merchant/apply
4. مشكلة — "مش عارف أسجل" → شرح خطوة بخطوة
5. سؤال عن السعر → شرح الباقات + WhatsApp للتفاصيل

**الملفات المتوقعة:**
- `components/smart-bot.tsx` — الواجهة
- `components/smart-bot.css` — التصميم
- `lib/bot/knowledge-base.ts` — كل معلومات المنصة
- `lib/bot/intent-matcher.ts` — المطابقة الذكية
- `lib/bot/fallback.ts` — WhatsApp routing
- `app/api/bot/log/route.ts` — تتبع الأسئلة الشائعة

**الحالة:** ⏳ pending — يبدأ بعد Sprint 4

---

## 🎯 #2 — Market & Competitor Research

**الهدف:**
بحث شامل عن المنافسين في النيتش + نموذج الربح الأمثل.

**المطلوب:**

### A. تحليل المنافسين
ابحث في:
- **Elmenus** (مصر — دليفري)
- **Talabat** (دليفري MENA)
- **Otlob** (دليفري مصر)
- **Waffarha** (عروض مصر)
- **Yumamia** (ديسكفري)
- **Zomato Egypt**
- **TripAdvisor Egypt**
- **Facebook Pages** للمطاعم المحلية
- **Google My Business**
- **أي منصة محلية صغيرة**

**لكل منافس، رصد:**
- المميزات الأساسية
- نموذج العمل (commission / subscription / ads)
- نقاط القوة
- نقاط الضعف
- UX patterns
- Business Model Canvas

**النتيجة:** `docs/COMPETITORS_ANALYSIS.md`

### B. نموذج الربح
- **للعميل مجاناً:** ما الذي يمكن تقديمه؟
- **للتاجر مجاناً:** ما الذي يمكن تقديمه؟
- **للتاجر مدفوع:** الباقات + الأسعار المقترحة للسوق المصري 2026
- **طرق تمويل إضافية:**
  - إعلانات مخصصة (banners)
  - Featured placements
  - Subscriptions (شهري/ربع/سنوي)
  - Premium profiles
  - Sponsored offers
  - Listing highlights
  - Lead generation (كشف الأرقام)
  - Referral commissions (لاحقاً)
  - Order-bot service (لاحقاً)

**النتيجة:** `docs/REVENUE_MODEL.md`

**الحالة:** ⏳ pending — يبدأ بعد Sprint 4

---

## 🎯 #3 — Real Businesses Data Collection

**الهدف:**
جمع بيانات حقيقية لكل الأنشطة في شبين القناطر + القرى المجاورة.

**الفئات:**
- ✅ مطاعم (مع توصيل)
- ✅ صيدليات (مع توصيل)
- ✅ ماركت/سوبرماركت (مع توصيل)
- ✅ مكاتب توصيل

**لكل نشاط:**
- ✅ اسم النشاط (مؤكد)
- ✅ نوع النشاط (restaurant / pharmacy / supermarket / delivery_office)
- ✅ العنوان الحي
- ✅ رابط Google Maps Location
- ✅ أرقام تواصل (فون + WhatsApp)
- ✅ هل بيوصل للبيت؟ (نعم/لا)
- ✅ صور (منيو أو صور عامة)
- ✅ ساعات العمل
- ✅ المنطقة (شبين القناطر / قرية مجاورة)

**القرى المستهدفة:**
- شبين القناطر
- القلج
- الجبل الأصفر
- كفر بطا
- نوى
- طحا
- منشأة الكرام
- أبو زعبل

**الحالة الافتراضية:**
- `is_published = true`
- `is_featured = false` (كله مش مميز)
- يراجعها الأدمن ويعدل

**الطريقة:**
- بحث في Google Maps
- بحث في Facebook
- بحث في Elmenus / Talabat / Otlob (للأماكن المسجلة)
- التأكد من وجود خدمة توصيل (من الإعلانات أو التواصل)
- تجميع في CSV/JSON جاهز للاستيراد

**النتيجة:** `data/businesses_import.json` + migration script

**الحالة:** ⏳ pending — بعد Revenue Model

---

## 🎯 #4 — Notifications System v2 (2026 Smart)

**الهدف:**
نظام إشعارات ذكي واحترافي لكل الأدوار.

**المتطلبات:**
- ✅ إشعارات للعميل (رد على التقييم، عروض، تذكيرات)
- ✅ إشعارات للتاجر (تقييم جديد، عرض جديد، اشتراك قرب ينتهي)
- ✅ فلاتر للتاجر حسب الباقة المدفوعة
- ✅ Web Push + in-app + email (اختياري)
- ✅ Rate limiting + quiet hours
- ✅ i18n على الإشعارات

**الحالة:** ⏳ pending

---

## 🎯 #5 — Advanced Analytics (Admin + Merchant)

**الهدف:**
تحليلات احترافية 2026 للـ admin والـ merchant.

**للأدمن:**
- Real-time visitors
- Funnel analysis
- Cohort retention
- Revenue tracking
- Custom date ranges
- Comparison (week over week)
- Export CSV/Excel/PDF

**للتاجر (حسب الباقة):**
- زيارات (unique/total)
- كشوف الأرقام
- تقييمات
- تفاعل مع العروض
- مواقع الزوار (area-based)
- أوقات الذروة

**الحالة:** ⏳ pending

---

## 🎯 #6 — Order Bot (Merchant Feature)

**الهدف:**
بوت ذكي يطلب بدل العميل.

**المتطلبات:**
- يتصل بقائمة المطعم
- يجهّز الطلب
- يرسله للتاجر
- يحدّث العميل بالحالة
- Order tracking
- دفع مسبق (اختياري)

**الحالة:** ⏳ pending — long-term

---

## 📋 قائمة انتظار صغيرة (do later)

- [ ] **WhatsApp Channel + FB Page links** — من المستخدم
- [ ] **Supabase leaked-password protection** — إعداد في Dashboard
- [ ] **Distributed rate limiting** — Redis / Upstash
- [ ] **SEO sweep** — og:image لكل صفحة + JSON-LD لكل business
- [ ] **Responsive audit** — كل مقاسات
- [ ] **Color system tokens** — audit + consolidate
- [ ] **Icon system** — توحيد كل الأيقونات SVG
- [ ] **Dark/Light mode toggle** (اختياري — المستخدم dark-first)
- [ ] **Multi-language** (عربي فقط حالياً)

---

## 🔄 التنفيذ الحالي (Sprint 2+)

**اللي بنعمله الآن:**
1. ✅ super_admin points cleanup
2. ✅ Notifications System v2 — قيد التنفيذ
3. ✅ admin/security → functional
4. ✅ admin/analytics → أقوى
5. ✅ account/edit → كنترول أحسن
6. ✅ Favicon أوضح + PWA
7. ✅ Explore → تصميم + hero + delivery_office fix
8. ✅ صفحة زائر

**بعدها:** Smart Bot (#1)

---

**ملاحظة:** الملف ده مرجع حي — يتحدّث كل جلسة. الأولوية بتتغير حسب احتياج البيزنس.
