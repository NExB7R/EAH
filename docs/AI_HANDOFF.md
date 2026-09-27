# EAH — AI Handoff

> تسليم سريع لأي AI/مطور.

**آخر تحديث:** 2026-09-27
**الإصدار:** v2.1.0-alpha

---

## 0. ابدأ من هنا

اقرأ بالترتيب:

1. MASTER_BRIEF.md
2. AI_CONTRACT.md
3. SACRED.md
4. LESSONS.md
5. STRUCTURE.md
6. SECURITY.md
7. CODE_STANDARDS.md
8. DEBUGGING.md
9. PRODUCTION_CHECKLIST.md
10. DATABASE_RULES.md
11. AI_HANDOFF.md (هذا الملف)
12. PROGRESS.md
13. TODO.md
14. SESSION_LOG.md

بعدها: "قرأت. جاهز." واستنى.

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
4. terminal paste للعربي → بيلخبط — استخدم nano أو base64

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

ممنوع تعديل بدون موافقة صريحة:
- components/home-hero.tsx
- components/featured-bento.tsx
- components/row-carousel.tsx
- components/business-card.tsx
- components/floating-capsule.tsx
- components/menu-drawer.tsx
- lib/data/businesses.ts
- lib/ranking.ts
- lib/supabase/public.ts
- proxy.ts
- next.config.ts
- app/layout.tsx
- app/page.tsx
- app/globals.css

---

## 11. الإصدارات

- v2.1.0-alpha — الحالي (Home + Pages + Performance)
- v2.0.0-alpha — Core كامل
- v0.1.0 — Foundation

---

آخر تحديث: 2026-09-27
المالك: NourEldin B7R — فلسطين في القلب
