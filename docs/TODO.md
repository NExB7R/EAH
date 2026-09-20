# EAH — TODO (الشغل الحالي)

> آخر تحديث: 2026-09-20

## 🔴 أولوية عالية

- [ ] إضافة 5+ أنشطة حقيقية (مطاعم/صيدليات/ماركت)
- [ ] إصلاح /explore — ترتيب الفلاتر + شكل الكارد
- [ ] اختبار Quick Actions في صفحة النشاط
- [ ] اختبار Lightbox للمعرض والمنيو
- [ ] اختبار رفع صور جديدة (watermark يظهر صح)

## 🟠 أولوية متوسطة

- [ ] إصلاح كل كود بيستخدم items_summary (الصح: items)
- [ ] Referral system — تتبع الإحالات + النقاط
- [ ] نقاط قابلة للاستبدال (خصومات/مميز)
- [ ] Business Form (رابط URL بدل رفع)

## 🟡 أولوية منخفضة

- [ ] PWA offline mode
- [ ] Chat بين العميل والتاجر
- [ ] تقارير أسبوعية للتاجر
- [ ] تصدير Excel

## ✅ خلص مؤخراً

- [x] Business page كاملة (Gallery + Menu + Hours + Quick Actions)
- [x] تقييمات auto-approve + flagging
- [x] إشعارات + welcome + NotifLink
- [x] حفظ البروفايل (API-based)
- [x] 8 ملفات حيّة (START_HERE + SECRETS + ARCHITECTURE + LIVE_STATE + CHANGELOG + TODO + ROADMAP + DECISIONS)
- [x] تنظيف 7 ملفات يتيمة
- [x] **cron كل ساعة (GitHub Actions)** ← جديد
- [x] **GRANT service_role على 60 جدول** ← جديد
- [x] **إشعار عميل بعد أوردر (Push)**
- [x] **إشعار تاجر عند أوردر جديد**
- [x] **إشعار تاجر عند تقييم جديد**
- [x] **Fra1 region (Frankfurt) جنب Supabase**
- [x] **Parallel + cached queries**
- [x] **Watermark على الغلاف/المعرض/المنيو**

---

## 📱 قائمة التذكير قبل الإطلاق الرسمي

### Monitoring
- [ ] نزّل تطبيق UptimeRobot على الموبايل (iOS / Android)
- [ ] تأكد من استقبال Push notifications
- [ ] Test كل الأخطاء تعمل على موبايلك
- [ ] Status Page عام (اختياري)

### Vercel Pro Upgrade ($20/شهر)
- [ ] ترقية من Hobby → Pro
- [ ] تفعيل cron دقيق (كل دقيقة)
- [ ] تفعيل Analytics
- [ ] تفعيل Backup
- [ ] رفع حد deployment Storage
- [ ] دومين مخصص (eah-eg.com)

### قبل الإطلاق
- [ ] 20 نشاط حقيقي في الـ DB
- [ ] اختبار كامل على الموبايل
- [ ] Facebook Page مرتبة (شوف `SOCIAL_SETUP.md`)
- [ ] WhatsApp Channel شغالة
- [ ] إشعارات Sentry + UptimeRobot مختبرة

### UptimeRobot — نقاط مستقبلية
- [ ] ترقية UptimeRobot لخطة مدفوعة → Region Europe فقط
  - السبب: Monitor من أمريكا (2222ms) — مش دقيق للمستخدمين المصريين
  - الأولوية: منخفضة (بس ممكن مع Vercel Pro)
