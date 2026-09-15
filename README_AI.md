# EAH — AI/Developer Onboarding (5-Minute Read)

Last updated: 2026-09-15
Read this FIRST before touching anything.

## What is EAH?

EAH (اللي نفسك فيه ؟) — Local discovery platform for Shibin El-Qanater + nearby villages.
Users discover restaurants, pharmacies, supermarkets, delivery offices.

- Live: https://eah-sq.vercel.app
- Repo: https://github.com/NExB7R/EAH (branch: ui-onlook)
- Stack: Next.js 16 + React 19 + Supabase + Vercel

## Quick Start

    cd ~/EAH/08-web
    npm install
    cp .env.example .env.local
    npm run dev

Open http://localhost:3000

## Repository Structure

    EAH/
    ├── 00-project-status.md         # current status
    ├── AGENTS.md                    # engineering rules (read!)
    ├── PROJECT_MEMORY.md            # cross-session memory (read!)
    ├── README_AI.md                 # this file
    ├── MASTER_REDESIGN_PLAN.md      # 2026 roadmap
    ├── docs/
    │   ├── PLATFORM_GUIDE_2026.md   # full platform guide
    │   ├── AGENT_BRIEF.md           # compact reference
    │   ├── CHANGELOG_ACTIVE.md      # current session changes
    │   ├── HANDOFF_2026_09_15.md    # session handoff
    │   └── VERCEL_SETUP_2026.md     # Vercel setup guide
    ├── 03-database/migrations/      # SQL source of truth
    └── 08-web/                      # Next.js app
        ├── app/                     # App Router
        ├── components/              # 100+ components
        ├── lib/                     # business logic
        └── public/                  # static assets

## Golden Rules

1. Git is source of truth — all SQL in migrations
2. No demo data in production
3. No deletion without approval — additive only
4. Use proxy.ts NOT middleware.ts (Next.js 16+)
5. Run typecheck before commit: npm run typecheck
6. No secrets in code — .env.local only
7. RLS is security-critical — never touch policies without review

## User Roles (4)

- customer    → Discover + Favorites + Reviews + Rewards
- merchant    → Above + Dashboard + Business edit + Analytics
- super_admin → Everything + Admin Panel + Studio + Users + Audit

Note: there is NO plain "admin" role. Only super_admin.

## Key Files (frequent edits)

- app/layout.tsx                  → Root layout + metadata + fonts
- app/page.tsx                    → Homepage (design-driven + fallback)
- components/floating-capsule.tsx → Floating header
- components/side-panel.tsx       → Side panel (ads)
- components/home-dynamic.tsx     → Default homepage
- lib/supabase-server.ts          → Server + service clients
- lib/profile-presets.ts          → AVATARS + badges
- proxy.ts                        → Auth middleware

## Bugs Fixed (recent)

- Logout broken      → proxy.ts now exempts /auth/logout
- Merchant form      → controlled inputs (no getElementById hacks)
- Sentry slow in dev → disabled unless NODE_ENV=production
- Header CSS error   → rebuilt from scratch

## Helpful Commands

    cd ~/EAH/08-web && npx tsc --noEmit    # typecheck
    cd ~/EAH/08-web && npm run build       # build
    cd ~/EAH/08-web && vercel --prod       # deploy
    cd ~/EAH && git log --oneline -10      # recent commits

## Read next

1. AGENTS.md                       — strict rules
2. PROJECT_MEMORY.md               — lessons from past sessions
3. docs/PLATFORM_GUIDE_2026.md     — full platform guide
