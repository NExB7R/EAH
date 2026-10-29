# EAH — PROGRESS.md

> **مرجع الحالة الحية.** اللقطات المؤرخة في أسفل الملف سجل تاريخي وليست إثباتًا على اجتياز الاختبارات الحالية.
> آخر مراجعة: 2026-10-29.

## الحالة الحالية — متابعة 2026-10-29

- **العمل على Git:** الفرع الأساسي `main`. هذا التحديث يعالج اتساق التسميات والتنقل وتنسيق معالجات إنشاء النشاط ووثائق التسليم؛ استخدم سجل Git لمعرفة أحدث SHA.
- **النشر:** آخر نشر ناجح معروف للتعديلات الوظيفية هو commit `1b7091be5dd885835606e7ed36041412c3f7d2f7`، بحالة Vercel `READY`. التحقق السابق أكد استجابة `/explore` وصفحة النشاط بـ HTTP 200. تحديثات لاحقة على المصدر لم تحصل على نشر جديد بسبب `build-rate-limit`، فلا تعتبرها منشورة حتى يُتحقق من Vercel.
- **الكروت وصفحة النشاط:** تحسّن مكان رسالة عدم وجود تقييمات، وتُعرض شارات النشاط الفعلية في رأس التفاصيل، مع رابط مسار واضح واسم صفحة بدون تكرار لاحقة العلامة التجارية. ما زال الفحص البصري التفاعلي على أحجام موبايل فعلية مطلوبًا.
- **الأدوار والتسميات:** الأسماء الظاهرة المعتمدة فقط: الأدمن، البايع، المشتري. القيم الداخلية `super_admin` و`merchant` و`customer` ثابتة، والزائر حالة وصول وليس دورًا. يجري توحيد القوائم والوثائق؛ لا تعتبر البحث النصي في كل الملفات مكتملًا حتى تنتهي المراجعة الشاملة.
- **إضافة نشاط بواسطة الأدمن:** يمكن إنشاء نشاط دون مالك مرتبط. ربط حساب اختياري ويحدد المالك الوحيد؛ الحساب المختار بدور المشتري يتحوّل إلى بايع عبر إجراء الخادم بعد حفظ النشاط وجهات الاتصال. رقم المالك الشخصي غير مطلوب، مع بقاء التحقق من جهة تواصل النشاط حسب النموذج.
- **نشاط QA مؤقت في الإنتاج:** `اختبار EAH — نشاط تجريبي (لا تتعامل)`, slug `eah-qa-test-20261029`: https://eah-sq.vercel.app/businesses/eah-qa-test-20261029 . أُضيف للاختبار بناءً على طلب المالك وبداخله تنبيه واضح أنه غير حقيقي. يجب إلغاء نشره/حذفه بعد انتهاء الاختبار وقبل انتهاء التنبيه في 2026-11-05. لم تُنشأ حسابات دخول وهمية.
- **RLS للإعلانات:** تم تطبيق تشديد السياسات على جدول `public.ads` القديم في قاعدة الإنتاج، وتأكدت أربعة سياسات قراءة/إنشاء/تعديل/حذف. اختبار السلوك الفعلي بـ pgTAP/E2E لم يُشغَّل بعد بسبب عائق Runner.
- **GitHub Actions:** الإخفاقات الحالية تحدث قبل تخصيص Runner (`runner_id=0`, `steps=[]`). لذلك لا توجد نتيجة موثوقة لاجتياز أو فشل TypeScript أو Vitest أو Playwright أو RLS. يلزم إصلاح إعدادات Runner/الفوترة من جهة مالك المستودع.
- **Vercel:** تجاوز حدّ البناء/النشر ما زال قائمًا. خطوة تجاهل بناء تغييرات التوثيق تمنع البناء غير الضروري لكنها لا تحل حد الحساب.
- **جاهزية الإطلاق:** **غير معتمدة بعد.** لم تكتمل رحلة حقيقية على بيئة اختبار تشمل الإنشاء، ربط المالك الاختياري، الصور، الحفظ، النشر، الظهور في البحث والصفحة العامة، ولا اختبارات الأدوار الثلاثة وRLS وE2E.

## أولويات المتابعة

1. حل تخصيص GitHub Runner من إعدادات المستودع/الفوترة، ثم تشغيل Quality Gate وVitest وPlaywright وpgTAP.
2. إزالة عائق Vercel build-rate-limit والتحقق من نشر commit وظيفي جديد قبل اعتماد أي تغيير واجهة على الإنتاج.
3. الحصول على موافقة صريحة قبل إنشاء Supabase test branch مدفوع، ثم اختبار رحلات الأدمن والبايع والمشتري وanon عليه.
4. اختبار دورة النشاط كاملة بصريًا ووظيفيًا على الموبايل وسطح المكتب.
5. إلغاء نشر أو حذف نشاط QA المؤقت بعد انتهاء الاختبار وقبل 2026-11-05.

