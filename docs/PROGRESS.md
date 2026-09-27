# EAH — PROGRESS.md

> حالة كل ملف في v2. آخر تحديث: 2026-09-27

---

## 📊 الحالة العامة

**آخر commit:** `155a744`
**الفرع:** main (متزامن مع origin/v2)
**v2.1.0-alpha**

---

## web/ (Next.js app)

### Config
| الملف | الحالة |
|------|--------|
| `.env.example` | ✅ |
| `next.config.ts` | ✅ (CSP + headers) |
| `tsconfig.json` | ✅ (strict + noUncheckedIndexedAccess) |
| `package.json` | ✅ |
| `eslint.config.mjs` | ✅ |

### App — Pages
| الملف | الحالة |
|------|--------|
| `app/layout.tsx` | ✅ (Splash + Capsule + ScrollToTop) |
| `app/page.tsx` | ✅ Home كامل (10 sections) |
| `app/loading.tsx` | ✅ skeleton |
| `app/globals.css` | ✅ |
| `app/manifest.ts` | ✅ |
| `app/explore/page.tsx` | ✅ (search + filters + load more) |
| `app/explore/loading.tsx` | ✅ |
| `app/featured/page.tsx` | ✅ (grid + load more, gold) |
| `app/featured/loading.tsx` | ✅ |
| `app/trends/page.tsx` | ✅ (orange) |
| `app/trends/loading.tsx` | ✅ |
| `app/offers/page.tsx` | ✅ (purple) |
| `app/offers/loading.tsx` | ✅ |
| `app/new/page.tsx` | ✅ (purple) |
| `app/new/loading.tsx` | ✅ |
| `app/nearby/page.tsx` | ✅ (purple) |
| `app/nearby/loading.tsx` | ✅ |
| `app/suggest/page.tsx` | ✅ (placeholder) |
| `app/businesses/[slug]/page.tsx` | ⚠️ مؤقت |
| `app/about/page.tsx` | ✅ |
| `app/about/presentation/page.tsx` | ✅ (12 slides) |

### App — Auth
| الملف | الحالة |
|------|--------|
| `app/auth/actions.ts` | ✅ |
| `app/auth/auth-form.tsx` | ✅ |
| `app/auth/auth.module.css` | ✅ |
| `app/auth/page.tsx` | ✅ |
| `app/auth/recover/page.tsx` | ✅ |
| `app/auth/logout/route.ts` | ✅ |

### App — API
| الملف | الحالة |
|------|--------|
| `app/api/track-action/route.ts` | ✅ |

### Components
| الملف | الحالة |
|------|--------|
| `avatar.tsx` | ✅ |
| `business-card.tsx` | ✅ (موحّد لكل الأقسام + tone) |
| `explore-search.tsx` | ✅ |
| `featured-bento.tsx` | ✅ (Home — grid 8/6/4) |
| `floating-capsule.tsx` | ✅ (🎯 اكتشف + ℹ️) |
| `home-hero.tsx` | ✅ |
| `install-prompt.tsx` | ✅ |
| `loading-skeleton.tsx` | ✅ |
| `load-more.tsx` | ✅ (client component) |
| `logo.tsx` | ✅ |
| `menu-drawer.tsx` | ✅ |
| `nearby-cta.tsx` | ✅ (location) |
| `nearby-grid.tsx` | ✅ (Home row) |
| `new-row.tsx` | ✅ (Home row) |
| `offers-strip.tsx` | ✅ (Home row) |
| `page-header.tsx` | ✅ |
| `review-reminder.tsx` | ✅ |
| `row-carousel.tsx` | ✅ (auto-scroll + hidden arrows) |
| `scroll-to-top.tsx` | ✅ |
| `secondary-hero.tsx` | ✅ (لوجو + خط + nav + عنوان) |
| `section-layout.tsx` | ✅ (Server + LoadMoreGrid) |
| `section-nav.tsx` | ✅ (8 أيقونات) |
| `section-title.tsx` | ✅ (6 tones) |
| `signup-prompt.tsx` | ✅ |
| `splash.tsx` | ✅ |
| `suggested-section.tsx` | ✅ |
| `trending-row.tsx` | ✅ (Home row — rank badge) |
| `watermark.tsx` | ✅ |
| `wm-image.tsx` | ✅ |
| `icons/index.tsx` | ✅ (~50 أيقونة) |

### Lib
| الملف | الحالة |
|------|--------|
| `data/businesses.ts` | ✅ (11 query + cache 300s) |
| `data/user.ts` | ✅ |
| `data/areas.ts` | ✅ |
| `data/index.ts` | ✅ |
| `engagement.ts` | ✅ |
| `featured-rotation.ts` | ⚠️ مش مستخدم (ممكن نمسحه) |
| `hooks/use-fair-rotation.ts` | ✅ (Fisher-Yates + sessionStorage) |
| `nav-items.ts` | ✅ (8 items) |
| `ranking.ts` | ✅ |
| `search/history.ts` | ✅ |
| `search/index.ts` | ✅ |
| `search/normalize.ts` | ✅ |
| `search/synonyms.ts` | ✅ |
| `supabase/public.ts` | ✅ |
| `supabase/server.ts` | ✅ |
| `supabase/service.ts` | ✅ |
| `supabase/browser.ts` | ✅ |
| `utils/distance.ts` | ✅ |
| `validations/auth.ts` | ✅ |

### Root
| الملف | الحالة |
|------|--------|
| `proxy.ts` | ✅ (session refresh + route protection) |

---

## 📁 docs/

| الملف | الحالة |
|------|--------|
| MASTER_BRIEF.md | ✅ |
| AI_CONTRACT.md | ✅ |
| SACRED.md | ✅ |
| DESIGN_SYSTEM.md | ✅ |
| ARCHITECTURE.md | ✅ |
| FEATURES.md | ✅ |
| ROADMAP.md | ✅ |
| GLOSSARY.md | ✅ |
| MIGRATION_GUIDE.md | ✅ |
| SCHEMA.sql | ⚠️ قديم |
| CODE_STANDARDS.md | ✅ |
| DEBUGGING.md | ✅ |
| PRODUCTION_CHECKLIST.md | ✅ |
| DATABASE_RULES.md | ✅ |
| SECURITY.md | ✅ |
| AI_HANDOFF.md | ✅ |
| PROGRESS.md | ✅ (هذا الملف) |
| TODO.md | ✅ |
| SESSION_LOG.md | ✅ |
| CHANGELOG.md | ✅ |
| STRUCTURE.md | ✅ |
| LESSONS.md | ✅ |
| NEW_CHAT_MESSAGE.md | ✅ |
| FILE_ORDER.md | ✅ |

---

## 📈 إحصائيات

- **App:** ~2400 سطر
- **Components:** ~3500 سطر
- **Lib:** ~1800 سطر
- **Docs:** ~6000 سطر

---

## 🎯 اللي جاي

1. **Footer** — كامل (روح 2026).
2. **`/about` polish**.
3. **Account** — `/account/*`.
4. **Merchant** — `/merchant/*`.
5. **Admin** — `/admin/*`.
6. **Business Page كاملة**.
7. **Rate Limiting** (Upstash).
8. **Turnstile** على signup.

---

آخر تحديث: 2026-09-27
