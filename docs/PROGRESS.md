# EAH — PROGRESS.md

> **مرجع الحالة الحية**. الأقسام بعد الفهرس تاريخية ولا تثبت أن كل رحلة اختُبرت اليوم.
> آخر مراجعة: 2026-10-29.

## الحالة الحالية — متابعة 2026-10-29

- **العمل على Git:** التعديلات كلها على `main` فقط، بدون إنشاء فروع جديدة. أحدث دفعة كود وظيفي تتضمن حماية إجراءات الحظر الفردي والجماعي وإصلاح حساب أوقات التحليلات حسب توقيت مصر.
- **البناء:** آخر نسخة وظيفية مؤكدة قبل دفعة التوقيت والحماية وصلت إلى `READY` على Vercel بعد نجاح تجميع Next.js وTypeScript وتوليد 54 صفحة. بناء رأس `main` الحالي قيد التحقق؛ لا نخلط بين نجاح بناء سابق ونجاح آخر commit.
- **إدارة المستخدمين:** الحظر وفكّه الفردي والجماعي يتحقق من وجود الحساب ودوره قبل التنفيذ، يمنع استهداف `super_admin`، يقيّد إدارة حسابات الأدمن للأدمن الأعلى، ويسجل التغييرات بعد التحقق من الصفوف التي عُدلت. يظل اختبار الجلسات الحقيقية والصلاحيات في بيئة اختبار مطلوبًا.
- **التحليلات والتوقيت:** تم إزالة الحساب التقريبي الذي يضيف ساعتين إلى UTC من `web/lib/data/insights.ts`. الآن تستخدم ساعات الذروة وأيام الزيارات وتجميع الطلبات توقيت `Africa/Cairo` عبر أداة مشتركة تتعامل مع التوقيت الصيفي والعبور إلى يوم جديد. أُضيفت اختبارات لوضع التوقيت الصيفي والشتوي والتواريخ غير الصالحة؛ يجب أن تجتاز اختبار Vitest وبوابة البناء في CI.
- **صلاحيات التقارير:** الفحص الحي أثبت أن `business_insights` عليه RLS بلا أي سياسة، مع أن مسارات البايع والأدمن تقرأ وتكتب عبر جلسة المستخدم. أُضيف ترحيل `docs/migrations/2026-10-29-prelaunch-access-control.sql` بأربع سياسات owner/admin للقراءة والإنشاء والتعديل والحذف، مع إغلاق قراءة anon. الترحيل **موثّق ومختبر داخل معاملة `ROLLBACK` فقط** ولم يُطبّق على قاعدة الإنتاج. يجب اختباره على قاعدة غير إنتاجية ثم تشغيل رحلات التقارير قبل تطبيقه رسميًا.
- **صلاحيات بقية لوحة الأدمن:** تأكد تعارض RLS إضافي في التقييمات والبلاغات والإعلانات والاشتراكات والتحليلات وسجل التدقيق: بعض السياسات كانت تسمح لـ `super_admin` فقط رغم أن صفحات الخادم تقبل `admin` أيضًا. أُضيف `docs/migrations/2026-10-29-admin-dashboard-rls-alignment.sql` لتصحيح المسارات التي تأكد استخدامها لجلسة المستخدم؛ سجل التدقيق يظل غير قابل للتعديل أو الحذف للأدمن العادي. هذه الترحيلات **اختُبرت داخل معاملة `ROLLBACK` فقط** ولم تُطبّق على الإنتاج.
- **حماية RPC:** ترحيل `prelaunch-access-control.sql` يقيّد دوال حساسة غير مستخدمة من المتصفح ويحصر بعضها في `service_role`، ويمنع تنفيذ دوال triggers كـ RPC، ويثبت `search_path` للدوال الثلاث. كشف فحص السياسات أن `auth_is_admin()` و`is_admin()` مستعملتان أيضًا داخل predicates لسياسات `PUBLIC`؛ لذلك أُضيف `restore-rls-helper-execute.sql` ليعيد صلاحية تنفيذ الدالتين فقط، بينما RLS يحدد الوصول الفعلي للبيانات. اختُبرت سلسلة الترحيلات كاملة داخل معاملة ثم `ROLLBACK`، وتأكد عدم بقاء صفوف أو سياسات أو فهارس تجريبية في الإنتاج.
- **الأداء:** أُضيف `docs/migrations/2026-10-29-foreign-key-indexes.sql` لإضافة 14 فهرسًا على أعمدة المفاتيح الأجنبية التي أبلغ عنها Supabase. جرى اختبار وجودها داخل المعاملة ثم أكدنا اختفاءها بعد `ROLLBACK`؛ لم تُنشأ فهارس على الإنتاج.
- **CI / قاعدة الاختبار:** `.github/workflows/quality.yml` أصبح يحدّد صلاحيات GitHub، يعطل بيانات الاعتماد المستمرة بعد Checkout، يلغي تشغيلات الجودة الأقدم على المرجع نفسه، ويشغّل ملفات pgTAP المحددة من مجلد `web` الصحيح. يفرض `SUPABASE_DB_URL` لقاعدة اختبار **غير إنتاجية** بدل تجاوز الاختبارات بصمت. تم إضافة `web/supabase/config.toml`.
- **بوابة الجودة:** آخر التقارير السابقة ما زالت تُظهر فشل GitHub Actions قبل تخصيص Runner (`runner_id=0`, `steps=0`). لم يتوفر إلى الآن إثبات أن Quality Gate أو RLS/pgTAP أو E2E اجتازت على رأس `main`. يلزم إصلاح توفر الـ Runner وضبط سر قاعدة الاختبار.
- **دورة النشاط:** لم تُختبر بعد بشكل متكامل ببيانات اختبار: إنشاء نشاط دون مالك، وربط مستخدم موجود اختياريًا، ورفع الصور، والحفظ، والنشر، والظهور في البحث والصفحة العامة. لا ننفذ هذه الرحلة على الإنتاج ببيانات تجريبية.
- **حالة الإطلاق:** **غير جاهز لإعلان الإطلاق** إلى أن تنجح اختبارات CI وRLS على بيئة غير إنتاجية، تُختبر سياسات التقارير فعليًا بأدوار متعددة، ويُنجز اختبار دورة النشاط والموبايل والتنقل، وتُراجع نتائج فاحص Supabase المتبقية بدل تجاهلها.

