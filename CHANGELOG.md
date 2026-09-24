# EAH - CHANGELOG.md

كل التغييرات المهمة في المشروع.

---

## [v0.1.0] - 2026-09-24

### Added
- Fresh repo (v2 branch)
- 10 documentation files:
  - MASTER_BRIEF.md
  - FEATURES.md
  - ROADMAP.md
  - AI_CONTRACT.md
  - SACRED.md
  - DESIGN_SYSTEM.md
  - ARCHITECTURE.md
  - SCHEMA.sql
  - MIGRATION_GUIDE.md
  - SESSION_LOG.md
- Next.js 16 + React 19 + TypeScript
- Supabase connection (53 businesses)
- Vercel link
- Production deployment

### Archived
- Old code (v1) → archive/v1 branch
- 46 migrations → kept for reference
- All sessions 1-5 logs

### Status
- Production live: https://eah-sq.vercel.app
- Docs complete
- Code: starting

---

## [v2.0.0-alpha] - 2026-09-25

### Added
- **Core (Week 1):**
  - `.env.example` — 14 مفتاح
  - `next.config.ts` — CSP + security headers + image domains
  - `tsconfig.json` — strict + noUncheckedIndexedAccess
  - `globals.css` — design tokens (ألوان + مسافات + radius + shadows + motion)
  - خطوط Cairo Variable + Tajawal Variable (self-hosted)
  - `app/manifest.ts` — PWA manifest

- **Supabase:**
  - 4 clients: `public`, `server`, `service`, `browser`
  - `proxy.ts` — session refresh + route protection

- **Auth:**
  - `lib/validations/auth.ts` — Zod schemas
  - `app/auth/actions.ts` — signup + login + recover
  - `app/auth/auth-form.tsx` — Tabs (login/signup) + أيقونات + password toggle
  - `app/auth/page.tsx` + `app/auth/recover/page.tsx`
  - `app/auth/logout/route.ts`
  - دعم 3 صيغ إيميل (legacy)

- **Design:**
  - `components/icons/index.tsx` — 12 أيقونة SVG outline
  - `components/logo.tsx` + `logo.module.css` — تاج + word + slogan + hover animation
  - `components/splash.tsx` — شاشة بداية (CSS + sessionStorage)
  - Scrollbar gradient بنفسجي → ذهبي

- **PWA:**
  - `favicon.ico` (التاج)
  - `icon.png` + `apple-icon.png`
  - `public/icon-192.png` + `icon-512.png`

- **Data:**
  - `lib/data.ts` — fetch functions (unstable_cache)
  - `lib/ranking.ts` — trend score + daily shuffle
  - `components/watermark.tsx` + `wm-image.tsx` — علامة مائية (CSS overlay)

- **DB:**
  - `docs/migrations/2026-09-25-normalize-profiles.sql`

- **Docs:**
  - `AI_HANDOFF.md`
  - `PROGRESS.md`
  - `SESSION_LOG.md` (updated)

### Changed
- Auth login يدعم 3 صيغ إيميل (legacy support)
- CSP: `'unsafe-inline'` في `script-src` (Next.js 16 محتاج)
- tsconfig: `target: ES2022` + `noUncheckedIndexedAccess`

### Fixed
- tabIndicator direction في RTL
- slogan في اللوجو (ثابت + hover animation)

### Removed
- 4 حسابات مجهولة من `auth.users`
- tagline "منصة اكتشاف..." (استُبدل)

### Status
- Production: https://eah-sq.vercel.app
- Commits: ~30
- Next: Home + Explore + Business Page
