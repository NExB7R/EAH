# EAH — Handoff

## الحالة التشغيلية المعتمدة — 2026-11-21

> هذا القسم هو المصدر الحالي للتسليم. السجلات التي تليه تاريخية؛ لا تعتمد أي SHA أو حالة اختبار أو قرار قديم دون مطابقته مع الأدلة الحديثة أدناه.

### قواعد ثابتة

- التطوير على `main` فقط. لا تنشئ فروع اختبار أو فروع عمل غير ضرورية، ولا تدمج Dependabot PR تلقائيًا.
- أدوار المنصة ثلاثة فقط: الأدمن (`super_admin`)، العميل (`customer`)، والتاجر (`merchant`). الزائر حالة وصول، وليس دورًا. جميع النصوص الظاهرة تستخدم «الأدمن/العميل/التاجر» مع بقاء المفاتيح التقنية.
- يستطيع الأدمن إنشاء نشاط دون مالك؛ ربط حساب موجود اختياري ولا يتطلب رقم هاتف المالك الشخصي.
- نشاط الأدمن يبدأ مسودة ولا يظهر في البحث أو الصفحة العامة قبل النشر الصريح.
- لا تُجرِ أي كتابة أو seed أو migration أو رفع أو حذف على Supabase الإنتاجي. فحص المشاريع المتصلة في 2026-11-21 أظهر مشروعًا واحدًا فقط باسم EAH، وهو الإنتاج؛ لا توجد بيئة QA مستقلة.
- لا تنفّذ نشرًا أو تغييرات إعدادات Vercel قبل 2026-12-15 وإعادة التحقق. الحالة الأخيرة هي `Account is blocked`؛ هذا حظر حساب خارجي وليس فشل Build.
- لا تعِد كتابة Git history ولا تستخدم force-push لإزالة بيانات اعتماد قديمة دون قرار وخطة استرداد مستقلين.

### أحدث SHA والعمل البرمجي

- آخر SHA على `main`: `91cd994c2bcb2289f56f75b1ba8d752950f0acb4`.
- تغييرات النصوص الظاهرة التي تمت في هذه الدفعة: صفحة من نحن `a51b476`، FAQ `ebd7d0c`، الشروط `3b67c44`، الفوتر `ee78416`، شريط الثقة `73fa76f`، تصدير الطلبات `479127d`، إعداد الطلبات `ef54fc4`، فلتر الأنشطة `0f2630b`، وبطاقة مصدر النشاط `91cd994`.
- هذه التغييرات خاصة بالمسميات الظاهرة فقط، ولم تغيّر قيم `customer/merchant/super_admin`، أو صلاحيات الأدوار، أو منطق الملكية والنشر والطلبات.
- تغييرات سابقة على معالج إنشاء النشاط ولوحة ربط المالك موجودة في `60f1d78` و`3890e8a` و`7897c97` و`3323667`.

### نتائج الجودة المثبتة وحدودها

- أحدث Quality job مكتمل ومتحقق منه على SHA `0f2630b1e106320b4e7ce758f23e6a6ab89ce1f1` هو run `44845473525`. انتهى Quality job بالنجاح: TypeScript وESLint وPrettier للملفات المتغيرة وStylelint وWebpack Build وVitest وnpm audit للإنتاج عند high وKnip وjscpd.
- في التشغيل نفسه: Vitest اجتاز 37 ملف اختبار و234 اختبارًا. فحص npm كان `--omit=dev --audit-level=high` فقط؛ لا يعني خلو تبعيات التطوير أو advisories الأقل من high.
- فحص Prettier الشامل في التشغيل `44845253748` أبلغ عن **171 ملفًا** غير منسق، والعداد المصحح في Workflow سجّل العدد نفسه. هذا دين تنسيق تاريخي معلن؛ فحص الملفات المتغيرة ما زال حاجبًا ونجاحه لا يعني أن جميع الملفات القديمة نظيفة.
- التشغيل `44845473525` ككل انتهى بالفشل لأن وظيفة `rls-tests` توقفت عند شرط `SUPABASE_DB_URL` الفارغ. لم يبدأ Supabase CLI أو pgTAP أو تطبيق migrations أو RLS audit؛ هذا ليس فشل اختبار RLS، فالاختبار لم يُنفّذ.
- **مهم:** آخر commit `91cd994` لا توجد له بعد Check Runs من GitHub Actions. ظهرت أربع Check Suites لتكاملات Supabase/Claude/Vercel/Sentry بحالة queued فقط؛ لا تعتبر هذا دليلًا على اجتياز Quality Gate. يجب انتظار تشغيل مرتبط بالـSHA نفسه قبل اعتماد تعديل بطاقة النشاط.
- محاولات تحديث عداد Prettier السابقة التي أفسدت YAML تم إصلاحها بإعادة بناء Workflow من نسخة سليمة، ثم تصحيح عداد ANSI. لا ترجع إلى commits المحاولة الفاشلة `14fe9d8` و`4db2d7a` و`2553d68` و`14fe9d8` كنسخة Workflow مرجعية.
- Dependabot PR `#42` لتحديث `supabase/setup-cli` من 3.0.1 إلى 3.2.0 لم يُدمج؛ راجع diff وCI قبل قرار منفصل.

