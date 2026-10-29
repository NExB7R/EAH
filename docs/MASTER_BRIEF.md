# 📘 EAH — MASTER BRIEF v3.1

> ملف واحد شامل يقدم المنصة كاملة لأي مطور / AI / شريك.
> اقرأه من الأول للآخر قبل أي سطر كود.

**آخر تحديث:** 2026-10-29
**الإصدار:** 3.1
**المالك:** NourEldin B7R — nexb7r@gmail.com

**تسميات الأدوار في الواجهة:** الأدمن، البايع، المشتري فقط. الزائر حالة وصول وليس دورًا. القيم التقنية تظل `super_admin` و`merchant` و`customer`؛ راجع `ROLES_MATRIX.md` لأي تعارض.

---

## 0. القاعدة الصفرية

**قبل أي سطر كود:**
1. اقرأ الملف ده كامل
2. اقرأ `AI_CONTRACT.md` + `SACRED.md`
3. قول: "قرأت. جاهز."
4. استنى التعليمات
5. **ممنوع أي تعديل بدون سؤال صريح**
6. **typecheck قبل كل commit**
7. **deploy فقط بعد preview + موافقة**
8. **build محلي ممنوع** (SIGILL — جهاز قديم)

---

## 1. الهوية

### الاسم والسلوغان
- **الاسم:** EAH
- **السلوغان:** اللي نفسك فيه ؟
- **الهوك:** شبيك لبيك .. كل حاجة حواليك
- **ستيكر المنطقة:** من قلب شبين القناطر (مع أيقونة location)
- **النوع:** منصة اكتشاف محلية مصرية
- **البداية:** شبين القناطر + القرى حواليها
- **التوسع:** القليوبية → الدلتا → باقي المحافظات

### الألوان
- **الخلفية:** `#07020D` (أسود بنفسجي عميق)
- **البنفسجي الأساسي:** `#9D4EDD`
- **البنفسجي النيون:** `#A855F7`
- **البنفسجي الفاتح:** `#C77DFF`
- **الذهبي الأساسي:** `#E8C79A`
- **الذهبي الفاتح:** `#F5D9A7`
- **Teal (للنجاح):** `#55E7D1`
- **البرتقالي (للترند):** `#FDBA74`
- **الأحمر (للتحذير):** `#FCA5A5`

### الخطوط
- **الرئيسي:** Cairo Variable (عربي)
- **العرض:** Tajawal Variable
- **التوقيع:** Brush Script MT / Segoe Script
- **ممنوع:** Poppins, Inter, Roboto

### الستايل العام
- Dark-only (بدون light mode)
- نيون ناعم — طبقة واحدة، بدون توهج عالي
- بدون backdrop-filter على الكروت
- بدون animations مستمرة
- انسيابية — CSS transitions قصيرة (180-240ms)
- Container Queries حيث ممكن
- View Transitions API للانتقال
- الروح: Linear × Vercel × Stripe × Apple، 2026/2027

### الشعار
- **اللوجو الكامل:** تاج (ذهبي) + EAH (بنفسجي نيون) + slogan
- **الأيقونة (favicon + PWA):** التاج فقط
- **اللوجو الصغير (header/drawer):** EAH + تاج صغير
- **الملفات:** `/public/eah-word.webp` + `/public/eah-crown.webp` + `/public/favicon.ico`

### الأيقونات
- ممنوع emoji في UI — فقط SVG icons
- المكتبة: `components/eah-icons.tsx` (custom)
- الستايل: outline ناعم (stroke 1.8-2.2)

---

## 2. المهمة والأهداف

### المهمة
توصيل أهل شبين القناطر والقرى بأماكنهم المحلية — بسرعة، بدقة، بتجربة عربية أصلية.

### الأهداف
| المرحلة | المدة | الأنشطة | الزوار/شهر | الدخل/شهر |
|---------|-------|---------|-----------|-----------|
| سنة 1 | 12 شهر | 100 | 10,000 | 20,000 ج.م |
| سنة 2-3 | 24 شهر | 1,000 | 100,000 | 150,000 ج.م |
| سنة 5 | 60 شهر | 5,000+ | 500,000+ | 500,000+ ج.م |

---

## 3. نموذج الربح

### الباقات المدفوعة

#### 🆓 الباقة المجانية — 0 ج.م
- صفحة نشاط كاملة
- ظهور في البحث والتصنيفات
- استقبال طلبات واتساب
- بدون إحصائيات متقدمة

#### ⭐ الباقة المميزة — 200 ج.م/شهر
- ظهور في المميزين
- شارة ذهبية
- إحصائيات أساسية
- ترتيب أولوية
- 3 عروض مجانية شهرياً
- تجربة مجانية 30 يوم

