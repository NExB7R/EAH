# EAH — رسالة الشات الجديد

**التاريخ:** 2026-10-07
**الإصدار:** v1.0.0 · **آخر commit:** `655b866` (main)
**الحالة:** 🟢 Production Ready · قاعدة البيانات نظيفة (صفر أنشطة وهمية)

---

## ابدأ من هنا

**الملف الشامل:** `docs/HANDOFF.md` — كل حاجة في صفحة واحدة.
**الترتيب الكامل:** `docs/FILE_ORDER.md` — المصدر الوحيد.

**بعد القراءة:** قول "قرأت. جاهز." واستنى.

---

## إيه EAH؟

منصة اكتشاف محلية مصرية من شبين القناطر.
- **مجانية 100%** للعميل
- **صفر عمولة** على التاجر
- **طلب مباشر** على واتساب

**الربح:**
- 4 باقات: أساسية (0) / مميز (300) / نمو (500) / شراكة (1000)
- 4 إعلانات: بانر رئيسية (400) / بين الأقسام (200) / بانر تصنيف (300) / إعلان ترند (400)
- توثيق منفصل: 100 ج.م/سنة

---

## الحالة الحالية (بعد Wipe)

**الـ DB نظيف:**
- 0 أنشطة
- 0 تقييمات
- 0 عروض
- 0 إعلام
- 1 profile (NourEldin B7R — super_admin)
- 4 باقات + 4 ad_slots + 18 badge + إعدادات

**الكود كامل 100%** — جاهز لاستقبال البيانات.

---

## الميزات الجاهزة (95% مكتمل)

| الميزة | الحالة |
|--------|--------|
| Core (Auth + Home + Explore) | ✅ |
| Account (12 صفحة) | ✅ |
| Merchant (17 صفحة) | ✅ |
| Admin (19 صفحة) | ✅ |
| Trust System 2.0 | ✅ |
| Fair Ranking (7 معايير) | ✅ |
| Reviews 2.0 (JSONB dimensions) | ✅ |
| Threaded Comments (YouTube-style) | ✅ |
| Advanced Filters (9 فلاتر) | ✅ |
| Voice Search (Whisper + Web Speech) | ✅ |
| Offline First (Serwist + IndexedDB) | ✅ |
| Business Insights AI | ✅ |
| Nonce CSP (XSS) | ✅ |
| Bundle (Lighthouse 99 desktop) | ✅ |

---

## اللي جاي (حسب الترتيب)

### 🔴 فوراً
1. **إضافة أنشطة حقيقية** — بداية نظيفة
2. **اختبار ميداني** — موبايل حقيقي + شبكة حقيقية
3. **تجربة طلب كاملة** (من إنشاء → تسليم)
4. **اختبار أمان** بـ 3 أدوار

### 🟠 قبل الإطلاق
5. **Telegram Bot** (Admin/Merchant/Client)
6. **Rotate المفاتيح المكشوفة** (11 مفتاح)
7. **Vercel Pro** (20$/شهر) — إجباري قانوني
8. **Supabase Pro** (25$/شهر) — استقرار
9. **Domain** eah.app

### 🟡 بعد الإطلاق
- Google Search Console
- Vercel Speed Insights
- Sentry (error tracking)

---

## القواعد الذهبية (مهمة)

- **مختصر دايماً** (§31) — مفيش شرح إلا لو طُلب
- **Python للملفات الكبيرة** (§36) — ممنوع nano
- **ممنوع build محلي** (§32) — SIGILL
- **اقرأ قبل التعديل** (§33) — find → read → understand → grep
- **تزامن الوثائق** (§35) — أي تعديل → PROGRESS + SESSION_LOG
- **مصدر واحد للحقيقة** (§26)

---

## الممنوعات المطلقة

- تعديل بدون سؤال (§3.1)
- commit بدون typecheck
- deploy بدون preview + موافقة
- build محلي (SIGILL)
- secrets في Git
- تكرار كود (§18.1)
- any بدون سبب (§18.2)

---

## مصادر أساسية

- `HANDOFF.md` — الملف الشامل
- `VISION.md` — الرؤية 2026-2027
- `CRITERIA.md` — معايير المنصة
- `USER_PREFERENCES.md` — تفضيلات المالك
- `CODE_REVIEW_LOG.md` — المشاكل المرصودة
- `NEXT_SESSION.md` — المهام المتبقية
- `LESSONS.md` — الدروس
- `Desktop/X.txt` — كل المفاتيح + روابط الخدمات

---

## ملاحظات أمنية

**11 مفتاح مكشوف في شات سابق** — لسه محتاجين rotate قبل الإطلاق:
1. Supabase Service Role
2. Cloudinary Secret
3. Upstash Token
4. Groq API Key
5. Gemini API Key
6. OpenRouter (× 2)
7. Turnstile Secret
8. VAPID Private
9. CRON + SUPABASE_CRON + EAH_VISITOR_SALT
10. GitHub PAT

**الملف موجود في:** `Desktop/X.txt` — فيه روابط كل خدمة مباشرة.

---

**المالك:** NourEldin B7R — فلسطين في القلب
