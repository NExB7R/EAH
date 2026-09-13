# EAH — Project Overview

> Public documentation. For internal details, see `.private/` (not in Git).

## What is EAH?
EAH is a local discovery platform for Shebin El-Qanater and nearby villages.
The tagline is: **اللى نفسك فيه ؟** (What do you feel like?)

## Mission
Help people discover local restaurants, pharmacies, supermarkets and
delivery offices — with a mobile-first, dark-mode PWA experience.

## Tech Stack
- Next.js 16 + React 19 + Tailwind
- Supabase (Postgres + Auth + Storage + RLS)
- Vercel (hosting)
- GitHub (source of truth)

## Repository Structure
- `08-web/` — the Next.js application
- `03-database/migrations/` — SQL migrations (applied manually)
- `04-design/` — brand and design system

## Golden Rules
1. Git is the source of truth
2. All SQL applied manually in Supabase SQL Editor
3. Security review before merging any feature
4. Preserve prior functionality
5. Batch deploys at milestone completion

## Roles
- `customer` — normal user
- `merchant` — owns businesses
- `admin` — manages content
- `super_admin` — full platform control

## Status
**Version:** v0.2.x (Discovery + UX + PWA)
See `00-project-status.md` for current state.

## License
Proprietary — see `LICENSE`.

## Contribution
Internal project. Contact via GitHub @NExB7R.
