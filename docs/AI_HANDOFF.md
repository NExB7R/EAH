# EAH — AI Handoff

> تسليم سريع لأي AI/مطور.

**آخر تحديث:** 2026-09-25
**الإصدار:** v2.0.0-alpha

---

## 0. ابدأ من هنا

1. اقرأ MASTER_BRIEF.md + AI_CONTRACT.md + SACRED.md
2. اقرأ LESSONS.md
3. اقرأ PROGRESS.md
4. اقرأ SESSION_LOG.md
5. قول "قرأت. جاهز." واستنى

---

## 1. هيكل الريبو

- docs/ — الوثائق
- web/ — Next.js app
- CHANGELOG.md

---

## 2. الحالة الحالية

**✅ خلص:**
- `.env.example` + `next.config.ts` + `tsconfig.json`
- `globals.css` (design tokens) + fonts
- `lib/supabase/*` (4 clients)
- `proxy.ts` (session refresh)
- Auth كامل (`/auth` + actions + recover + logout)
- Design System (icons + logo + splash)
- PWA basics (favicon + icons + manifest)
- `lib/data.ts` + `lib/ranking.ts`
- Watermark overlay (`WmImage`)

**⏳ جاي:**
- Home (Hero + Bento + Strips + Footer)
- Explore
- Business Page
- Account + Merchant
- Admin

---

## 3. التقنيات

- **Next.js 16** + **React 19** + **TypeScript strict**
- **CSS Modules** (مفيش Tailwind)
- **Supabase** (DB + Auth + Storage)
- **Cloudinary** (لما ننقل)
- **Vercel** (hosting)

---

## 4. القواعد الذهبية

1. **ممنوع تعديل بدون سؤال** (SACRED files)
2. **typecheck قبل كل commit**
3. **build محلي ممنوع** (SIGILL)
4. **commits صغيرة**
5. **استخدم `WmImage`** لكل صورة (ما عدا avatars)
6. **السلوجان:** "اللى نفسك فيه ؟" (ثابت)
7. **الهوك:** "شبيك لبيك .. كل حاجة حواليك"
8. **الستيكر:** "من قلب شبين القناطر"

---

## 5. أوامر مهمة

```bash
# من ~/EAH-V2/web
npx tsc --noEmit          # typecheck
npm run dev               # dev server
rm -rf .next              # لو dev بطيء

---

## 6. Supabase

- **Project ID:** `npmpiivmdksdirrumbmt` (Frankfurt, eu-central-1)
- **Env keys:** في `web/.env.local`
- **DB:** 53 نشاط تجريبي
- **RLS:** 100% enabled
- **Functions:** ~95
- **Tables:** profiles, businesses, business_media, business_reviews, offers, order_requests, notifications, favorites, follows, points_log, user_roles, +10

**⚠️ أي تعديل DB → migration جديدة في `docs/migrations/`**

**⚠️ ممنوع تعديل `auth.users` مباشرة — استخدم Admin API**

---

## 7. المشاكل المعروفة

1. **SIGILL** في `npm run build` محلي → استخدم Vercel Preview.
2. **`'unsafe-inline'` في CSP** → مؤقت (Next.js 16 محتاج).
3. **Unsplash في `next.config.ts`** → مؤقت (لما ننقل Cloudinary).
4. **terminal paste للعربي** → بيلخبط. تحقق بـ `wc -l` + `tail` بعد كل كتابة.
5. **`AI_HANDOFF.md` + `SCHEMA.sql`** → ناقصين شوية.

---

## 8. مسار سريع

**لو عايز تبدأ شغل:**

1. `cd ~/EAH-V2/web && npx tsc --noEmit` → تأكد نظيف.
2. `cat ~/EAH-V2/docs/PROGRESS.md` → شوف الحالة.
3. `cat ~/EAH-V2/docs/SESSION_LOG.md` → آخر جلسة.
4. **استنى تعليمات NourEldin.**

**لو الشات اتقطع:**
1. اقرأ الملف ده كامل.
2. اقرأ `PROGRESS.md` + `SESSION_LOG.md`.
3. قول: "قرأت. جاهز." واستنى.

---

## 9. الهوية (مختصر)

- **الاسم:** EAH
- **السلوجان:** اللي نفسك فيه ؟
- **الهوك:** شبيك لبيك .. كل حاجة حواليك
- **الستيكر:** من قلب شبين القناطر
- **الخلفية:** `#07020D`
- **البنفسجي:** `#9D4EDD` / `#A855F7` / `#C77DFF`
- **الذهبي:** `#E8C79A` / `#F5D9A7`
- **الخط:** Cairo Variable + Tajawal Variable
- **الستايل:** نيون ناعم، dark-only، 2026/2027

---

## 10. الملفات المقدسة (SACRED)

**ممنوع تعديل بدون موافقة صريحة:**

- `components/home-hero.tsx` + `.css`
- `components/home-dynamic-v2.tsx`
- `components/section-slider-v2.tsx` + `.css`
- `components/simple-flip-card.tsx` + `.css`
- `components/floating-capsule.tsx` + `.css`
- `components/site-footer.tsx` + `.css`
- `lib/data.ts`
- `lib/ranking.ts`
- `lib/personalization.ts`
- `lib/supabase-server.ts`
- `lib/supabase-browser.ts`
- `proxy.ts`
- `next.config.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`

**⚠️ بس `lib/data.ts` + `lib/ranking.ts` اتعملوا من الصفر في v2 — فمش تعديل.**

---

## 11. الإصدارات

- **v2.0.0-alpha** — الحالي (Core كامل، Home جاي)
- **v0.1.0** — Foundation (2026-09-24)

---

**آخر تحديث:** 2026-09-25
**المالك:** NourEldin B7R — فلسطين في القلب 🇵🇸
