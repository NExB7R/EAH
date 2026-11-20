# EAH — Platform Upgrade Plan (2026-11)

**الفترة المخططة:** 2026-11-15 → 2026-11-22  
**طبيعة الوثيقة:** خطة تاريخية/مقترحة وليست سجل تنفيذ أو دليلًا على اكتمال أي مرحلة.  
**مرجع الحالة الفعلية:** `docs/PROGRESS.md` و`docs/ERROR_REGISTER.md` وGitHub Actions على آخر SHA.

---

## المراحل (بالترتيب)

| # | المهمة | الوقت | Commit |
|---|---|---|---|
| 1 | WhatsApp → Online orders | 1 يوم | `feat(orders): replace whatsapp_orders with online_orders` |
| 2 | Enforcement Layer | 1 يوم | `feat(entitlements): enforce plan features across platform` |
| 3 | إزالة "2 ساعات" من المنصة | نصف يوم | `chore(support): remove SLA time references` |
| 4 | Hide comments/reviews enforcement | نصف يوم | `feat(privacy): enforce hide_comments/hide_reviews` |
| 5 | تحذير تعليقات قابل للغلق | نصف يوم | `feat(comments): dismissible warning banner` |
| 6 | Admin Control Panel | 1 يوم | `feat(admin): full control panel per business` |
| 7 | Notifications (مشترك vs عادي) | نصف يوم | `feat(notifications): subscriber vs free distinction` |
| 8 | Featured home scheduling | نصف يوم | `feat(featured): monthly scheduling per plan` |
| 9 | Lightbox + Hero أكبر | نصف يوم | `feat(media): image lightbox + larger hero` |
| 10 | CRM (مؤجل — بعد 30 تاجر) | 1 يوم | `feat(crm): basic customer CRM` |

---

## مرجع الأسعار (نهائي)

### الباقات
| الباقة | شهري | 3 شهور | 6 شهور | 12 شهر | فروع |
|---|---|---|---|---|---|
| مجاني | 0 | — | — | — | 1 |
| مميز | 150 | 425 | 800 | 1,440 | 2 |
| احترافي | 300 | 850 | 1,600 | 2,880 | 4 |
| أعمال | 500 | 1,425 | 2,700 | 4,800 | 8 |

### باقة العميل
**مؤجلة** حتى 50 نشاط + 1000 مستخدم.

### الإعلانات
| المكان | 7 | 15 | 30 | 90 | 180 |
|---|---|---|---|---|---|
| home_banner | 150 | 300 | 500 | 1,400 | 2,500 |
| home_feed | 100 | 200 | 350 | 900 | 1,600 |
| category_banner | 80 | 150 | 300 | 750 | 1,350 |
| trend_pin | 120 | 220 | 400 | 1,100 | 2,000 |
| search_top | 90 | 170 | 300 | 800 | 1,450 |

---

## قواعد ثابتة

1. التحذيرات **قابلة للغلق** (localStorage `eah-dismiss-{key}`)
2. كل حاجة تُدار من `/admin` — لا شيء hardcoded
3. enforcement يعتمد على DB لا على JS
4. المسمى الظاهر «التاجر»، والمفتاح التقني `merchant`; لا تستخدم مسميات بديلة.
5. "سوبر أدمن" في الكود، "صاحب المنصة" في الواجهة
6. لا "2 ساعات" أو SLA مكتوب — الدعم غير محدد الوقت
7. الصور الحقيقية فقط — لا بيانات وهمية
8. لكل باقة حد فروع/صور/عروض واضح

---

## المميزات النهائية لكل باقة (تاجر)

| Feature | مجاني | مميز | احترافي | أعمال |
|---|---|---|---|---|
| basic_listing | ✅ | ✅ | ✅ | ✅ |
| online_orders | ✅ | ✅ | ✅ | ✅ |
| verified_badge | ✅ | ✅ | ✅ | ✅ |
| public_stats | ✅ | ✅ | ✅ | ✅ |
| basic_stats | ❌ | ✅ | ✅ | ✅ |
| featured_badge | ❌ | ✅ | ✅ | ✅ |
| offers_gallery | ❌ | ✅ | ✅ | ✅ |
| trend_eligibility | ❌ | ✅ | ✅ | ✅ |
| reply_to_reviews | ❌ | ✅ | ✅ | ✅ |
| full_stats | ❌ | ❌ | ✅ | ✅ |
| featured_home | ❌ | ❌ | ✅ | ✅ |
| crm_basic | ❌ | ❌ | ❌ | ✅ |
| crm_full | ❌ | ❌ | ❌ | ❌ (مؤجل) |
| pdf_reports | ❌ | ❌ | ❌ | ❌ (مؤجل) |
| dedicated_support | ❌ | ❌ | ❌ | ✅ |

**حدود:**
- فروع: 1 / 2 / 4 / 8
- صور: 3 / 10 / 20 / 50
- عروض الرئيسية/شهر: 0 / 0 / 1 / 3

---

## Enforcement نقاط (8 أماكن)

| # | المكان | الشرط |
|---|---|---|
| 1 | `business-card.tsx` | شارة "مميز" فقط إذا `featured_badge` |
| 2 | `businesses/[slug]` | معرض = limit حسب الباقة |
| 3 | `getFeaturedBusinesses` | فقط `featured_home` |
| 4 | `getTrendingBusinesses` | فقط `trend_eligibility` |
| 5 | `merchant/insights` | إخفاء متقدم إلا إذا `full_stats` |
| 6 | `merchant/orders` | تفعيل حسب `online_orders` |
| 7 | `merchant/branches` | منع عند الحد |
| 8 | `merchant/business/edit` | منع صور زيادة |

---

## حالة التنفيذ

- [ ] 1. WhatsApp → Online
- [ ] 2. Enforcement Layer
- [ ] 3. إزالة "2 ساعات"
- [ ] 4. Hide comments enforcement
- [ ] 5. تحذير تعليقات dismissible
- [ ] 6. Admin Control Panel
- [ ] 7. Notifications
- [ ] 8. Featured home scheduling
- [ ] 9. Lightbox + Hero
- [ ] 10. CRM (مؤجل)

---

## Audit المطلوب قبل كل مرحلة

- grep للاستخدام
- فحص DB (SQL)
- tsc + eslint
- commit اختباري (rollback سهل)

**التوثيق:** كل مرحلة تُحدّث هذا الملف عند الانتهاء.
