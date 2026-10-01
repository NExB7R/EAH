# EAH — PERFORMANCE_BASELINE.md

> قياسات Core Web Vitals لكل إصدار. المرجع لأي تحسين.
> §26 — Single Source of Truth للـ performance.

---

## 2026-10-02 — v1.0.0 Baseline (Pre-Launch)

**Commit:** `e2c7866`
**URL:** https://eah-sq.vercel.app
**الأداة:** PageSpeed Insights (Google Cloud)
**الجهاز:** Moto G Power (Mobile) / Desktop Chrome

### Mobile (Moto G Power)

| المقياس | القيمة | الحالة | الهدف |
|---------|--------|--------|-------|
| Performance | **84** | ⚠️ | 95+ |
| Accessibility | 100 | ✅ | 100 |
| Best Practices | 96 | 🟡 | 100 |
| SEO | 100 | ✅ | 100 |
| FCP | 3.0s | ⚠️ | < 1.8s |
| **LCP** | **Error (NO_LCP)** | ❌ | < 2.5s |
| CLS | 0 | ✅ | < 0.1 |
| Speed Index | 1.3s | ✅ | < 3.4s |
| TBT | Error | ❌ | < 200ms |

### Desktop

| المقياس | القيمة | الحالة | الهدف |
|---------|--------|--------|-------|
| Performance | **95** | ✅ | 95+ |
| Accessibility | **96** | ⚠️ | 100 |
| Best Practices | 96 | 🟡 | 100 |
| SEO | 100 | ✅ | 100 |
| FCP | 0.3s | ✅ | < 0.9s |
| **LCP** | **Error (NO_LCP)** | ❌ | < 2.5s |
| CLS | 0 | ✅ | < 0.1 |
| Speed Index | 1.3s | ✅ | < 1.3s |

---

## 🚨 المشاكل الحرجة

### 1. LCP Error على الجهازين
- **الرسالة:** "حدث خطأ في تحميل الصورة الرئيسية"
- **السبب المتوقع:** صورة الهيرو (لوجو EAH) مش بتتحمّل
- **الأثر:** Google ميقدرش يقيس LCP = تصنيف سلبي

### 2. Mobile Performance 84
- **السبب:** FCP 3.0s (الهدف 1.8s) + LCP fail
- **الأثر:** ترتيب أقل في البحث

### 3. Desktop Accessibility 96
- **السبب:** 14 عنصر فيهم contrast ضعيف
- **الأثر:** WCAG AA غير محقق

### 4. Best Practices 96 (الجهازين)
- CSP unsafe-inline (مؤقت)
- XSS-Protection 0 (مقصود)
- Trusted Types
- Baseline
- Third-party cookies

---

## خطة التحسين (مرتبة)

1. **LCP Error** — تشخيص + إصلاح صورة الهيرو (أولوية 1)
2. **Mobile FCP 3.0s** — preload + font optimization
3. **Desktop Contrast** — فحص 14 عنصر
4. **Best Practices → 100** — nonce CSP + Trusted Types
5. **Mobile Performance → 95+**

---

## التاريخ

- 2026-10-02: Baseline الأول (v1.0.0 pre-launch)

---

آخر تحديث: 2026-10-02
