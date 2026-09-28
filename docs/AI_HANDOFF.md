# EAH — AI Handoff

> تسليم سريع لأي AI/مطور.

**آخر تحديث:** 2026-09-28
**الإصدار:** v2.2.0-alpha

---

## 0. ابدأ من هنا

**الترتيب الكامل في FILE_ORDER.md** — المصدر الوحيد.

بعد القراءة: "قرأت. جاهز." واستنى.

---

## 1. هيكل الريبو

- docs/ — الوثائق (24 ملف)
- web/ — Next.js app
- CHANGELOG.md

---

## 2. الحالة الحالية

**✅ خلص:**
- Core كامل (Config + Auth + Supabase + Design + PWA)
- Home كامل (Hero + 7 sections + Suggested)
- 5 صفحات أقسام (/trends /offers /new /nearby /suggest)
- /explore كامل (search + filters + load more)
- /featured كامل (grid + load more)
- /about + Presentation Mode
- Business Card موحّد (كل الأقسام)
- SectionNav (8 أيقونات + tooltips)
- ScrollToTop + Loading Skeletons
- Performance: Home 6→2 queries + TTL 300s

**⏳ جاي:**
- Footer كامل
- Account (/account/*)
- Merchant (/merchant/*)
- Admin (/admin/*)
- Business Page كاملة

---

## 3. التقنيات

- Next.js 16 + React 19 + TypeScript strict
- CSS Modules (مفيش Tailwind)
- Supabase (DB + Auth + Storage)
- Cloudinary (لما ننقل)
- Vercel (hosting)

---

## 4. القواعد الذهبية

1. ممنوع تعديل بدون سؤال (SACRED files)
2. typecheck قبل كل commit — npx tsc --noEmit
3. build محلي ممنوع (SIGILL)
4. commits صغيرة
5. استخدم WmImage لكل صورة
6. السلوجان: "اللي نفسك فيه ؟"
7. الهوك: "شبيك لبيك .. كل حاجة حواليك"
8. الستيكر: "من قلب شبين القناطر"

---

## 5. أوامر مهمة

من مسار web/:
- npx tsc --noEmit — typecheck
- npm run dev — dev server
- rm -rf .next — لو dev بطيء

---

## 6. Supabase

- Project ID: npmpiivmdksdirrumbmt (Frankfurt)
- Env keys: في web/.env.local
- DB: 53 نشاط
- RLS: 100% enabled
- Tables: ~30
- Functions: ~95

⚠️ أي تعديل DB → migration جديدة
⚠️ ممنوع تعديل auth.users مباشرة

---

## 7. المشاكل المعروفة

1. SIGILL في npm run build محلي → استخدم Vercel Preview
2. 'unsafe-inline' في CSP → مؤقت (Next.js 16)
3. Unsplash في next.config.ts → مؤقت
4. terminal heredoc + nano للعربي → بيلخبط — استخدم base64 أو Python

---

## 8. مسار سريع

لو عايز تبدأ شغل:
1. cd ~/EAH-V2/web && npx tsc --noEmit — تأكد نظيف
2. cat ~/EAH-V2/docs/PROGRESS.md — شوف الحالة
3. cat ~/EAH-V2/docs/SESSION_LOG.md — آخر جلسة
4. استنى تعليمات NourEldin

لو الشات اتقطع:
1. اقرأ الملف ده كامل
2. اقرأ PROGRESS.md + SESSION_LOG.md
3. قول: "قرأت. جاهز." واستنى

---

## 9. الهوية

- الاسم: EAH
- السلوجان: اللي نفسك فيه ؟
- الهوك: شبيك لبيك .. كل حاجة حواليك
- الستيكر: من قلب شبين القناطر
- الخلفية: #07020D
- البنفسجي: #9D4EDD / #A855F7 / #C77DFF
- الذهبي: #E8C79A / #F5D9A7
- الخط: Cairo Variable + Tajawal Variable
- الستايل: نيون ناعم، dark-only، 2026/2027

---

## 10. الملفات المقدسة (SACRED)

**القائمة الكاملة في SACRED.md قسم 4** — المصدر الوحيد.

---

## 11. الإصدارات

- v2.2.0-alpha — الحالي (Business + Account + Merchant + Admin)
- v2.1.0-alpha — Home + Pages + Performance
- v2.0.0-alpha — Core كامل
- v0.1.0 — Foundation

---

آخر تحديث: 2026-09-28
المالك: NourEldin B7R — فلسطين في القلب
