# EAH — خطة السرعة والأمان (Phase 2)

> مؤجل لحد ما نخلص كل الميزات. آخر تحديث: 2026-09-27

---

## ⚡ السرعة

### 1. force-dynamic → revalidate (ISR) — ×10 أسرع
- الحالي: كل زيارة = build كامل (~480ms)
- بعد ISR: ~45ms
- التطبيق: /trends /offers /new /nearby /featured → revalidate = 60
- الصفحات اللي فيها session (/, /explore) → تفضل dynamic

### 2. Next.js 16 Cache Components
- cacheComponents: true في next.config.ts
- use cache بدل unstable_cache
- cacheLife للتحديد الدقيق

### 3. Streaming + Suspense
- لف الأقسام البطيئة في Suspense
- المستخدم يشوف السريع فوراً

### 4. تحسين الصور
- sizes دقيقة لكل صورة
- priority لأول شاشة بس

---

## 🛡️ الأمان

### 1. Supabase Auth Rate Limits (Dashboard — صفر كود)
- Sign-up / Sign-in: 5 محاولات / 15 دقيقة
- Password reset: 3 / ساعة
- Token refresh: 60 / ساعة
- Auth → Rate Limits

### 2. Upstash Redis Rate Limiting (لـ API routes)
- @upstash/ratelimit
- slidingWindow(10, '10 s')
- مجاني حتى 10K requests/يوم

### 3. CSP قائم على Nonce (بدل unsafe-inline)
- توليد nonce في proxy.ts
- تمريره للـ layout
- style-src يفضل unsafe-inline (Next.js)

### 4. RLS Audit
- npx supabase-rls-linter
- RLS001 (missing RLS) = CRITICAL
- RLS002 (USING true) = CRITICAL
- RLS004 (FK no index) = Performance
- RLS006 (SECURITY DEFINER no search_path) = HIGH

### 5. Supabase Advisors (Dashboard)
- Observability → Advisors
- بيفحص schema + RLS + indexes تلقائياً
- إلزامي قبل الإطلاق

---

## 📋 المراحل

### المرحلة 1 (ساعة — مجانية)
1. Supabase Auth Rate Limits
2. Supabase Advisors
3. force-dynamic → revalidate = 60 في 5 صفحات
4. RLS linter

**النتيجة:** ×10 سرعة + كشف مشاكل RLS.

### المرحلة 2 (نص يوم)
5. Upstash Redis
6. Rate limit على API
7. Nonce-based CSP

**النتيجة:** حماية DDoS + XSS حقيقي.

### المرحلة 3 (يوم — اختياري)
8. cacheComponents: true
9. unstable_cache → use cache
10. Streaming + Suspense

**النتيجة:** Instant navigation.

---

## 🎯 الأولوية

1. **المرحلة 1** — 80% من الفايدة، مجانية
2. **المرحلة 2** — قبل الإطلاق الرسمي
3. **المرحلة 3** — لما نكبر (1000+ مستخدم)

---

آخر تحديث: 2026-09-27
