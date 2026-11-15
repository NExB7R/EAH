# EAH — Development Workflow

آخر تحديث: 2026-11-15

## الوضع الحالي

- Vercel Paused (Free CPU) حتى 15 ديسمبر
- التطوير: npm run dev محليًا + git push
- قبل الإطلاق: Vercel Pro ($20/شهر) + eah.store
- اقرأ docs/RULES.md + docs/HANDOFF.md أولاً

## العمل اليومي

1. Terminal 1: cd ~/EAH/web && npm run dev
2. عدّل + اختبر في http://localhost:3000
3. Chrome mobile view (F12 → Ctrl+Shift+M → iPhone 12 Pro)
4. tsc: npx tsc --noEmit (يجب EXIT=0)
5. cd ~/EAH && git add -A && git commit -m "..." && git push origin main

## القيود

- لا preview deployments
- لا اختبار موبايل حقيقي (Chrome mobile view)
- Supabase الحقيقي يعمل من localhost (نفس DB)

## المنجز (2026-11-15)

- Avatar + Hero + Tabs + Audit log
- Phone search v6 (3 modes + privacy)
- Privacy settings UI
- 2FA backend + UI
- Sidebar مجموعات + StatCard + Footer
- 0 أنشطة، 1 مستخدم (super_admin)

## المتبقي قبل الإطلاق

1. إدخال 50 نشاط حقيقي
2. اختبار 2FA
3. ربط تجار بأنشطة
4. Save & Next في wizard
5. /about + /blog

## نهاية الشهر

1. Vercel Pro
2. آخر commit → ينشر تلقائيًا
3. ربط eah.store
