-- EAH — Standing System (نظام الالتزام والعقوبات)
-- Date: 2026-11-06

BEGIN;

-- 1. إضافة حقول الالتزام للبروفايل
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS standing text DEFAULT 'good' CHECK (standing IN ('excellent', 'good', 'warning', 'restricted', 'suspended')),
  ADD COLUMN IF NOT EXISTS standing_expires_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS standing_reason text DEFAULT NULL;

-- 2. جدول سجل العقوبات (Cockpit Log)
CREATE TABLE IF NOT EXISTS public.standing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL, -- 'penalize', 'pardon', 'extend', 'shorten', 'ban'
  previous_standing text,
  new_standing text,
  reason text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 3. دالة للأدمن عشان يعدل العقوبة (أو يحظر)
CREATE OR REPLACE FUNCTION public.admin_manage_standing(
  p_user_id uuid,
  p_action text, -- 'penalize', 'pardon', 'ban'
  p_new_standing text,
  p_expires_at timestamptz,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_prev_standing text;
BEGIN
  -- تأكد إن اللي بيعمل ده أدمن
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'غير مصرح لك');
  END IF;

  -- جلب الحالة السابقة
  SELECT standing INTO v_prev_standing FROM public.profiles WHERE id = p_user_id;

  -- تعديل البروفايل
  UPDATE public.profiles
  SET standing = p_new_standing,
      standing_expires_at = p_expires_at,
      standing_reason = p_reason
  WHERE id = p_user_id;

  -- تسجيل الحركة في السجل
  INSERT INTO public.standing_events (user_id, admin_id, action, previous_standing, new_standing, reason, expires_at)
  VALUES (p_user_id, v_admin_id, p_action, v_prev_standing, p_new_standing, p_reason, p_expires_at);

  RETURN jsonb_build_object('ok', true);
END;
$$;

COMMIT;
