# EAH Web

واجهة الويب/PWA لمشروع EAH ومعها **EAH Design Studio Pro** داخل نفس المشروع.

## تشغيل

```bash
cd ~/Downloads/local-platform-project
python3 start_eah.py
```

أو يدويًا:

```bash
cd 08-web
npm install
npm run dev
```

ثم افتح `http://localhost:3000/studio`.

## الاستوديو

الاستوديو جزء دائم من EAH، وليس خدمة خارجية ولا يحتاج رصيدًا. التصميم المحفوظ يوجد في `08-web/.eah/studio.json`، والصفحة الرئيسية تستخدم نفس بيانات التصميم.

يوفر التحكم في التخطيط والسحب والإفلات، المكونات، النصوص، الصور، الأزرار، الأقسام، العرض والارتفاع، الـpadding والـmargin والـgap، الخلفيات، الحدود، الـradius، الظلال، الشفافية، الـblur، Responsive values، شعار EAH، وخلفية الـSVG stickers.