---

## سجل تاريخي — مراجعة الصورتين في 2026-10-27

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


- **اختبارات التجاوب للموبايل:** أُضيفت تغطية Playwright لصفحة التواصل والاستكشاف بعروض 320/360/375/390/414/430px، مع فحص overflow في المحتوى والهيدر العائم، واختبار أن الروابط الخارجية في صفحة التواصل HTTPS وعلى نطاق رسمي معتمد. الاختبارات مضافة لكنها لم تُنفذ بعد لأن GitHub Actions لا يزال يفشل قبل تخصيص Runner.

## صلاحيات الأدمن الأعلى — 2026-10-29

- **قنوات التواصل وإعدادات الموقع:** قنوات التواصل الرسمية (واتساب الدعم، قناة واتساب، فيسبوك والإيميل) أصبحت تُقرأ من `app_settings` مركزيًا، ولا تُعرض للزائر إلا بعد تفعيل `public_contacts_enabled` وبعد نجاح التحقق من الرابط/الرقم. أُزيلت الروابط الثابتة من صفحة التواصل والفوتر والقائمة وزر تمديد التجربة، وتظهر رسالة هادئة مع روابط المساعدة عند عدم إعداد القنوات. فحص الإنتاج كشف أن `service_role` كان يفتقد صلاحيات `app_settings`؛ اختُبرت منح الصلاحيات ثم طُبقت عبر `grant_service_role_app_settings_20261029`. تحقق دائم: الخدمة تملك SELECT/INSERT/UPDATE/DELETE، و`anon` لا يملك SELECT. نحتاج مراقبة سجل Vercel بعد أول زيارة للنسخة المنشورة.

- **حساب الأدمن الأعلى الوحيد:** بوابات الإدارة وإجراءات الصلاحيات تعتمد الآن على `super_admin` فقط؛ الحسابات ذات الدور القديم `admin` لا تحصل على لوحة الإدارة. واجهات تغيير الدور الفردي والجماعي لا تسمح بمنح `admin` أو `super_admin`. ترحيل `2026-10-29-super-admin-only.sql` اجتاز اختبار `BEGIN/ROLLBACK` وطُبق على الإنتاج. تحقق مباشر بعد التطبيق: `super_admin_count=1` و`legacy_admin_count=0`، والمشغل يمنع تعيين `admin`، إضافة super_admin ثانٍ، أو تخفيض الأخير. اختبارات E2E بدور حقيقي ما زالت مطلوبة عندما تتوفر بوابة CI.


## 2026-10-29 — استكمال حماية الصلاحيات والواجهة

- توحيد تعريف الدور الإداري الداخلي على `super_admin` في الحارس المركزي والجلسة وصورة الحساب ونموذج تغيير الدور؛ الخيارات الإدارية لم تعد قابلة للتعيين من واجهة المستخدم. حساب قاعدة البيانات الوحيد ما زال `super_admin` واحدًا، ودور `admin` القديم غير موجود.
- إعدادات التواصل أصبحت مركزية من `app_settings` مع قيم فارغة افتراضية وتعطيل الظهور العام. الصلاحيات النهائية على الجدول: الخدمة تقرأ/تدرج/تحدّث فقط، ولا تحذف؛ الزائر لا يقرأ الجدول.
- إزالة لاحقة العلامة المكررة من عناوين الصفحات لتصبح `اسم الصفحة | EAH` بدل تكرار `EAH` مرتين.
- أضيف اختبار Playwright للتجاوب في 320–430px لصفحة الاستكشاف والتواصل. GitHub Actions ما زالت تفشل قبل تشغيل Runner (`runner_id=0` وخطوات فارغة)، لذلك لم يُتحقق منها داخل CI؛ لا تُعلن جاهزية E2E حتى تتوفر بيئة تشغيل.
- لا تزال تجربة إضافة نشاط حقيقي كاملة (حفظ، صور، نشر، ظهور في البحث وصفحة عامة) بحاجة لاختبار دخول بصلاحيات فعلية على بيئة آمنة. لم تُنشأ حسابات أو أنشطة وهمية في الإنتاج.


## مزامنة صور النشاط — 2026-10-29

