# EAH — SECURITY PLAN

> خطة الحمايات الأمنية الكاملة. المصدر الوحيد للحقيقة.
> آخر تحديث: 2026-09-30

---

## 0. الفلسفة

**الدفاع في العمق (Defense in Depth):**
- كل حماية في طبقة مختلفة
- لو طبقة فشلت، الطبقة اللي بعدها تحمي
- الحمايات الحرجة في DB (مستحيل تتخطى)
- الحمايات الثانوية في App/Cloud

---

## 1. اللي خلص ✅

### DB Triggers
| # | الحماية | الدالة | الحالة |
|---|---------|--------|--------|
| 1 | منع تقييم النفس | prevent_self_review | ✅ |
| 2 | منع طلب النفس | prevent_self_order | ✅ |
| 3 | كشف Velocity (10+/ساعة) | detect_review_velocity | ✅ |
| 4 | Audit log للتقييمات | log_review_changes | ✅ |

### Indexes + Constraints
| # | الحماية | الحالة |
|---|---------|--------|
| 5 | Unique follow/favorite | ✅ |
| 6 | CHECK على كل enum | ✅ |
| 7 | CHECK على ranges (impact, wanted) | ✅ |

### App Layer
| # | الحماية | الحالة |
|---|---------|--------|
| 8 | RLS 100% | ✅ |
| 9 | Zod validation | ✅ |
| 10 | Service Role server-only | ✅ |
| 11 | Parameterized queries | ✅ |
| 12 | gitleaks (منع secrets) | ✅ |
| 13 | npm audit (ثغرات الحزم) | ✅ |

---

## 2. اللي ناقص (بعدين)

### المرحلة 1: حمايات حرجة (مجانية)

| # | الحماية | الأداة | التكلفة | الوقت |
|---|---------|--------|---------|-------|
| 1 | Turnstile على التسجيل | Cloudflare Turnstile | مجاني | 20 دقيقة |
| 2 | Auth Rate Limits | Supabase Dashboard | مجاني | 5 دقايق |
| 3 | API Rate Limiting | Upstash Redis | مجاني | 30 دقيقة |
| 4 | RLS Audit | supabase-rls-linter | مجاني | 15 دقيقة |

**التفاصيل:**

**1. Cloudflare Turnstile:**
- حماية من البوتات
- 88% من تطبيقات Supabase فيها RLS misconfigured
- الخطوات:
  1. حساب Cloudflare (مجاني)
  2. Turnstile → Add Site → Site Key + Secret Key
  3. `npm install @marsidev/react-turnstile`
  4. الـ widget في auth-form.tsx
  5. التحقق في actions.ts قبل signUp

**2. Supabase Auth Rate Limits:**
- Dashboard → Authentication → Rate Limits
- Sign-up/Sign-in: 5 / 15 دقيقة
- Password reset: 3 / ساعة
- Token refresh: 60 / ساعة

**3. Upstash Rate Limiting:**
- Vercel serverless مفيش shared state
- الحل: Redis خارجي
- الحدود المجانية: 10K commands/day + 256MB
- `npm install @upstash/ratelimit @upstash/redis`
- `lib/rate-limit.ts` + الـ limiter في proxy.ts

**4. RLS Audit:**
- `npx supabase-rls-linter`
- RLS001 (missing RLS) = CRITICAL
- RLS002 (USING true) = CRITICAL
- SECURITY DEFINER بدون search_path = HIGH

### المرحلة 2: حمايات متوسطة (قبل الإطلاق)

| # | الحماية | الأداة | التكلفة | الوقت |
|---|---------|--------|---------|-------|
| 5 | Device Fingerprinting | FingerprintJS OSS | مجاني | ساعة |
| 6 | Audit Logs شاملة | Triggers إضافية | مجاني | ساعة |
| 7 | Open Redirect Protection | Next.js config | مجاني | 15 دقيقة |

**التفاصيل:**

**5. Device Fingerprinting:**
- منع الحسابات المتعددة
- FingerprintJS (open source) — مجاني
- `useFingerprint()` hook
- تخزين الـ fingerprint في profiles
- لو 3+ حسابات من نفس الجهاز → flag

**6. Audit Logs شاملة:**
- مش بس للتقييمات
- كل عملية إدارية + تعديل بيانات حساسة
- Trigger على: businesses, profiles, subscriptions

