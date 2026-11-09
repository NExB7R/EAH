-- EAH — Approve customer1's test reviews (for verification)
-- Run in Supabase SQL Editor.
-- Correct columns: moderated_at, moderated_by (not reviewed_at).

UPDATE public.business_reviews
SET status = 'approved',
    moderated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'customer1@eah.test')
  AND status = 'pending';

-- تحقق
SELECT 
  status,
  count(*) AS cnt,
  max(moderated_at) AS last_moderation
FROM public.business_reviews
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'customer1@eah.test')
GROUP BY status;
