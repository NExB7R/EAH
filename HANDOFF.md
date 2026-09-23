# EAH — Handoff

آخر تحديث: 2026-09-23
Branch: ui-onlook
آخر commit: 5952aa4
Tag: v1.3.0-perf-session-2026-09-23
الرابط: https://eah-sq.vercel.app

## اقرأ أول
1. AI_CONTRACT.md — القواعد الإجبارية
2. SACRED.md — المقدسات
3. SESSION_2026-09-23.md — ملخص جلسة 23/9 (19 commit)
4. ARCHITECTURE.md — التقني

## المشروع
EAH — منصة اكتشاف محلية مصرية
Stack: Next.js 16 + TypeScript + Supabase + Vercel
Owner: NourEldin B7R — nexb7r@gmail.com

## الهوية المقدسة
- بنفسجي: #9D4EDD / #A855F7
- ذهبي: #E8C79A / #F5D9A7
- Cairo (main) + Dancing Script (footer only)
- Dark theme فقط، مفيش emoji في UI

## ممنوعات
1. تعديل home-hero.tsx / home-dynamic-v2.tsx / section-slider-v2.tsx بدون تصريح
2. commit بدون typecheck
3. deploy بدون preview + موافقة Nour
4. build محلي (SIGILL)

## الأولويات القادمة
1. UI رفع صور للأغلفة (44 نشاط بدون غلاف)
2. فحص Lighthouse + Web Vitals
3. Split explore-client.tsx

## الأوامر
cd ~/EAH/08-web && npx tsc --noEmit
cd ~/EAH && git add -A && git commit -m 'msg' && git push origin ui-onlook
cd ~/EAH && ./deploy.sh 'msg'   # بموافقة Nour فقط

## التواصل
NourEldin B7R — nexb7r@gmail.com
WhatsApp: 201012892806

صنع بكل قلب في شبين القناطر — فلسطين في القلب
