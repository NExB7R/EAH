# Project Bible — Local Discovery Platform

## Current status
- Working title: EAH
- Brand status: chosen by founder; legal/domain/social availability remains a separate verification gate
- Current version: v0.1.0-foundation
- Budget: 0 EGP initially
- Launch geography: Shebin El-Qanater + nearby villages/centers
- MVP does not receive orders inside the platform
- Founder will initially collect restaurants, menus, offers and delivery-office data manually

## Product promise
A local discovery platform that understands what is around the user and what fits their preferences, then connects them with the right place easily.

## Categories
- Restaurants
- Delivery offices
- Supermarkets (future but planned in architecture)
- Pharmacies (future but planned in architecture)
- Other local services later

## Core UX principles
- Personalized home for signed-in users
- Featured businesses can receive a paid boost, but paid placement must not overwhelm relevance/quality
- Favorites, exclusions and interaction history feed recommendations
- Location weighting depends on category
- Menus are image-based in MVP
- Offers are structured text + teaser image
- Contact details, payment methods, ratings and comments become visible after verified registration
- Privacy: system can know more than it exposes to businesses/users

## Customer profile
Registration: real phone number + OTP verification + name + password.
The platform maintains a private Customer Trust Score. It is not exposed as a raw score to restaurants.

## Ratings
Restaurant rating uses multiple dimensions such as taste, value, speed and experience, aggregated into an overall rating.
Offers have independent reactions such as “Worth it 🔥” and “Not for me”. Offer engagement feeds discovery and recommendation ranking.

## Recommendations
MVP starts rule-based. Future versions can use richer recommendation models. “Suggest food for me” is a signature feature using a short conversational questionnaire.

## Favorites & exclusions
Favorites trigger relevant updates/offer notifications. Exclusions are available from the first account release and can be reversed.

## Future ordering
Later: in-platform bot gathers order details, saves a structured order, and sends it to the selected restaurant through WhatsApp. Restaurant pays for the ordering service. WhatsApp is a communication channel, not the system of record.

## Future monetization
- Featured placement
- Restaurant ordering service subscription
- Delivery-office featured placement/subscription
- Ads
- Future search/CRM products
- Future partner-funded customer rewards/benefits

## Non-goals for MVP
- In-platform ordering
- Online payments
- Customer discounts/rewards
- Advanced CRM
- Complex AI infrastructure

## Versioning
Use semantic-style versions:
- v0.1.x = MVP foundation and bug fixes
- v0.2.x = major UX/recommendation improvements
- v0.3.x = merchant improvements
- v0.5.x = stronger recommendation engine
- v0.9.x = beta
- v1.0.0 = public launch

## Critical rule
The repository documents are the project's source of truth. Important decisions must not live only in chat.


## Live Supabase state
- Project ref: `npmpiivmdksdirrumbmt`
- Region: `eu-central-1` (Frankfurt)
- Status: ACTIVE_HEALTHY
- 10 public foundation tables exist with RLS enabled.
- Business phone/WhatsApp fields were removed from the public `businesses` table; contact methods live in `business_contact_methods` and require verified phone status.
- `businesses.owner_profile_id` exists for future merchant ownership.
- Migration history currently contains `20260910232459_foundation_security_hardening`; the original bootstrap still needs a clean baseline migration capture.
