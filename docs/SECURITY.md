# EAH — SECURITY.md

> الحمايات الأمنية الكاملة + الثغرات + خطة التحسين. **المصدر الوحيد للحقيقة.**
> آخر تحديث: 2026-10-03

---

## 0. الفلسفة

**الدفاع في العمق (Defense in Depth):**
- كل حماية في طبقة مختلفة
- لو طبقة فشلت، الطبقة اللي بعدها تحمي
- الحمايات الحرجة في DB (مستحيل تتخطى)
- الحمايات الثانوية في App/Cloud

---

## 1. الحمايات الحالية ✅

### 1.1 Database (Supabase)

| الحماية | الحالة |
|---------|--------|
| Row Level Security (RLS) | ✅ 100% على كل الجداول |
| Service Role Key | ✅ Server-only |
| SQL Injection | ✅ Prevention (parameterized) |
| Password hashing | ✅ Supabase Auth (bcrypt) |
| Session management | ✅ Supabase |
| Rate limiting (DB) | ⚠️ جزئي (rate_limits table) |

**DB Triggers:**

| # | الحماية | الدالة |
|---|---------|--------|
| 1 | منع تقييم النفس | prevent_self_review |
| 2 | منع طلب النفس | prevent_self_order |
| 3 | كشف Velocity (10+/ساعة) | detect_review_velocity |
| 4 | Audit log للتقييمات | log_review_changes |

**Indexes + Constraints:**

| # | الحماية |
|---|---------|
| 5 | Unique follow/favorite |
| 6 | CHECK على كل enum |
| 7 | CHECK على ranges (impact, wanted) |

### 1.2 Application (Next.js)

| الحماية | الحالة |
|---------|--------|
| CSP | ✅ `next.config.ts` |
| X-Frame-Options | ✅ DENY |
| X-Content-Type-Options | ✅ nosniff |
| Referrer-Policy | ✅ strict-origin-when-cross-origin |
| Permissions-Policy | ✅ camera=(), mic=(self), geo=(self) |
| HSTS | ✅ max-age=63072000; includeSubDomains |
| CSRF | ✅ Next.js Server Actions |
| Input validation | ✅ Zod schemas |
| Route protection | ✅ `proxy.ts` |
| gitleaks | ✅ pre-commit |
| npm audit | ✅ zero high |

### 1.3 Secrets

| الحماية | الحالة |
|---------|--------|
| `.env.local` | ✅ في `.gitignore` |
| Service Role Key | ✅ Server-only |
| Cloudinary keys | ✅ Server-only |
| VAPID keys | ✅ Server-only (private) |

---

## 2. الحمايات المطبقة فعلياً

### 2.1 CSP (next.config.ts)

default-src 'self'
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: cloudinary + supabase
connect-src 'self' supabase + cloudinary
font-src 'self' data:
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
object-src 'none'
upgrade-insecure-requests

### 2.2 RLS (Supabase)

- Public read: businesses, business_media, reviews, offers
- Owner read/write: حسب owner_profile_id
- Self read/write: profiles, favorites, follows, orders
- Admin full: عبر is_admin()

### 2.3 Zod Validation

- كل input → Zod schema
- Server-side فقط
- رسائل خطأ عربية

### 2.4 Route Protection (proxy.ts)

