# EAH — Handoff to New Chat
> آخر تحديث: 2026-09-18
> Version: v1.0.0

## Owner
NourEldin B7R — مصري، عامية، مباشر.
- مفيش build محلي (جهاز ضعيف) — Vercel يبني
- typecheck قبل كل commit
- أوامر كبيرة، مفيش شرح طويل

## Project
EAH — منصة اكتشاف محلية (شبين القناطر + القرى حواليها)
- Production: https://eah-sq.vercel.app
- GitHub: NExB7R/EAH (private, branch ui-onlook)
- Vercel: eah-74a0/eah
- Supabase: npmpiivmdksdirrumbmt
- آخر commit: b41924a

## Golden Rules (من AGENTS.md)
1. Git = source of truth — كل SQL في migrations
2. مفيش demo/fake data في production
3. proxy.ts مش middleware.ts (Next.js 16+)
4. typecheck قبل commit: npx tsc --noEmit
5. مفيش build محلي — git push فقط
6. مفيش secrets في الكود — .env.local فقط
7. RLS + SECURITY DEFINER = critical
8. Never trust client-provided roles
9. الأدوار: customer / merchant / super_admin (مفيش admin)
10. additive only — مفيش حذف بدون موافقة صريحة
11. السلوغان المقدّس: اللي نفسك فيه ؟
12. أسامي الأدوار: أخويا/أختي، أخويا البزنس/أختي البزنس، صاحب البيت

## Voice & Tone (من VOICE_AND_TONE.md)
مصري شعبي، أخوي، دافئ.
- ممنوع: يا زعيم، يا وحش، المستخدم، يمكنك، نحن
- مسموح: يا أخويا، نورت، على الآخر، مولعة، يلا بينا

## Design
- Dark-first
- Neon Purple: #A855F7 / #6B21FF / #C084FC
- Dark Gold: #E8C79A / #F5D9A7
- Background: #07060B / #0A0712 / #140E22
- Fonts: Cairo + Cairo Play + Dancing Script
- RTL (لكن اللوجو dir=ltr)
- كل الأيقونات في components/eah-icons.tsx
- مفيش emojis في المنصة (اتنضفوا)
- Gradient headings عامة (بنفسجي → دهبي)
- AmbientBg (40 أيقونة خلفية)

## Scripts (في ~/EAH)
- ./sync.sh — فحص التزامن
- ./verify.sh — فحص شامل
- ./lock.sh — تشفير backup
- ./unlock.sh — فك التشفير
- ./bump.sh patch — زيادة فيرشن
- ./ship.sh "msg" — typecheck + commit + push + tag

## File Structure
- ~/EAH/AGENTS.md — القواعد الإلزامية
- ~/EAH/PROJECT_MEMORY.md — ذاكرة الجلسات
- ~/EAH/README_AI.md — onboarding
- ~/EAH/SYNC_GUIDE.md — نظام التزامن
- ~/EAH/docs/VOICE_AND_TONE.md — النبرة
- ~/EAH/docs/CHANGELOG_ACTIVE.md — التغييرات
- ~/EAH/03-database/migrations/ — SQL source of truth
- ~/EAH/08-web/ — Next.js app
  - app/ — 79 page + 21 API
  - components/ — 60+ component
  - lib/ — 30+ file
  - public/ — static assets

## Current Task: اختبار المنصة صفحة صفحة

القاعدة: صفحة واحدة في المرة.

الترتيب:
1. / (الرئيسية) ← نبدأ هنا
2. /explore
3. /businesses/taboosh
4. /trends + /featured + /new
5. /about + /pricing + /advertise
6. القايمة الجانبية + الفوتر
7. /admin
8. موبايل + PWA

كل صفحة: NourEldin هيبعت screenshot → نحلل → نصلح → نتأكد → نروح للي بعدها.

## Security Status
- DB Password: ✅ اتغير
- Git history: ✅ نظيف (0 secrets)
- Backup مشفّر: ✅ AES256 في ~/.eah-secure/
- Pre-commit hook: ✅ يمنع أي secrets جديد
- Service Role Key: ⚠️ لسه (اختياري rotate)
- VAPID Keys: ⚠️ لسه

## اللي خلص (v1.0.0)
- 71 emoji → 0
- 30+ أيقونة نيون SVG
- Gradient headings
- WhatsApp Orders + confirm RPC
- Feature Flags (admin per business)
- Ads System (slots + ads + tracking)
- Moderation (auto-flag + dashboard)
- Partners Transfer
- Facebook Collect (fb/ig/tiktok)
- Maps (Leaflet + CartoDB)
- Trial + Cron (7ص + 7م)
- Bot B7R
- AmbientBg (40 أيقونة)

## Known Issues
- any types ~90 في الكود
- Service Role Key لسه مش rotated
- Sentry errors مش مفحوصة

## Environment
- Node: v22.23.2
- Vercel CLI: 59.17.0
- git identity: NExB7R / nexb7r@users.noreply.github.com
- gpg: مثبت (لتشفير backup)
- python3: 3.12
- convert (ImageMagick)

## Supabase Keys Format
Supabase غيّرت شكل الـkeys:
- القديم: eyJhbGci... (200+ حرف)
- الجديد: sb_secret_... (41 حرف) + sb_publishable_... (46 حرف)
- الاتنين صح

## Communication Rules
1. مصري شعبي، أخوي، مباشر
2. أوامر كبيرة مش صغيرة
3. مفيش شرح طويل
4. set +H && cat > file << 'EOF' للكتابة
5. لو أمر كسر حاجة → رجّع فوراً
6. سجّل: NourEldin B7R
7. صفحة واحدة في المرة
8. VERSION bump مع أي commit

## Current Step
"افتح https://eah-sq.vercel.app/?v=1 في incognito وابعت screenshot للرئيسية."
