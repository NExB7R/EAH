# EAH — Handoff Document for Next Chat

**آخر تحديث:** 2026-09-14
**الإصدار:** v0.2.0
**Branch:** `ui-onlook`
**Live:** eah-sq.vercel.app

---

## ⚠️ قواعد ذهبية لا تُخترق

1. **الجودة العالية هي الأساس** — مفيش أخطاء
2. **Git = source of truth** — مفيش نسخ موازية
3. **TypeScript نظيف دايماً** — `npx tsc --noEmit` قبل كل commit
4. **Runtime test** — تأكد الصفحات بترجع 200
5. **Additive only** — ما نكسرش الوظائف الموجودة
6. **مفيش بيانات ديمو**
7. **Next.js 16.3+ → `proxy.ts` مش `middleware.ts`**
8. **الأسرار في `.env.local` فقط** — ممنوع في chat/screenshot
9. **مفيش "بسيط كفاية"** — كل حاجة احترافية 2026
10. **كل patch → TS + Runtime + smoke test**

---

## 📚 الوثائق المرجعية

- `MASTER_REQUIREMENTS.md` — المتطلبات
- `PROJECT_BIBLE.md` — الرؤية
- `PROJECT_MEMORY.md` — دروس الجلسات
- `MASTER_REDESIGN_PLAN.md` — الخطة
- `00-project-status.md` — الحالة
- `SECURITY-HARDENING.md` — الأمان
- `RELEASE_PROCESS.md` — الإصدار

---

## 🏗️ المعمارية

- **Frontend:** Next.js 16.3.4 + React 19 + TypeScript + Tailwind + Custom CSS
- **Backend:** Supabase (`npmpiivmdksdirrumbmt`, Frankfurt eu-central-1)
- **DB:** Postgres + Auth + Storage + RLS
- **Hosting:** Vercel (لما يتربط GitHub)

---

## 🔑 ENV Variables

في `.env.local` + Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (أو `_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (Secret — يتخطى RLS)
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_SUBJECT`
- `CRON_SECRET`

---

## 📦 اللي خلص (v0.2.0)

### Core
- Auth + proxy.ts + onboarding + personalization
- Real trends RPC + push notifications + subscriptions (30d trial)
- PWA + SEO (OG per business + JSON-LD) + referrals + rewards

### Admin Panel
- Overview + businesses + change-requests + merchants + users
- Analytics + audit timeline + subscriptions + rewards + referrals
- Offers + ads + reviews + security

### Public Pages
- `/` `/explore` `/offers` `/recommend` `/trends`
- `/about` `/pricing` `/privacy` `/terms` `/cookies` `/contact`
- `/businesses/[slug]` + OG + JSON-LD
- `/merchant/apply` with "أخرى" option

### Design System
- Floating capsule (glassmorphism + compact-scroll + verified badge)
- Card stagger animations + slider pause + reduced-motion
- Modern share menu + brand scrollbar

---

## 🔴 Known Issues / TODO

### عاجل (يدوي)
- 🔴 **Rotate SUPABASE_SERVICE_ROLE_KEY** — اتكشف في محادثة
- 🔴 **Vercel env vars** — SERVICE_ROLE_KEY + CRON_SECRET
- 🟡 **WhatsApp + Facebook** — يُستكمل

### متوسط
- 🟠 Rate limit in-memory → Upstash Redis
- 🟠 Custom SMTP (Resend/SendGrid)
- 🟠 CSP + Security Headers
- 🟠 Error tracking (Sentry)
- 🟠 Backup strategy

### منخفض
- 🟡 page_view_events cleanup cron
- 🟡 PWA screenshots + shortcuts
- 🟡 تلميع "اشرب حاجة" text

---

## 🎨 Design Principles

- **خلفية:** `#07060B`
- **نيون بنفسجي:** `#A855F7` / `#8B5CF6`
- **نصوص:** `#E8E4F5` / `#F5F0E8`
- **Glassmorphism** + blur + saturate
- **Animations:** بطيئة 0.3-0.55s, `cubic-bezier(0.22, 1, 0.36, 1)`
- **RTL** دايماً

---

## 🚦 Workflow

لكل تغيير:
1. Backup: `cp file /tmp/eah-XX/file.bak`
2. Patch: Python regex أو `cat > file <<'TSXEOF'`
3. TS: `npx tsc --noEmit`
4. Runtime: `curl -s -o /dev/null -w "%{http_code}"`
5. Commit واضح
6. Push: `git push origin ui-onlook`

في النهاية:
- Migration → Supabase SQL Editor
- Env → `.env.local` + Vercel

---

## ⚡ Pitfalls

- `middleware.ts` انتهى → `proxy.ts`
- Python regex `\1\n\2` بيلزق الأسطر → استخدم lambda
- `JSX.Element` مش موجود في React 19 → `React.ReactNode`
- Service Role: `createServiceClient()` (مش `createClient`)
- `page_view_events.visitor_id` → `uuid` مش text
- `noUnusedLocals: false` يخفي أخطاء imports

---

## 🎯 الخطوات القادمة

### عاجل (يدوي)
1. Rotate service role key
2. Vercel env vars
3. WhatsApp/Facebook links

### في الكود
1. Rate limiting → Upstash
2. Custom SMTP
3. Security headers
4. Error tracking
5. PWA screenshots
6. Backup strategy

### المعاينة
- **Preview 2** — جولة شاملة في المتصفح + audit بصري

---

**القاعدة الأخيرة:** لو شكيت — **اسأل قبل التنفيذ**. الجودة أهم من السرعة.

---

## Connection Status (2026-09-14)

| النظام | الحالة | ملاحظات |
|--------|--------|---------|
| Git | OK | ui-onlook synced |
| Vercel | تحذير | كل deploys Preview — يحتاج Production Branch |
| Supabase | OK | npmpiivmdksdirrumbmt |
| Push VAPID | تحذير | يحتاج Vercel env |
| Cron | تحذير | يحتاج CRON_SECRET |
| Service Role | خطر | rotate فوراً |

## خطوات حرجة

1. Rotate SUPABASE_SERVICE_ROLE_KEY
2. Vercel Production Branch = ui-onlook
3. Vercel Env Vars: SERVICE_ROLE + CRON_SECRET + VAPID keys
4. Deploy Hooks → Redeploy
5. ابدأ FEATURES_TODO من #1

## Contact

- WhatsApp: يستكمل
- Facebook: يستكمل
- Email: ممنوع
