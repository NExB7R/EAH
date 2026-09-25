# EAH — SECURITY.md

> الحمايات الأمنية + الثغرات المحتملة + خطة التحسين.
> آخر تحديث: 2026-09-25

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

### 1.2 Application (Next.js)

| الحماية | الحالة |
|---------|--------|
| CSP | ✅ `next.config.ts` |
| X-Frame-Options | ✅ DENY |
| X-Content-Type-Options | ✅ nosniff |
| Referrer-Policy | ✅ strict-origin-when-cross-origin |
| Permissions-Policy | ✅ camera=(), mic=(self), geo=(self), payment=() |
| HSTS | ✅ max-age=63072000; includeSubDomains |
| CSRF | ✅ Next.js Server Actions (built-in) |
| Input validation | ✅ Zod schemas |
| Route protection | ✅ `proxy.ts` |

### 1.3 Secrets

| الحماية | الحالة |
|---------|--------|
| `.env.local` | ✅ في `.gitignore` |
| Service Role Key | ✅ Server-only |
| Cloudinary keys | ✅ Server-only |
| VAPID keys | ✅ Server-only (private) |

---

## 2. الثغرات المحتملة ⚠️

### 2.1 حرجة (لازم قبل الإطلاق)

| # | الثغرة | الخطورة | الحل |
|---|--------|---------|------|
| 1 | Rate limiting على `/auth/login` | 🔴 عالي | Upstash Redis |
| 2 | Rate limiting على `/auth/signup` | 🔴 عالي | Upstash Redis |
| 3 | Rate limiting على `/api/*` | 🔴 عالي | Upstash Redis |
| 4 | مفيش Turnstile على signup | 🟠 متوسط | Cloudflare Turnstile |
| 5 | Audit logs مش مربوطة بحاجات كتير | 🟠 متوسط | ربط في كل action |

### 2.2 متوسطة

| # | الثغرة | الخطورة | الحل |
|---|--------|---------|------|
| 6 | `'unsafe-inline'` في CSP | 🟠 متوسط | nonce-based CSP |
| 7 | مفيش X-XSS-Protection | 🟡 منخفض | إضافة header |
| 8 | مفيش Content-Type validation | 🟡 منخفض | middleware |
| 9 | مفيش IP allowlist للـ admin | 🟡 منخفض | Vercel config |

### 2.3 منخفضة

| # | الثغرة | الخطورة | الحل |
|---|--------|---------|------|
| 10 | مفيش Sentry (error tracking) | 🟡 منخفض | Sentry SDK |
| 11 | مفيش 2FA | 🟡 منخفض | TOTP |
| 12 | مفيش Security headers audit | 🟡 منخفض | securityheaders.com |

---

## 3. الحمايات المطبقة فعلياً

### 3.1 CSP (`next.config.ts`)

```
default-src 'self'
script-src 'self' 'unsafe-inline' (production)
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: cloudinary + supabase
connect-src 'self' supabase + cloudinary
font-src 'self' data:
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
object-src 'none'
upgrade-insecure-requests
```

### 3.2 RLS (Supabase)

- **Public read:** businesses, business_media, reviews, offers.
- **Owner read/write:** حسب owner_profile_id.
- **Self read/write:** profiles, favorites, follows, orders.
- **Admin full:** عبر is_admin().

### 3.3 Zod Validation

- كل input → Zod schema.
- Server-side فقط.
- رسائل خطأ عربية.

### 3.4 Route Protection (`proxy.ts`)

- `/account/*` → login required.
- `/merchant/*` → login required (ما عدا `/merchant/apply`).
- `/admin/*` → super_admin.
- `/notifications/*` → login required.

---

## 4. خطة التحسين

### 4.1 المرحلة 1 (قبل الإطلاق)

- [ ] Rate limiting (Upstash Redis).
- [ ] Turnstile على signup.
- [ ] Audit logs شاملة.
- [ ] Security headers audit.

### 4.2 المرحلة 2 (بعد 3 شهور)

- [ ] nonce-based CSP.
- [ ] 2FA اختياري.
- [ ] IP allowlist للـ admin.
- [ ] Sentry.

### 4.3 المرحلة 3 (بعد سنة)

- [ ] Penetration testing.
- [ ] Bug bounty.
- [ ] WAF (Cloudflare).

---

## 5. القواعد الإجبارية

### ممنوع
- secrets في Git.
- Service Role Key على client.
- RLS متعطّل.
- HTML غير موثوق (بدون sanitize).
- بيانات شخصية بدون تشفير.
- أي تعديل DB بدون migration.
- `eval()` أو `Function()`.

### مسموح
- Server Actions (CSRF protected).
- Service Role على server only.
- Zod validation.
- RLS.
- HTTPS إجباري.

---

## 6. الاستجابة للحوادث

### 6.1 Secret اتكشف
1. غيّره فوراً (Supabase / Cloudinary / Vercel).
2. امسح من Git history.
3. بلّغ.
4. راجع كل الـ secrets.

### 6.2 Production data اتمسحت
1. ما تعدّلش أي حاجة.
2. افحص Supabase backups.
3. بلّغ.
4. استنى تعليمات.

### 6.3 الموقع وقع
1. افحص Vercel logs.
2. افحص Supabase status.
3. بلّغ بالتشخيص.
4. استنى تعليمات.

---

## 7. المراجع

- `AI_CONTRACT.md` — القواعد
- `ARCHITECTURE.md §15` — Security
- `SACRED.md §11` — ممنوعات الأمان
- `LESSONS.md` — التجارب

---

آخر تحديث: 2026-09-25