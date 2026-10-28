-- EAH: order expiry worker uses status='expired'; keep the database constraint aligned.
ALTER TABLE public.order_requests
  DROP CONSTRAINT IF EXISTS order_requests_status_check;

ALTER TABLE public.order_requests
  ADD CONSTRAINT order_requests_status_check
  CHECK (status = ANY (ARRAY[
    'sent'::text,
    'seen'::text,
    'accepted'::text,
    'rejected'::text,
    'preparing'::text,
    'on_way'::text,
    'delivered'::text,
    'cancelled'::text,
    'expired'::text
  ]));

COMMENT ON CONSTRAINT order_requests_status_check ON public.order_requests IS
  'Order states supported by the seller workflow and lazy expiry process.';
