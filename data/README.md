# EAH Business Data Collection

## القرى المستهدفة
شبين القناطر، القلج، الجبل الأصفر، كفر بطا، نوى، طحا، منشأة الكرام، أبو زعبل.

## الأنواع
- restaurant (مطاعم + توصيل)
- pharmacy (صيدليات + توصيل)
- supermarket (ماركت + توصيل)
- delivery_office (مكاتب توصيل)

## خطوات الجمع
1. Google Maps: ابحث + تأكد من Delivery filter
2. Facebook: خد الرقم + رابط الصفحة
3. WhatsApp: ابعت رسالة اختبار
4. Elmenus/Talabat: بيانات إضافية

## الاستيراد
cd ~/EAH/08-web
node ../scripts/import-businesses.mjs ../data/BUSINESSES.json
