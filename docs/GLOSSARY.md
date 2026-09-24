# EAH - GLOSSARY.md

> قاموس المصطلحات. اقرأه قبل أي كود.

آخر تحديث: 2026-09-24

---

## مكونات الواجهة

Bento Grid
- شبكة 2x2 فيها بطاقات بأحجام مختلفة
- تستخدم في قسم المميزين
- مستوحاة من Apple / Notion

Snap Strip
- شريط أفقي يتحرك بالـ scroll
- CSS scroll-snap بدون JS
- تستخدم في العروض والجديد

Vertical List
- قائمة عمودية (زي Spotify)
- صورة 44x44 + اسم + نوع + تقييم
- تستخدم في الترند

Hero
- القسم العلوي في الصفحة
- لوجو + سلوغان + hook + بحث

Floating Capsule
- الهيدر العائم
- شفاف في الأعلى، صلب عند الـ scroll

Drawer
- القائمة الجانبية
- تفتح من اليمين (RTL)

Splash
- شاشة تحميل سريعة (1s)
- تاج + لوجو + خلفية

Welcome Gate
- صفحة ترحيب للزوار الجدد
- تظهر مرة واحدة فقط

---

## بيانات

Business
- نشاط (مطعم، صيدلية، ماركت، توصيل)

Featured
- الأنشطة المميزة (مدفوعة أو مختارة)

Trending
- الأنشطة الأعلى في التفاعل

Trust Score
- نقاط الثقة (0-100)
- ترتفع بالتفاعل، تنخفض بالإبلاغات

Loyalty Tier
- مستوى الولاء: Bronze, Silver, Gold, Platinum, Diamond

Points
- نقاط المستخدم
- تُكسب من التفاعل، تُستبدل بعروض

---

## تقني

RSC
- React Server Component
- يعمل على السيرفر بدون JS للعميل

Client Component
- مكون يعمل على المتصفح
- يحتاج "use client"

unstable_cache
- cache من Next.js
- يُستخدم فقط على مستوى module

publicClient
- Supabase client بدون cookies
- للقراءات العامة

serviceClient
- Supabase client بـ service role
- للسيرفر فقط (bypass RLS)

RLS
- Row Level Security
- أمان على مستوى الصف

proxy.ts
- بديل middleware.ts في Next.js 16
- للـ session refresh

---

## أدوار

customer
- مستخدم عادي

merchant
- صاحب نشاط

super_admin
- أدمن (فيه مفيش admin عادي)

---

## مصطلحات المنصة

EAH
- اسم المنصة

Hook
- شبيك لبيك .. كل حاجة حواليك

Slogan
- اللي نفسك فيه ؟

Zone
- من قلب شبين القناطر
