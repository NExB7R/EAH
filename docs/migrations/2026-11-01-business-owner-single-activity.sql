-- EAH: one linked business per merchant account.
-- The current merchant application and dashboard both operate on one business
-- per account. This index makes that invariant atomic at the database boundary.
-- Applied to the current EAH pre-launch base on 2026-11-06 (Supabase migration version 20261106035702).

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS businesses_one_owner_per_account_idx
ON public.businesses (owner_profile_id)
WHERE owner_profile_id IS NOT NULL;

COMMIT;
