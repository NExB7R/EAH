# EAH - ARCHITECTURE.md

> Technical architecture for EAH platform.
> Read MASTER_BRIEF.md first.

Last updated: 2026-09-24
Version: 1.0

---

## 1. Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript 5.9 (strict)
- CSS Modules
- @fontsource-variable/cairo
- @fontsource-variable/tajawal

### Backend
- Supabase (Postgres + Auth + Storage + Realtime)
- Next.js API Routes (serverless)
- Vercel Cron Jobs

### Services
- Cloudinary (images)
- Web Push (VAPID)
- Cloudflare Turnstile (bot protection)

### Hosting
- Vercel (Frankfurt - fra1)
- Supabase (Frankfurt - eu-central-1)
- Cloudinary (global CDN)

---

## 2. Project Structure

eah/
├── docs/               # Documentation (13 files)
├── web/                # Next.js app
│   ├── app/            # App Router
│   │   ├── (public)/   # Public routes
│   │   ├── account/    # User account
│   │   ├── merchant/   # Merchant dashboard
│   │   ├── admin/      # Admin panel
│   │   ├── api/        # API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx    # Home
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/         # Base UI
│   │   ├── icons/      # SVG icons
│   │   └── [feature]/  # Feature components
│   ├── lib/
│   │   ├── supabase/   # 4 clients
│   │   ├── data/       # Data fetchers
│   │   ├── search/     # Search logic
│   │   ├── ranking/    # Business ranking
│   │   └── utils/      # Helpers
│   └── public/
└── package.json

---

## 3. Supabase Clients

### 3.1 Public Client
File: lib/supabase/public.ts
Used for: Public reads (businesses, offers, reviews)
Features: No cookies, cacheable
Auth: Anonymous
Use with: unstable_cache

### 3.2 Server Client
File: lib/supabase/server.ts
Used for: Auth-aware server components
Features: Reads cookies
Auth: User session
Use with: force-dynamic only

### 3.3 Service Client
File: lib/supabase/service.ts
Used for: Admin operations (bypass RLS)
Features: Service role key
Auth: Server-only
Use with: Audit-logged

### 3.4 Browser Client
File: lib/supabase/browser.ts
Used for: Client components with auth
Features: Browser session
Auth: User session
Use with: Client components only

---

## 4. Data Flow

### 4.1 Public Reads (Home, Explore)
Route: force-dynamic
Client: createPublicClient (no cookies)
Cache: unstable_cache at module level
Flow: Request -> cache check -> if miss: query Supabase (RLS public) -> cache + return

### 4.2 Auth-Aware Reads (Account, Merchant)
Route: force-dynamic
Client: createClient (with cookies)
Cache: No cache (user-specific)
Flow: Request -> proxy.ts session check -> query Supabase (RLS self) -> return

### 4.3 Mutations (Create, Update, Delete)
Route: API routes
Client: createClient OR createServiceClient
Cache: revalidatePath/tag after
Flow: Client submit -> validate (zod) -> rate limit -> mutation -> revalidate -> return

---

## 5. Caching Strategy

### 5.1 Module-Level Cache
unstable_cache with tags + revalidate
MUST be at module level, NEVER inside component

### 5.2 Route-Level Cache
export const revalidate = 120
Used in: /offers, /trends, /new, /businesses/[slug], /search, /recommend, /sitemap

### 5.3 Static Cache
export const dynamic = 'force-static'
Used in: /about, /terms, /privacy, /cookies, /pricing