### Supabase وVercel والأمان

- لا توجد قاعدة اختبار مستقلة. مشروع Supabase الوحيد الظاهر في الاتصال هو EAH الإنتاجي؛ لذلك لا تشغّل DB/E2E التي تكتب بيانات، ولا seeder أو cleanup.
- `web/scripts/seed-qa-accounts.mjs` يستخدم Service Role ويكتب في Auth وprofiles وuser_roles وbusinesses وmerchant_order_settings؛ يبقى متوقفًا حتى اعتماد QA مستقلة وحارس Project Ref.
- المستودع Public. أزيلت بيانات اعتماد الاختبار الثابتة من النسخ الحالية، لكن Git history لم يُمحَ. تعامل مع كلمات المرور القديمة كأنها مكشوفة، وعلى المالك مراجعة الحسابات المرتبطة وتدوير/تعطيل بياناتها بعد تقييم الأثر.
- لم تُكتب أو تُحذف أي بيانات Supabase، ولم تُنفّذ migrations، ولم يحدث نشر أو تغيير Vercel في هذه الدفعة.

### الأعمال المفتوحة

1. تحقق من وجود Quality Gate run على SHA `91cd994`. لا تتابع تعديلات UI جديدة قبل معرفة نتيجة الفحص، أو سبب عدم إطلاقه.
2. أكمل تحديث أسماء الأدوار في `users-list.tsx` و`user-detail-actions.tsx` ورسائل Server Actions وreviews وorder modal، ملفًا واحدًا لكل patch. حافظ على role keys كما هي.
3. ملفات مثل `help/page.tsx` و`roadmap/page.tsx` و`menu-drawer.tsx` و`about/presentation/presentation-client.tsx` و`api/admin/export/route.ts` وملفات admin المحددة ضمن خط أساس Prettier؛ لا تغيّرها قبل أن يمر فحص التنسيق للملف المتغير.
4. خفّض دين Prettier الشامل من 171 ملفًا حتى الصفر على دفعات صغيرة؛ لا تُعطّل الفحص ولا تخفِ النتائج.
5. اعتمد QA منفصلة من المالك، مع Project Ref وURL وسر CI مخصصين. بعدها فقط شغّل pgTAP/RLS/migrations وE2E لدورة النشاط.
6. استكمل E2E على QA: إنشاء نشاط بلا مالك وبمالك اختياري، الصور والـrollback، المسودة والنشر، البحث والصفحة العامة وتجربة الهاتف.
7. راجع الأسرار التاريخية مع مالك المشروع. أعد تقييم Vercel بعد 2026-12-15 ولا تنشر قبل إغلاق بوابات الجودة والاختبار.

### بداية أي جلسة تالية

1. اقرأ AGENTS.md وCONSTITUTION.md وHANDOFF.md وQUALITY_GATES.md.
2. تحقق من آخر SHA على main وسجل commits والـworkflow runs الفعلية.
3. راجع الملفات المتأثرة كاملة وسياق callsites والاختبارات قبل كتابة الكود.
4. لا تنفذ أي كتابة Supabase دون QA منفصلة معتمدة؛ لا تنشر على Vercel قبل 2026-12-15.
5. نفّذ الفحوص على SHA المراد اعتماده وسجل النتائج الحقيقية.
6. حدّث PROGRESS.md وERROR_REGISTER.md عند تغييرات الحالة.

---

> **⚠️ حالة حرجة (2026-11-15):** Vercel Paused حتى 15 ديسمبر (Free Tier CPU).
> **التطوير الآن:** `npm run dev` محليًا + git push. **قبل الإطلاق:** Vercel Pro ($20/شهر).
> اقرأ `docs/DEV_WORKFLOW.md` قبل أي شيء.

---

1. واحدة واحدة — مراجعة كل خطوة
2. صفر تجاهل لأي مشكلة
3. Mobile-First (320-375px)
4. 2026/2027 — أحدث حلول
5. main فقط، مفيش فروع
6. قابلية التطوير

### التصميم
- عربي RTL كامل، Dark theme فقط
- الأدوار: الأدمن / البايع / المشتري
- التصنيفات: مطاعم/صيدليات/توصيل/أخرى

