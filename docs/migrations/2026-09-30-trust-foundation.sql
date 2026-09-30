-- ============================================================
-- EAH — Migration 1: Trust + Activities Foundation (v3)
-- Date: 2026-09-30
-- Purpose: الأساسيات لنظام الأثر والتفاعل
-- ============================================================

-- ============================================================
-- 0. is_admin() — تأكد إنها موجودة
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  );
$$;

-- ============================================================
-- 1. profiles — أعمدة الأثر والخصوصية
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS impact_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impact_level text DEFAULT 'visitor',
  ADD COLUMN IF NOT EXISTS streak_days integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_last_date date,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz,
  ADD COLUMN IF NOT EXISTS wanted_level integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_until timestamptz,
  ADD COLUMN IF NOT EXISTS display_name_mode text DEFAULT 'real',
  ADD COLUMN IF NOT EXISTS alias text,
  ADD COLUMN IF NOT EXISTS hide_avatar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_favorites boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_following boolean DEFAULT false;

-- Constraint: display_name_mode
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_display_name_mode_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_mode_check
  CHECK (display_name_mode IN ('real', 'alias', 'both', 'anonymous'));

-- Constraint: impact_level
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_impact_level_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_impact_level_check
  CHECK (impact_level IN ('visitor', 'basic', 'member', 'regular'));

-- Constraint: wanted_level (0-5)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_wanted_level_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_wanted_level_check
  CHECK (wanted_level BETWEEN 0 AND 5);

-- Constraint: impact_score (0-1000)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_impact_score_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_impact_score_check
  CHECK (impact_score BETWEEN 0 AND 1000);

-- ============================================================
-- 2. business_activities — كل تفاعل
-- ============================================================

CREATE TABLE IF NOT EXISTS public.business_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_activities_business
  ON public.business_activities(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_activities_user
  ON public.business_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_activities_type
  ON public.business_activities(activity_type);

ALTER TABLE public.business_activities
  DROP CONSTRAINT IF EXISTS business_activities_type_check;
ALTER TABLE public.business_activities
  ADD CONSTRAINT business_activities_type_check
  CHECK (activity_type IN ('follow', 'favorite', 'like', 'comment', 'reply', 'rating', 'share'));

CREATE UNIQUE INDEX IF NOT EXISTS uniq_follow
  ON public.business_activities(business_id, user_id)
  WHERE activity_type = 'follow';
CREATE UNIQUE INDEX IF NOT EXISTS uniq_favorite
  ON public.business_activities(business_id, user_id)
  WHERE activity_type = 'favorite';

ALTER TABLE public.business_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_select_public" ON public.business_activities;
CREATE POLICY "activities_select_public"
  ON public.business_activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "activities_insert_self" ON public.business_activities;
CREATE POLICY "activities_insert_self"
  ON public.business_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activities_delete_self" ON public.business_activities;
CREATE POLICY "activities_delete_self"
  ON public.business_activities FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 3. business_reviews — عمود واحد بس (sentiment)
-- ============================================================

ALTER TABLE public.business_reviews
  ADD COLUMN IF NOT EXISTS sentiment text;

ALTER TABLE public.business_reviews
  DROP CONSTRAINT IF EXISTS business_reviews_sentiment_check;
ALTER TABLE public.business_reviews
  ADD CONSTRAINT business_reviews_sentiment_check
  CHECK (sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative'));

-- ============================================================
-- 4. moderation_queue — المراجعة الذكية
-- ============================================================

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  reason text NOT NULL,
  auto_flagged boolean DEFAULT false,
  report_count integer DEFAULT 0,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_status
  ON public.moderation_queue(status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_moderation_pending
  ON public.moderation_queue(entity_type, entity_id)
  WHERE status = 'pending';

ALTER TABLE public.moderation_queue
  DROP CONSTRAINT IF EXISTS moderation_queue_status_check;
ALTER TABLE public.moderation_queue
  ADD CONSTRAINT moderation_queue_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'escalated'));

ALTER TABLE public.moderation_queue
  DROP CONSTRAINT IF EXISTS moderation_queue_entity_check;
ALTER TABLE public.moderation_queue
  ADD CONSTRAINT moderation_queue_entity_check
  CHECK (entity_type IN ('review', 'comment', 'business', 'user'));

ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moderation_admin_only" ON public.moderation_queue;
CREATE POLICY "moderation_admin_only"
  ON public.moderation_queue FOR ALL USING (public.is_admin());
