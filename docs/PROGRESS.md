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
