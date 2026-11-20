# EAH — Handoff

## الحالة التشغيلية المعتمدة — 2026-11-20

> هذا القسم هو المرجع الحالي. الأقسام اللاحقة التي تحمل تواريخًا أقدم محفوظة كسجل تاريخي؛ لا تعتمد أي SHA أو حالة اختبار أو دور أو خطوة نشر منها دون مراجعة أحدث الأدلة.

### قواعد المشروع

- العمل مباشرة على main؛ لا تنشئ فروع اختبار أو فروع عمل غير لازمة، ولا تستخدم PR كمسار افتراضي.
- الأدوار المسجلة ثلاثة فقط: الأدمن (super_admin)، العميل (customer)، والتاجر (merchant). الزائر حالة وصول لا دور. استخدم هذه المسميات فقط في النصوص الظاهرة، وحافظ على المفاتيح التقنية.
- يستطيع الأدمن إنشاء نشاط دون مالك. ربط حساب موجود اختياري، ولا يتطلب رقم هاتف المالك الشخصي.
- نشاط الأدمن يبدأ مسودة؛ لا يظهر في البحث أو الصفحة العامة قبل النشر الصريح.
- ممنوع أي كتابة أو seed أو migration أو رفع أو حذف على Supabase الإنتاجي. قاعدة QA منفصلة غير مؤكدة؛ اختبارات DB وعمليات إنشاء الحسابات والأنشطة والوسائط والتنظيف متوقفة حتى اعتمادها والتحقق من Project Ref.
- لا تنفّذ نشرًا أو تغيّر إعدادات Vercel خلال فترة الحظر. الحالة الحالية من Vercel هي Account is blocked، والموعد المعتمد لإعادة التقييم 2026-12-15. الحظر ليس دليلًا على فشل Build.
- لا تدّعِ نجاح E2E لدورة نشاط الأدمن قبل اختبارها على QA منفصلة: إنشاء بلا مالك ومع مالك اختياري، الشعار والغلاف، المسودة والنشر، البحث، والصفحة العامة.
- المستودع Public بحسب GitHub API. وثائق اختبار تاريخية كانت تحتوي كلمة مرور ثابتة ومعرّفات حسابات؛ أزيلت من النسخ الحالية لكن Git history لم يُمحَ. تعامل مع كلمات المرور المنشورة كأنها مكشوفة، وعلى المالك مراجعة الحسابات المرتبطة وتدوير/تعطيل بياناتها بعد مراجعة الأثر. لا تُجرَ كتابة على الإنتاج من هذه الجلسة.
- لا تعِد كتابة Git history أو تستخدم force-push دون قرار وخطة استرداد مستقلين.

### أحدث أدلة الكود والجودة — مراجعة 2026-11-20

- آخر commit تطبيقي/Workflow راجعته هو `cd537185b00004b99997d0c746066883fb2bcfad`. تحديثات التسليم والتوثيق اللاحقة محفوظة في commits مستقلة؛ تحقق من آخر SHA عبر GitHub قبل أي كتابة.
- آخر تغييرات الواجهة النصية المتحققة: `60f1d78` (wizard owner options)، `3890e8a` (review step)، `7897c97` (trial owner panel)، `3323667` (trust page). هذه الملفات غيّرت النصوص فقط، ولم تغير role keys أو منطق الصلاحيات.
- Quality Gate run `44818572502` على `cd537185`: **quality job نجح**. نجحت TypeScript وESLint وPrettier للملفات المتغيرة وStylelint وWebpack Build وVitest (37 ملف اختبار و234 اختبارًا) وnpm audit للإنتاج عند high وKnip وjscpd.
- الفحص الشامل لـPrettier في التشغيل نفسه أبلغ عن **170 ملفًا** ما زال فيها تنسيق قديم. هذا الفحص منفصل ومعلوماتي؛ لا يعتبر ناجحًا ولا يُخفى. الملفات المتغيرة تظل تحت فحص حاجب، ويجب خفض الدين الشامل تدريجيًا.
- Workflow run `44818572502` ككل انتهى بالفشل لأن وظيفة `rls-tests` رفضت البدء عند شرط قاعدة QA: `SUPABASE_DB_URL` فارغ. لم يبدأ Supabase CLI/pgTAP، ولم تُطبق migrations، ولم يعمل RLS audit. هذا ليس فشل اختبار RLS؛ الاختبار لم يُنفذ.
- CodeQL run `44818572947` وInvariants run `44818572702` نجحا على SHA `cd537185`. لا أضيف نتيجة Context Map لهذا SHA لعدم وجود تشغيل موثق في السجل الحالي.
- محاولات تعديل Quality workflow في `14fe9d8` و`4db2d7a` و`2553d68` احتوت YAML تالفًا؛ أُعيد بناء الملف من النسخة السليمة السابقة في `cd537185`. التشغيل النهائي يؤكد أن workflow parse and quality job عاد للعمل.
- Dependabot فتح PR رقم `#42` لتحديث `supabase/setup-cli` من 3.0.1 إلى 3.2.0 على فرع مستقل. لم يتم دمجه أو العمل على ذلك الفرع؛ راجع CI والـdiff قبل أي قرار دمج.
- Vercel ما زال يعرض `Account is blocked`، وهو حظر حساب خارجي لا فشل Build. لا تنفّذ Deployment أو تغييرات إعداد قبل 2026-12-15 وإعادة التحقق.
- لا اختبارات محلية نُفذت من بيئة العمل الحالية. لا توجد كتابة على Supabase أو تغييرات في بيانات الإنتاج أو إعدادات Vercel.

