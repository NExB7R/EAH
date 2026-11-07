-- EAH — Fix notify_merchant_on_review (type/link → notification_type/deep_link)
-- Date: 2026-11-08
-- Issue: Function used non-existent columns (type, link). Correct: notification_type, deep_link.
-- Impact: Any INSERT on business_reviews failed when business had an owner.

BEGIN;

CREATE OR REPLACE FUNCTION public.notify_merchant_on_review()
RETURNS TRIGGER AS $$
DECLARE
  v_owner uuid;
  v_business_name text;
  v_slug text;
BEGIN
  SELECT owner_profile_id, name, slug
  INTO v_owner, v_business_name, v_slug
  FROM public.businesses WHERE id = NEW.business_id;

  IF v_owner IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, notification_type, title, body, deep_link)
  VALUES (
    v_owner,
    'review',
    '⭐ تقييم جديد',
    'حد قيّم ' || v_business_name,
    '/merchant/businesses/' || v_slug || '/report'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
