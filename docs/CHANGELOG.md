
---

## [v2.1.0] - 2026-09-27 — Featured Redesign

### Added
- `lib/featured-rotation.ts` — Round-Robin عادل (8 ثواني/دورة)
- `components/featured-card.tsx` + `.module.css` — كارت موحد (hero + small)
- `app/featured/page.tsx` + `featured-showcase.tsx` + `featured.module.css`

### Changed
- `components/featured-bento.tsx` — Hero + 4 صغيرة + دوران تلقائي
- `components/featured-bento.module.css` — Bento حقيقي (2fr 1fr 1fr)
- `app/page.tsx` ⚠️ SACRED — شيل dailyShuffle

### Fixed
- عدالة المميزين — كل مميز ياخد Hero بنفس عدد المرات
- Hydration — الدوران مبني على `initialStart` من الـ server

---

## [v2.1.2] - 2026-09-27 — Featured Card Rich Info

### Added
- Badges في الكارت: النوع (بأيقونة) + المنطقة + التقييم + المصداقية + واتساب
- Badge "مفتوح/مقفل" على الصورة (أخضر/أحمر)
- Badge "مميز" على الـ hero

### Changed
- `featured-card.tsx` — أيقونات نوع ديناميكية (restaurant/pharmacy/...)
- `featured-card.module.css` — chips صغيرة + topBadges

### Notes
- صفر JS إضافي — كله CSS + JSX
- حقول جديدة (branches_count, offers_count, rating_count) → TODO (محتاج migration)

---

## [v2.1.3] - 2026-09-27 — Business Counts + Card Badges

### Added
- Migration: `branches_count` + `offers_count` + `rating_avg` + `rating_count`
- Triggers على business_branches/offers/business_reviews
- Indexes جديدة
- أيقونات: `StoreIcon` + `GiftIcon`
- Badges في الكارد: فروع + عروض + عدد التقييمات

### Changed
- `featured-card.tsx` — rating_avg الحقيقي لو موجود، وإلا trust_score/20
- `Business` type — 4 حقول جديدة
- `BUSINESS_COLUMNS` — 4 حقول جديدة

### Notes
- Denormalized counts = قراءة فورية (صفر JOIN وقت العرض)
- Triggers تحدّث تلقائي (SECURITY DEFINER)
- الـ migration الحالي: 9 أنشطة عندها عروض

---

## [v2.1.4] - 2026-09-27 — Featured Bento Fix + Fallback

### Fixed
- Bento grid: `grid-template-areas` بدل `grid-column/row` (كان مش شغّال في RTL)
- Hero بيكبر صح (2fr × 2 rows على Desktop)
- الكروت الصغيرة مترتبة صح (s1, s2 / s3, s4)

### Added
- Fallback جميل بدون صورة: أيقونة النوع كبيرة + توهج بنفسجي/ذهبي

### Notes
- معظم الأنشطة مفيش عندها cover → الـ fallback هو الأساسي حالياً
- صفر JS إضافي

---

## [v2.1.5] - 2026-09-27 — Home Scroll-Snap + Header Polish

### Added
- Scroll-snap عمودي (`y proximity`) على Home — إحساس قلب صفحات
- الهيدر مخفي في الهيرو + يظهر بعد ما تسكرول
- featured-bento = صفحة كاملة (min-height 100dvh)

### Changed
- `home-hero` — مساحة فوق اللوجو أقل + spacer اتشال
- `floating-capsule` — data-home + توسيط اللوجو بالظبط
- `app/page.tsx` — `data-snap="true"` على `<main>`

### Fixed
- اللوجو في الهيدر مش متوسّط بالظبط (grid-columns minmax(0,1fr))
- مساحة فاضية كبيرة فوق لوجو الهيرو

### Notes
- `prefers-reduced-motion` → يعطّل snap
- الهيدر يظهر بعد 80px (بدل 50px)

---

## [v2.1.6] - 2026-09-27 — Splash + Install + Bento Polish

### Fixed
- **Splash بيظهر متأخر** — بقى ظاهر من أول paint + useLayoutEffect يخفي قبل paint تاني
- **Install prompt مزعج** — بقى يدوي فقط (من زر الهيدر) — مفيش auto-show
- Header مبهدل — شيلنا `justify-items: center` (grid-columns كفاية)
- Scroll-snap مش بيقلب — `y mandatory` بدل `y proximity`
- Featured Bento في النص — `align-items: flex-start` بدل center

### Changed
- `splash.tsx` — initial hidden=false + useLayoutEffect
- `install-prompt.tsx` — إزالة auto-show (30s) — يدوي فقط

---

## [v2.2.0] - 2026-09-27 — Engagement + Review Reminder + Smart Install

### Added
- `lib/engagement.ts` — تتبّع تفاعل + جدولة تقييم + طلب تثبيت
- `components/review-reminder.tsx` + `.module.css` — إشعار تقييم بعد ساعتين
- `app/api/track-action/route.ts` — POST يسجّل الأحداث في DB
- Migration: `engagement_events` (تحليلات التفاعل)
- RLS على `engagement_events` (INSERT service_role / SELECT admin)
- 3 Indexes للأداء

### Changed
- `install-prompt.tsx` — Persuasion UI جديد (فوايد + زر ذهبي)
- `install-prompt.module.css` — تصميم Premium + توهج
- `floating-capsule.tsx` — `eah:install-request` → `eah:show-install`
- `layout.tsx` — إضافة `<ReviewReminder />`
- `home-hero.module.css` — فاصل 14px بين اللوجو ولافتة شبين