#### 🚀 باقة النمو — 500 ج.م/شهر
- كل مميزات المميزة +
- ظهور في الترند
- تقارير PDF شهرية
- CRM بسيط
- 10 عروض مجانية شهرياً
- إعلان بانر واحد شهرياً
- تجربة مجانية 30 يوم

#### 💎 باقة الشراكة — 1,500 ج.م/شهر
- كل مميزات النمو +
- بانر رئيسي (7 أيام/شهر)
- تطوير مخصص
- مدير حساب شخصي
- أولوية المميزات الجديدة

### الإعلانات
| النوع | السعر | المدة |
|-------|------|-------|
| بانر الرئيسية | 1,500 ج.م | أسبوع |
| بانر تصنيف | 800 ج.م | أسبوع |
| Sponsored Post | 500 ج.م | مرة |
| إعلان في الترند | 1,200 ج.م | أسبوع |

### العمولة (المستقبلي)
- مبدأ: مش بناخد نسبة من الطلبات
- بديل: تقارير + PDF → إثبات قيمة → 2-3% على الطلبات بعد سنتين

### الدخل الإضافي
- بوت واتساب — 100 ج.م/شهر
- CRM متقدم — 300 ج.م/شهر
- تطبيق iOS — 50 ج.م
- دومين مخصص — 200 ج.م/سنة

---

## 4. الميزات الأساسية

### 4.1 للمشتري

**الاكتشاف:**
- بحث ذكي باللهجة المصرية
- بحث صوتي (Voice Search)
- AI Assistant (مجاني)
- فلاتر: تصنيف، منطقة، تقييم، مفتوح حالاً، عروض
- ترشيحات شخصية
- قريب مني (5 كم)

**المعلومات:**
- صور حقيقية + منيو + فروع
- تقييمات موثقة
- أوقات عمل دقيقة

**الطلب:**
- واتساب مباشر
- بدون وسيط
- حفظ الفواتير

**التخصيص:**
- مفضلات محفوظة
- متابعة الأنشطة
- إشعارات ذكية (تحكم كامل + iOS 16.4+)
- App Badging

**المكافآت:**
- نظام نقاط
- مستويات ولاء: Bronze / Silver / Gold / Platinum / Diamond
- كوبونات حسب المستوى
- دعوات → نقاط

**PWA:**
- تثبيت على الموبايل
- iOS + Android + Desktop
- Offline-First (Level 3: full local-first)
- Push notifications

### 4.2 للبايع

**الظهور:**
- صفحة كاملة
- ظهور مجاني
- بدون عمولة
- QR Code مخصص

**الإحصائيات:**
- زوار (يومي/أسبوعي/شهري)
- اتصالات واتساب
- مكالمات
- تقارير PDF

**إدارة النشاط:**
- تعديل مباشر
- رفع صور + منيو
- إدارة الفروع
- رد على التقييمات

**الإشعارات:**
- تقييم جديد
- رد على تقييم
- طلب جديد
- مشتري جديد
- تقرير أسبوعي
- انتهاء اشتراك (3 أيام قبل) — مقفل

**المتابعة (Followers):**
- عملاء يتابعوك
- إشعار فوري عند نزول عرض
- CRM بسيط
- تصدير CSV

### 4.3 تجربة الـ 30 يوم

- 30 يوم تجربة مجانية لأي باقة
- مؤقت احترافي في لوحة التحكم
- إشعارات: 7 أيام / 3 أيام / يوم
- صفحة ترقية عند الانتهاء
- بيانات محفوظة

### 4.4 نظام التحكم الكامل

**للمميز:**
- featured_pin boolean
- featured_order int (1-10)
- featured_until date
- Rolling shuffle (seed تاريخي)

**للإعلانات:**
- status: active / paused / expired / scheduled
- start_date + end_date
- Auto-pause
- Manual pause فوري

**للباقات:**
- status: trial / active / expired / cancelled / pending
- auto-renew
- Cron يومي
- تمديد يدوي من Admin

### 4.5 نظام النقاط

**كسب النقاط:**
- تسجيل دخول يومي — 5 نقاط
- تصفح 5 أنشطة — 3 نقاط
- مشاهدة 30s+ — 2 نقاط
- كتابة تقييم — 20 نقطة
- تقييم مع صورة — 30 نقطة
- إضافة للمفضلة — 3 نقاط
- متابعة نشاط — 5 نقاط
- مشاركة على واتساب — 8 نقاط
- طلب عبر واتساب (يأكده البايع) — 25 نقطة
- دعوة صديق (يسجل) — 30 نقطة
- دعوة صديق (أول طلب) — 100 نقطة

