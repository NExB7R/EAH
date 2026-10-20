# EAH — HANDOFF.md

> **الملف الوحيد اللي محتاجه أي شات/إنسان جديد.**
> اقرأه كامل — هيفهمك المشروع في 5 دقايق.
> آخر تحديث: 2026-10-07

---

## 🎯 0. هوية المشروع

**EAH** = منصة اكتشاف محلية مصرية.
- **المكان:** شبين القناطر + القرى حواليها (بداية)
- **السلوجان:** اللي نفسك فيه ؟
- **الهوك:** شبيك لبيك .. كل حاجة حواليك
- **الستيكر:** من قلب شبين القناطر

**الفكرة:** كل حاجة محلية في مكان واحد — مطاعم، صيدليات، ماركت، توصيل، وأي خدمة.
- **للعميل:** مجاني 100%
- **للتاجر:** بدون عمولة على الطلبات
- **الربح:** باقات + إعلانات + مميز + توثيق (اختياري)

**التوسع:** 20+ نوع نشاط — سمسار، نجار، حلاق، ميكانيكي، كهربائي، دكتور...

---

## 📊 1. الحالة الحالية

| البند | القيمة |
|------|--------|
| **الإصدار** | v1.0.0 |
| **آخر commit** | من PROGRESS.md |
| **الفرع** | main |
| **الإنتاج** | https://eah-sq.vercel.app |

**اللي خلص:**
- Core كامل (Auth + Supabase + Design + PWA)
- Home + Explore + Featured + Trends + Offers + Nearby + Suggest + بدايات
- Account كامل (12 صفحة) + Merchant (11 صفحة) + Admin (19 صفحة)
- Trust System 2.0 (5 مستويات)
- Badge System (18 شارة)
- Fraud Detection كامل
- Referral System
- Geo System 2.0 (Context + branches)
- System Health Monitor

**اللي جاي:**
- فلاتر متقدمة (9 فلاتر)
- ترتيب العروض (Fair Rotation)
- تقييمات حسب النشاط
- تعليقات منفصلة
- إشعارات ذكية
- ترند 7 معايير 2026

---

## 🛠️ 2. التقنيات

- **Next.js 16** + React 19 + TypeScript strict
- **CSS Modules** (مفيش Tailwind)
- **Supabase** (DB + Auth + Storage + RLS)
- **Vercel** (Frankfurt — fra1)
- **Upstash Redis** (rate limiting)
- **Cloudflare Turnstile** (bot protection)
- **Multi-Provider AI:** Groq → Gemini → OpenRouter → Cerebras

**بنية الريبو:**





## 3. القواعد الذهبية

### 31 — مختصر دايماً
- مفيش شرح إلا لو مطلوب
- أوامر مباشرة → نتائج بس

### 32 — جهاز المالك ضعيف
- ممنوع npm run build محلي (SIGILL)
- ممنوع test suites كاملة
- Vercel + GitHub Actions بيبنوا
- npx tsc --noEmit خفيف — مسموح

### 33 — اقرأ قبل أي تعديل
- find → read → understand → grep usages
- قول: هعدل [الملف]. السبب. موافق؟
- استنى موافق

### 34 — رؤية 20+ نوع نشاط
- EAH مش منصة مطاعم
- منصة اكتشاف محلية شاملة

### 35 — تزامن الوثائق
- كود اتغير → PROGRESS + SESSION_LOG
- feature → CHANGELOG + VISION
- bug → LESSONS + CODE_REVIEW_LOG

### 36 — Python للملفات الكبيرة
- أي ملف > 20 سطر → Python
- ممنوع nano
- ممنوع heredoc > 50 سطر

### 26 — مصدر واحد للحقيقة

- آخر commit → PROGRESS.md
- الإصدار → PROGRESS.md
- Sacred files → SACRED.md
- Reading order → FILE_ORDER.md
- المشاكل → NEXT_SESSION.md
- القرارات → VISION.md

---

## 🎨 4. الهوية

### الألوان
- الخلفية: 07020D
- بنفسجي: 9D4EDD / A855F7 / C77DFF
- ذهبي: E8C79A / F5D9A7
- Teal: 55E7D1
- برتقالي: FDBA74
- أحمر: FCA5A5

### الخطوط
- الرئيسي: Cairo Variable
- العرض: Tajawal Variable
- ممنوع: Poppins, Inter, Roboto

### الستايل
- Dark-only
- نيون ناعم
- مفيش backdrop-filter
- مفيش animations مستمرة
- transitions 180-240ms

---

## 5. Trust System 2.0

**5 مستويات شعبية:**

- 0-19: لسه بادئ - bade2 - 🌱
- 20-39: ماشي حاله - mashey - 🌿
- 40-59: زي الفل - fel - 🌳
- 60-79: حريف - harif - 🏆
- 80-100: الأسطورة - ostora - 👑

**Log Scale (نفس DB):**
- 0-30: x1.5
- 30-50: x1.0
- 50-70: x0.7
- 70-85: x0.4
- 85-95: x0.2
- 95-100: x0.1

**Legend Points:** بعد الـ 100 — للترتيب الداخلي

**الأحداث:**
- تقييم معتمد: +5
- تقييم مستلم: +3
- طلب مكتمل: +8
- إحالة: +5 / +15
- تقييم مرفوض: -15
- بلاغ صحيح: -25
- خمول: -1/أسبوع بعد 30 يوم

**الأماكن:** /trust + /merchant/trust

---

## 6. Geo System 2.0

