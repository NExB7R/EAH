-- Applied to the current EAH pre-launch base on 2026-11-06 (Supabase migration version 20261106042744).
-- Cover the 14 foreign-key columns reported by Supabase Advisor.
-- The existing indexes were inspected first; none covered these FK columns
-- as a leading key. The tables are pre-launch/test data and no rows change.
-- Remove only the exact duplicate trust_badges(entity_type, entity_id) index.
-- Keep idx_trust_badges_entity as the surviving identical index.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_announcements_created_by
  ON public.announcements (created_by);

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

DROP INDEX IF EXISTS public.trust_badges_entity_idx;

COMMIT;
