-- ═══════════════════════════════════════════════════════════
-- EAH — Migration: Comment Thread Follows (YouTube-style)
-- التاريخ: 2026-10-07
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.comment_thread_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  root_comment_id uuid NOT NULL REFERENCES public.business_comments(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, root_comment_id)
);

CREATE INDEX IF NOT EXISTS idx_ctf_user
  ON public.comment_thread_follows(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ctf_root
  ON public.comment_thread_follows(root_comment_id);

ALTER TABLE public.comment_thread_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ctf_read_all" ON public.comment_thread_follows;
CREATE POLICY "ctf_read_all" ON public.comment_thread_follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ctf_self_all" ON public.comment_thread_follows;
CREATE POLICY "ctf_self_all" ON public.comment_thread_follows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