## أولويات المتابعة

1. تحقق من آخر نشر Vercel واختبارات TypeScript / Vitest بعد دفعة التوقيت والحماية.
2. جهّز `SUPABASE_DB_URL` لقاعدة غير إنتاجية، وأصلح تخصيص GitHub-hosted Runner قبل اعتماد أي بوابة جودة.
3. اختبر ترحيلي الصلاحيات والفهارس على قاعدة الاختبار؛ نفّذ اختبارات البايع والأدمن والمشتري وanon قبل أي تطبيق إنتاجي.
4. نفذ اختبار رحلة النشاط الحقيقية كاملة على بيئة اختبار، ثم افحص النتائج البصرية والمقاسات والتنقل والصلاحيات وسجلات التشغيل قبل إغلاق سجل الأخطاء.

## الحالة الحالية بعد مراجعة الصورتين — 2026-10-27

- **آخر commit وظيفي لواجهة النشاط:** `e6b22fe6c475eac5c168932840b8cd1bd9c7186b`.
- **آخر نشر للواجهة:** Vercel deployment `dpl_5pFU2jzirA8R8XBmryii5i8WYXp8` وصل إلى `READY` على هذا الـ commit. سجل البناء: تجميع ناجح في 16.7 ثانية، TypeScript في 5.1 ثانية، واكتمال البناء في 48 ثانية. [تفاصيل النشر](https://vercel.com/eah-74a0/eah/5pFU2jzirA8R8XBmryii5i8WYXp8).
- **كارد الهوم:** كان `CardImage` يعطي أولوية للوجو على صورة الغلاف، رغم أن النشاط المعروض في الصورة لديه رابط غلاف صالح. أصبح الغلاف هو الصورة الأساسية، واللوجو علامة صغيرة فوقه، مع fallback للوجو إذا تعذر تحميل الغلاف. اتزيلت طبقة تعتيم إضافية كانت تجعل الصورة أغمق من المطلوب.
- **عرض كارد منفرد:** وسّعنا العنصر الوحيد داخل قسم «قريب منك» إلى `min(100%, 560px)` وعلى الشاشات الصغيرة يستعمل المساحة المتاحة بدل ما يسيب فراغًا كبيرًا على الجانبين.
- **قسم «عن النشاط»:** القراءة الآمنة لبيانات النشاط `tapooosh` أظهرت أن الوصف المخزن هو `: )` بينما توجد عبارة تعريفية في `hook`. فلتر النص أصبح يستبعد علامات الترقيم والرموز فقط باستخدام Unicode، فيعرض العبارة التعريفية بدل وجه تعبيري أو كتلة فارغة.
- **مستوى المصداقية:** القيم الحية لـ `trust_tier` هي `bade2/mashey/fel/harif/ostora`؛ كانت صفحة التفاصيل تستخدم خريطة قديمة. اتحدّثت الأسماء والألوان لتطابق القيم الحالية، فالقيمة `fel` تعرض «زي الفل».
- **مواعيد العمل:** جدول النشاط المعروض يحتوي أيامًا تعمل من `09:00` إلى `04:00` في اليوم التالي. تم توضيح ذلك بعبارة «لليوم التالي» عندما يكون وقت الإغلاق أصغر من وقت الفتح؛ لم نغيّر الجدول المخزن أو منطق ساعات العمل.
- **القراءة العامة والأمان:** لا تزال إصلاحات قراءة الأنشطة والإعلانات والتعامل مع بيانات التواصل الخاصة موجودة على `main`. لم يتم منح صلاحيات عامة لجداول خاصة ولم تُنفذ migration إنتاجية.
- **الأدوار الظاهرة:** الأدمن، البايع، المشتري. لم تتغير قيم الصلاحيات أو المسارات الداخلية.
- **GitHub Actions:** ما زالت الوظائف تفشل قبل تخصيص Runner (`runner_id=0`, `steps=0`). لم تتنفذ اختبارات E2E أو Quality Gate؛ بناء Vercel الناجح لا يغني عنها.
- **طلبات الدمج:** PR #34 وPR #27 مغلقان لأن أحدهما أُدرج إصلاحه في `main` والآخر أصبح قديمًا. PR #33 يبقى Draft؛ ترحيل قاعدة البيانات المقترح فيه لم يطبق على الإنتاج.

### ما تم التحقق منه وما لم يتم

**تم التحقق:** بناء Vercel وTypeScript لدفعة تعديل كارد النشاط والتفاصيل وصل إلى `READY`.

**لم يتم التحقق وظيفيًا بعد:** مراجعة الواجهة المنشورة بصريًا على عدة مقاسات، تنفيذ دورة إنشاء نشاط حقيقية بحساب تجريبي، اختبار رفع الصور والحفظ والنشر والبحث وربط المالك، واختبار كشف الهاتف لمستخدم مسجل وغير مسجل. عدم ظهور أخطاء runtime في آخر نافذة رصد لا يثبت نجاح الرحلات.

### الخطوة التالية

1. افتح نسخة النشر بعد تحديثها وتحقق من الغلاف وحجم الكارد، ثم افحص صفحة النشاط ومواعيد اليوم التالي.
2. أصلح GitHub Actions/Runner حتى تبدأ خطوات فعلية ثم شغّل Quality Gate وE2E وCodeQL.
3. نفّذ دورة النشاط كاملة على Preview بحساب تجريبي، دون إنشاء بيانات اختبار على الإنتاج.
4. راجع PR #33 وترحيله الأمني في بيئة غير إنتاجية وخطة rollback قبل أي تطبيق.

## فهرس الملفات والحالة التاريخية

---

## web/ — Config

| الملف | الحالة |
|------|--------|
| .env.example | ✅ |
| next.config.ts | ✅ |
| tsconfig.json | ✅ |
| package.json | ✅ |
| eslint.config.mjs | ✅ |

---

## web/ — Pages

| الملف | الحالة |
|------|--------|
| app/layout.tsx | ✅ |
| app/page.tsx | ✅ |
| app/globals.css | ✅ |
| app/manifest.ts | ✅ |
| app/loading.tsx | ✅ |
| app/explore/page.tsx | ✅ |
| app/explore/loading.tsx | ✅ |
| app/featured/page.tsx | ✅ |
| app/featured/loading.tsx | ✅ |
| app/trends/page.tsx | ✅ |
| app/trends/loading.tsx | ✅ |
| app/offers/page.tsx | ✅ |
| app/offers/loading.tsx | ✅ |
| app/new/page.tsx | ✅ |
| app/new/loading.tsx | ✅ |
| app/nearby/page.tsx | ✅ |
| app/nearby/loading.tsx | ✅ |
| app/suggest/page.tsx | ✅ |
| app/businesses/[slug]/page.tsx | ✅ |
| app/about/page.tsx | ✅ |
| app/about/presentation/page.tsx | ✅ |
| app/pricing/page.tsx | ✅ |
| app/advertise/page.tsx | ✅ |
| app/contact/page.tsx | ✅ |
| app/terms/page.tsx | ✅ |
| app/privacy/page.tsx | ✅ |
| app/cookies/page.tsx | ✅ |
| app/faq/page.tsx | ✅ |
| app/support-palestine/page.tsx | ✅ |

---

## web/ — Auth

| الملف | الحالة |
|------|--------|
| app/auth/actions.ts | ✅ |
| app/auth/auth-form.tsx | ✅ |
| app/auth/auth.module.css | ✅ |
| app/auth/page.tsx | ✅ |
| app/auth/recover/page.tsx | ✅ |
| app/auth/logout/route.ts | ✅ |

---

## web/ — API

| الملف | الحالة |
|------|--------|
| app/api/track-action/route.ts | ✅ |
| app/api/log-error/route.ts | ✅ |
| app/api/cron/cleanup-errors/route.ts | ✅ |

---

## web/ — Account

| الملف | الحالة |
|------|--------|
| app/account/layout.tsx | ✅ |
| app/account/page.tsx | ✅ |
| app/account/edit/page.tsx | ✅ |
| app/account/edit/edit-form.tsx | ✅ |
| app/account/favorites/page.tsx | ✅ |
| app/account/following/page.tsx | ✅ |
| app/account/notifications/page.tsx | ✅ |
| app/account/orders/page.tsx | ✅ |
| app/account/points/page.tsx | ✅ |
| app/account/security/page.tsx | ✅ |
| app/account/security/change-password-form.tsx | ✅ |
| app/account/verify/page.tsx | ✅ |
| app/account/badges/page.tsx | ✅ |

---

## web/ — Merchant

| الملف | الحالة |
|------|--------|
| app/merchant/layout.tsx | ✅ |
| app/merchant/page.tsx | ✅ |
| app/merchant/actions.ts | ✅ |
| app/merchant/apply/page.tsx | ✅ |
| app/merchant/apply/apply-wizard.tsx | ✅ |
| app/merchant/apply/success/page.tsx | ✅ |
| app/merchant/business/page.tsx | ✅ |
| app/merchant/business/edit-form.tsx | ✅ |
| app/merchant/orders/page.tsx | ✅ |
| app/merchant/offers/page.tsx | ✅ |
| app/merchant/subscription/page.tsx | ✅ |
| app/merchant/settings/page.tsx | ✅ |
| app/merchant/insights/page.tsx | ✅ |
| app/merchant/insights/actions.ts | ✅ |
| app/merchant/insights/generate-button.tsx | ✅ |
| app/merchant/insights/[id]/page.tsx | ✅ |
| app/merchant/insights/[id]/print-button.tsx | ✅ |

---

## web/ — Admin

| الملف | الحالة |
|------|--------|
| app/admin/layout.tsx | ✅ |
| app/admin/page.tsx | ✅ |
| app/admin/businesses/page.tsx | ✅ |
| app/admin/users/page.tsx | ✅ |
| app/admin/subscriptions/page.tsx | ✅ |
| app/admin/analytics/page.tsx | ✅ |
| app/admin/ads/page.tsx | ✅ |
| app/admin/moderation/page.tsx | ✅ |
| app/admin/audit/page.tsx | ✅ |
| app/admin/notifications/page.tsx | ✅ |
| app/admin/reports/page.tsx | ✅ |
| app/admin/settings/page.tsx | ✅ |
| app/admin/insights/page.tsx | ✅ |
| app/admin/health/page.tsx | ✅ |
| app/admin/fraud/page.tsx | ✅ |
| app/reports/actions.ts | ✅ |
| app/reports/report-button.tsx | ✅ |
| app/merchant/subscription/actions.ts | ✅ |
| app/merchant/subscription/subscribe-button.tsx | ✅ |

---

## web/ — Components

### Layout + Navigation

| الملف | الحالة |
|------|--------|
| floating-capsule.tsx | ✅ |
| menu-drawer.tsx | ✅ |
| secondary-hero.tsx | ✅ |
| page-header.tsx | ✅ |
| section-nav.tsx | ✅ |
| section-title.tsx | ✅ |
| scroll-to-top.tsx | ✅ |
| site-footer.tsx | ✅ |
| account-sidebar.tsx | ✅ |
| admin-sidebar.tsx | ✅ |
| merchant-sidebar.tsx | ✅ |
| account-page-header.tsx | ✅ |

### Cards + Home Sections

| الملف | الحالة |
|------|--------|
| business-card.tsx | ✅ |
| featured-bento.tsx | ✅ |
| home-hero.tsx | ✅ |
| trending-row.tsx | ✅ |
| offers-strip.tsx | ✅ |
| new-row.tsx | ✅ |
| nearby-grid.tsx | ✅ |
| nearby-cta.tsx | ✅ |
| suggested-section.tsx | ✅ |
| row-carousel.tsx | ✅ |
| load-more.tsx | ✅ |
| section-layout.tsx | ✅ |
| loading-skeleton.tsx | ✅ |

### UI + Business

| الملف | الحالة |
|------|--------|
| avatar.tsx | ✅ |
| logo.tsx | ✅ |
| ~~splash.tsx~~ | 🗑️ (شال — LCP) |
| signature.tsx | ✅ |
| palestine-heart.tsx | ✅ |
| watermark.tsx | ✅ |
| wm-image.tsx | ✅ |
| icons/index.tsx | ✅ |
| install-prompt.tsx | ✅ |
| signup-prompt.tsx | ✅ |
| review-reminder.tsx | ✅ |
| explore-search.tsx | ✅ |
| business-hero.tsx | ✅ |
| business-tabs.tsx | ✅ |
| business-actions.tsx | ✅ |
| fixed-cta.tsx | ✅ |
| smart-lock-modal.tsx | ✅ |
| paid-gate.tsx | ✅ |
| plan-card.tsx | ✅ |
| empty-state.tsx | ✅ |
| coming-soon.tsx | ✅ |
| about-free-app.tsx | ✅ |

---

## web/ — Lib

### Data

| الملف | الحالة |
|------|--------|
| lib/data/businesses.ts | ✅ |
| lib/data/business-detail.ts | ✅ |
| lib/data/account.ts | ✅ |
| lib/data/admin.ts | ✅ |
| lib/data/areas.ts | ✅ |
| lib/data/insights.ts | ✅ |
| lib/data/merchant.ts | ✅ |
| lib/data/subscriptions.ts | ✅ |
| lib/data/user.ts | ✅ |
| lib/data/index.ts | ✅ |

### AI + Supabase

| الملف | الحالة |
|------|--------|
| lib/ai/business-advisor.ts | ✅ |
| lib/ai/storage.ts | ✅ |
| lib/logging/errors.ts | ✅ |
| lib/logging/audit.ts | ✅ |
| lib/auth/admin.ts | ✅ |
| lib/auth/ip.ts | ✅ |
| lib/data/fraud.ts | ✅ |
| lib/data/badges.ts | ✅ |
| lib/data/health.ts | ✅ |
| lib/data/admin-business.ts | ✅ |
| lib/logging/client.ts | ✅ |
| lib/data/health.ts | ✅ |
| lib/data/admin-business.ts | ✅ |
| lib/auth/admin.ts | ✅ |
| lib/supabase/public.ts | ✅ |
| lib/supabase/server.ts | ✅ |
| lib/supabase/service.ts | ✅ |
| lib/supabase/browser.ts | ✅ |

### Utils + Search + Hooks

| الملف | الحالة |
|------|--------|
| lib/engagement.ts | ✅ |
| lib/ranking.ts | ✅ |
| lib/nav-items.ts | ✅ |
| lib/hooks/use-fair-rotation.ts | ✅ |
| lib/utils/distance.ts | ✅ |
| lib/search/history.ts | ✅ |
| lib/search/index.ts | ✅ |
| lib/search/normalize.ts | ✅ |
| lib/search/synonyms.ts | ✅ |
| lib/validations/auth.ts | ✅ |
| lib/validations/merchant.ts | ✅ |

## web/ — Root

| الملف | الحالة |
|------|--------|
| proxy.ts | ✅ |
| next.config.ts | ✅ |

---

## 📁 docs/

| الملف | الحالة |
|------|--------|
| MASTER_BRIEF.md | ✅ |
| AI_CONTRACT.md | ✅ |
| SACRED.md | ✅ |
| DESIGN_SYSTEM.md | ✅ |
| ARCHITECTURE.md | ✅ |
| FEATURES.md | ✅ |
| ROADMAP.md | ✅ |
| GLOSSARY.md | ✅ |
| MIGRATION_GUIDE.md | ✅ |
| CODE_STANDARDS.md | ✅ |
| DEBUGGING.md | ✅ |
| PRODUCTION_CHECKLIST.md | ✅ |
| DATABASE_RULES.md | ✅ |
| SECURITY.md | ✅ |
| AI_HANDOFF.md | ✅ |
| PROGRESS.md | ✅ (هذا الملف) |
| SESSION_LOG.md | ✅ |
| CHANGELOG.md | ✅ |
| STRUCTURE.md | ✅ |
| LESSONS.md | ✅ |
| NEW_CHAT_MESSAGE.md | ✅ |
| FILE_ORDER.md | ✅ |
| AUDIT_PLAN.md | ✅ |
| PERFORMANCE_SECURITY_PLAN.md | ✅ |

---

## 📈 إحصائيات

- **App:** ~2400 سطر
- **Components:** ~3500 سطر
- **Lib:** ~1800 سطر
- **Docs:** ~7000 سطر

---

## 🎯 اللي جاي

1. التعليقات + التقييمات الكاملة
2. نظام المصداقية الديناميكي
3. الفرص الجديدة (30 يوم)
4. 5 صفحات Admin المتبقية
5. Rate Limiting (Upstash)
6. Turnstile على signup
7. nonce-based CSP

---

آخر تحديث: 2026-10-06

---

## 📋 خطط مؤجلة (docs/plans/)

- ANNOUNCEMENTS.md — إشعارات المسؤول المميزة

---

## 🤖 AI Agent (جديد 2026-10-02)

| الملف | الحالة |
|------|--------|
| lib/ai/openrouter.ts | ✅ |
| lib/ai/tools.ts (3 أدوات) | ✅ |
| lib/ai/agent.ts | ✅ |
| app/api/ai/chat/route.ts | ✅ |
| components/ai-widget.tsx | ✅ |

**الموديل:** meta-llama/llama-3.3-70b-instruct:free
**Rate limit:** 10 أسئلة / 10 دقايق / user (Upstash)

---

## 📊 SEO (جديد 2026-10-02)

- app/sitemap.ts (dynamic)
- app/robots.ts
- JSON-LD LocalBusiness على business pages

---

## 💰 Polish Pass (جديد 2026-10-02)

راجع `docs/plans/POLISH_PASS.md`

- §1 المسافة (DistanceBadge + geolocation)
- §2 الكارد الموحد
- §3 فخامة المميزين (gold + shimmer)
- §4 Nav (mobile labels + purple active)
- §5 المصداقية (trust badges)


---

## 🎛️ Admin Panel Overhaul (جديد 2026-10-17)

| الميزة | الملف | الحالة |
|--------|-------|--------|
| Business Quick Actions | `admin/businesses/[id]/business-actions-bar.tsx` | ✅ |
| Business Bulk Actions | `admin/businesses/business-list.tsx` + `bulk-actions.ts` | ✅ |
| Featured Drag & Drop | `admin/featured/featured-list.tsx` + `reorderFeatured` | ✅ |
| Settings Confirm Modals | `components/ui/confirm-modal.tsx` | ✅ |
| Users Bulk Actions | `admin/users/users-list.tsx` + `bulk-actions.ts` | ✅ |
| CSV Export (7 أنواع) | `api/admin/export/route.ts` + `lib/utils/csv.ts` | ✅ |
| Moderation Search | `admin/moderation/moderation-filters.tsx` | ✅ |
| Broadcast History | `admin/notifications/history-list.tsx` | ✅ |
| Health Actions + Filters | `admin/health/actions.ts` + `health-filters.tsx` | ✅ |
| ⌘K Command Palette | `components/ui/command-palette.tsx` | ✅ |

**عدد commits:** 10
**أسطر مضافة:** ~3,500
**ملفات جديدة:** ~20
**TypeScript errors:** 0
**ESLint errors:** 0

### النمط المعماري

- كل server action: `requireAdmin` → `zod.validate` → `supabase` → `logAudit` → `revalidatePath`
- كل filter state في URL: bookmarkable + shareable + يعمل مع back/forward
- كل CSV export يحترم الفلتر الحالي
- كل المكونات الجديدة `'use client'` — عدا الصفحات (Server Components)
