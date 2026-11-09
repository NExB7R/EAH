-- EAH — Approve customer1's test reviews (for verification)
-- Run in Supabase SQL Editor.

UPDATE public.business_reviews
SET status = 'approved',
    reviewed_at = now(),
    reviewed_by = (SELECT id FROM auth.users WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'super_admin') LIMIT 1)
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'customer1@eah.test')
  AND status = 'pending';

-- تحقق
SELECT 
  (SELECT count(*) FROM business_reviews 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'customer1@eah.test') 
     AND status = 'approved') AS approved_count;