### 5.4 No Cache
export const dynamic = 'force-dynamic'
Used in: /, /explore, /account/*, /merchant/*, /admin/*


---

## 6. Authentication Flow

### 6.1 Signup
1. User submits phone + password
2. Supabase Auth creates user
3. Trigger handle_new_user runs
4. Creates profile + assigns customer role
5. Returns session
6. Client stores session

### 6.2 Login
1. User submits credentials
2. Supabase Auth verifies
3. Returns session cookies
4. proxy.ts refreshes session on every request
5. Server components read user via createClient

### 6.3 Session Refresh
File: proxy.ts (not middleware.ts)

- Runs on every request
- Refreshes expired sessions
- Redirects unauthenticated from protected routes
- Injects user into request headers

### 6.4 Logout
- POST to /auth/logout
- Clears session cookies
- Redirects to /

---

## 7. RLS Strategy

### 7.1 Public Read
- businesses: is_published = true
- business_media: is_published = true
- business_reviews: status = approved
- offers: is_published = true AND active dates

### 7.2 Owner Read/Write
- businesses: owner_profile_id = auth.uid()
- business_media: via business ownership
- business_reviews: business owner can reply

### 7.3 Self Read/Write
- profiles: id = auth.uid()
- favorites: user_id = auth.uid()
- follows: user_id = auth.uid()
- orders: customer_profile_id = auth.uid()
- notifications: user_id = auth.uid()

### 7.4 Admin Full
- is_admin() function checks super_admin role
- Used for privileged operations
- Audit logged

### 7.5 Service Role
- Bypasses RLS
- Only on server
- For cross-user operations
- Never exposed to client

---

## 8. API Routes

### 8.1 Public APIs
- /api/qr - QR code generation
- /api/og - OpenGraph images
- /api/ads/active - Active ads
- /api/reveal-contact - Contact reveal (rate-limited)

### 8.2 Auth APIs
- /api/auth/change-password
- /api/auth/logout

### 8.3 User APIs
- /api/profile/update
- /api/favorites
- /api/follows
- /api/reviews
- /api/orders/notify
- /api/push/subscribe
- /api/locations

### 8.4 Merchant APIs
- /api/merchant/export
- /api/merchant/menu
- /api/merchant/qr-svg
- /api/merchant/subscription/request
- /api/admin/upload
- /api/upload/order-image
- /api/upload/voice

### 8.5 Admin APIs
- /api/admin/export
- /api/admin/collect
- /api/admin/generate-report
- /api/admin/pending

### 8.6 Cron APIs
- /api/cron/subscription-check (daily 9am)
- /api/cron/trial-reminder (7am, 7pm)
- /api/cron/review-reminder
- /api/cron/monthly-reports
- /api/cron/trust-decay

---

## 9. Realtime

### 9.1 Live Visitors
- Table: page_view_events
- Subscription: count of active visitors
- Display: small widget on home

### 9.2 Notifications
- Table: notifications
- Subscription: self only
- Display: badge count in header

### 9.3 Order Updates
- Table: order_requests
- Subscription: customer + merchant
- Display: real-time status

---

## 10. Storage Buckets

### 10.1 business-media
- Public read
- Owner write (via RLS)
- Paths: {business_id}/{type}/{filename}
- Types: logo, cover, gallery, menu

### 10.2 avatars
- Public read
- Self write
- Paths: {user_id}/{filename}

### 10.3 order-images
- Private
- Self + merchant read
- Self write
- Paths: {order_id}/{filename}

### 10.4 order-voice
- Private
- Self + merchant read
- Self write
- Paths: {order_id}/{filename}

---

## 11. Image Optimization

### 11.1 Cloudinary

URLs:
- Base: res.cloudinary.com/{cloud}/image/upload/
- Transforms: f_auto,q_auto:eco,w_{size},h_{size},c_fill

Sizes:
- Card: 400x300
- Large: 800x600
- Cover: 1200x800
- Hero: 1600x1000

### 11.2 next/image

- Used for: local assets, user avatars
- Formats: AVIF, WebP
- Device sizes: [320, 480, 640, 768, 1024, 1280]
- Image sizes: [64, 96, 128, 200, 256, 384]

---

## 12. Cron Jobs

### 12.1 subscription-check
- Schedule: 0 9 * * * (9am daily)
- Task: Check expiring subscriptions, send reminders

### 12.2 trial-reminder
- Schedule: 0 7,19 * * * (7am, 7pm)
- Task: Remind trial users before expiry

### 12.3 review-reminder
- Schedule: 0 * * * * (hourly)
- Task: Remind users to review after 1 hour

### 12.4 monthly-reports
- Schedule: 0 10 1 * * (1st of month)
- Task: Generate merchant reports

### 12.5 trust-decay
- Schedule: 0 0 * * * (midnight)
- Task: Decay inactive user trust scores

---

## 13. Error Handling

### 13.1 Client Errors
- Toast notification
- Log to console (dev only)
- Retry logic for network errors

### 13.2 Server Errors
- Try/catch in API routes
- Return structured error response
- Log to Sentry (future)

### 13.3 Fallbacks
- Empty states (no data)
- Error boundaries (React)
- Offline page (PWA)

---

## 14. Performance

### 14.1 Bundle Size
- Target: < 200KB initial JS
- Code splitting per route
- Dynamic imports for heavy components

### 14.2 Images
- Cloudinary transforms
- next/image for local
- Lazy loading (default)

### 14.3 Fonts
- Cairo Variable (self-hosted)
- font-display: swap
- Preload critical

### 14.4 CSS
- CSS Modules (scoped)
- No unused rules
- Critical CSS inline (future)

### 14.5 Caching
- unstable_cache (module level)
- Route revalidate
- CDN (Vercel Edge)

---

## 15. Security

### 15.1 Headers
- CSP (strict)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- HSTS

### 15.2 Rate Limiting
- In-memory (dev)
- Upstash Redis (production - future)
- Per IP + per user

### 15.3 Validation
- Zod schemas for all inputs
- Server-side only
- No client trust

### 15.4 Secrets
- .env.local only
- Never in Git
- Vercel env vars
- Rotated regularly

---

## 16. Monitoring

### 16.1 Vercel Analytics
- Page views
- Web Vitals
- Deployment status

### 16.2 Supabase Logs
- Query performance
- Auth events
- RLS denials

### 16.3 Custom
- Audit logs (in DB)
- Error logs (future Sentry)
- Performance metrics

---

## 17. Deployment

### 17.1 Local
- npm run dev
- localhost:3000
- Supabase dev project

### 17.2 Preview
- Every push to v2
- Vercel Preview URL
- Test before production

### 17.3 Production
- Merge to v2 (default branch)
- Vercel auto-deploy
- eah-sq.vercel.app

### 17.4 Rollback
- Vercel: Instant rollback to previous
- Git: Revert + force push
- Supabase: Restore from backup

---

## 18. Environment Variables

Required:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- NEXT_PUBLIC_VAPID_PUBLIC_KEY
- VAPID_SUBJECT
- CRON_SECRET
- EAH_VISITOR_SALT

Optional:
- NEXT_PUBLIC_APP_VERSION
- TURNSTILE_SECRET_KEY
- NEXT_PUBLIC_TURNSTILE_SITE_KEY

---

## 19. Testing Strategy

### 19.1 Manual (Phase 1-3)
- Every feature tested on:
  - iPhone SE (320px)
  - iPhone 14 (393px)
  - iPad (768px)
  - Desktop (1440px)

### 19.2 Automated (Future)
- Vitest for unit tests
- Playwright for E2E
- Lighthouse CI for perf

---

## 20. Related Files

- docs/MASTER_BRIEF.md - Vision
- docs/SCHEMA.sql - Database schema
- docs/SACRED.md - Sacred files
- docs/AI_CONTRACT.md - Rules

---

Last updated: 2026-09-24
Version: 1.0
Owner: NourEldin B7R