- GeoProvider (Context) — قراءة موقع واحدة للصفحة
- useDistance(lat, lng) — hook
- DistanceBadge — إنت هنا لو أقل من 100م
- BranchList — كل فرع بمسافته + الأقرب ليك تلقائية
- Cache: localStorage — ساعة

**القاعدة:** كل بطاقة نشاط = Trust + Distance

---

## 7. العروض — القرار

**الشروط:**
- is_published = true
- ends_at > now()

**الترتيب — Fair Rotation:**
- 3 slots للأحدث
- 3 slots للـ Trust الأعلى
- 2 slots Round-Robin

**ملاحظات:**
- نسبة الخصم: بيانات بس — مش معيار
- Featured boost: مفيش

**الأماكن:** Home + /offers + /merchant/offers + /admin/offers

---

## 8. المميزون

**3 طرق:**
1. مدفوع — التاجر يشتري الباقة (300 ج.م/شهر)
2. يدوي — الأدمن يفعّل بدون فلوس
3. تلقائي مؤقت — 30 يوم ترحيبي

**الترتيب:** featured_pin → featured_order → trust_score
**إشعار:** قبل الانتهاء بـ 7/3/1 يوم

---

## 9. التوثيق (Verified)

- منفصل عن الباقات
- بموافقة الأدمن — مفيش توثيق تلقائي
- المعايير: Trust أكبر من 80 + 50 تفاعل + سلوك نظيف
- الفرق عن Trust:
  - Trust = رقم متحرك (يكتسب)
  - Verified = شارة ثابتة (مدفوعة)

---

## 10. الفحص المكتمل

**Trust System:** 5 دوال + triggers + UI كامل
**Fraud Detection:** wanted_level internal + multi-account + rate limit
**Health Monitor:** system_errors + error logging + cron

**كل الفحوصات:**
- typecheck ✅
- eslint ✅
- knip ✅
- npm audit ✅

---

## 11. الوثائق — الترتيب

الترتيب الكامل في FILE_ORDER.md

**ملفات مهمة:**
- AI_CONTRACT.md — القواعد الإجبارية
- SACRED.md — الملفات المقدسة
- VISION.md — الرؤية 2026-2027
- CRITERIA.md — معايير المنصة
- USER_PREFERENCES.md — تفضيلات المالك
- LESSONS.md — الدروس + أخطاء AI
- PROGRESS.md — حالة كل ملف
- NEXT_SESSION.md — المهام المتبقية
- SESSION_LOG.md — سجل الجلسات
- CODE_REVIEW_LOG.md — المشاكل المرصودة

---

## 12. الأولويات الحالية

**متبقي:**
1. فلاتر متقدمة (9 فلاتر)
2. ترتيب العروض (Fair Rotation)
3. تقييمات حسب النشاط
4. تعليقات منفصلة + صور
5. إشعار التقييم بعد ساعتين
6. ترند 7 معايير 2026
7. إحالة → trust score
8. إشعارات ذكية

**مؤجل:**
- Telegram Bot (يحتاج فون)
- Voice Search (يحتاج API key)
- Offline First 2027

---

## 13. ابدأ من هنا

**اقرأ بالترتيب:**
1. QUICK_START.md
2. NEW_CHAT_MESSAGE.md
3. PROGRESS.md
4. AI_CONTRACT.md
5. SACRED.md
6. VISION.md
7. USER_PREFERENCES.md
8. CODE_REVIEW_LOG.md
9. NEXT_SESSION.md
10. LESSONS.md
11. SESSION_LOG.md (آخر جلسة)
12. HANDOFF.md (ده الملف)

**قول:** "قرأت. جاهز."
**استنى تعليمات.**

---

## 14. القاعدة الذهبية النهائية

لو شاكك → اسأل.
لو مش متأكد → اسأل.
لو فيه خطر → اسأل.

**الهدف:** منصة نظيفة تخدم الناس لسنين.

---

**المالك:** NourEldin B7R — فلسطين في القلب

---

## حالة التسليم — 2026-10-20 (Admin Redesign)

**آخر commit:** `6b682be`
**Invariants:** OK (B1=0, B2=5, B6=34, X1-X4=0)
**Deploy:** Vercel auto

### شغال
- Business wizard fullscreen (4 steps)
- Contact types (10): phone/whatsapp/complaints/manager/shift_*/facebook/instagram/website/additional
- Notice (info/warning/critical + expiry)
- Open-now override (auto/open/closed)
- Location picker (📍 + OSM iframe)
- Admin detail: 3 tabs (نظرة عامة/تعديل/معاينة)
- Admin profile: sidebar + avatar routing
- Bell → /admin/notifications
- WhatsApp orders gate (server-side)
- 5 God Components split (كلها ≤300 سطر)

### مختبرش لسه
- 🟡 Mobile UX على 320px (يحتاج QA بعد أول نشاط)
- 🟡 Notice/override/📍 end-to-end (نظرياً شغال)
- 🟡 وizard على أجهزة مختلفة

### أولويات الجلسة القادمة
1. **أول نشاط حقيقي** (الأولوية #1)
2. Mobile QA بعد اختبار
3. UI polish حسب الملاحظات
4. SEC-01 rotate (قرار المالك)

### تحذيرات
- `hooks.ts` أصبح 3 ملفات — لا تعدّل واحد بدون التانيين
- `business-form-hooks.ts` = combiner — التعديل الحقيقي في state/handlers
- الملفات المقدّسة: SACRED.md §4

