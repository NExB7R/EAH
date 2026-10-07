# EAH — NEXT_SESSION.md

> قائمة المهام المتبقية. **مصدر واحد للحقيقة.**
> آخر تحديث: 2026-10-06

---

## ✅ تم (Session 12 — 2026-10-05/06)

- Feature Announcements (جدول + banner + admin UI + flag)
- Ads System (merchant request + admin approve + display)
- /suggest ديناميكي (بناءً على تاريخ المستخدم)
- Branches CRUD للتاجر (add/edit/delete/setPrimary)
- Live Stats Bar (8 عدادات فوق الفوتر)
- Menu Slider + Screenshot في OrderModal
- Multi-Provider AI (Groq → Gemini → OpenRouter → Cerebras)
- 4 AI Tools جديدة (offers/trending/categories/by-area)
- Search v2 (Word-level + Fuzzy + Intent + Secondary sort)
- Admin Panel (dashboard + businesses + users + moderation)
- 4 Migrations موثّقة

---

## 🔴 حرجة — قبل الإطلاق

- [ ] **Turnstile حقيقي** — حالياً Test Keys في Production
  - السبب: `eah-sq.vercel.app` مش مسجل في Cloudflare Turnstile
  - الحل: Cloudflare Dashboard → Turnstile → Widget → Add Hostname: `eah-sq.vercel.app` + `localhost`
  - بعدها: نرجّع مفاتيح الإنتاج على Vercel (production + preview + development)
  - المرجع: `Desktop/X.txt` — مفاتيح Turnstile الأصلية
  - الأولوية: عالية — Test Keys = صفر حماية من البوتات

## 🔴 فوري — اختبار بعد تصليح RLS

- [ ] اختبار `/` `/account` `/merchant/subscription` `/admin/businesses` `/find` + صفحة نشاط
- [ ] التأكد من عمل find-by-phone بعد إغلاق profiles للـ public
- [ ] DevTools → Console: صفر أخطاء في الصفحات الأساسية

## 🔴 حرجة — قبل الاختبار الميداني

- [ ] مسح البيانات الوهمية (53 نشاط + حسابات تجريبية)
- [ ] إضافة أنشطة حقيقية في كل المجالات
- [ ] صور حقيقية (بدل تجريبية)
- [ ] تجربة حقيقية للطلب (إنشاء → تسليم)
- [ ] حسابات حقيقية (تاجر + عميل + اختبار الأدوار)
- [ ] اختبار الأمان (RLS + محاولات اختراق + تسريب)
- [ ] اختبار السرعة (كل صفحة + كل API)
- [ ] اختبار الترتيب (بحث + ترند + ترشيحات)
- [ ] اختبار الجوال (موبايل حقيقي + شبكة مختلفة)

---

## 🟠 قريب (بعد الأساس)

- [x] Role-Based Polish ✓ (Session 14)
- [ ] Telegram Bot — Admin / Merchant / Client
- [ ] Admin UI للبوت (/admin/telegram)
- [ ] Voice Search ذكي (Whisper + فهم عامية)
- [ ] Business Insights AI (تقارير ذكية للتاجر)
- [ ] Smart Notifications
- [ ] Reputation Score 2.0
- [ ] Growth & Marketing ذكي

---

## 🟡 متوسط

- [ ] Offline First 2027
- [ ] Smart Pricing

---

## المراجع

- VISION.md · CODE_REVIEW_LOG.md · USER_PREFERENCES.md · FUTURE.md