- /account/* → login required
- /merchant/* → login required (ما عدا /merchant/apply)
- /admin/* → super_admin
- /notifications/* → login required


---

## 3. الثغرات المحتملة (من منظور مهاجم)

### 3.1 من ناحية المستخدم/الزائر

| الثغرة | الاستغلال | الحل الحالي | الحل المستقبلي |
|--------|-----------|-------------|-----------------|
| حسابات متعددة | حسابات بأرقام مختلفة | Supabase Auth | Turnstile + Fingerprint |
| Review Bombing | حشد لتقييم سلبي | DB Trigger ✅ | - |
| تضخيم الأثر | تعليقات قصيرة متكررة | Log Scale ✅ | Rate Limit |
| صور مسروقة | صور من الإنترنت | - | Reverse Image Search |

### 3.2 من ناحية صاحب النشاط

| الثغرة | الاستغلال | الحل الحالي |
|--------|-----------|-------------|
| تقييم النفس | حساب عميل ويقيّم | DB Trigger ✅ |
| طلبات وهمية | طلبات لنفسه | DB Trigger ✅ |
| ردود متطابقة | رد متكرر | Rate Limit (بعدين) |

### 3.3 من ناحية النظام

| الثغرة | الاستغلال | الحل الحالي |
|--------|-----------|-------------|
| انتحال | رقم قديم | سياسة 30 يوم (بعدين) |
| تجاوز RLS | ثغرة | RLS Audit (بعدين) |
| SQL Injection | حقن | Zod + Parameterized ✅ |
| DDoS | هجوم | Cloudflare (بعدين) |
| Brute Force | محاولات دخول | Auth Rate Limits (بعدين) |
| Rate Limit عام | 1000 req/s | Upstash (بعدين) |


---

## 4. خطة التحسين

### 4.1 المرحلة 1: حمايات حرجة (مجانية) — قبل الإطلاق

| # | الحماية | الأداة | الوقت |
|---|---------|--------|-------|
| 1 | Turnstile على التسجيل | Cloudflare Turnstile | 20 دقيقة |
| 2 | Auth Rate Limits | Supabase Dashboard | 5 دقايق |
| 3 | API Rate Limiting | Upstash Redis | 30 دقيقة |
| 4 | RLS Audit | supabase-rls-linter | 15 دقيقة |

**تفاصيل:**

**1. Cloudflare Turnstile:**
- حماية من البوتات
- 88% من تطبيقات Supabase فيها RLS misconfigured
- الخطوات: حساب Cloudflare → Turnstile → Add Site → Site Key + Secret
- npm install @marsidev/react-turnstile
- الـ widget في auth-form.tsx + التحقق في actions.ts

**2. Supabase Auth Rate Limits:**
- Dashboard → Authentication → Rate Limits
- Sign-up/Sign-in: 5 / 15 دقيقة
- Password reset: 3 / ساعة
- Token refresh: 60 / ساعة

**3. Upstash Rate Limiting:**
- Vercel serverless مفيش shared state → Redis خارجي
- الحدود المجانية: 10K commands/day + 256MB
- npm install @upstash/ratelimit @upstash/redis
- lib/rate-limit.ts + الـ limiter في proxy.ts

**4. RLS Audit:**
- npx supabase-rls-linter
- RLS001 (missing RLS) = CRITICAL
- RLS002 (USING true) = CRITICAL
- SECURITY DEFINER بدون search_path = HIGH

### 4.2 المرحلة 2: حمايات متوسطة — قبل الإطلاق الرسمي

| # | الحماية | الأداة | الوقت |
|---|---------|--------|-------|
| 5 | Device Fingerprinting | FingerprintJS OSS | ساعة |
| 6 | Audit Logs شاملة | Triggers إضافية | ساعة |
| 7 | Open Redirect Protection | Next.js config | 15 دقيقة |

**تفاصيل:**

**5. Device Fingerprinting:**
- منع الحسابات المتعددة
- FingerprintJS (open source)
- useFingerprint() hook
- تخزين الـ fingerprint في profiles
- لو 3+ حسابات من نفس الجهاز → flag

**6. Audit Logs شاملة:**
- كل عملية إدارية + تعديل بيانات حساسة
- Trigger على: businesses, profiles, subscriptions

**7. Open Redirect Protection:**
- منع تحويلات ضارة
- التحقق من next parameter في الـ redirects

### 4.3 المرحلة 3: حمايات متقدمة — بعد Vercel Pro

| # | الحماية | الأداة | السبب |
|---|---------|--------|-------|
| 8 | Reverse Image Search | Google Vision API | مكلف بعد free tier |
| 9 | WAF متقدم | Cloudflare Pro | مدفوع |
| 10 | Penetration Testing | شركة متخصصة | مكلف |
| 11 | ShieldLabs / Sift | كشف احتيال متقدم | 99$/شهر |
| 12 | 2FA | TOTP | مش حرج دلوقتي |


---

## 5. القواعد الإجبارية

### ممنوع

- secrets في Git
- Service Role Key على client
- RLS متعطّل
- HTML غير موثوق (بدون sanitize)
- بيانات شخصية بدون تشفير
- أي تعديل DB بدون migration
- eval() أو Function()
- raw SQL queries
- trust على client input

### إجباري

- كل حماية حرجة في DB
- Zod على كل input
- RLS على كل جدول
- Audit log للعمليات الحساسة
- Rate limit لكل endpoint
- Server Actions (CSRF protected)
- Service Role على server only
- HTTPS إجباري

---

## 6. الاستجابة للحوادث

### 6.1 Secret اتكشف

1. غيّره فوراً (Supabase / Cloudinary / Vercel)
2. امسح من Git history
3. بلّغ
4. راجع كل الـ secrets

### 6.2 Production data اتمسحت

1. ما تعدّلش أي حاجة
2. افحص Supabase backups
3. بلّغ
4. استنى تعليمات

### 6.3 الموقع وقع

1. افحص Vercel logs
2. افحص Supabase status
3. بلّغ بالتشخيص
4. استنى تعليمات

---

## 7. الأدوات

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

## 8. المراجع

- AI_CONTRACT.md — القواعد
- ARCHITECTURE.md §15 — Security
- SACRED.md §11 — ممنوعات الأمان
- QUALITY.md — نظام الجودة
- LESSONS.md — التجارب

---

آخر تحديث: 2026-10-03
