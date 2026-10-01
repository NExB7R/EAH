# EAH — AI LESSONS

> أخطاء الذكاء الاصطناعي الشائعة في بناء المواقع.
> مرجع لأي شات جديد. آخر تحديث: 2026-10-01

---

## 1. أخطاء AI الشائعة (بالأرقام)

| الخطأ | النسبة | المصدر |
|-------|--------|--------|
| RLS معطّل أو misconfigured | **88%** من تطبيقات Supabase | بحث 2026 على 1,645 تطبيق |
| ثغرة أمنية واحدة على الأقل | **44%** من الكود المولَّد | Veracode 2026 |
| IDOR / Broken Access Control | **45%** من الكود المولَّد | بحث أمني 2026 |
| نقص CSRF protection | **100%** من 15 تطبيق مختبر | Tenzai 2026 |
| SSRF vulnerabilities | **100%** من أدوات AI الخمسة | Tenzai 2026 |
| Hardcoded Secrets | **12%** من الإعدادات | GitGuardian 2026 |
| مكتبات وهمية (Slopsquatting) | **1.1-1.9%** من أسماء الحزم | GPT-5 |
| يحتاج debugging في production | **43%** من أكواد AI | Lightrun 2026 |
| حادثة إنتاج واحدة على الأقل | **82%** من الشركات | بحث 2026 |
| Bugs per developer زادت | **+54%** | بحث 2026 |

---

## 2. الأخطاء العشرة (بالتفصيل)

### 1. RLS معطّل
- **المشكلة:** الـ AI بينسى يفعّل RLS أو بيكتب policies ضعيفة
- **النتيجة:** أي حد بالـ anon key يقدر يقرا كل الداتا
- **الفحص:** `select tablename, rowsecurity from pg_tables where schemaname = 'public'`
- **الحل:** RLS على كل جدول + policy فيها `auth.uid()`

### 2. USING (true) في RLS
- **المشكلة:** بتبان "آمنة" وهي **بتفتح كل حاجة**
- **الفحص:** `select tablename, policyname, qual from pg_policies where qual = 'true'`
- **الحل:** بدلها بـ `(select auth.uid()) = user_id`

### 3. مفيش WITH CHECK
- **المشكلة:** INSERT policies بدون `WITH CHECK` = المستخدم يكتب أي حاجة
- **الفحص:** `select tablename, policyname from pg_policies where with_check is null`
- **الحل:** كل INSERT policy لازم يكون فيها `WITH CHECK`

### 4. IDOR — مفيش ownership check
- **المشكلة:** المستخدم يقدر يعدّل بيانات حد تاني
- **الفحص:** `grep -rn ".from(" app/ lib/ | grep -v ".eq('user_id" | grep -v "auth.uid"`
- **الحل:** كل query فيها `.eq('user_id', user.id)`

### 5. Service Role Key في client
- **المشكلة:** المفتاح الحساس يوصل للعميل = اختراق كامل
- **الفحص:** `grep -r "SERVICE_ROLE" app/ components/`
- **الحل:** Service Role في `.env.local` بس + server-only

### 6. CSRF protection ناقص
- **المشكلة:** API routes بدون حماية
- **الفحص:** `grep allowedOrigins next.config.ts`
- **الحل:** `serverActions.allowedOrigins` في next.config.ts

### 7. SSRF — fetch لـ URL من المستخدم
- **المشكلة:** المهاجم يخلي السيرفر يجيب URLs داخلية
- **الفحص:** `grep -rn "fetch(" app/ lib/`
- **الحل:** allowlist للـ domains + التحقق من URL

### 8. Hardcoded Secrets
- **المشكلة:** مفاتيح في الكود = تسريب
- **الفحص:** `gitleaks detect --source .`
- **الحل:** .env.local + gitleaks في pre-commit

### 9. Slopsquatting — مكتبات وهمية
- **المشكلة:** AI يشاور على حزم مش موجودة، والمهاجم يسجلها باسم خبيث
- **الفحص:** `for pkg in $(jq -r '.dependencies | keys[]' package.json); do npm view $pkg version; done`
- **الحل:** التحقق من كل حزمة في npm registry

### 10. Error handling بيسرّب معلومات
- **المشكلة:** error messages بترجع للـ client بتفاصيل داخلية
- **الفحص:** مراجعة كل `catch` block
- **الحل:** رسائل عامة + logging server-side بس

---

## 3. أخطاء الأدوات نفسها

| الأداة | CVE | CVSS |
|--------|-----|------|
| Claude Code | 28 CVE في سنة | 10.0 |
| Cursor | CVE-2026-50548, CVE-2026-50549 | 9.8 |
| GitHub Copilot | CVE-2025-53773 | 9.6 |
| Gemini CLI | CVE-2025-xxxxx | 10.0 |

**الدرس:** حدّث أدواتك **دايماً**. حتى الأدوات الرسمية فيها ثغرات.

---

## 4. حالات حقيقية

| الشركة | الحادثة | الخسارة |
|--------|---------|---------|
| Amazon | 2 outages في مارس 2026 | 7.9M طلب + 1.6M error |
| Supabase App | تسريب 1.5M token | 35,000 email |
| Vibe-coded apps | 2,000+ ثغرة | 400+ secret |

---

## 5. الحمايات المطبقة في EAH

| # | الحماية | الحالة |
|---|---------|--------|
| 1 | RLS على 70 جدول | ✅ |
| 2 | 4 DB Triggers | ✅ |
| 3 | Column-level REVOKE | ✅ |
| 4 | RPC functions | ✅ |
| 5 | Turnstile | ✅ |
| 6 | Upstash Rate Limiting | ✅ |
| 7 | gitleaks | ✅ |
| 8 | Zod validation | ✅ |
| 9 | CSP + Security headers | ✅ |
| 10 | CSRF allowedOrigins | ✅ |
| 11 | Vitest 58 اختبار | ✅ |
| 12 | GitHub Actions | ✅ |

---

## 6. الفحوصات الدورية

**قبل كل commit** (lefthook):
- gitleaks (secrets)
- prettier
- eslint
- typecheck

**قبل كل push** (lefthook):
- typecheck كامل

**كل أسبوع:**
- `npm run knip` (كود ميت)
- `npm run dup` (تكرار)
- `npm audit`

**بعد كل feature جديدة:**
- فحص AI Code (AI_CONTRACT §30)

---

آخر تحديث: 2026-10-01