### الأمان
- phone/whatsapp ممنوع is_public=true
- Reveal flow فقط
- Secrets في Vercel env فقط
- 2FA إجباري
- Rotation كل 90 يوم

### الموارد
- Vercel Free: 100GB/6000 min
- لا push عشوائي
- لا npm install محلي
- Live edits عبر Vercel

### ما تم إزالته
- زر المشاركة من الفوتر
- رقم الإصدار
- كارت إيميل الدعم
- hexiel
- Demo data قبل الإطلاق

## 🏗️ Stack

| الطبقة | التقنية |
|---|---|
| Framework | Next.js 16.3 + React 19 |
| Styling | CSS Modules + Design Tokens |
| Backend | Supabase (Postgres+RLS) |
| Images | Cloudinary |
| Hosting | Vercel |
| Push | VAPID |

## 📁 Structure

- docs/ — Documentation
- web/app/ — Pages + API
- web/components/ — Components
- web/lib/ — Data + Utils
- web/supabase/tests/ — RLS tests
- AGENTS.md (root) — AI rules

## 📚 Critical Files

- docs/CONSTITUTION.md — الدستور
- docs/BRAIN.md — Quick understanding
- docs/HANDOFF.md — هذا الملف
- docs/TEST_ENVIRONMENT.md — Test accounts
- docs/LAUNCH_CHECKLIST.md — Pre-launch
- docs/LAUNCH_DAY_RUNBOOK.md — Day-of
- docs/DESIGN_TOKENS.md — Tokens
- docs/ERROR_REGISTER.md — Errors
- docs/LESSONS.md — Lessons
- docs/PROGRESS.md — Progress

## ✅ Done

### Security
- 16/16 verification passed
- Standing System (Cockpit+Autopilot+can_interact)
- Contact privacy (CHECK+trigger)
- RLS 15/15
- find_by_phone locked

### Monitoring
- /admin/health: 13 checks + 3 auto-fixes
- Launch Readiness (gauge)
- Verify Launch (16 via UI)
- API endpoint

### Design
- 39 design tokens
- 138 module.css converted
- EmptyState (4 variants × 28 pages)
- Trust Bar
- Error boundaries
- Unified Header
- Sidebars removed

### Systems
- Business Completeness (15 criteria)
- Completeness Panel + Badge
- Branch auto-create
- SEO (metadata+JSON-LD)

### Testing
- 273 tests passing

### Documentation
- 15+ MD files comprehensive

## ⏳ Not Completed

### Before Launch (T-7)
- [ ] cleanup.sql (remove demo)
- [ ] 3+ real businesses (≥85%)
- [ ] 2+ real merchants
- [ ] 1+ real offer
- [ ] Domain purchase+link
- [ ] Secrets rotation
- [ ] Facebook + WhatsApp

### After Launch
- [ ] Key rotation 90d
- [ ] 10 user interviews
- [ ] Expansion to other cities

## 🔑 Test Accounts

لا تُخزَّن كلمات مرور أو بيانات دخول اختبار داخل المستودع. تُدار حسابات QA في مدير أسرار بيئة الاختبار المعزولة فقط، ولا يُعاد استخدام بيانات اعتماد الإنتاج.

## 🚀 Workflow

### Start new chat with:
اقرأ docs/HANDOFF.md + CONSTITUTION + AGENTS.md + آخر PROGRESS

### Before any change:
cd ~/EAH && git status && git pull origin main && git log -5

### During work:
- العمل على `main` مباشرة وفق الحالة التشغيلية المعتمدة أعلاه
- خطوة واحدة في كل مرة ومراجعة diff بعد كل تغيير
- لا كتابة على Supabase الإنتاجي
- اختبارات DB على QA معزولة فقط
- لا تفترض أن push سيؤدي إلى نشر Vercel أثناء فترة الإيقاف

### After commit:
- تحقق من SHA وحالة GitHub Actions على نفس commit
- لا تطلب نشر Vercel أو تغيّر إعداداته قبل انتهاء الإيقاف ومراجعة الجودة

## ⚠️ Warnings

### ❌ لا تفعل
- git push --force
- تعديل migrations قديمة
- حذف .env.local بدون backup
- npm install كامل
- npm run build محليًا
- push عشوائي

### 🟡 احترس
- Next.js 16 features جديدة
- React 19 compat
- Supabase RLS على أي جدول جديد
- Vercel builds cost (1-2 min each)

### 🟢 آمن
- components جديدة
- pages جديدة (مع loading/error)
- migrations جديدة
- tests جديدة
- UI improvements (بـ tokens)

## 📊 Launch Criteria

