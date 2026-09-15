# Agent Brief — EAH

## In one sentence
Local discovery PWA for Shibin El-Qanater: users find restaurants, pharmacies, supermarkets, delivery offices.

## Tech
- Next.js 16.3.4 (App Router, proxy.ts)
- React 19.2.8
- TypeScript 5.9 (strict)
- Supabase (Postgres + Auth + Storage + RLS)
- Vercel (deploy + cron)
- Sentry (production only)

## Current version
v0.3.0 — Discovery + Personalization + PWA + Subscriptions

## Key concepts

### Design system
- Dark-first
- Neon purple (#A855F7) + dark gold (#E8C79A)
- Mobile-first
- Fonts: Cairo + Cairo Play + Dancing Script

### Auth flow
- Phone + password (no SMS in MVP)
- Server-side session via proxy.ts
- Roles read from user_roles table (never client)

### Badges (simplified 2026)
- Crown     → super_admin only
- Premium   → paid merchant (active subscription)
- Verified  → user verified account

Removed: titles + frames system (was too complex)

### Database
- 24 migrations in 03-database/migrations/
- RLS on every table
- SECURITY DEFINER functions for sensitive ops

## What to avoid
- Do NOT touch RLS without review
- Do NOT add demo/fake data
- Do NOT use middleware.ts (use proxy.ts)
- Do NOT expose secrets
- Do NOT break existing features

## What to do
- Run npx tsc --noEmit before commit
- Add migrations for SQL changes
- Read PROJECT_MEMORY.md for context
- Ask before deleting files

## Where to look first
- Stuck?           → PROJECT_MEMORY.md
- Architecture?    → docs/PLATFORM_GUIDE_2026.md
- Security?        → docs/SECURITY-HARDENING.md
- Vercel?          → docs/VERCEL_SETUP_2026.md
