# EAH — HANDOFF.md

> **الملف الوحيد اللي محتاجه أي شات/إنسان جديد.**
> اقرأه كامل — هيفهمك المشروع في 5 دقايق.
> آخر تحديث: 2026-10-28

---

## 🎯 0. هوية المشروع

**EAH** = منصة اكتشاف محلية مصرية.
- **المكان:** شبين القناطر + القرى حواليها (بداية)
- **السلوجان:** اللي نفسك فيه ؟
- **الهوك:** شبيك لبيك .. كل حاجة حواليك
- **الستيكر:** من قلب شبين القناطر

**الفكرة:** كل حاجة محلية في مكان واحد — مطاعم، صيدليات، توصيل، وأي خدمة.
- **للمشتري:** مجاني 100%
- **للبايع:** بدون عمولة على الطلبات
- **الربح:** باقات + إعلانات + مميز + توثيق (اختياري)

**التوسع:** 20+ نوع نشاط — سمسار، نجار، حلاق، ميكانيكي، كهربائي، دكتور...

---

## 📊 1. الحالة الحالية

| البند | القيمة |
|------|--------|
| **الإصدار** | v1.0.0 |
| **آخر commit** | `9985bba6601dc81346f457195323a0cfc5348d30` |
| **الفرع** | main |
| **الإنتاج** | https://eah-sq.vercel.app |

**الحالة الوظيفية الحالية (2026-10-28):**
- مسارات التصفح، البحث، النشاط العام ولوحات الأدمن والبايع موجودة؛ لكن الرحلات المتكاملة تحتاج اختبارًا عمليًا بحسابات غير أدمن قبل اعتمادها كجاهزة للإطلاق.
- تم فصل سمعة النشاط عن نقاط المشاركة؛ نقاط المشاركة لا تظهر كدرجة ثقة عامة ولا تدخل ترتيب الأنشطة.
- تم تأمين التقييم ليحتاج طلبًا مكتملًا، وإجبار إدخالات المشترين على `pending`، وإتاحة رد واحد للبايع على تقييم معتمد فقط.
- تم تأمين انتقالات الطلب ومنع التلاعب بهوية المشتري/النشاط، وإصلاح قيد الحالات وقفل رسالة واتساب.
- تم فصل مستوى الحسابات المتعددة عن البلاغات المثبتة؛ البلاغ المعلق أو المرفوض لا يزيد مؤشر المخاطر.
- الأولوية التالية: إكمال اختبار رحلة واقعية من إنشاء النشاط/الطلب إلى التسليم والتقييم، وتشغيل GitHub Actions بعد إصلاح مشكلة تخصيص Runner.

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

## 5. نقاط المشاركة والسمعة والتوثيق

- `trust_score` و`trust_tier` حقول تاريخية لنقاط المشاركة فقط، وليسا دليلًا على موثوقية الشخص أو النشاط.
- أسماء مستويات المشاركة الداخلية: بداية، مشارك، نشط، متميز، الأسطورة.
- نقاط المشاركة لا تدخل في ترتيب الأنشطة العام ولا تظهر للمشتري كدرجة سمعة.
- سمعة البايع تظهر كحقائق منفصلة: توثيق الإدارة، متوسط التقييم وعدده، والطلبات المكتملة.
- المشتري لا يملك درجة عامة؛ يظهر للبايع في سياق الطلب توثيق الهاتف وسجل الطلبات المكتملة، مع حالة محايدة عند تعذر التحقق.
- البلاغ غير المحقق أو رفض الطلب لا ينشئ عقوبة تلقائية. مؤشرات المخاطر داخلية ومصدرها منفصل.
- `/trust` و`/merchant/trust` لشرح النموذج؛ صفحة البايع تعرض أدلة نشاطه.

---

## 6. Geo System 2.0

- GeoProvider (Context) — قراءة موقع واحدة للصفحة
- useDistance(lat, lng) — hook
- DistanceBadge — إنت هنا لو أقل من 100م
- BranchList — كل فرع بمسافته + الأقرب ليك تلقائية
- Cache: localStorage — ساعة

**القاعدة:** كل بطاقة نشاط = أدلة سمعة منفصلة + المسافة

---

## 7. العروض — القرار

**الشروط:**
- is_published = true
- ends_at > now()

**الترتيب — Fair Rotation:**
- 3 slots للأحدث
- 3 slots لدليل السمعة الأعلى (التوثيق الإداري + التقييم بحجم عينته + الطلبات المكتملة)
- 2 slots Round-Robin

**ملاحظات:**
- نسبة الخصم: بيانات بس — مش معيار
- Featured boost: مفيش

