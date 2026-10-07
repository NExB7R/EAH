-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: Threaded Comments
-- التاريخ: 2026-10-07
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.business_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.business_comments(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  depth int NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 2),
  likes_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'hidden', 'deleted')),
  is_edited boolean NOT NULL DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_comments_business
  ON public.business_comments(business_id, created_at DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_business_comments_parent
  ON public.business_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_business_comments_user
  ON public.business_comments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id uuid NOT NULL REFERENCES public.business_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user
  ON public.comment_likes(user_id, created_at DESC);

-- RLS
ALTER TABLE public.business_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_public_read" ON public.business_comments;
CREATE POLICY "comments_public_read" ON public.business_comments
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "comments_self_insert" ON public.business_comments;
CREATE POLICY "comments_self_insert" ON public.business_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_self_update" ON public.business_comments;
CREATE POLICY "comments_self_update" ON public.business_comments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_self_delete" ON public.business_comments;
CREATE POLICY "comments_self_delete" ON public.business_comments
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_public_read" ON public.comment_likes;
CREATE POLICY "likes_public_read" ON public.comment_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "likes_self_insert" ON public.comment_likes;
CREATE POLICY "likes_self_insert" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_self_delete" ON public.comment_likes;
CREATE POLICY "likes_self_delete" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger: احسب depth تلقائياً
CREATE OR REPLACE FUNCTION public.set_comment_depth()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.depth := 0;
  ELSE
    SELECT depth + 1 INTO NEW.depth FROM public.business_comments WHERE id = NEW.parent_id;
    IF NEW.depth > 2 THEN
      RAISE EXCEPTION 'أقصى عمق للرد هو 2';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_comment_depth ON public.business_comments;
CREATE TRIGGER trg_comment_depth
  BEFORE INSERT ON public.business_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_comment_depth();

-- Trigger: احسب likes_count
CREATE OR REPLACE FUNCTION public.refresh_comment_likes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cid uuid;
BEGIN
  cid := COALESCE(NEW.comment_id, OLD.comment_id);
  IF cid IS NULL THEN RETURN NULL; END IF;
  UPDATE public.business_comments
  SET likes_count = (SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = cid)
  WHERE id = cid;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS trg_comment_likes ON public.comment_likes;
CREATE TRIGGER trg_comment_likes
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.refresh_comment_likes();

-- Trigger: Rate limit 5/15min
CREATE OR REPLACE FUNCTION public.comment_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cnt integer;
BEGIN
  SELECT COUNT(*) INTO cnt FROM public.business_comments
  WHERE user_id = NEW.user_id AND created_at > now() - interval '15 minutes';
  IF cnt >= 5 THEN
    RAISE EXCEPTION 'كثير شوية — جرب بعد شوية';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_comment_rate ON public.business_comments;
CREATE TRIGGER trg_comment_rate
  BEFORE INSERT ON public.business_comments
  FOR EACH ROW EXECUTE FUNCTION public.comment_rate_limit();
