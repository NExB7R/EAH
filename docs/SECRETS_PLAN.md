# EAH — خطة إدارة المفاتيح والأمان (مؤجل)

> ⚠️ **مؤجل لبعد ما نخلص الميزات الأساسية — وقبل المدفوعات.**

**آخر تحديث:** 2026-10-08

---

## 🎯 السبب

أثناء التطوير السريع (2026-10-04 → 2026-10-05) اتبعتت مفاتيح في الشات بشكل غير آمن:

| المفتاح | التسرّب | الخطورة | الحالة |
|---------|---------|---------|--------|
| `GROQ_API_KEY` | 2026-10-05 | 🟠 متوسط | لسه |
| `GEMINI_API_KEY` | 2026-10-05 | 🟡 منخفض | لسه |
| `TURNSTILE_SECRET_KEY` | 2026-10-05 | 🔴 عالي | **2026-10-08 — اتكشف تاني** |
| `UPSTASH_REDIS_REST_TOKEN` | 2026-10-05 | 🔴 عالي | لسه |
| **`TURNSTILE_SITE_KEY`** | **2026-10-08** | **🟢 منخفض** | **public — بسيط** |
| **`TURNSTILE_SECRET_KEY` (نسخة جديدة)** | **2026-10-08** | **🔴 عالي** | **لسه في الشات** |

**الحالة الحالية:** مفيش ضرر عملي (الشات مش منشور)، بس لازم rotate قبل الإطلاق.

---

## 🔴 Turnstile — حالة طارئة (2026-10-08)

**اللي حصل:**
- مفاتيح Turnstile الجديدة (Production) اتكشفت في شات AI
- Production شغال بالمفاتيح الجديدة (بعد fix CSP + nonce)
- **خطر:** أي حد شاف الشات يقدر يستخدم الـ Secret للتلاعب

**Turnstile Site Key vs Secret:**
- **Site Key** (`0x4AAAAAAFKj0MmPWv_YfMRl`) — **public** ✅ (بيظهر في HTML)
- **Secret Key** (`0x4AAAAAAFKj0MTzyprLAN...`) — **سري** 🔴

**الإجراء الفوري (15 دقيقة):**
1. Cloudflare Dashboard → Turnstile → EAH widget
2. **Rotate Secret Key**
3. تحديث Vercel: `TURNSTILE_SECRET_KEY` (Production + Preview + Development)
4. تحديث `.env.local`
5. Redeploy Vercel
6. اختبار `/auth` — Signup لازم يشتغل

**السبب:** تحذير §31 — المفتاح اتبعت في شات، حتى لو داخلي.

---

## ⏰ متى ننفذ

**الشرط:** بعد ما نخلص الميزات الأساسية + قبل أول دفعة مدفوعة (Vercel Pro).

**الترتيب:**
1. نخلص كل features من `NEXT_SESSION.md`
2. نعمل اختبار ميداني شامل
3. **rotate كل المفاتيح** ← قبل المدفوعات
4. نعمل نظام إدارة مفاتيح آمن
5. نطلق

---

## 🔐 قائمة المفاتيح اللي هتتغير

### التسجيل في كل خدمة (لو لسه مش مسجل):

| الخدمة | الموقع | نوع المفتاح |
|--------|--------|-------------|
| Groq | console.groq.com/keys | API Key |
| Google Gemini | aistudio.google.com/apikey | API Key |
| OpenRouter | openrouter.ai/keys | API Key |
| Cloudflare Turnstile | dash.cloudflare.com | Secret Key + Site Key |
| Upstash Redis | console.upstash.com | REST Token + URL |
| Supabase | supabase.com/dashboard | URL + anon + service_role |
| Cloudinary | console.cloudinary.com | Cloud Name + Key + Secret |
| VAPID (Push) | web-push-codelab.glitch.me | Public + Private |
| Resend (لو استخدم) | resend.com | API Key |

---

## 🛠️ نظام إدارة المفاتيح الآمن (القرار المطلوب)

### خيار A: 1Password / Bitwarden (موصى به)

**Bitwarden Free:**
- مجاني للأبد
- Vaults مشفرة (AES-256)
- Secure Notes للمفاتيح
- مشاركة لو فيه فريق
- **رابط:** bitwarden.com

