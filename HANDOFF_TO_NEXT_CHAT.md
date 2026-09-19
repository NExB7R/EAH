> للإطلاق الرسمي: اقرأ docs/LAUNCH_CHECKLIST.md (Vercel Pro + دومين + فيسبوك)

> ⚠️ اقرأ DEPLOY_SETUP.md قبل أي deploy — webhook Vercel معطل، استخدم ./deploy.sh

# EAH — Handoff to Next Chat

> آخر تحديث: 2026-09-18
> Version: v1.0.1
> Branch: ui-onlook
> Last commit: e27be99

## Owner
NourEldin B7R — مصري، عامية، مباشر.
- مفيش build محلي (جهاز ضعيف) — Vercel يبني
- typecheck قبل كل commit
- أوامر كبيرة، مفيش شرح طويل

## Project
EAH — منصة اكتشاف محلية (شبين القناطر + القرى حواليها)
- Production: https://eah-sq.vercel.app
- GitHub: NExB7R/EAH (private, branch ui-onlook)
- Vercel: eah-74a0/eah (Hobby — cron daily only)
- Supabase: npmpiivmdksdirrumbmt
- Cloudinary: zlgcimmg (25GB free)

## أوامر سريعة

cd ~/EAH
./push.sh "fix: وصف"                # patch bump + push + auto-deploy
./push.sh "feat: وصف" --minor       # minor bump
./push.sh "feat!: وصف" --major      # major bump
./push.sh "chore: وصف" --no-bump    # بدون bump
./push.sh "wip" --draft             # commit محلي فقط

push.sh بيعمل:
1. tsc --noEmit
2. Version bump + package.json update
3. Session log entry
4. commit + push
5. Vercel auto-deploy (2-3 دقايق)

## ملفات لازم يقراها AI
1. HANDOFF_TO_NEXT_CHAT.md (ده)
2. AGENTS.md
3. docs/DEV_GUIDE.md
4. docs/SESSION_LOG.md
5. PROJECT_MEMORY.md
6. docs/CHANGELOG_ACTIVE.md
7. docs/VOICE_AND_TONE.md

## Voice & Tone
- مصري شعبي، أخوي، دافئ
- السلوغان المقدس: "اللي نفسك فيه ؟"
- ممنوع: يا زعيم، يا وحش، المستخدم، يمكنك، نحن
- مسموح: يا أخويا، نورت، على الآخر، مولعة

## Roles
- customer / merchant / super_admin (مفيش "admin" role)

## Stack
- Next.js 16.3 + React 19 + Turbopack
- Supabase (Auth + DB + RLS)
- Cloudinary (صور + ضغط تلقائي)
- Vercel (hosting + cron daily)
- Push Notifications (VAPID + web-push)
- Sentry (errors)

## قواعد حرجة
1. set +H قبل أي أمر فيه !
2. مفيش migrations عمياء — افحص Supabase الأول
3. بعد كل migration → طبّقها يدوي في Supabase SQL Editor
4. regex Python خطر — استخدم string replace
5. Hobby plan = cron مرة واحدة يوميًا فقط
6. مفيش build محلي — Vercel يبني
7. push.sh دايماً — مش git push لوحده

## Known Issues
- Service Role Key لسه مش rotated
- VAPID Keys لسه مش regenerated
- Deploy Hook URL اتكشف (محتاج Revoke)
- ~90 any types في الكود
- Deployment Storage قريب من الحد

## Current Status
- Sync تلقائي على Vercel شغال (git push → deploy تلقائي)
- push.sh كـ backup plan
- Version + session log + changelog تلقائي
- Next: review صفحة صفحة (8 صفحات)

## الصفحات للمراجعة
1. / — الرئيسية
2. /explore
3. /businesses/taboosh
4. /account + /account/edit
5. /account/points
6. /admin + /admin/pending + /admin/audit
7. /merchant + /merchant/pending
8. /about + /pricing + /advertise

## Current Step
"استنى المستخدم يبعت screenshot للصفحة الجاية."
