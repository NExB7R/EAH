# EAH — Launch Checklist (قبل الإطلاق الرسمي)

> **الحالة:** قيد الإعداد.
> **آخر تحديث:** 2026-11-09
> **الغرض:** قائمة مرجعية نهائية — كل بند لازم يتقفل قبل فتح المنصة للجمهور.

---

## 🟢 1. البنية التحتية (Infrastructure)

- [x] قاعدة البيانات (Supabase) متصلة
- [x] RLS على كل الجداول الحرجة (15 جدول)
- [x] الـ Triggers الحرجة شغالة (notify_merchant_on_review, autopilot, ...)
- [x] Design Tokens (39 tokens) مطبقة على 138 ملف
- [x] CI/CD عبر Vercel + GitHub Actions
- [x] Domain + SSL (Vercel auto)
- [ ] **Vercel Production Environment Variables** مؤكدة
- [ ] **Backup تلقائي لقاعدة البيانات** (Supabase → Daily Backups)

---

## 🟢 2. الأنظمة الأساسية (Core Systems)

- [x] **Standing System**: Cockpit + Autopilot + `can_interact` RPC
- [x] **Health Checks**: 13 فحص + 3 auto-fixes
- [x] **Launch Readiness**: 11 فحص موزون
- [x] **Design System**: Tokens + Empty States (28 صفحة) + Error Boundaries
- [x] **Unified Header**: FloatingCapsule عبر كل الصفحات
- [x] **Contact Privacy**: أرقام التواصل محمية (0 أرقام مكشوفة)
- [x] **Branch Auto-create**: كل نشاط جديد بياخد فرع أساسي

---

## 🟢 3. الصفحات العامة (Public Pages)

- [x] `/` — الرئيسية (Hero + Categories + Trending + Offers + New + Nearby)
- [x] `/explore` — البحث والفلترة (mobile scroll)
- [x] `/businesses/[slug]` — صفحة النشاط (Hero + Actions + Tabs + Branches + Gallery)
- [x] `/featured`, `/trends`, `/offers`, `/new`, `/nearby`
- [x] `/about`, `/contact`, `/faq`, `/help`, `/trust`
- [x] `/terms`, `/privacy`, `/cookies`
- [x] `/auth` — تسجيل الدخول/التسجيل
- [x] Error boundaries لكل صفحة عامة

---

## 🟢 4. لوحات التحكم (Dashboards)

- [x] `/admin` — لوحة الإدارة (unified header)
- [x] `/admin/businesses` — إدارة الأنشطة
- [x] `/admin/businesses/new` — Wizard إضافة نشاط (يُنشئ فرع تلقائي)
- [x] `/admin/users` — إدارة المستخدمين + Standing Cockpit
- [x] `/admin/health` — صحة النظام + Launch Readiness
- [x] `/merchant` — لوحة التاجر (unified header)
- [x] `/merchant/business` — إدارة النشاط
- [x] `/merchant/orders` — إدارة الطلبات
- [x] `/merchant/offers` — العروض
- [x] `/account` — لوحة العميل (Bento Grid + Welcome Header)
- [x] `/account/*` — كل صفحات الحساب (favorites, orders, following, notifications, points, badges, ...)

---

## 🟢 5. الأمان (Security)

- [x] RLS على كل الجداول (15/15)
- [x] `find_by_phone` مقفول للزوار (revoked)
- [x] أرقام التواصل محمية (reveal_contact flow)
- [x] `checkCanInteract` على submitReview + createComment + replyToReview
- [x] Autopilot: عقوبات تلقائية على المخالفات المتكررة
- [x] CSP Nonce على كل request (proxy.ts)
- [x] Admin/merchant محميين في proxy.ts
- [ ] **Secrets Rotation** قبل الإطلاق (مؤجل 90 يوم)
- [ ] **SEC-02b**: VERCEL_OIDC_TOKEN في git history (تم تنظيفه في filter-repo)

---

## 🟢 6. جودة البيانات (Data Quality)

- [x] دالة `can_interact` موجودة
- [x] Autopilot trigger موجود ومفعّل
- [x] Demo data معزولة (slugs تبدأ بـ `demo-` أو `eah-qa-test-`)
- [ ] **حذف demo data قبل الإطلاق** (`docs/seeds/cleanup.sql`)
- [ ] **إضافة 3+ أنشطة حقيقية** (مش demo)
- [ ] **بيانات تجار حقيقية** (merchant1/merchant2 → حسابات حقيقية)

