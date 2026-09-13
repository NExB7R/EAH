# Work Log

## 2026-09-11 — Session start
- Confirmed project should be treated as a long-term product, not a one-off site.
- Confirmed zero-budget start.
- Confirmed PWA + dark mode default + installability.
- Confirmed local SEO and Facebook distribution are architectural requirements.
- Confirmed customer personalization: favorites, exclusions, ratings, offer reactions, recommendations.
- Confirmed no in-platform ordering in MVP; order bot is a later paid merchant feature.
- Confirmed project memory is maintained in versioned files.

## 2026-09-11
- Founder confirmed EAH as the project name.
- Established brand direction: master brand must remain category-agnostic.
- Default UI remains dark mode.
- Next: freeze database model and RLS, then build UI shell.

## Session update
- Supabase schema v0.1.0 drafted.
- RLS matrix drafted.
- Next: project setup + Supabase SQL migration + storage buckets.


### 2026-09-11 — Naming decision
- Founder confirmed the public brand spelling as **EAH** (no exclamation mark).
- Next: move one step at a time into the v0.1.0 technical foundation.


## 2026-09-11 — Database implementation
- Created executable Supabase migration `03-database/migrations/0001_eah_v0_1_0.sql`.
- Added PostGIS, app schema, core tables, indexes, auth profile bootstrap, RLS, and public directory views.
- Kept ordering/rewards disabled in v0.1.0.

## 2026-09-10 — Supabase live hardening
- Verified project `npmpiivmdksdirrumbmt` is active/healthy.
- Applied migration `foundation_security_hardening`.
- Applied migration `business_media_storage_foundation`.
- Applied migration `security_revoke_public_rls_helper`.
- Re-ran security advisor: 0 findings.
- Remaining manual gate: enable hosted Supabase Phone Auth and configure an SMS provider in Dashboard.

## 2026-09-11 — Project workflow hardening

- Consolidated the current EAH web project under `08-web/` inside the main project repository.
- Git is now the project source of truth.
- Added `.gitattributes`, root `.gitignore`, `VERSION`, release process, and GitHub Actions CI.
- Set web package version to `0.2.2`.

---

## 2026-09-13 — Security Hardening + Vercel Deploy

### ✅ اتعمل
- إصلاح `reveal_contact`: validation + advisory lock + constraints
- Migration `20260913000000_harden_reveal_contact.sql` (87 سطر)
- Server-side visitor hash (SHA-256 من IP + UA + client_token + salt)
- Rate limiting: 20/min per IP
- API validation: UUID + method_type whitelist
- إصلاح TypeScript errors في `floating-capsule.tsx` + `audit/page.tsx`
- Deploy ناجح على `eah-sq.vercel.app`
- إنشاء `PROJECT_MEMORY.md` للتواصل بين الشاتات

### 📚 اتعلمنا
- `date_trunc('day', ...)` مش IMMUTABLE في Postgres
- advisory lock أفضل من unique index للـ 24h dedup
- Vercel CLI بيعرض `UNKNOWN` أحيانًا بس الـ deploy ناجح
- GitHub بيقع → محتاجين مسار بديل للـ deploy

### 🎯 الجاي
1. `middleware.ts` لـ session refresh
2. Onboarding flow كامل
3. PWA install prompt
4. Git auto-deploy (لما GitHub يرجع)

### ⚠️ مشاكل معروفة
- مفيش `middleware.ts` → sessions مش بتتجدد
- Git auto-deploy مش شغال (GitHub permissions)
- Rate limit in-memory (مش موزّع)