| المعيار | الهدف | الحالي |
|---|---|---|
| Verify Launch | 16/16 | ✅ |
| Readiness | ≥90% | ~78% |
| Real Businesses | ≥3 | ❌ 0 |
| Demo Data | 0 | ❌ 3 |
| Tests | 273/273 | ✅ |
| RLS | 15/15 | ✅ |
| Secrets Rotated | 90d | ❌ |
| Domain | Ready | ❌ |

## 🎯 Priorities (Next Sessions)

### Session 1
1. اقرأ HANDOFF+CONSTITUTION+PROGRESS
2. جهّز بيئة QA معزولة ومعتمدة قبل أي بيانات اختبار
3. اختبر إنشاء نشاط تجريبي بلا مالك ومع مالك اختياري
4. اختبر logo+cover+hours ثم النشر والبحث والصفحة العامة على QA فقط

### Session 2
1. أضف 2-3 أنشطة
2. تحقق من Badges في /admin/businesses
3. جرب كشف رقم كعميل

### Session 3
1. cleanup.sql (مسح demo)
2. تحقق من Readiness ≥90%
3. Secrets rotation
4. Domain setup

### Session 4 — Launch Day
اتبع docs/LAUNCH_DAY_RUNBOOK.md

## 🛠️ URLs

- Vercel: vercel.com/dashboard
- Supabase: supabase.com/dashboard/project/npmpiivmdksdirrumbmt
- GitHub: github.com/NExB7R/EAH
- Cloudinary: cloudinary.com/console

## 🎁 النجاح vs الفشل

### ✅ ينجح
1. اقرأ قبل ما تكتب
2. اختبر قبل push
3. سجّل كل درس
4. git status clean
5. commits صغيرة

### ❌ يفشل
1. التخمين
2. تجاهل warnings
3. تعديل بدون قراءة
4. commits كبيرة
5. push بدون اختبار

---

**✅ جاهز — ابدأ الشات الجديد بـ:**
اقرأ docs/HANDOFF.md + CONSTITUTION + AGENTS.md

---

## 🚨 قواعد تقنية صارمة

### ⛔ Hard NOs

| ممنوع | السبب |
|---|---|
| `npm run build` محليًا | SIGILL على الجهاز |
| `npm test` (كامل) | بطيء. استخدم `npx vitest run <file>` |
| `nano` | بيعلق الترمنال |
| heredoc > 50 سطر | بيتقطع. قسّم أجزاء |
| خطوط Poppins/Inter/Roboto | خطوط EAH: Tajawal + Cairo |
| `git push --force` | يمسح شغل |
| تعديل migrations قديمة | اعمل جديدة |

### 🔒 RPCs محمية (service_role فقط)

- `get_multi_account_ips`: REVOKED من PUBLIC + anon + authenticated
- `find_by_phone`: REVOKED من anon/authenticated (service بعد rate-limit)
- `is_phone_registered`: service_role فقط
- `can_interact`: authenticated (للتحقق من standing)
- `check_trigger_status`: authenticated (للـ health)

### 🎨 قواعد التصميم

- خطوط: Tajawal + Cairo + Great Vibes فقط
- Dark theme فقط، لا light mode
- RTL كامل: `dir="rtl"` على html
- Design tokens: `var(--purple-2-20)` بدل rgba يدوي
- Mobile-first: ابدأ من 320px

### 🗄️ قواعد Database

- RLS إجباري على أي جدول جديد
- service_role في Server Actions فقط
- Demo data يبدأ بـ `demo-` أو `eah-qa-test-`
- CHECK constraints للحقول الحساسة
- Triggers لازم تتحقق من أعمدة الجدول

### ⚙️ Vercel

- كل push = 1-2 build min
- `npm ci` على Vercel يحتاج package-lock متزامن
- Build fail = rollback فوري
- Env vars في Dashboard فقط

### 🧪 Testing

- `npx vitest run <file>` فقط
- RLS tests في web/supabase/tests/
- E2E في web/e2e/ (Playwright على CI)

### 📝 التوثيق

- كل درس → docs/LESSONS.md
- كل خطأ → docs/ERROR_REGISTER.md
- كل تغيير → docs/PROGRESS.md
- كل قرار → docs/CONSTITUTION.md

### 2. افحص الحالة

cd ~/EAH
git status
git log -5
cd web
npx tsc --noEmit
cd ~/EAH

### 3. الأولوية الحالية
المالك يضيف أول نشاط حقيقي من /admin/businesses/new

### 4. دورك
- تابع خطوة بخطوة
- ساعد في logo/cover/hours
- تحقق من النسبة بعد كل خطوة
- سجّل المشاكل في ERROR_REGISTER

**✅ جاهز — ابدأ الشات الجديد بـ "اقرأ docs/HANDOFF.md"**