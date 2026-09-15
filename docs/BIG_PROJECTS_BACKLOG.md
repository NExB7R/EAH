# EAH — Big Projects Backlog (2026)

> أولويات + متطلبات كل مشروع كبير. آخر تحديث: 2026-09-15

## #1 — AI Smart Bot (أولوية عليا)

**بوت خفيف جداً يفهم المنصة كاملة ويساعد الزائر.**

- يفهم: الأماكن، العروض، التسجيل، الأسعار، التواصل
- يعرف: كل معلومات التواصل + طرق الإعلان
- سكرول behavior + intent detection
- واجهة عائمة 2026 فخمة (floating bubble, mobile-first)
- Fallback → WhatsApp deep link لو ما عرفش
- مكان مميز في المنصة (تسويق واضح)
- **تقنية:** rule-based + intent detection (مش LLM ثقيل)
- **ملفات:** `components/smart-bot.tsx`, `lib/bot/knowledge-base.ts`, `lib/bot/intent-matcher.ts`

**السيناريوهات:**
1. زائر جديد — "المنصة إيه؟"
2. عميل — "عايز أطلب"
3. تاجر — "عايز أسجل"
4. مشكلة — "مش عارف أسجل"
5. سعر — "الباقات بكام؟" → WhatsApp

**الحالة:** ⏳ pending

---

## #2 — Market & Competitor Research

**تحليل المنافسين + نموذج الربح.**

### A. المنافسون (بحث شامل)
- Elmenus, Talabat, Otlob, Waffarha, Yumamia, Zomato Egypt, TripAdvisor Egypt
- Facebook Pages + Google My Business + أي منصة محلية

**لكل منافس:** المميزات، نموذج العمل، نقاط القوة/الضعف، UX patterns.

**النتيجة:** `docs/COMPETITORS_ANALYSIS.md`

### B. نموذج الربح
- **للعميل:** مجاناً
- **للتاجر مجاناً:** listing أساسي
- **للتاجر مدفوع:** باقات + أسعار حسب السوق المصري
- **طرق تمويل:** إعلانات، featured placement، subscriptions، sponsored offers، lead gen، order-bot service

**النتيجة:** `docs/REVENUE_MODEL.md`

**الحالة:** ⏳ pending

---

## #3 — Real Businesses Data Collection

**جمع بيانات حقيقية لكل الأنشطة في شبين القناطر + 7 قرى.**

**القرى:** شبين القناطر، القلج، الجبل الأصفر، كفر بطا، نوى، طحا، منشأة الكرام، أبو زعبل.

**الفئات (مع توصيل فقط):**
- مطاعم، صيدليات، ماركت، مكاتب توصيل

**لكل نشاط:**
- اسم + نوع + عنوان حي + Google Maps URL
- أرقام (فون + WhatsApp) + ساعات عمل
- هل بيوصل للبيت؟ + صور (منيو/عامة)

**الحالة الافتراضية:** `is_published=true`, `is_featured=false`

**الطريقة:** Google Maps + Facebook + Elmenus/Talabat + تأكيد توصيل

**النتيجة:** `data/businesses_import.json` + migration script

**الحالة:** ⏳ pending (بعد #2)

---

## #4 — Notifications System v2

**إشعارات ذكية لكل الأدوار.**

- عميل: تقييمات، عروض، تذكيرات
- تاجر: تقييمات، عروض، اشتراك
- فلاتر حسب الباقة المدفوعة
- Web Push + in-app
- Rate limiting + quiet hours

**الحالة:** ⏳ pending

---

## #5 — Advanced Analytics

**Admin + Merchant تحليلات احترافية 2026.**

- Admin: real-time, funnel, cohort, revenue, export
- Merchant (حسب الباقة): زيارات، reveals، تقييمات، تفاعل

**الحالة:** ⏳ pending

---

## #6 — Order Bot (Merchant Feature)

بوت يطلب + تتبع + delivery integration.

**الحالة:** ⏳ long-term

---

## 📋 قائمة صغيرة (do later)

- [ ] WhatsApp Channel + FB Page links (من المستخدم)
- [ ] Supabase leaked-password protection
- [ ] Distributed rate limiting (Redis)
- [ ] SEO sweep (og:image + JSON-LD)
- [ ] Responsive audit
- [ ] Icon system consistency