**7. Open Redirect Protection:**
- منع تحويلات ضارة
- التحقق من `next` parameter في الـ redirects

### المرحلة 3: حمايات متقدمة (بعد Vercel Pro)

| # | الحماية | الأداة | لماذا مؤجلة؟ |
|---|---------|--------|--------------|
| 8 | Reverse Image Search | Google Vision API | مكلف بعد free tier |
| 9 | WAF متقدم | Cloudflare Pro | مدفوع |
| 10 | Penetration Testing | شركة متخصصة | مكلف |
| 11 | ShieldLabs / Sift | كشف احتيال متقدم | 99$/شهر |
| 12 | 2FA | TOTP | مش حرج دلوقتي |

---

## 3. الثغرات المحتملة (من منظور مهاجم)

### أ) من ناحية المستخدم/الزائر

| الثغرة | الاستغلال | الحل الحالي | الحل المستقبلي |
|--------|-----------|-------------|-----------------|
| حسابات متعددة | حسابات بأرقام مختلفة | Supabase Auth (رقم واحد) | Turnstile + Fingerprint |
| Review Bombing | حشد لتقييم سلبي | DB Trigger ✅ | - |
| تضخيم الأثر | تعليقات قصيرة متكررة | Log Scale ✅ | Rate Limit |
| صور مسروقة | صور من الإنترنت | - | Reverse Image Search |

### ب) من ناحية صاحب النشاط

| الثغرة | الاستغلال | الحل الحالي |
|--------|-----------|-------------|
| تقييم النفس | حساب عميل ويقيّم | DB Trigger ✅ |
| طلبات وهمية | طلبات لنفسه | DB Trigger ✅ |
| ردود متطابقة | "شكراً" × 100 | Rate Limit (بعدين) |

### ج) من ناحية النظام

| الثغرة | الاستغلال | الحل الحالي |
|--------|-----------|-------------|
| انتحال | رقم قديم | سياسة 30 يوم (بعدين) |
| تجاوز RLS | ثغرة | RLS Audit (بعدين) |
| SQL Injection | حقن | Zod + Parameterized ✅ |
| DDoS | هجوم | Cloudflare (بعدين) |
| Brute Force | محاولات دخول | Auth Rate Limits (بعدين) |
| Rate Limit عام | 1000 req/s | Upstash (بعدين) |

---

## 4. قواعد ذهبية

### ممنوع
- ❌ Service Role Key على client
- ❌ RLS معطّل
- ❌ secrets في Git
- ❌ raw SQL queries
- ❌ trust على client input

### إجباري
- ✅ كل حماية حرجة في DB
- ✅ Zod على كل input
- ✅ RLS على كل جدول
- ✅ Audit log للعمليات الحساسة
- ✅ Rate limit لكل endpoint

---

## 5. خطة التنفيذ

| المرحلة | المحتوى | الحالة |
|---------|---------|--------|
| **الآن** | DB Triggers + RLS + Zod | ✅ خلصنا |
| **المرحلة 1** | Turnstile + Auth Limits + Upstash + RLS Audit | ⏳ |
| **المرحلة 2** | Fingerprint + Audit Logs + Open Redirect | ⏳ |
| **المرحلة 3** | Reverse Image + WAF + Pentest | ⏳ |

**الترتيب:**
1. المرحلة 1 (كلها مجانية) → قبل أي features جديدة
2. المرحلة 2 → قبل الإطلاق الرسمي
3. المرحلة 3 → بعد Vercel Pro

---

## 6. الأدوات المستخدمة

| الأداة | المجال | التكلفة |
|--------|--------|---------|
| Supabase RLS | DB | مجاني |
| DB Triggers | DB | مجاني |
| Zod | Validation | مجاني |
| gitleaks | Secrets | مجاني |
| npm audit | Dependencies | مجاني |
| Cloudflare Turnstile | Anti-Bot | مجاني |
| Upstash Redis | Rate Limit | مجاني (10K/day) |
| FingerprintJS | Device ID | مجاني (OSS) |
| Google Vision | Images | مجاني (1K/month) |
| Cloudflare WAF | DDoS | مجاني (basic) |

---

## 7. المراجع

- `AI_CONTRACT.md` — القواعد
- `SECURITY.md` — الحمايات الحالية
- `QUALITY.md` — نظام الجودة
- `LESSONS.md` — التجارب

---

آخر تحديث: 2026-09-30