**الاستخدام:**
- Vault: "EAH Production"
- كل مفتاح في Secure Note منفصل
- ملاحظات: الموقع، تاريخ الإنشاء، تاريخ آخر rotate

### خيار B: Vercel Environment Variables (للإنتاج)

- كل المفاتيح في Production env
- **مش محلياً**
- حد يوصله → محتاج صلاحية Vercel
- **الأفضل للإنتاج**

### خيار C: نسخة مشفرة محلية

- ملف `secrets.gpg` مشفر
- مفتاح التشفير في مكان آمن
- Backup على USB + Cloud

**التوصية:** **A + B** — Bitwarden للتخزين، Vercel للإنتاج.

---

## 📋 خطة التنفيذ (بعد ما نخلص الميزات)

### المرحلة 1 — التجهيز (30 دقيقة)

- [ ] حساب Bitwarden (مجاني)
- [ ] Vault: "EAH Production"
- [ ] Secure Notes لكل مفتاح

### المرحلة 2 — Rotate (ساعة)

- [ ] **🔴 Turnstile: Rotate Secret فوراً** ← 2026-10-08 exposure
- [ ] Groq: امسح القديم → جديد
- [ ] Gemini: امسح القديم → جديد
- [ ] OpenRouter: rotate
- [ ] Upstash: Rotate Token
- [ ] Supabase: rotate service_role (بحذر شديد)
- [ ] Cloudinary: rotate (لو مستخدم)
- [ ] GitHub PAT: rotate (إن وجد)

### المرحلة 3 — التوثيق

- [ ] كل مفتاح في Bitwarden
- [ ] تاريخ Rotate لكل مفتاح
- [ ] توثيق في `SECRETS.md` (بدون المفاتيح نفسها)

### المرحلة 4 — Vercel Setup

- [ ] إضافة كل المفاتيح لـ Vercel Production
- [ ] `.env.local` جديد (نظيف)
- [ ] حذف `.env.local` القديم
- [ ] التأكد: `gitleaks` يشتغل تمام

### المرحلة 5 — Backup

- [ ] نسخة مشفرة من المفاتيح في Bitwarden
- [ ] Backup على USB (لحالات الطوارئ)
- [ ] كلمة سر Bitwarden في مكان آمن منفصل

---

## 🚫 قواعد صارمة (للمستقبل)

### ممنوع
- ❌ `cat .env.local` في terminal
- ❌ `source .env.local` في terminal
- ❌ `echo "KEY=value" >> .env.local` بمفتاح مكشوف
- ❌ إرسال مفتاح في أي شات
- ❌ مفتاح في كود (hardcoded)
- ❌ مفتاح في `git commit`

### مسموح
- ✅ `grep "^KEY_NAME=" .env.local | head -c 20` (للتأكد)
- ✅ `node -e "require('dotenv').config(); console.log(process.env.KEY ? 'OK' : 'MISSING')"`
- ✅ فتح `.env.local` بمحرر (nano/vim/VS Code) — بس متصورش ومتبعتش

### بعد كل rotate
- ✅ تحديث `.env.local`
- ✅ تحديث Vercel Production
- ✅ تحديث Bitwarden
- ✅ كتابة التاريخ في `SECRETS.md`

---

## 📊 جدول Rotate الدوري

| المفتاح | كل |
|---------|-----|
| Groq | 3 شهور |
| Gemini | 3 شهور |
| OpenRouter | 3 شهور |
| Turnstile | 6 شهور |
| Upstash | 6 شهور |
| Supabase service_role | سنة (بحذر) |
| Cloudinary | سنة |

---

## 🔗 المراجع

- `docs/SECURITY.md` — الحمايات العامة
- `docs/LESSONS.md` — دروس الأخطاء

---

## ⚠️ التذكير النهائي

**قبل أي دفعة مدفوعة (Vercel Pro / Supabase Pro) — لازم:**
1. كل المفاتيح rotated
2. Bitwarden محدّث
3. Vercel Production محدّث

**لو حصل تسريب مفتاح في المستقبل:**
1. rotate فوراً
2. تحقق من Logs الخدمة
3. سجّل في `LESSONS.md`

---

آخر تحديث: 2026-10-05
