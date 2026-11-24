# EAH — Moderation & Abuse Plan

**آخر تحديث:** 2026-11-24
**الحالة:** TODO — للتطبيق بعد AI Knowledge Base
**الأولوية:** عالية (قبل الإطلاق)

---

## المبدأ

منصة تحمي المستخدمين من:
- السب والقذف
- التلاعب (تعليقات/تقييمات مزيفة)
- الروابط الخبيثة (phishing، spam)
- سلوك مسيء متكرر

**مع:**
- تحذير أول
- تخفيض trust_score تدريجي
- تصعيد لإجراءات صارمة
- إشعار فوري للأدمن
- تحكم كامل للأدمن

---

## الموجود حالياً (أساس جيد)

- trust_score + trust_tier في profiles
- audit_logs (12 عمود)
- business_reviews + business_comments
- notifications system
- report_wanted_level في profiles
- standing / standing_reason في profiles
- banned_until / ban_reason في profiles

---

## المطلوب بناؤه (6 مكونات)

### 1. Content Scanner (كشف آلي)

**الملف:** `lib/moderation/scan.ts`

- Regex للسب المصري (قائمة كلمات + variants)
- كشف الروابط المشبوهة (bit.ly, IP addresses, non-https)
- كشف التكرار (نفس النص 3+ مرات = spam)
- كشف التلاعب (تقييمات من نفس IP/device في يوم)

**النتيجة:** `{ severity: 'ok' | 'warn' | 'block', reason?, matches? }`

### 2. Trust Score Penalty

**الملف:** `lib/moderation/penalty.ts`

- `warn` = -5 نقاط
- `block` = -15 نقاط + إخفاء التعليق
- إعادة المخالفة في 30 يوم = خصم مضاعف
- 3 مخالفات = tier drop

**آلية:** trigger في DB أو server action

### 3. Warning System (للمستخدم)

**UI:**
- Modal عند أول مخالفة: "تنبيه: تعليقك فيه كلام غير لائق — تم إخفاؤه. تكرار المخالفة = تعليق الحساب"
- Notification في `/account/notifications`
- Badge على البروفايل (اختياري)

### 4. Escalation (تصعيد)

| المخالفات (30 يوم) | الإجراء |
|---|---|
| 1 | تحذير + -5 نقاط |
| 2 | تحذير ثاني + -15 نقاط |
| 3 | تعليق 7 أيام (`banned_until`) |
| 4 | حظر دائم + `standing = 'banned'` |

**الملف:** `lib/moderation/escalation.ts`

### 5. Admin Notification (فوري)

**عند أي `block`:**
- إشعار في `/admin/notifications` (أولوية عالية)
- push notification (لو مفعّل)
- metadata: المستخدم، المحتوى، النوع، trust_before/after
- رابط للتحكم

### 6. Admin Control Panel

**صفحة:** `/admin/moderation/abuse`

- قائمة بكل المخالفات (فلترة بالمستخدم/التاريخ/النوع)
- زر "رفع الحظر" / "خفض الحظر" / "حظر دائم"
- تعديل trust_score يدويًا
- تعليق الإجراء (whitelist المستخدم)
- عرض الروابط المشبوهة + السب

---

## الأمان (حرج)

- **لا false positives قاتلة:** الكلمة قد تكون جزء من اسم نشاط شرعي
- **قائمة بيضاء:** "قتل" في سياق "مطعم قتيل" ≠ "موت"
- **مراجعة بشرية** قبل الحظر الدائم
- **قابلية الاستئناف:** `/account/appeal`
- **GDPR-like:** المستخدم يقدر يحذف بياناته

---

## خطة التنفيذ (3-4 أيام)

| # | المهمة | الوقت |
|---|---|---|
| 1 | `scan.ts` (regex + URL detection) | نصف يوم |
| 2 | `penalty.ts` + DB trigger | نصف يوم |
| 3 | Warning UI + notification | نصف يوم |
| 4 | `escalation.ts` + cron | نصف يوم |
| 5 | Admin notification wiring | ربع يوم |
| 6 | `/admin/moderation/abuse` page | يوم |
| 7 | اختبار + false positives | نصف يوم |

**المجموع:** 3-4 أيام.

---

## قرارات معلّقة (تحتاج إجابتك)

1. **قائمة الكلمات؟** — من يحددها؟ (ثابتة في الكود أم table في DB للأدمن يعدّلها)
2. **AI لكشف السب** (بدل regex)؟ — يستخدم Groq (مجاني)
3. **الحظر الدائم يحتاج موافقة أدمن** أم تلقائي بعد 4 مخالفات؟
4. **الاستئناف:** هل نضيفه في V1 أم V2؟

---

## مرتبط بـ

- `docs/QUALITY_GATES.md` — Gate 4 (Security)
- `docs/RULES.md` — قواعد التطوير
- trust system الموجود (`lib/data/trust*`)
- `banned_until` في profiles
