# EAH! — RLS Matrix v0.1.0

| Resource | Visitor | Verified Customer | Merchant | Admin |
|---|---|---|---|---|
| Approved business public fields | READ | READ | READ | READ/WRITE |
| Menu images approved | READ | READ | own READ/WRITE | READ/WRITE |
| Offers approved | READ | READ | own READ/WRITE | READ/WRITE |
| Contact methods | NO | READ approved | own READ/WRITE | READ/WRITE |
| Payment methods | NO | READ approved | own READ/WRITE | READ/WRITE |
| Ratings/comments | NO | READ | own business READ, no private customer tables | READ/WRITE |
| Favorites | NO | own CRUD | NO | controlled/support |
| Exclusions | NO | own CRUD | NO | controlled/support |
| Preferences | NO | own CRUD | NO | controlled/support |
| Trust events/score | NO | own/history as product allows | NO | controlled |
| Notifications | NO | own READ/update read_at | NO | system/admin |
| Featured placements | NO | READ effect only | own READ | READ/WRITE |
| Reports | NO | own create/read status | can create/report responses as allowed | READ/WRITE |

## Enforcement
- Never authorize merchant access by trusting a client-supplied business_id.
- Verify ownership through server-side relationship checks.
- Prefer security-definer functions for sensitive actions with explicit grants.
