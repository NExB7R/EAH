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

والصفحة الرئيسية تقرأ نفس التصميم المحفوظ. أي تعديل تحفظه من الاستوديو يصبح هو الشكل المستخدم في الموقع المحلي.

التحكم يشمل Drag & Drop، إعادة ترتيب، Duplicate، Delete، إضافة مكونات، Root Theme، Logo، Hero، Search، Intent Chips، الترند، العروض، الجديد، الصيدليات، المقاضي، التوصيل، CTA، Container، Grid، Text، Button، Image، Spacer، Divider، Navigation، Footer، وخلفية Stickers SVG.

كل عنصر بصري رئيسي لديه تحكم في العرض، الارتفاع الأدنى، الـpadding، الـmargin، الـgap، الخلفية، صورة الخلفية، الحدود، الـradius، الـshadow، الشفافية، الـblur، والـoverflow، مع Responsive values للموبايل والتابلت والشاشة في المكونات التي تحتاجها.

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