**الأماكن:** Home + /offers + /merchant/offers + /admin/offers

---

## 8. المميزون

**3 طرق:**
1. مدفوع — البايع يشتري الباقة (300 ج.م/شهر)
2. يدوي — الأدمن يفعّل بدون فلوس
3. تلقائي مؤقت — 30 يوم ترحيبي

**الترتيب:** featured_pin → featured_order → توثيق الإدارة → التقييم وعدده → الطلبات المكتملة
**إشعار:** قبل الانتهاء بـ 7/3/1 يوم

---

## 9. التوثيق (Verified)

- منفصل عن الباقات
- بموافقة الأدمن — مفيش توثيق تلقائي
- توثيق إداري يدوي فقط؛ لا يُفعّل تلقائيًا بالنقاط أو التفاعل أو الدفع.
- `is_verified` يعني مراجعة بيانات محددة بواسطة الأدمن، وليس ضمانًا لجودة كل تعامل.
- نقاط المشاركة منفصلة عن السمعة وعن التوثيق.

---

## 10. الفحص المكتمل

**نقاط المشاركة:** نظام داخلي فقط؛ ليست درجة موثوقية عامة.
**السمعة:** توثيق إداري + تقييم وعدده + طلبات مكتملة، دون عقوبة تلقائية على البلاغات غير المحققة.
**إشارات المخاطر:** multi_account_level منفصل عن report_wanted_level؛ pending/reviewing/dismissed لا تُعاقب المشتبه به.
**Health Monitor:** system_errors + error logging + cron

**حالة الفحوصات (2026-10-28):**
- Vercel production deployment للـ commit `9985bba6601dc81346f457195323a0cfc5348d30` وصل إلى `READY`، ونجح التجميع وTypeScript وتوليد الصفحات. رابط النشر: `https://eah-3se4qaqpy-eah-74a0.vercel.app`.
- اختبارات SQL داخل معاملات `BEGIN/ROLLBACK` أثبتت منع الطلبات المزيفة، فرض مراجعة التقييم، سلامة انتقالات الطلب، وقفل رسالة واتساب، وعدم احتساب البلاغ قبل قرار الأدمن.
- GitHub Actions تفشل قبل بدء أي خطوة (`runner_id=0`, `steps=0`)؛ لذلك لا تعتبر E2E أو Quality Gate أو CodeQL ناجحة حتى يتم إصلاح Runner وتنفيذ الخطوات.

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

---

## Session Close — 2026-10-20 (Admin + Security Overhaul)

**آخر commit:** `be1f199`  
**Invariants:** all OK  
**Deploy:** Vercel auto

### اللي اتحل (مؤكد بالاختبار)

**Admin UX:**
- Wizard fullscreen + 3 tabs تفاصيل النشاط + mobile drawer
- Admin profile + bell routing
- 10 contact types + notice + open-override
- 📍 location picker (geolocation + OSM)

**Media:**
- File upload + URL paste (logo/cover/menu/gallery)
- Menu + Gallery sections
- Offers CRUD + public display

**Public Page:**
- Notice banner + open-override
- Offers tab + share modal + QR (5 منصات)

**Security — DB-04/05 ✅ (verified by test):**
- `check_*_badges`: self-award guard (verified: 42501)
- `get_referral_*`: self-only filter
- `get_user_points`: self-only
- `get_business_funnel/features/trial_status`: ownership guard
- `get_multi_account_ips`: REVOKE PUBLIC + authenticated + anon
- AP-05: service client for admin notifications

**Tech Debt:**
- business-form.tsx: 1179 → 19 سطر
- business-form-hooks.ts: 380 → 3 ملفات
- B2 select('*'): 5 → 1 (documented exception)
- B3 baseline accurate

### اللي مؤجل

- **SEC-01**: rotate 11 keys (قرارك — قبل الإطلاق)
- **SEC-02b**: ***REMOVED*** in git history (history rewrite)
- CONSISTENCY-01: SACRED → 4 أنواع
- Mobile QA polish بعد أول نشاط

### أولويات الجلسة القادمة

1. **أضف أول نشاط حقيقي** (الهدف الأساسي)
2. اختبر end-to-end (offers + images + share + mobile)
3. SEC-01 rotate
4. Mobile QA polish

### تحذيرات

- `business-form-hooks.ts` = combiner — التعديل في `-state.ts` / `-handlers.ts`
- `get_multi_account_ips` — REVOKE PUBLIC/anon/authenticated — استخدمه بـ service client بس
- قواعد §14 في AI_PLAYBOOK (Python write_text — ممنوع `r + backslash`)