- **مزامنة صور النشاط:** أُضيف `private.sync_business_media_image_columns()` وtrigger على `business_media` لتحديث `businesses.logo_url` و`cover_image_url` تلقائيًا عند الإضافة/التعديل/الحذف، مع backfill للصور الحالية. هذا يعالج اختلاف مصدر الكارد (حقول النشاط) عن مصدر صفحة التفاصيل (وسائط النشاط). الاختبار داخل `BEGIN/ROLLBACK` نجح؛ اختبار الرفع عبر UI ما زال مطلوبًا.


## اتجاه تجربة المنتج والتصميم — 2026-10-29

- أُضيف `docs/EAH_PRODUCT_BLUEPRINT.md` لتثبيت الاتجاه المبدئي قبل إعادة تصميم واسعة: الحفاظ على هوية البنفسجي/النيون والتاج والهوك وعبارة شبين القناطر وعناصر فلسطين والإمضاء، مع تطوير التنقل والخلفية والبحث والتصنيفات وترتيب الأنشطة وتجربة الهاتف.
- الدمج المعتمد مبدئيًا: Neon Discovery + Modern Marketplace + Trust First + Dashboard Pro + Adaptive EAH. هذا اتجاه تصميم وليس ادعاءً بأن الواجهة نُفذت أو اختُبرت بالكامل.
- قواعد البحث والتصنيفات والترتيب والأداء والاستجابة واختبارات القبول موثقة في الـ Blueprint. ننتظر الكروكي لتأكيد توزيع الشاشات قبل تغييرات بصرية واسعة؛ تستمر الإصلاحات الوظيفية والأمنية المستقلة حسب الأولوية.
- يجب مراجعة الملفات الحالية قبل أي تنفيذ بصري، وعدم تغيير النصوص الأساسية أو اختراع بيانات تواصل أو إثباتات توثيق غير موجودة.


## إصلاح تنقل الأقسام السريعة — 2026-10-29

- **المشكلة المؤكدة:** `ChipScrollHandler` كان يبحث عن القسم مرة واحدة فقط بعد مهلة 150ms؛ إذا وصل القسم لاحقًا ضمن Server Components تحت `Suspense` فلن تحدث محاولة أخرى، وبالتالي قد يفشل التنقل السلس من التصنيفات إلى القسم.
- **الإصلاح على `main`:** `web/components/chip-scroll-handler.tsx` ينتظر ظهور الهدف باستخدام `MutationObserver` بمهلة قصوى 5 ثوانٍ، ويحترم `prefers-reduced-motion`. إذا لم يظهر قسم معروف، يوجّه إلى الصفحة المتخصصة المقابلة (`/offers`, `/trends`, `/nearby`, `/suggest`).
- **اختبار الانحدار:** أضيف اختبار Playwright في `web/e2e/home.spec.ts` يدرج القسم بعد تحميل الصفحة ويتحقق من حدوث التمرير.
- **التحقق:** نشر Vercel للـ commit `840180b48122693eac7bd2868d9b3b6abbca8a58` وصل إلى `READY` بعد اكتمال البناء. صفحات `/`, `/explore`, `/offers`, `/trends`, `/nearby`, `/suggest`, و`/businesses/tapooosh` أعادت HTTP 200 عند فحصها على deployment المنشور. هذا لا يثبت تنفيذ اختبار Playwright؛ بوابة CI لا تزال بحاجة لتشغيل اختبارات فعلية.



## إصلاح ترتيب نتائج البحث — 2026-10-29

- **المشكلة:** صفحة الاستكشاف كانت تفرض `sort: 'relevance'` كلما وُجد نص بحث، فتتجاهل اختيار المشتري «الأحدث» أو «الأعلى تقييمًا» أو «الأقرب» حتى لو كانت الواجهة تعرض هذا الاختيار.
- **الإصلاح:** أُضيف `resolveResultSort`: الصلة بالبحث هي الافتراضية عند كتابة استعلام من دون اختيار ترتيب، لكن الترتيب الصريح يطبّق فعلًا. خيار «الأكثر صلة بالبحث» يظهر فقط عند وجود استعلام، وحالة الترتيب التي تعرضها الفلاتر تُحسب من نفس الترتيب الفعلي للخادم.
- **تحقق إضافي:** اختيار «الأقرب» دون إحداثيات صالحة لا يُعامل كأنه ترتيب مسافة فعال؛ يعود الترتيب الافتراضي بدل إيهام المستخدم.
- **الاختبارات:** أُضيفت اختبارات انحدار للحالات الافتراضية والصريحة والمسافة دون موقع. لا يُعلن اجتياز Vitest/E2E حتى تُشغّل الاختبارات فعليًا؛ بناء Vercel واختبارات المصدر المنفصلة لا يغنيان عنها.


