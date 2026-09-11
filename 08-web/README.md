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

## EAH Design Studio Pro

```text
http://localhost:3000/studio
```

الاستوديو جزء ثابت من المشروع نفسه، وليس خدمة خارجية ولا يحتاج اشتراك أو رصيد.

التصميم المحفوظ موجود في:

```text
08-web/.eah/studio.json
```

وعند الضغط على **حفظ التغييرات** يتم تخزين بيانات التصميم في هذا الملف عبر `/api/studio/design`. الصفحة الرئيسية تقرأ نفس البيانات، لذلك ما يتعمل في الاستوديو هو مصدر شكل الصفحة.

التحكم يشمل سحب وإفلات وإعادة ترتيب وإضافة وحذف وتكرار المكونات، Root Theme، الشعار، Hero، البحث، الفئات، الترند، العروض، الجديد، الصيدليات، المقاضي، التوصيل، CTA، Container، Grid، Text، Button، Image، Spacer، Divider، Navigation، Footer، وخلفية Stickers SVG.

كل عنصر بصري رئيسي لديه مجموعات للتحكم في العرض والارتفاع الأدنى، الـpadding والـmargin والـgap، الخلفية وصورة الخلفية، الحدود والـradius، الـshadow، الشفافية والـblur، إضافة إلى Responsive values للموبايل والتابلت والشاشة حيث يلزم.

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
