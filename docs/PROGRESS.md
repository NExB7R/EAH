# EAH — PROGRESS.md

> حالة كل ملف في v2. آخر تحديث: 2026-09-25

---

## web/ (Next.js app)

### Config
| الملف | الحالة | commit |
|------|--------|--------|
| `.env.example` | ✅ | `8549b3c` |
| `next.config.ts` | ✅ | `bc4b5b6` |
| `tsconfig.json` | ✅ | `018059a` |
| `package.json` | ✅ | `7378248` |
| `eslint.config.mjs` | ✅ | — |

### App Router
| الملف | الحالة | commit |
|------|--------|--------|
| `app/layout.tsx` | ✅ | `e1ed23e` |
| `app/globals.css` | ✅ | `e1ed23e` |
| `app/page.tsx` | ⏳ placeholder | — |
| `app/manifest.ts` | ✅ | `daf703f` |
| `app/favicon.ico` | ✅ | `daf703f` |
| `app/icon.png` | ✅ | `daf703f` |
| `app/apple-icon.png` | ✅ | `daf703f` |

### Auth
| الملف | الحالة | commit |
|------|--------|--------|
| `app/auth/actions.ts` | ✅ | `7378248` |
| `app/auth/auth-form.tsx` | ✅ | `2f971a3` |
| `app/auth/auth.module.css` | ✅ | `2f971a3` |
| `app/auth/page.tsx` | ✅ | `959d03b` |
| `app/auth/recover/page.tsx` | ✅ | `304b2d9` |
| `app/auth/logout/route.ts` | ✅ | `d8ef06c` |

### Lib
| الملف | الحالة | commit |
|------|--------|--------|
| `lib/supabase/public.ts` | ✅ | `72ef7be` |
| `lib/supabase/server.ts` | ✅ | `72ef7be` |
| `lib/supabase/service.ts` | ✅ | `72ef7be` |
| `lib/supabase/browser.ts` | ✅ | `72ef7be` |
| `lib/validations/auth.ts` | ✅ | `571cd30` |
| `lib/data.ts` | ✅ | `bc4b5b6` |
| `lib/ranking.ts` | ✅ | `bc4b5b6` |
| `lib/supabase/types.ts` | ⏳ generated | — |

### Components
| الملف | الحالة | commit |
|------|--------|--------|
| `components/icons/index.tsx` | ✅ | `bd5df4f` |
| `components/logo.tsx` | ✅ | `09dda8e` |
| `components/logo.module.css` | ✅ | `09dda8e` |
| `components/splash.tsx` | ✅ | `e1ed23e` |
| `components/splash.module.css` | ✅ | `e1ed23e` |
| `components/watermark.tsx` | ✅ | `bc4b5b6` |
| `components/watermark.module.css` | ✅ | `bc4b5b6` |
| `components/wm-image.tsx` | ✅ | `bc4b5b6` |

### Root
| الملف | الحالة | commit |
|------|--------|--------|
| `proxy.ts` | ✅ | `c7e4371` |

### Public
| الملف | الحالة | commit |
|------|--------|--------|
| `public/eah-word.webp` | ✅ | `588083f` |
| `public/eah-crown.webp` | ✅ | `588083f` |
| `public/icon-192.png` | ✅ | `daf703f` |
| `public/icon-512.png` | ✅ | `daf703f` |

---

## ⏳ جاي (Week 2)

| الملف | الحالة |
|------|--------|
| `app/page.tsx` | كامل |
| `components/hero.tsx` + `.module.css` | جديد |
| `components/business-card.tsx` + `.module.css` | جديد |
| `components/bento-featured.tsx` + `.module.css` | جديد |
| `components/snap-strip.tsx` + `.module.css` | جديد |
| `components/trending-list.tsx` + `.module.css` | جديد |
| `components/site-footer.tsx` + `.module.css` | جديد |
| `app/explore/page.tsx` | جديد |
| `app/businesses/[slug]/page.tsx` | جديد |

---

## docs/

| الملف | الحالة |
|------|--------|
| `MASTER_BRIEF.md` | ✅ |
| `AI_CONTRACT.md` | ✅ |
| `SACRED.md` | ✅ |
| `ROADMAP.md` | ✅ |
| `FEATURES.md` | ✅ |
| `DESIGN_SYSTEM.md` | ✅ |
| `ARCHITECTURE.md` | ✅ |
| `GLOSSARY.md` | ✅ |
| `MIGRATION_GUIDE.md` | ✅ |
| `SCHEMA.sql` | ⚠️ قديم (ينقص columns) |
| `SESSION_LOG.md` | ✅ محدّث |
| `AI_HANDOFF.md` | ⚠️ ناقص (ينقص 3 أقسام) |
| `PROGRESS.md` | ✅ |
| `migrations/2026-09-25-normalize-profiles.sql` | ✅ |

