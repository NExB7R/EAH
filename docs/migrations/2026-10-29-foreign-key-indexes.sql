-- EAH — Index missing foreign-key columns reported by Supabase advisors.
-- Date: 2026-10-29
-- All indexes are additive and idempotent. Verify on a non-production database first.
-- These indexes also keep parent-row deletes/updates from scanning child tables as data grows.

CREATE INDEX IF NOT EXISTS idx_announcements_created_by
  ON public.announcements (created_by);

CREATE INDEX IF NOT EXISTS idx_ads_approved_by
  ON public.ads (approved_by);

CREATE INDEX IF NOT EXISTS idx_area_requests_business_id
  ON public.area_requests (business_id);

CREATE INDEX IF NOT EXISTS idx_area_requests_requested_by
  ON public.area_requests (requested_by);

CREATE INDEX IF NOT EXISTS idx_area_requests_reviewed_by
  ON public.area_requests (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_business_insights_generated_by
  ON public.business_insights (generated_by);

CREATE INDEX IF NOT EXISTS idx_business_reviews_moderated_by
  ON public.business_reviews (moderated_by);

CREATE INDEX IF NOT EXISTS idx_businesses_claimed_by_user_id
  ON public.businesses (claimed_by_user_id);

CREATE INDEX IF NOT EXISTS idx_businesses_rejected_by
  ON public.businesses (rejected_by);

CREATE INDEX IF NOT EXISTS idx_businesses_verified_by
  ON public.businesses (verified_by);

CREATE INDEX IF NOT EXISTS idx_comment_thread_follows_business_id
  ON public.comment_thread_follows (business_id);

CREATE INDEX IF NOT EXISTS idx_engagement_events_user_id
  ON public.engagement_events (user_id);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_reviewed_by
  ON public.moderation_queue (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_system_errors_resolved_by
  ON public.system_errors (resolved_by);

CREATE INDEX IF NOT EXISTS idx_system_errors_user_id
  ON public.system_errors (user_id);

-- Post-migration verification:
-- SELECT conrelid::regclass AS table_name, conname
-- FROM pg_constraint
-- WHERE contype = 'f'
--   AND conrelid::regclass::text IN ('public.announcements', 'public.ads', 'public.area_requests',
--       'public.business_insights', 'public.business_reviews', 'public.businesses',
--       'public.comment_thread_follows', 'public.engagement_events',
--       'public.moderation_queue', 'public.system_errors')
-- ORDER BY 1, 2;
