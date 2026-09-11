# EAH v0.1.0 — Supabase Setup

## Current step
The project has a first executable PostgreSQL migration at:

`03-database/migrations/0001_eah_v0_1_0.sql`

## What it creates
- `app` schema
- profiles / customer preferences
- areas
- businesses / locations / categories
- restaurant menu image metadata
- offers
- gated contact and payment methods
- delivery coverage
- favorites and exclusions
- restaurant ratings + dimensions
- offer reactions
- notifications
- featured placements
- customer trust events / scores
- reports / admin actions
- RLS policies and helper functions
- public directory views
- PostGIS location support
- auth user → profile bootstrap trigger

## Intentionally disabled
- orders
- order items/events
- WhatsApp ordering
- rewards/benefits
- payment processing

## Important
Run this only against a fresh development Supabase project first. Review the policies before production launch. Never put the Supabase service-role key in the client.
