# EAH — ذاكرة المشروع (Cross-Chat Memory)

> **مهم:** هذا الملف هو نقطة البداية لأي شات جديد. **اقرأه بالكامل قبل أي إجراء.**
> آخر تحديث: 2026-09-13

---

## 1. الهوية الأساسية

- **الاسم:** EAH
- **السلوجان:** اللى نفسك فيه ؟
- **الجملة:** جمهورية شبين القناطر تتحدث...
- **المالك:** NourEldin B7R (GitHub: NExB7R)
- **الجمهور:** شباب الريف المصري
- **الميزانية:** 0 EGP مبدئيًا
- **الهدف الزمني:** 35 ساعة / أسبوع للـ MVP

---

## 2. البنية التقنية

| المكون | القيمة |
|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind |
| Backend | Supabase (Postgres + Auth + Storage + RLS) |
| Supabase Project | `npmpiivmdksdirrumbmt` (Frankfurt) |
| Hosting | Vercel (`eah-sq.vercel.app`) |
| Source | GitHub: `NExB7R/EAH` |
| Branch | `ui-onlook` (production) |
| Version | 0.2.x |

### بيئة التطوير
- Linux Mint 22.3، 2 cores، 3.7GB RAM
- **لا يوجد AVX** → Supabase CLI مش شغال → SQL Editor + pg_dump
- جهاز ضعيف → البناء بطيء، الكود لازم يكون خفيف

---

## 3. القواعد الذهبية (لا تُخترق)

1. **Git is the truth** — كل قرار موثّق في commit + ملف
2. **ممنوع `supabase db push`** — الملفات المحلية مش متطابقة مع Remote
3. **كل SQL يدويًا** في Supabase SQL Editor
4. **الـ commit + push** بعد كل تعديل معنى
5. **مفيش secrets في Git** — كل المفاتيح في `.env.local`
6. **Security first** — أي feature يتراجع أمنيًا قبل الدمج
7. **Batch deploy** — مش deploy كل 5 دقايق، بل عند اكتمال milestone
8. **Preserve prior functionality** — أي تعديل جديد ميكنش بيكسر حاجة قديمة

---

## 4. خارطة الطريق للجودة والأمان (من اتفاق 2026-09-13)

### المدى القصير (خلال التطوير)
- [ ] تحديث `README.md` — دليل شامل
- [ ] إنشاء `ARCHITECTURE.md` — شرح القرارات المعمارية
- [ ] استخدام Git branches بشكل صارم
- [x] إضافة `LICENSE` + إشعار حقوق
- [ ] إضافة `middleware.ts` لـ session refresh

### المدى المتوسط (قبل الإطلاق)
- [ ] تطبيق إخفاء الكود (Obfuscation) على النسخة الإنتاجية
- [ ] العلامات المائية للكود (Watermarking) لإثبات الملكية
- [ ] تأكيد MFA للحسابات الحساسة
- [ ] Security headers كاملة (CSP, HSTS, إلخ)

### المدى الطويل (للنمو والتوسع)
- [ ] تسجيل العلامات التجارية (اسم EAH + الشعار)
- [ ] إعداد اتفاقيات NDA لأي متعاون
- [ ] استشارة محامي ملكية فكرية
- [ ] عقد ترخيص تجاري واضح

### قواعد أمنية إلزامية (من SECURITY-HARDENING.md)
- تعديلات التاجر لا تكتب مباشرة على المحتوى الحي
- كل تعديل يحتاج مراجعة super_admin
- RLS + least privilege في كل مكان
- ممنوع service-role في الكود الأمامي
- كلمات السر يديرها Supabase Auth فقط
- الأذونات من الأدوار في DB، مش من metadata
- أي عملية حساسة تنتج audit record

---

## 5. الحالة الحالية (2026-09-13)

### ✅ شغال
- DB (23 جدول، 34 دالة، 46 RLS policy)
- 3 Storage buckets
- 30 business + 12 offer + 30 review (بيانات اختبار)
- `/admin` كاملة
- `/merchant` كاملة
- `/account`
- `/explore`, `/recommend`, `/offers`, `/businesses/[slug]`
- `/about`, `/contact`, `/terms`, `/privacy`
- Anti-manipulation v1 (contact_reveals + server-side hash + rate limit)
- Deploy على `eah-sq.vercel.app`

