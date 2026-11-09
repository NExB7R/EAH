# EAH — Handoff Document

> **آخر تحديث:** 2026-11-09
> **الحالة:** جاهزة تقنيًا 95%

## 🎯 قواعد المالك

### العمل
1. واحدة واحدة — مراجعة كل خطوة
2. صفر تجاهل لأي مشكلة
3. Mobile-First (320-375px)
4. 2026/2027 — أحدث حلول
5. main فقط، مفيش فروع
6. قابلية التطوير

### التصميم
- عربي RTL كامل، Dark theme فقط
- الأدوار: عميل/تاجر/أدمن
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

| Email | Password | Role |
|---|---|---|
| customer1@eah.test | Test@12345 | customer (100 pts) |
| customer2@eah.test | Test@12345 | restricted 30d |
| merchant1@eah.test | Test@12345 | merchant (demo-featured-restaurant) |
| merchant2@eah.test | Test@12345 | merchant (demo-new-pharmacy) |
| (owner) | (personal) | super_admin |

## 🚀 Workflow

### Start new chat with:
اقرأ docs/HANDOFF.md + CONSTITUTION + AGENTS.md + آخر PROGRESS

### Before any change:
cd ~/EAH && git status && git pull origin main && git log -5

### During work:
- خطوة واحدة في كل مرة
- مراجعة بعد كل خطوة
- push بعد كل commit
- اختبار في المتصفح

### After commit:
git push origin main
انتظر Vercel 1-2 min

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
2. أضف نشاط حقيقي واحد
3. ارفع logo+cover+hours
4. تحقق من Completeness ≥85%

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
