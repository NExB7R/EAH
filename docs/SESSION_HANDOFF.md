# EAH — SESSION HANDOFF

> اقرأ الملف ده كامل قبل أي شغل.

## 📌 الأساسيات
- Project: EAH — منصة اكتشاف محلية
- Production: https://eah-sq.vercel.app
- GitHub: https://github.com/NExB7R/EAH
- Branch: ui-onlook
- Last commit: 46a0763
- Vercel: eah-74a0/eah (auto-deploy)
- Supabase: npmpiivmdksdirrumbmt

## 👤 عن المستخدم (bondok)
- مصري، لهجة عامية
- بيحب السرعة والمباشرة
- مش بيحب build محلي (جهاز ضعيف) — typecheck بس
- مش بيحب الأوامر الطويلة (bash heredoc بيكسر)
- كل دفعة = typecheck + commit + push

## ⚠️ مشاكل bash المعروفة
- heredoc مع Unicode (═) → error
- ! في السكريبتات → history expansion
- <<'EOF' مع pipe → بيكسر
- الحل: python3 -c "..." أو base64 encoding

## 🏗️ البنية
EAH/
- docs/ (SESSION_HANDOFF.md, CHANGELOG_ACTIVE.md, COMPETITORS_ANALYSIS.md, BIG_PROJECTS_BACKLOG.md)
- data/ (BUSINESSES_TEMPLATE.json, README.md)
- scripts/import-businesses.mjs
- 03-database/migrations/ (27)
- 08-web/ (Next.js 16.3.4 + React 19 + TS 5.9)

## 🔧 تقنيات
- Next.js 16.3.4 (proxy.ts NOT middleware.ts)
- React 19.2.8
- Supabase (RLS على كل جدول)
- Vercel (Node 22.x)
- Turbopack
- نوعات: customer / merchant / super_admin (مفيش admin)

## 🎨 هوية التصميم
- Dark-first
- Neon purple: #A855F7 / #6B21FF / #C084FC
- Dark gold: #E8C79A / #F5D9A7
- Fonts: Cairo + Cairo Play + Dancing Script
- Mobile-first, 2026 aesthetic

## 📊 إحصائيات
- 68 pages
- 48 components
- 25 lib files
- 16 API routes
- 27 migrations
- Typecheck 100%
- 0 broken imports

## ✅ اللي خلص (Batches 1-60)
- Smart Bot (21 intent + AI orb icon)
- Order Bot (form + notify + dashboard)
- Pricing (3 plans + FAQ)
- Merchant Orders Dashboard
- Homepage hero rebuild
- Trends Podium
- Legal pages rewrite
- Competitors Analysis doc
- Data Collection System

## 🐛 مشاكل اتحلت
- Vercel: mixed CJS/ESM في next.config.ts
- OG images: Arabic font غير مدعوم → static icons
- /merchant-info prefix match
- Logout route

## 🔴 قواعد حرجة (AGENTS.md)
1. Git = source of truth
2. RLS + SECURITY DEFINER = critical
3. مفيش demo data
4. مفيش secrets في الكود
5. proxy.ts مش middleware.ts
6. typecheck قبل commit
7. additive only
8. Never trust client roles claims
9. مفيش admin role

## 🎯 Backlog
1. Order Status Flow (Sprint 6) ← التالي
2. Real-time order tracking
3. Business analytics v2
4. Menu management UI
5. Reservations + Maps
6. Data import (user fills data/BUSINESSES.json)

## 🎬 New chat prompt
اقرأ docs/SESSION_HANDOFF.md
أنا bondok، عايز نكمل من Sprint 6.
قواعد: مفيش build، typecheck بس، أمر واحد كبير.

**آخر commit:** 46a0763
**الحالة:** جاهز للاختبار + جمع البيانات