### ⚠️ ناقص
- `middleware.ts` (session refresh) ← **أولوية**
- Onboarding flow كامل بعد التسجيل
- PWA install prompt
- الإشعارات
- الترند الحقيقي (بيانات موجودة، query ناقص)
- Light/Dark toggle
- `/merchant/apply`
- Ban system كامل
- المساحة الإعلانية العائمة
- Git auto-deploy على Vercel

---

## 6. الأمن — ملخص ما تم

### contact_reveals
- جدول جديد لتسجيل الكشوف الفريدة
- Constraints: method_type whitelist + visitor_hash regex
- `reveal_contact` function:
  - SECURITY DEFINER + SET search_path = public
  - validation (method_type + visitor_hash)
  - pg_advisory_xact_lock لمنع race condition
  - 24h dedup per (business, method, visitor)
- Migration: `03-database/migrations/20260913000000_harden_reveal_contact.sql`

### API /api/reveal-contact
- Server-side hash derivation: SHA-256(salt | IP | UA | client_token)
- Rate limiting: 20/min per IP (in-memory، يحتاج Redis للإنتاج)
- Validation: UUID + method_type whitelist + token length
- Error codes: 400 validation، 429 rate limit، 500 server error

### Client (business-contact.tsx)
- يبعت `client_token` (UUID) بدل `visitor_hash`
- السيرفر هو اللي يحسب الـ hash النهائي

---

## 7. الدروس المستفادة (من جلسة 2026-09-13)

1. **الـ unique index على `date_trunc('day', ...)` مش IMMUTABLE** → استخدم advisory lock بدل
2. **الـ migration ممكن يتقطع** وأنت بتلصق → تحقق بـ `wc -l` بعد الكتابة
3. **`crypto.randomUUID()` مش 64-char hex** → لازم server-side derivation
4. **Vercel CLI بيعرض `UNKNOWN`** بس الـ deploy ناجح → تحقق بـ curl
5. **GitHub بيقع أحيانًا** → متعتمدش عليه كمسار وحيد
6. **الـ deploy بياخد وقت** → batch deploys بدل كل تعديل

---

## 8. الملفات المرجعية (اقرأها بالترتيب)

1. `PROJECT_MEMORY.md` ← **إنت هنا**
2. `MASTER_REQUIREMENTS.md` — المرجع الكامل للمتطلبات
3. `PROJECT_BIBLE.md` — الرؤية المعمارية
4. `SECURITY-HARDENING.md` — خطة الأمان
5. `00-project-status.md` — الحالة الحالية
6. `WORKLOG.md` — سجل الجلسات
7. `RELEASE_PROCESS.md` — عملية الإصدار
8. `03-database/migrations/` — كل migrations مطبقة

---

## 9. طريقة العمل مع الشات (مهم)

### لأي شات جديد:
1. **اقرأ هذا الملف أولاً**
2. **راجع `00-project-status.md` + آخر 5 commits** (`git log --oneline -5`)
3. **قبل أي تعديل:** تأكد إنه ما يكسرش حاجة موجودة
4. **بعد أي تعديل:** حدّث `WORKLOG.md` + `PROJECT_MEMORY.md` + commit

### لأي feature جديدة:
- اكتب في `WORKLOG.md` التاريخ + اللي اتعمل + اللي اتعلّم
- لو الأمن اتأثر → حدّث `SECURITY-HARDENING.md`
- لو المتطلبات اتغيرت → حدّث `MASTER_REQUIREMENTS.md`

### قواعد الترقيم:
- v0.1.x = Foundation
- v0.2.x = Discovery + UX + PWA
- v0.3.x = Merchant
- v0.5.x = Recommendations
- v0.9.x = Beta
- v1.0.0 = Launch

---

## 10. نبرة التواصل مع المالك

- شبابية، مصرية، صريحة
- بدون مقدمات طويلة
- أوامر copy-paste جاهزة
- لو فيه مشكلة، قولها مباشرة
- متخبيش الصعوبات

---

**آخر تحديث:** 2026-09-13
**آخر commit:** سيتم تسجيله بعد الإنشاء
