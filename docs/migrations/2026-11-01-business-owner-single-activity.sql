-- EAH: one linked business per merchant account.
-- The current merchant application and dashboard both operate on one business
-- per account. This index makes that invariant atomic at the database boundary.
-- Apply only to an isolated non-production database until verified and approved.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS businesses_one_owner_per_account_idx
ON public.businesses (owner_profile_id)
WHERE owner_profile_id IS NOT NULL;

COMMIT;