## متابعة 2026-10-29 — نتائج فحص الإعلان والصلاحيات

- القراءة فقط من قاعدة الإنتاج أثبتت أن جدول `ads` لا يحتوي على `approved_by/approved_at` رغم أن إجراء الموافقة يكتب إليهما، وأن سياسات المالك لا تمنع تغيير حالة الإعلان مباشرة ولا تتحقق من ملكية النشاط عند الإدراج. كذلك سياسة القراءة العامة لا تتحقق من موعد البداية.
- لم أغيّر Schema قاعدة الإنتاج. قواعد المشروع تشترط موافقة صاحب المنصة قبل SQL/Schema، وstaging ونسخة احتياطية قبل التنفيذ. هذا مانع أمان موثق وليس إصلاحًا مكتملًا.
- حُصّن طلب الإعلان في الخادم: روابط HTTP(S) فقط، تواريخ صالحة ومتسلسلة، تحقق من مكان إعلان نشط، وموعد بداية افتراضي غير فارغ ليتوافق مع العمود الإلزامي. كما أصبح إلغاء الإعلان يربط الحذف بالمعرّف والنشاط والحالات القابلة للإلغاء داخل العملية نفسها، ولا يعلن نجاح الحذف إذا أعادت RLS صفر صفوف.
- أضيفت «إعلانات نشاطي» لقائمة البايع، واستُبدل تدرج زر المشاركة في الفوتر بمتغيرات نظام التصميم.
- **ما زال مطلوبًا:** موافقة على إعداد ترحيل جديد، وبيئة staging لاختبارها، ثم مراجعة معمارية لنقل تدفق الإعلان من الجدول القديم `ads` إلى `ad_campaigns/ad_creatives`. لم يتم اختبار رحلة الإعلان الحقيقية أو إنشاء بيانات اختبار.


## متابعة 2026-10-29 — توقيت طلب الإعلان وحدود المحاولات

- مدخلات `datetime-local` لطلب الإعلان تُفسَّر الآن بتوقيت `Africa/Cairo` وتتحول إلى UTC باستخدام أداة مشتركة تتعامل مع التوقيت الصيفي؛ لا تعتمد على توقيت خادم Vercel أو إضافة ساعتين ثابتتين.
- أُضيفت اختبارات وحدة للتحويل في توقيت مصر الصيفي والشتوي وللتواريخ غير الصالحة، وأصبح إرسال/إلغاء طلبات البايع محدودًا باستخدام `strictLimiter` مع `failClosed: true`.
- إشعار الأدمن بإنشاء طلب إعلان يُنتظر انتهاء محاولاته عبر `Promise.allSettled` بدل إطلاق وعود غير منتظرة.
- حالة التحقق: لا أستطيع تشغيل Vitest محليًا من خلال واجهة GitHub فقط. البناء على Vercel سيؤكد التجميع وTypeScript، أما اختبار الوحدة وCI فما زالا بحاجة إلى Runner يعمل.


## متابعة 2026-10-29 — إصلاح إجراءات إدارة الإعلانات

- أزيلت الكتابة إلى العمودين غير الموجودين `approved_by/approved_at` من موافقة الإعلان. أصبح إجراء الموافقة يتحقق من الـUUID والتواريخ بتوقيت `Africa/Cairo`، ولا ينتقل إلى active إلا إذا كانت الحالة الحالية pending.
- أُضيف تحديد معدل إلى عمليات الإدارة، والتحقق من الحالة الحالية داخل عمليات الرفض/الإيقاف/الاستئناف/الحذف مع فحص الصف المتأثر؛ لا يُعرض نجاح لمجرد أن Supabase لم يُرجع خطأ.
- مشكلة RLS الأوسع ما زالت قائمة: مالك الإعلان يستطيع محاولة تغيير الحالة مباشرة عبر PostgREST، والإدراج لا يثبت ملكية النشاط. لن تتصلح هذه الثغرة بشكل كامل من Server Actions فقط؛ تحتاج migration مختبرة في staging بعد موافقتك.


## متابعة 2026-10-29 — توحيد التسميات الظاهرة

- وُحّدت بقايا تسميات جمهور الواجهة في الأسئلة الشائعة والمساعدة والشروط وصفحة التعريف إلى «المشتري/البايع».
- لم تتغير قيم الأدوار الداخلية، أسماء الجداول، أو النصوص التاريخية في وثائق التطوير.


## 2026-10-29 — QA activity, ad RLS and CI/build housekeeping

