# EAH — Resource Budget & Incident Policy

## 1. حدود المنصات (Free Tier)
- **GitHub Actions**: 2000 دقيقة/شهر. بيخلص بسبب: Push على كل فرع، PR+Push، E2E، Re-runs.
- **Vercel**: 100GB bandwidth, 6000 build mins. بيخلص بسبب: Preview deploys لكل PR، Builds فاشلة متكررة.
- **Supabase**: 500MB DB. بيخلص بسبب: Queries غير indexed، صور غير مضغوطة.
- **Cloudinary**: 25GB. بيخلص بسبب: Transformations كتيرة.

## 2. قواعد إجبارية
- `concurrency` في كل workflow (إلغاء الـ runs القديمة).
- `paths-ignore` للملفات اللي مش محتاجة build (`docs/**`, `*.md`).
- E2E على `main` فقط. مفيش Matrix builds إلا لو ضروري.

## 3. سجل الحوادث (Incident Log)
| التاريخ | المنصة | الحادثة | التكلفة | الإجراء |
|---|---|---|---|---|
| 2026-11-06 | GitHub Actions | Billing failed: "recent account payments failed" | 2 runs فاشلين | تحويل الريبو لـ Public مؤقتًا + تنضيف التاريخ |
| 2026-10-XX | Git History | VERCEL_OIDC_TOKEN in history | خطر أمني | SEC-02b: تم تنضيف التاريخ بـ filter-repo |

## 4. تذكير: الرجوع لـ Private
- **التاريخ:** 2026-12-01 (أول الشهر).
- **السبب:** تجديد دقائق GitHub Actions المجانية (2000 دقيقة).
- **الإجراء:** تغيير الرؤية من Public إلى Private من إعدادات الريبو.
