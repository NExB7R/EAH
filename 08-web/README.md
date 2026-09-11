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

الصفحة الرئيسية تقرأ نفس التصميم المحفوظ، والاستوديو نفسه يدير نفس مكونات EAH. هذا يجعل التصميم هو مصدر الحقيقة البصري للمشروع بدل ما تكون التعديلات مجرد preview منفصل.

### التحكم

- Drag & Drop، إعادة ترتيب، Duplicate، Delete وإدخال مكونات جديدة.
- Root Theme: الخلفية، الأسطح، البنفسجي، النصوص، العرض العام، المسافات، الاستدارة والـstickers.
- EAH Logo، Hero، Search، Intent Chips.
- أقسام الترند والعروض والجديد والصيدليات والمقاضي والتوصيل وCTA.
- Container وGrid وText وButton وImage وSpacer وDivider وNavigation وFooter.
- لكل عنصر بصري رئيسي: Width، Max Width، Min Height، Padding، Margin، Gap، Background، Background Image، Borders، Radius، Shadow، Opacity، Blur وOverflow.
- Responsive controls للموبايل والتابلت والشاشة.
- خلفية Stickers مرسومة كـSVG خفيفة وقابلة للتحكم في الكثافة والشفافية والسرعة والانتشار والأشكال.
- معاينات Mobile / Tablet / Desktop / Wide.

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
