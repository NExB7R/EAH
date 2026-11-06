-- EAH — Disable stale in-app order settings on ownerless activities.
-- Public visibility and direct contact channels remain unchanged.
-- Internal orders require a linked seller; the runtime already fails closed.
-- Applied to the current EAH pre-launch base on 2026-11-06 (Supabase migration version 20261106035929); safe to re-run.

BEGIN;

UPDATE public.businesses
SET accepts_orders = false
WHERE owner_profile_id IS NULL
  AND accepts_orders IS TRUE;

UPDATE public.merchant_order_settings AS mos
SET orders_enabled = false,
    orders_disabled_at = now(),
    updated_at = now()
FROM public.businesses AS b
WHERE b.id = mos.business_id
  AND b.owner_profile_id IS NULL
  AND mos.orders_enabled IS TRUE;

COMMIT;
