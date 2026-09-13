# EAH Web

واجهة الويب/PWA لمشروع EAH ومعها **EAH Design Studio Pro** داخل نفس المشروع.

## تشغيل الاستوديو

من جذر المشروع:

```bash
python3 start_eah.py
```

ثم يفتح المتصفح تلقائيًا على:

```text
http://localhost:3000/studio
```

أو شغّله يدويًا من `08-web` باستخدام `npm run dev`.

## الاستوديو

الاستوديو جزء ثابت من EAH، وليس خدمة خارجية ولا يحتاج رصيدًا. بيانات التصميم تحفظ في:

```text
08-web/.eah/studio.json
```

والصفحة الرئيسية تستخدم نفس التصميم المحفوظ.

التحكم يشمل السحب والإفلات، الترتيب، الإضافة والحذف والتكرار، Root Theme، الشعار، Hero، البحث، الفئات، الترند، العروض، الجديد، الصيدليات، المقاضي، التوصيل، CTA، Container، Grid، Text، Button، Image، Spacer، Divider، Navigation، Footer، وخلفية Stickers SVG، مع تحكم واسع في المقاسات والمسافات والخلفيات والحدود والظلال والشفافية والـblur والـresponsive.

## Environment

انسخ `.env.example` إلى `.env.local` وأدخل:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

