# EAH Web

واجهة الويب/PWA لمشروع EAH، ومعها **EAH Design Studio Pro** للتحكم البصري في الواجهة.

## Stack

- Next.js 16.3.4 (App Router)
- React 19.2.8
- Puck 0.23
- Supabase SSR 0.12.7
- Supabase JS 2.116.0
- TypeScript
- Mobile-first / Dark-first
- Web App Manifest + Service Worker shell

## تشغيل الموقع

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:3000`.

## الاستوديو البصري

```text
http://localhost:3000/studio
```

الاستوديو مستقل داخل المشروع، ولا يحتاج حساب خدمة خارجية أو رصيد. تصميم الصفحة محفوظ في:

```text
08-web/.eah/studio.json
```

وعند الحفظ من الاستوديو يتم تحديث الملف عبر `/api/studio/design`، لذلك يمكن الاحتفاظ به داخل Git مثل أي جزء من المشروع.

الاستوديو يوفّر:

- سحب وإفلات وإعادة ترتيب العناصر.
- إضافة وحذف وتكرار العناصر.
- تحكم شامل في العرض، الارتفاع، المسافات، الحدود، الظلال، الخلفيات، الشفافية والـBlur.
- Responsive controls للموبايل والتابلت والشاشة.
- أقسام EAH: الشعار، Hero، البحث، الفئات، الترند، العروض، الجديد، الصيدليات، المقاضي، التوصيل وCTA.
- عناصر عامة: Container, Grid, Text, Button, Image, Spacer, Divider, Navigation, Footer, Sticker Cloud.
- خلفية EAH البنفسجية مع Stickers SVG خفيفة قابلة للتحكم.

## تشغيل الاستوديو بضغطة

من جذر المستودع:

```bash
python3 start_eah.py
```

الـlauncher يشغّل Next.js من `08-web` ويفتح `/studio` تلقائيًا.

## Environment

انسخ `.env.example` إلى `.env.local` وأدخل:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

لا تضع أي `service_role` أو `sb_secret` key في متغير يبدأ بـ `NEXT_PUBLIC_`.