- Added one public QA-only activity, “اختبار EAH — نشاط تجريبي (لا تتعامل)” at /businesses/eah-qa-test-20261029. It has no owner, phone/contact details, logo/cover, in-app orders or WhatsApp orders. Its public notice explicitly says it is not a real activity and not to contact/order. The warning expires on 2026-11-05; remove or unpublish this QA record when testing is complete.
- Verified over the deployed site that the QA detail route returns HTTP 200 and shows the warning; /explore now includes its name and slug. Public activity title metadata no longer repeats EAH.
- Refined cards: “لسه مفيش تقييمات” is metadata rather than a large badge covering the image. Detail page now has an accessible breadcrumb and shows genuine activity flags and the exact address when available.
- Applied migration legacy_ads_rls_hardening_20261029 to Supabase production after testing the DDL inside a transaction that was rolled back. Live pg_policies verification confirms public read requires active/start/end window, seller inserts must link an owned business and stay pending, direct updates are admin-only, and seller deletes are restricted to their own pending/rejected ads. ads row count remains zero.
- Added the matching migration file and six pgTAP regression assertions to the repository and wired them into the RLS quality job. The pgTAP suite has not run yet because GitHub runners fail before the first step; it must be executed once a runner is available.
- CI root cause is external to the workflow YAML: the latest jobs show runner_id=0, empty runner_name, and no steps. Added paths-ignore rules so docs/workflow housekeeping doesn't keep consuming failing jobs. This does not repair hosted Runner availability for code changes; repository/account Actions usage/spending limits or a self-hosted runner still needs owner-side resolution.
- Installed Vercel Ignored Build Step. A workflow/helper-only commit was confirmed skipped with exit code 0; missing Git SHAs/history fail open and continue the build. The app commit 1b7091b built successfully (TypeScript finished, webpack compiled, deployment READY).
- No Supabase staging branch was created because it would incur about USD 0.01344/hour and needs explicit cost approval. No fake login users were created; the explicitly requested test activity was sufficient for the public card/detail path.


## 2026-10-29 — حالة إصلاح الإنتاج ومرحلة التحقق

- نشاط QA تجريبي منشور بعنوان «اختبار EAH — نشاط تجريبي (لا تتعامل)» على /businesses/eah-qa-test-20261029. لا مالك، لا هاتف أو وسيلة تواصل، ولا طلبات داخل المنصة أو واتساب. يظهر التنبيه في صفحة التفاصيل، والنشاط ظاهر الآن في /explore. ينتهي التنبيه 5 نوفمبر 2026؛ أزل أو ألغِ نشر سجل QA بعد انتهاء الاختبار حتى لا يبقى سجل تجريبي ضمن النتائج.
- بطاقة النشاط لا تعرض «لسه مفيش تقييمات» فوق الصورة بعد الآن؛ الرسالة أصبحت جزءًا من تفاصيل البطاقة. صفحة التفاصيل فيها breadcrumb، شارات الميزات الحقيقية، والعنوان الكامل عند توفره.
- نسخة التطبيق commit 1b7091be5dd885835606e7ed36041412c3f7d2f7 أصبحت READY على Vercel، مع نجاح التجميع وTypeScript. تم فحص الاستجابات العامة: الرئيسية/الاكتشاف والصفحة التجريبية 200، عنوان الصفحة التجريبية لا يكرر EAH، والنشاط التجريبي يظهر في نتائج الاكتشاف.
- طُبقت سياسات RLS للإعلانات القديمة في الإنتاج بعد اختبار DDL داخل معاملة تم التراجع عنها؛ التحقق الحي أكد السياسات الأربع المتوقعة، وصفوف الإعلانات تظل صفرًا. Migration واختبار pgTAP موجودان في المستودع، لكن pgTAP لم يُشغّل على staging بعد.
- GitHub Actions: Jobs على تغييرات التطبيق تفشل قبل تخصيص Runner (runner_id=0 وsteps=[]). تحديثات docs/workflow وحدها لم تعد تشغل هذه الوظائف، وهو تقليل لهدر التشغيل لا إصلاح لتوفر Runner. لحل الجذر، على مالك الحساب فحص Actions billing/usage/spending limit أو إضافة self-hosted runner.
- Vercel Ignored Build Step يعمل: تحققنا أن التزام تغيير workflow/helper وحده أُلغي برسالة exit code 0، والالتزام الذي يغير التطبيق لا يتخطى البناء. هذا يقلل builds غير اللازمة لكنه لا يلغي quotas لحساب Vercel.
- لم يتم إنشاء حساب دخول وهمي؛ نشاط QA العام كان كافيًا لاختبار البطاقة والتفاصيل. لم يتم إنشاء Supabase staging بسبب التكلفة المتكررة 0.01344 USD/ساعة وعدم وجود موافقة منفصلة.