**المستويات:**
- Bronze: 0-499 (1x نقاط)
- Silver: 500-1,999 (1.25x + 5% خصم إعلانات)
- Gold: 2,000-4,999 (1.5x + 10% خصم)
- Platinum: 5,000-9,999 (2x + 15% خصم)
- Diamond: 10,000+ (3x + 25% خصم)

**استخدام النقاط:**
- عرض في نشاط — 500 نقطة
- كوبون 10% — 800 نقطة
- كوبون 20% — 1,500 نقطة
- توصيل مجاني — 1,200 نقطة
- ترقية مؤقتة — 3,000 نقطة

### 4.6 WhatsApp Orders (مهم جداً)

- رسالة واتساب **غير قابلة للتعديل** قبل الإرسال
- **بدون أي تلاعب** في القيم أو المحتوى
- **تأكيد من البايع خلال 10 دقايق**
- المشتري يشوف الرد (وافق/رفض) في الوقت الفعلي
- كل حاجة تتسجل (Audit Log)
- أي تلاعب: تحذير × 2 → حظر (مراجعة يدوية)

### 4.7 التقييم بعد التجربة

- إشعار بعد **ساعة من الطلب**
- المستخدم يقيّم النشاط
- التقييم يتسجل كـ "تجربة حقيقية"
- يميزه عن التقييمات العامة

### 4.8 الأقسام المقفلة

**محتوى محمي للمسجلين فقط:**
- رقم التواصل
- التعليقات
- إضافة للمفضلة
- المتابعة
- الموقع
- التواصل على فيسبوك / واتساب
- المنيو

**العرض:** banner واضح "سجّل عشان تستفيد"

---

## 5. الأمان والتزامن والسرعة

### الأمان
- RLS كامل
- Service-role فقط للحساس
- Rate limiting
- Server-side hashing
- Turnstile / Cloudflare
- صفر secrets في Git
- CSP صارم
- HTTPS إجباري

### التزامن
- Supabase Realtime
- Optimistic updates
- Retry logic
- Offline queue
- Push notifications
- صفر polling غير ضروري

### السرعة
- unstable_cache (module-level)
- createPublicClient (بدون cookies)
- Cloudinary transforms (WebP + AVIF)
- Lazy loading
- CSS-only splash
- صفر animations مستمرة
- هدف Lighthouse: 95+

### الوصول السهل
- PWA كامل
- Bottom sheet على الموبايل
- ARIA labels
- Keyboard navigation
- iPhone SE (320px) → 4K

---

## 6. الصفحات الكاملة

### عامة
`/`, `/explore`, `/offers`, `/trends`, `/new`, `/featured`, `/businesses/[slug]`, `/about`, `/contact`, `/pricing`, `/advertise`, `/support-palestine`, `/terms`, `/privacy`, `/cookies`

### محمية
`/auth`, `/auth/recover`, `/auth/change-password`, `/account`, `/account/edit`, `/account/points`, `/account/loyalty`, `/account/orders`, `/account/referral`, `/account/verify`, `/account/security`, `/account/following`, `/notifications`

### بايع
`/merchant`, `/merchant/apply`, `/merchant/orders`, `/merchant/offers`, `/merchant/subscription`, `/merchant/settings`

### أدمن
`/admin`, `/admin/businesses`, `/admin/users`, `/admin/subscriptions`, `/admin/analytics`, `/admin/ads`, `/admin/moderation`, `/admin/audit`, `/admin/studio`, `/admin/notifications`, `/admin/featured`, `/admin/settings`

---

## 7. لوحة التحكم

### الأقسام
- Dashboard
- إدارة الأنشطة
- إدارة المستخدمين
- الاشتراكات والباقات
- التحليلات
- الإعلانات
- المراجعة
- سجل التدقيق
- Design Studio
- الإشعارات
- الإعدادات

### المعايير
- سريعة (< 1s)
- محمية (RLS + role)
- تعمل على الموبايل
- قابلة للتوسع

---

## 8. نظام الإشعارات

### للمشتري
- عرض جديد من نشاط متابع
- رد على تقييمي
- تحديث نشاط قريب
- نقاط جديدة
- عروض حصرية (اختياري)
- كوبونات (اختياري)
- إشعارات المنصة

### للبايع
- تقييم جديد
- رد على تقييم
- طلب جديد
- مشتري جديد
- تقرير أسبوعي
- انتهاء اشتراك (مقفل)
- إشعار إداري (مقفل)

### iOS 16.4+
- Web Push مدعوم
- App Badging API

---

## 9. التثبيت والتجاوب

### PWA
- Manifest كامل
- Service Worker
- Install Banner (مرة واحدة)
- Offline-First

