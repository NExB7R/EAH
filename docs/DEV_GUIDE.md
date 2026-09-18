# EAH — Developer Guide

> **اقرأ الملف ده أول حاجة.**

## الأوامر السريعة

| الأمر | يعمل إيه |
|-------|----------|
| `./push.sh "fix: وصف"` | typecheck + patch bump + commit + push |
| `./push.sh "feat: وصف" --minor` | minor bump |
| `./push.sh "feat!: وصف" --major` | major bump |
| `./push.sh "chore: وصف" --no-bump` | بدون bump |
| `./push.sh "wip" --draft` | commit محلي بدون push |

## البنية

- **GitHub:** `NExB7R/EAH` (branch: `ui-onlook`)
- **Vercel:** `eah-74a0/eah` — auto-deploy على push لـ `ui-onlook`
- **Supabase:** `npmpiivmdksdirrumbmt`
- **Production:** https://eah-sq.vercel.app

## ⚠️ قواعد مهمة

1. **قبل أي migration** → افحص Supabase (`information_schema`) للتأكد إن الجدول مش موجود
2. **بعد كل migration** → طبّقها يدوي في Supabase SQL Editor
3. **`npx tsc --noEmit` قبل commit** — `push.sh` بيعملها أوتوماتيك
4. **مفيش build محلي** — Vercel يبني
5. **Vercel Hobby** = cron مرة واحدة يوميًا بس
6. **`set +H`** قبل أي أمر فيه `!` (history expansion)
7. **regex-based Python** خطر — استخدم string replace بسيط

## اللي بيقراه AI الجديد

1. `docs/DEV_GUIDE.md` (ده)
2. `HANDOFF_TO_NEXT_CHAT.md`
3. `AGENTS.md`
4. `PROJECT_MEMORY.md`
5. `docs/SESSION_LOG.md` ← آخر التطورات
6. `docs/CHANGELOG_ACTIVE.md`
7. `docs/VOICE_AND_TONE.md`

## Voice & Tone

- مصري شعبي، أخوي، مباشر
- السلوغان المقدس: **"اللي نفسك فيه ؟"**
- الأدوار: customer / merchant / super_admin
- ممنوع: يا زعيم، يا وحش، المستخدم، يمكنك
- مسموح: يا أخويا، نورت، على الآخر، مولعة

## Stack

- Next.js 16.3 + React 19 + Turbopack
- Supabase (Auth + DB + RLS)
- Cloudinary (صور + ضغط تلقائي)
- Vercel (hosting + cron)
- Tailwind-less (CSS modules)

## الملفات الحساسة

- `08-web/proxy.ts` — middleware (Auth)
- `08-web/lib/supabase-server.ts` — server client
- `08-web/app/admin/layout.tsx` — super_admin guard
- `08-web/lib/cloudinary.ts` — صور
- `08-web/app/api/admin/upload/route.ts` — رفع صور

## آخر التطورات

شوف `docs/SESSION_LOG.md` (أحدث 20 entry).