### حالة العمل المفتوح

1. **Prettier baseline:** 170 ملفًا قديمًا ما زال يحتاج تنسيقًا. فحص الملفات المتغيرة أصبح حاجبًا؛ خفّض الدين الشامل تدريجيًا حتى الصفر، ولا تصف الفحص الشامل بأنه ناجح.
2. **مصطلحات الأدوار:** تم تحديث أربعة ملفات UI، لكن ما زالت نصوص «مشتري/بايع» في إدارة الأنشطة والمستخدمين، القائمة الجانبية والفوتر وصفحات التعريف والمساعدة والأسئلة والشروط والتصدير ورسائل الخادم. أصلح كل ملف في سياقه، ولا تغيّر `customer/merchant/super_admin`.
3. **قاعدة QA:** اعتماد Project Ref غير إنتاجي والتحقق منه وربطه بسر CI مستقل؛ بعدها فقط شغّل pgTAP/RLS والمigrations المراجعة.
4. **الأسرار التاريخية:** Git history العام قد يحتوي بيانات دخول اختبار قديمة؛ على المالك مراجعة الحسابات المرتبطة وتدوير/تعطيل البيانات بعد تقييم الأثر. لا force-push/rewrite دون قرار وخطة استرداد.
5. **دورة النشاط:** E2E على QA: إنشاء أدمن بدون مالك وبمالك اختياري، حفظ كمسودة، الشعار والغلاف، rollback، النشر الصريح، الظهور في البحث والصفحة العامة، وفحص الهاتف.
6. **الطلبات والأوفلاين:** اختبر فصل الطلبات الداخلية عن واتساب، عدم تكرار offline queue، وخصوصية Service Worker على QA.
7. **Vercel:** أعد فحص الحساب بعد 2026-12-15؛ لا تنشر قبل نجاح البوابات ومراجعة آخر SHA.

### تحديثات التوثيق والعمل في 2026-11-20

- تم توحيد قواعد الأدوار في المراجع الأساسية إلى الأدمن/العميل/التاجر مع تثبيت المفاتيح التقنية.
- تم تحديث `docs/SACRED.md` و`docs/FEATURES.md` و`docs/VISION.md` و`docs/USER_PREFERENCES.md` و`docs/AI_CONTRACT.md` لمسميات الأدوار الصحيحة.
- تم تحديث `docs/DEVELOPMENT_GUIDE.md` و`docs/QUALITY_GATES.md` لتوضيح سياسة QA، وخط أساس Prettier، وفحص الملفات المتغيرة.
- تم تحديث `docs/PROGRESS.md` و`docs/ERROR_REGISTER.md` و`docs/NEW_CHAT_MESSAGE.md` لربط آخر الأدلة بالـSHA والـRun IDs.
- تم تعديل أربعة ملفات UI نصيًا في commits منفصلة؛ لا توجد تغييرات على Supabase أو Vercel أو نشر.

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