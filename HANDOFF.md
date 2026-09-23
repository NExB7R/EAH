# EAH — Handoff

آخر تحديث: 2026-09-24
Branch: ui-onlook
آخر commit: 266d08d
الرابط: https://eah-sq.vercel.app

## اقرأ أول
1. AI_CONTRACT.md
2. SACRED.md
3. SESSION_2026-09-24.md
4. SESSION_2026-09-23.md
5. ARCHITECTURE.md

## المشروع
EAH — منصة اكتشاف محلية مصرية
Stack: Next.js 16 + TypeScript + Supabase + Vercel
Owner: NourEldin B7R

## الهوية
بنفسجي: #9D4EDD / #A855F7
ذهبي: #E8C79A / #F5D9A7
Cairo (main), Dark theme, مفيش emoji

## ممنوعات
1. تعديل home-hero.tsx / home-dynamic-v2.tsx / section-slider-v2.tsx بدون تصريح
2. commit بدون typecheck
3. deploy بدون preview + موافقة
4. build محلي (SIGILL)

## حالة حرجة
6 commits مدفوعين GitHub بدون نشر Vercel (limit).
بكرة: vercel --prod --yes ثم اختبار.

## rollback
git reset --hard 87225a0 && git push origin ui-onlook --force-with-lease

## التواصل
NourEldin B7R — nexb7r@gmail.com