---

## Docs الجديدة (2026-09-27)

| الملف | الحالة |
|------|--------|
| `CODE_STANDARDS.md` | ✅ |
| `DEBUGGING.md` | ✅ |
| `PRODUCTION_CHECKLIST.md` | ✅ |
| `DATABASE_RULES.md` | ✅ |
| `TODO.md` | ✅ |
| `LESSONS.md` | ✅ |

---

## إحصائيات الـ Docs

- **Total docs:** 22 ملف
- **Total lines:** ~4,500 سطر
- **آخر تحديث:** 2026-09-27

---

## الـ commits الأخيرة (2026-09-25 → 2026-09-27)

- `69c2ec4` — Drawer full rewrite
- `6543857` — Social + Footer + scrollbar
- `8682b81` — Profile Section
- `3f2163e` — TODO + UserSession trust
- `59e346a` — Capsule new layout
- `5559928` — Drawer onCloseRef fix
- `cc92e76` — Drawer debug
- `b47b4f8` — Drawer auto-close fix
- `2e64e41` — Scroll detection fix
- `b63c3bb` — Capsule icons pointer-events
- `2abbcd5` — Capsule smaller
- `d88036a` — Featured lightweight
- `253562b` — Business Card
- `4139936` — Smart Search
- `7fdf3fe` — Explore Search + History
- `f95cbab` — Explore Page
- `76b2f9b` — CODE_STANDARDS
- `3066474` — DEBUGGING
- `a4e2270` — PRODUCTION_CHECKLIST
- `6682e9c` — DATABASE_RULES
- `0354e99` — AI_CONTRACT §22-24
- `d2bb4ac` — AI_HANDOFF update

---

آخر تحديث: 2026-09-27

---

## 2026-09-27 — Featured Redesign ✅

| الملف | الحالة |
|------|--------|
| `lib/featured-rotation.ts` | ✅ جديد |
| `components/featured-card.tsx` + `.module.css` | ✅ جديد |
| `components/featured-bento.tsx` + `.module.css` | ✅ إعادة كتابة |
| `app/featured/page.tsx` + `featured-showcase.tsx` + `featured.module.css` | ✅ جديد |
| `app/page.tsx` ⚠️ | ✅ تعديل (SACRED) |

### 2026-09-27 — Business Counts + Card Badges ✅
- Migration `2026-09-27-add-business-counts.sql`
- StoreIcon + GiftIcon
- Cards: badges فروع + عروض + rating_count

### 2026-09-27 — Featured Bento Fix + Fallback ✅
- grid-template-areas (bento صحيح)
- Fallback جميل بدون صور

### 2026-09-27 — Home Scroll-Snap ✅
- Scroll-snap عمودي (proximity)
- Header hide in hero + show on scroll
- Logo centering fix

### 2026-09-27 — Splash + Install + Bento Polish ✅
- Splash: من أول paint
- Install: يدوي فقط
- Header: توسيط سليم
- Snap: mandatory

### 2026-09-27 — Engagement + Review + Install ✅
- lib/engagement.ts
- review-reminder.tsx + css
- api/track-action
- migration: engagement_events
- install-prompt redesign (persuasion)

### 2026-09-27 — Featured Unified ✅
- بدون Hero variant
- 10 كروت × Home + /featured موحّدين
- /featured: بدون خلفية داكنة

### 2026-09-27 — Featured Final ✅
- Home: 5×2/3×2/2×2 (10/6/4)
- /featured: 4×2/3×2/2×2 (8/6/4)
- Auto-rotate + Touch swipe + IntersectionObserver
- إطار ذهبي بريميوم

### 2026-09-27 — Featured Final ✅
- Home: 5×2/3×2/2×2 (10/6/4)
- /featured: 4×2/3×2/2×2 (8/6/4)
- Auto-rotate + Touch swipe + IntersectionObserver
- إطار ذهبي بريميوم

### 2026-09-27 — Trending ✅
- Vertical List (10 rows)
- Server Component — بدون JS
- إطار بنفسجي

### 2026-09-27 — Offers Strip ✅
- Horizontal Snap Strip
- إطار برتقالي
- Server Component

### 2026-09-27 — Nearby Grid ✅
- 4 كروت (2×2 / 4×1)
- إطار تيل
- Server Component

### 2026-09-27 — New Grid ✅ — Home Sections Complete
Home الآن: Hero + Featured + Trending + Offers + Nearby + New
كل قسم بألوانه الخاصة (ذهبي/بنفسجي/برتقالي/تيل/فوشيا)
