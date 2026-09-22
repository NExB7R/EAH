# Sprint 2026 — Home & Mobile

> البداية: 2026-09-22
> الفرع: `arena/01a0c683-eah`
> المرجع: `docs/audit/PLATFORM_PASS_2026_09_21.md`

## الهدف

تكملة خطة الـ Platform Pass على محورين:
1. بند الأمان المتبقي قبل الإنتاج: نقل الـ routes الحساسة من rate limiting في الذاكرة للـ atomic DB limiter.
2. محور Home & Mobile: تطبيق والتحقق من عناصر Soft Neon 2026 على الرئيسية والموبايل.

## اللي اتعمل (2026-09-22)

### 1) Rate limiting → DB atomic limiter (بند 6 من قايمة ما قبل الإنتاج)

اتحوّلوا لـ `checkRateDb` (RPC الذري `consume_rate_limit` — موزّع عبر الـ serverless instances):

- `/api/coupons/redeem`
- `/api/coupons/validate`
- `/api/follows`
- `/api/orders/notify`
- `/api/push/notify`
- `/api/qr`
- `/api/track-reveal`
- `/api/upload` (avatars)
- `/api/admin/upload`
- `/api/admin/collect/parse`

فضل على الذاكرة فقط: `/api/track` (120/min analytics — حجم عالي وقيمة إساءة منخفضة،
مش مستاهل DB roundtrip لكل event).

ملاحظة: `checkRateDb` بيعمل fallback تلقائي على الـ in-memory limiter لو الـ RPC
مش متاح — يعني الكود آمن قبل وبعد تطبيق الهجرة.

### 2) Home & Mobile — Soft Neon 2026

اتراجعنا على عناصر الـ UX الموجودة في الخطة وسدّينا الناقص:

| العنصر | الحالة |
|---|---|
| Ambient Aurora (4 nodes، بنفسجي/دهبي/سماوي) | ✅ موجود — معطّل على الشاشات الصغيرة ولمقلّلي الحركة |
| بحث زجاجي (glass search) | ✅ موجود — `backdrop-filter` + حالة focus سماوية |
| توهج داخلي للكروت + حركة hover أخف | ✅ موجود في `explore-card-v5` |
| حالة مفتوح/لايف سماوية | 🔧 **اتضافت دلوقتي** على كروت الرئيسية (`ec5`) — كانت موجودة في كروت `explore` القديمة فقط |
| المفضلة SVG متسقة | ✅ موجودة |
| فلتر bar لاصق + Escape + حالات معطلة | ✅ موجودين في `filter-select` |
| Back to Top عام + reduced-motion + safe-area | ✅ موجود — **الحجم على الموبايل اتعدّل من 40 لـ 44px** |
| 44px لمس على الموبايل | 🔧 **اتظبط**: أزرار تنقل السلايدر 38→44، زر البحث + زر الصوت في بحث الرئيسية |
| تقليل الحركة المستمرة على الموبايل | 🔧 **اتضاف**: تمرير السلايدرز التلقائي مبيشتغلش على شاشات ≤640px، ولا مع `prefers-reduced-motion` — وكمان سلايدر صور الكارد الـ 3D بيوقف مع تقليل الحركة |

### 3) تعديلات الرئيسية حسب ملاحظات Nour

- شيلنا تصنيف **مقاضي/ماركت** من كويك لينكات الرئيسية (صفر أنشطة من النوع ده — وفي Explore الشيب معطّلة تلقائياً لما العد صفر).
- **السلوجان فوق والهوك تحته** (كانوا معكوسين).
- ظبط المساحات: هوامش السلوجان/الهوك/البحث/التصنيفات اتقلصت، والشبكة بقت 3 أعمدة.

## المتبقي من قايمة ما قبل الإنتاج (مهام تشغيلية — صاحب المشروع)

1. تطبيق `20260921230000_atomic_rate_limit.sql` على Supabase عبر مسار الهجرات المعتاد.
2. التأكد إن كل متغيرات `.env.example` موجودة في Vercel (قايمة كاملة في `08-web/.env.example`).
3. اختبارات متصفح موثّقة لـ customer / merchant / super-admin على بيانات staging.
4. Lighthouse/Web Vitals على build منشور بميديا حقيقية.
5. تفعيل Supabase leaked-password protection + مواصلة مراجعة RLS/performance lints.

## التحقق

- `npm run typecheck` — نجح.
- `npm run build` — (نتيجة البناء في سجل الجلسة).
