# EAH — Deploy Setup

## المشكلة
webhook Vercel↔GitHub بيتعطل. الحل: نشر مباشر.

## الاستخدام
cd ~/EAH && ./deploy.sh "feat: وصف"

بيعمل: typecheck + commit + push + vercel --prod.

## الإعداد (خلص)
- vercel CLI مثبت
- vercel login تمام
- مربوط بـ eah-74a0/eah

## لو vercel اختفى
npm i -g vercel
vercel login
cd ~/EAH/08-web && vercel link --yes

## قواعد
1. استخدم ./deploy.sh مش push.sh
2. متعملش vercel promote للـ preview
3. Hobby = build واحد بالمرة