### التجاوب
| الجهاز | العرض | التخطيط |
|--------|------|---------|
| iPhone SE | 320px | 1 column |
| iPhone 14 | 393px | 1 column |
| iPad Mini | 768px | 2 column |
| iPad Pro | 1024px | 2-3 column |
| Laptop | 1440px | 3-4 column |
| 4K | 2560px+ | Max-width 1280px |

---

## 10. البوت + AI Assistant

### البوت
- صفحة /about شاملة
- Presentation Mode (PDF للـ Pitch)
- مركز تحديثات (منفصل للمشتري / للبايع)
- صندوق أسود

### AI Assistant (مجاني)
- مساعد ذكي داخل المنصة
- صوت + كتابة
- لهجة مصرية شعبية
- يعمل في كل مكان

### Support Bot (منفصل)
- يحل مشاكل فنية
- يوفر وقت الدعم

---

## 11. المشاركة + QR

- Native share
- Social: WhatsApp / Facebook / X / Telegram
- Copy link
- QR Code لكل صفحة
- OG Image ديناميكي

---

## 12. دعم فلسطين

- شارة دائمة في الفوتر
- صفحة /support-palestine
- 2% من دخل الباقات
- صندوق دعم

---

## 13. الفوتر

1. اللوجو الكامل
2. 3 كروت تواصل
3. 4 أعمدة (اكتشف / للبياعين / عننا / قانوني)
4. شريط فلسطين
5. التوقيع: NourEldin B7R (Script، ذهبي)
6. الحقوق: 2026 EAH
7. الإصدار: من `docs/PROGRESS.md` (§26)

---

## 14. SEO + Integrations

### LocalBusiness Schema
- JSON-LD على كل صفحة نشاط

### Google Business Profile
- ربط كل نشاط بـ GBP
- مزامنة تلقائية

### Agentic Web
- صفحات نظيفة + semantic
- Public API للقراءة
- ذكر EAH في كل بيانات

---

## 15. القواعد الذهبية

### ممنوعات
1. تعديل بدون سبب
2. شيل features
3. commit بدون typecheck
4. deploy بدون preview + موافقة
5. build محلي (SIGILL)
6. تعديل Schema بدون سؤال
7. secrets في Git
8. img بدون Cloudinary
9. animations مستمرة
10. content-visibility على الأساسي
11. unstable_cache جوه component
12. createClient في public reads
13. emojis في UI

### مسموحات
1. features (بعد موافقة)
2. bug fixes
3. perf improvements
4. security (بعد شرح)
5. docs
6. CHANGELOG

### سير العمل
1. اقرأ
2. اسأل
3. استنى موافق
4. عدّل حاجة واحدة
5. typecheck
6. خلص
7. استنى

---

## 16. البنية التقنية

- Next.js 16 + React 19 + TS
- CSS Modules
- Supabase (Postgres + Auth + Realtime)
- Cloudinary
- Vercel
- Web Push (VAPID)

### هيكل
EAH/
  docs/          ← 24 ملف وثائق
  web/           ← Next.js app
    app/
    components/
    lib/
    public/
    proxy.ts
    next.config.ts
    package.json
  CHANGELOG.md

---

## 17. خطة التنفيذ

- أسبوع 1: أساس (Auth + Home + Explore)
- أسبوع 2: تفاعل (Account + Merchant + Admin)
- أسبوع 3: متقدم (Offers + Reviews + Analytics)
- أسبوع 4: إطلاق (PWA + SEO + Testing)

التفاصيل: ROADMAP.md

---

## 18. الرسالة للشات الجديد

اقرأ بالترتيب:
MASTER_BRIEF → AI_CONTRACT → SACRED → LESSONS → STRUCTURE → SECURITY → CODE_STANDARDS → DEBUGGING → PRODUCTION_CHECKLIST → DATABASE_RULES → AI_HANDOFF → PROGRESS → TODO → SESSION_LOG → AUDIT_PLAN.

قول: قرأت. جاهز. واستنى.

القواعد:
1. ممنوع أي تعديل بدون سؤالي
2. typecheck قبل كل commit
3. deploy بعد preview + موافقي
4. build محلي ممنوع
5. أي مشكلة → قف واسأل

الأولويات:
1. السرعة (Lighthouse 95+)
2. الأمان (RLS + auth + rate limiting)
3. التزامن (realtime + offline)
4. التصميم (نيون ناعم)
5. التجاوب (320px → 4K)

---

## 19. الخلاصة

EAH منصة اكتشاف محلية مصرية. مجانية للمشتري، بدون عمولة على البايع. الربح من باقات + إعلانات. تصميم 2026 نيون ناعم. تقنية نظيفة، سريعة، آمنة، offline-capable.

التوقيع: NourEldin B7R — فلسطين في القلب