---

## 🟢 7. الوثائق (Documentation)

- [x] `docs/CONSTITUTION.md` — الدستور
- [x] `docs/DESIGN_TOKENS.md` — نظام التصميم
- [x] `docs/TEST_ENVIRONMENT.md` — بيئة التجربة
- [x] `docs/ERROR_REGISTER.md` — سجل الأخطاء
- [x] `docs/LESSONS.md` — الدروس
- [x] `docs/PROGRESS.md` — تقدم العمل
- [x] `docs/LAUNCH_PLAN.md` — خطة الإطلاق
- [x] `docs/TESTING_GUIDE.md` — دليل الاختبار
- [x] `docs/RESOURCE_BUDGET.md` — حدود الموارد
- [x] `docs/SECRETS_MANAGEMENT.md` — إدارة المفاتيح

---

## 🟡 8. اختبارات ما قبل الإطلاق (Pre-Launch Tests)

- [ ] **اختبار 1:** زائر → تصفح → كشف رقم (يفشل — يطلب تسجيل)
- [ ] **اختبار 2:** عميل نشط → كشف رقم (ينجح) → تقييم → طلب
- [ ] **اختبار 3:** عميل مقيد → تقييم (يفشل — رسالة واضحة)
- [ ] **اختبار 4:** تاجر → إدارة نشاط → رد على تقييم → استلام طلب
- [ ] **اختبار 5:** أدمن → إضافة نشاط جديد (فرع يُنشأ تلقائي)
- [ ] **اختبار 6:** أدمن → Standing Cockpit (تحذير/تقييد/حظر/إعفاء)
- [ ] **اختبار 7:** أدمن → Health Checks (كل حاجة ✅)
- [ ] **اختبار 8:** أدمن → Launch Readiness (>90%)
- [ ] **Lighthouse**: Performance > 90, Accessibility > 90, Best Practices > 90, SEO > 90

---

## 🟡 9. قبل ضغطة الإطلاق (Final Checks)

- [ ] **إزالة .env.local من الـ repo** (متأكد gitignored)
- [ ] **`cleanup.sql` نُفذ** (كل demo data اختفت)
- [ ] **Secret Rotation** للـ VERCEL_OIDC_TOKEN + Supabase keys
- [ ] **Vercel → Domains**: ربط الدومين الرسمي
- [ ] **Google Search Console** + **Bing Webmaster** setup
- [ ] **Sitemap.xml** + **robots.txt** تحت الدومين الجديد
- [ ] **إعلان على السوشيال** (Facebook, WhatsApp channel)
- [ ] **مراقبة 48 ساعة بعد الإطلاق** (system_errors + standing_events)

---

## 🔴 بعد الإطلاق (Post-Launch)

- [ ] **Key Rotation** كل 90 يوم
- [ ] **متابعة الحوادث** (incident log)
- [ ] **تحسين بناءً على feedback** (مقابلات مع أول 10 مستخدمين)
- [ ] **إضافة أنشطة جديدة** (هدف: 20 نشاط في أول شهر)

---

## 📊 معايير الإطلاق (Launch Criteria)

**لازم تكون كل الشروط دي متحققة:**

| المعيار | القيمة المطلوبة |
|---|---|
| Launch Readiness | **≥ 90%** |
| Health Checks | **0 blockers** |
| Real Businesses | **≥ 3** |
| Demo Data | **0** |
| Tests Passing | **8/8** |
| Lighthouse Performance | **≥ 90** |
| RLS Coverage | **100%** |
| Secrets Rotated | **✅** |

**لو كل الشروط متحققة → الإطلاق آمن.**

---

## 🚀 يوم الإطلاق (Launch Day)

1. **صباحًا:** مراجعة نهائية للـ checklist
2. **قبل الظهر:** تفعيل الدومين الرسمي
3. **ظهرًا:** نشر على السوشيال
4. **بعد ساعتين:** مراقبة system_errors
5. **مساءً:** أول تواصل مع التجار (WhatsApp)
6. **آخر اليوم:** مراجعة metrics (زوار، تسجيلات، تفاعلات)