### Behavior (المنطق)
- Install Prompt: مش auto — يظهر عند كشف رقم / واتساب / تقييم
- "مش دلوقتي" → cooldown دقيقتين (مش يتكرر كل مرة)
- "ثبّت الآن" → يتسجّل في localStorage (مش يظهر تاني)
- Review Reminder: يظهر بعد ساعتين من كشف الرقم/واتساب
- أي تفاعل → يُسجّل في `engagement_events` (fire-and-forget)

---

## [v2.2.2] - 2026-09-27 — Featured Unified (بدون Hero) + /featured Clean

### Changed
- **Featured Bento** — كل الكروت موحّدة (10 كروت، 5 cols Desktop)
- **/featured** — كل الكروت موحّدة (4 cols Desktop) + بدون خلفية داكنة
- **/featured** — شيلنا الـ container (gold border + gradient bg)

### Removed
- Hero variant من Home + /featured
- Pagination + progress bar + timer row
- الخلفية الداكنة من /featured

### Notes
- 10 كروت × `next/image` lazy = صفر تأثير سرعة
- الكارد variant="small" هو الأساسي حالياً

---

## [v2.2.3] - 2026-09-27 — Featured Final (Home + /featured)

### Added
- Featured Bento (Home): Grid موحّد — 5×2 / 3×2 / 2×2
- Featured Showcase (/featured): Grid موحّد — 4×2 / 3×2 / 2×2
- تدوير تلقائي 10 ثواني (يتوقف عند Hover/الخروج من الشاشة)
- سحب يدوي (Touch) على الموبايل والتابلت
- IntersectionObserver (يوقف الدوران لما يخرج من الشاشة)
- Reduced Motion support
- عدّاد "1/6" (بدون أسهم — أنضف)
- إطار ذهبي رفيع + توهج نيون بنفسجي

### Changed
- الكارد: كله variant="small" (موحّد)
- `/featured` — بدون خلفية داكنة، بدون container ذهبي
- page.tsx — شيلنا initialStart

### Removed
- Chevron arrows (كبيرة) — استبدلناها بسحب يدوي
- Hero variant من Bento

### Notes
- الـ DOM ثابت — 10/6/4 slots فقط، بيتبدل المحتوى
- الصور lazy — بس اللي ظاهرة بتتحمّل

---

## [v2.2.3] - 2026-09-27 — Featured Final (Home + /featured)

### Added
- Featured Bento (Home): Grid موحّد — 5×2 / 3×2 / 2×2
- Featured Showcase (/featured): Grid موحّد — 4×2 / 3×2 / 2×2
- تدوير تلقائي 10 ثواني (يتوقف عند Hover/الخروج من الشاشة)
- سحب يدوي (Touch) على الموبايل والتابلت
- IntersectionObserver (يوقف الدوران لما يخرج من الشاشة)
- Reduced Motion support
- عدّاد "1/6" (بدون أسهم — أنضف)
- إطار ذهبي رفيع + توهج نيون بنفسجي

### Changed
- الكارد: كله variant="small" (موحّد)
- `/featured` — بدون خلفية داكنة، بدون container ذهبي
- page.tsx — شيلنا initialStart

### Removed
- Chevron arrows (كبيرة) — استبدلناها بسحب يدوي
- Hero variant من Bento

### Notes
- الـ DOM ثابت — 10/6/4 slots فقط، بيتبدل المحتوى
- الصور lazy — بس اللي ظاهرة بتتحمّل

---

## [v2.3.0] - 2026-09-27 — Trending List (Home)

### Added
- `components/trending-list.tsx` — Server Component (صفر JS)
- `components/trending-list.module.css` — إطار بنفسجي (يختلف عن الذهبي)
- `getTrendingBusinesses` في lib/data
- ترتيب: `sortByTrend` (trust + orders + recency)

### Style
- قائمة عمودية (زي Spotify) — رقم + thumb + info + right
- Rank badges: 1 ذهبي، 2 فضي، 3 برونزي، الباقي بنفسجي
- Server Component — صفر JS على client

---

## [v2.4.0] - 2026-09-27 — Offers Strip (Home)

### Added
- `components/offers-strip.tsx` — Server Component
- `components/offers-strip.module.css` — إطار برتقالي (يختلف عن الذهبي/البنفسجي)
- `getActiveOffers` في lib/data — يجيب العروض النشطة من `offers`

### Style
- Horizontal Snap Strip (سحب أفقي)
- 240px كارد (200px على الموبايل)
- Badge "عرض" + سعر ذهبي + اسم النشاط + المنطقة

---

## [v2.5.0] - 2026-09-27 — Nearby Grid (Home)

### Added
- `components/nearby-grid.tsx` — Server Component (4 كروت)
- `components/nearby-grid.module.css` — إطار تيل (Teal)
- `getNearbyBusinesses` في lib/data — حسب المنطقة

### Style
- 2×2 (Mobile) / 4×1 (Desktop)
- إطار تيل #55E7D1 — مختلف عن الذهبي/البنفسجي/البرتقالي
- Rating ذهبي على الصورة

---

## [v2.6.0] - 2026-09-27 — New Grid (Home)

### Added
- `components/new-grid.tsx` — Server Component (6 كروت)
- `components/new-grid.module.css` — إطار بنفسجي فاتح (#C77DFF)
- يستخدم `getNewBusinesses` الموجود

### Style
- 2 (Mobile) / 3 (Desktop) أعمدة
- Badge "جديد" + Rating ذهبي
- إطار C77DFF — مختلف عن باقي الأقسام

### Home Sections (الآن):
1. HomeHero
2. FeaturedBento (ذهبي)
3. TrendingList (بنفسجي)
4. OffersStrip (برتقالي)
5. NearbyGrid (تيل)
6. NewGrid (فوشيا)
