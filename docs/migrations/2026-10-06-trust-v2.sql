-- ═══════════════════════════════════════════════════════════
-- EAH — Trust System 2.0 (2026-10-06)
-- 5 levels + Log scale (diminishing returns) + Legend Rank
-- Replaces: impact_score, impact_level, old tiers (pro/vip)
-- ═══════════════════════════════════════════════════════════

-- ═══ PART 1: Helpers ═══

DROP FUNCTION IF EXISTS public.get_trust_tier(integer);
CREATE OR REPLACE FUNCTION public.get_trust_tier(p_score integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score < 20 THEN 'baraka'
    WHEN p_score < 40 THEN 'active'
    WHEN p_score < 60 THEN 'mo3tabar'
    WHEN p_score < 80 THEN 'kebeer'
    ELSE 'legend'
  END;
$$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legend_points integer NOT NULL DEFAULT 0;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS legend_points integer NOT NULL DEFAULT 0;

ALTER TABLE public.profiles ALTER COLUMN trust_score SET DEFAULT 50;
ALTER TABLE public.profiles ALTER COLUMN trust_tier SET DEFAULT 'mo3tabar';
ALTER TABLE public.businesses ALTER COLUMN trust_score SET DEFAULT 50;
ALTER TABLE public.businesses ALTER COLUMN trust_tier SET DEFAULT 'mo3tabar';

-- ═══ PART 2: Core Engine ═══

DROP FUNCTION IF EXISTS public.award_trust_points(text, uuid, text, integer, jsonb);
CREATE OR REPLACE FUNCTION public.award_trust_points(
  p_entity_type text,
  p_entity_id uuid,
  p_event_type text,
  p_delta integer,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current integer;
  v_factor numeric;
  v_effective integer;
  v_new integer;
  v_tier text;
  v_legend integer;
  v_legend_delta integer := 0;
BEGIN
  IF p_entity_type = 'user' THEN
    SELECT trust_score, legend_points INTO v_current, v_legend
    FROM public.profiles WHERE id = p_entity_id;
  ELSIF p_entity_type = 'business' THEN
    SELECT trust_score, legend_points INTO v_current, v_legend
    FROM public.businesses WHERE id = p_entity_id;
  ELSE
    RAISE EXCEPTION 'invalid entity_type: %', p_entity_type;
  END IF;

  v_current := COALESCE(v_current, 50);
  v_legend := COALESCE(v_legend, 0);

  IF p_delta > 0 THEN
    v_factor := CASE
      WHEN v_current < 30 THEN 1.5
      WHEN v_current < 50 THEN 1.0
      WHEN v_current < 70 THEN 0.7
      WHEN v_current < 85 THEN 0.4
      WHEN v_current < 95 THEN 0.2
      ELSE 0.1
    END;
  ELSE
    v_factor := 1.0;
  END IF;

  v_effective := ROUND(p_delta * v_factor);
  v_new := GREATEST(0, LEAST(100, v_current + v_effective));

  IF v_current >= 100 AND p_delta > 0 THEN
    v_legend_delta := p_delta;
    v_new := 100;
  END IF;

  v_legend := v_legend + v_legend_delta;
  v_tier := public.get_trust_tier(v_new);

  IF p_entity_type = 'user' THEN
    UPDATE public.profiles
    SET trust_score = v_new, trust_tier = v_tier,
        legend_points = v_legend, trust_updated_at = now()
    WHERE id = p_entity_id;
  ELSE
    UPDATE public.businesses
    SET trust_score = v_new, trust_tier = v_tier,
        legend_points = v_legend, trust_updated_at = now()
    WHERE id = p_entity_id;
  END IF;

  INSERT INTO public.trust_events (
    entity_type, entity_id, event_type, delta, score_before, score_after, metadata
  ) VALUES (
    p_entity_type, p_entity_id, p_event_type, v_effective, v_current, v_new, p_metadata
  );

  RETURN jsonb_build_object(
    'before', v_current,
    'delta_raw', p_delta,
    'delta_effective', v_effective,
    'after', v_new,
    'tier', v_tier,
    'legend', v_legend
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_trust_points(text, uuid, text, integer, jsonb) TO authenticated;

-- ═══ PART 3: Triggers ═══

DROP TRIGGER IF EXISTS on_review_trust_trigger ON public.business_reviews;
DROP FUNCTION IF EXISTS public.on_review_added();

CREATE OR REPLACE FUNCTION public.on_review_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'approved') THEN
      PERFORM public.award_trust_points(
        'user', NEW.user_id, 'review_approved', 5,
        jsonb_build_object('review_id', NEW.id)
      );
      PERFORM public.award_trust_points(
        'business', NEW.business_id, 'review_received', 3,
        jsonb_build_object('review_id', NEW.id)
      );
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    PERFORM public.award_trust_points(
      'user', NEW.user_id, 'review_rejected', -15,
      jsonb_build_object('review_id', NEW.id, 'reason', NEW.flagged_reason)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_trust_trigger
  AFTER INSERT OR UPDATE ON public.business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.on_review_added();

DROP TRIGGER IF EXISTS on_order_trust_trigger ON public.order_requests;
DROP FUNCTION IF EXISTS public.on_order_confirmed();

CREATE OR REPLACE FUNCTION public.on_order_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP != 'UPDATE' THEN RETURN NEW; END IF;

  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    IF NEW.customer_profile_id IS NOT NULL THEN
      PERFORM public.award_trust_points(
        'user', NEW.customer_profile_id, 'order_completed', 8,
        jsonb_build_object('order_id', NEW.id)
      );
    END IF;
    PERFORM public.award_trust_points(
      'business', NEW.business_id, 'order_completed', 8,
      jsonb_build_object('order_id', NEW.id)
    );
  END IF;

  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    PERFORM public.award_trust_points(
      'business', NEW.business_id, 'order_rejected', -3,
      jsonb_build_object('order_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_trust_trigger
  AFTER UPDATE ON public.order_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.on_order_confirmed();

DROP TRIGGER IF EXISTS on_trust_updated_customer ON public.profiles;
DROP TRIGGER IF EXISTS on_trust_updated_business ON public.businesses;
DROP FUNCTION IF EXISTS public.on_trust_updated() CASCADE;

CREATE OR REPLACE FUNCTION public.on_trust_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.trust_score IS DISTINCT FROM OLD.trust_score THEN
    NEW.trust_tier := public.get_trust_tier(NEW.trust_score);
    NEW.trust_updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_trust_updated_customer
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.on_trust_updated();

-- ═══ PART 4: Decay ═══

DROP FUNCTION IF EXISTS public.apply_trust_decay();
CREATE OR REPLACE FUNCTION public.apply_trust_decay()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_users integer := 0;
  v_biz integer := 0;
  v_rec record;
BEGIN
  FOR v_rec IN
    SELECT id FROM public.profiles
    WHERE last_activity_at IS NOT NULL
      AND last_activity_at < (now() - interval '30 days')
      AND trust_score > 0
  LOOP
    PERFORM public.award_trust_points('user', v_rec.id, 'decay', -1, '{}'::jsonb);
    v_users := v_users + 1;
  END LOOP;

  FOR v_rec IN
    SELECT id FROM public.businesses
    WHERE last_activity_at IS NOT NULL
      AND last_activity_at < (now() - interval '30 days')
      AND trust_score > 0
  LOOP
    PERFORM public.award_trust_points('business', v_rec.id, 'decay', -1, '{}'::jsonb);
    v_biz := v_biz + 1;
  END LOOP;

  RETURN jsonb_build_object('users', v_users, 'businesses', v_biz);
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_trust_decay() TO authenticated;

-- ═══ PART 5: Cleanup ═══

ALTER TABLE public.profiles DROP COLUMN IF EXISTS impact_score;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS impact_level;

DROP TRIGGER IF EXISTS trigger_refresh_user_impact ON public.business_activities;
DROP FUNCTION IF EXISTS public.compute_user_impact(uuid);
DROP FUNCTION IF EXISTS public.level_from_impact(integer);
DROP FUNCTION IF EXISTS public.refresh_user_impact();

DROP TRIGGER IF EXISTS trigger_set_referral_code ON public.profiles;

-- ═══ PART 6: Fix data ═══

UPDATE public.profiles SET trust_score = 50 WHERE trust_score IS NULL;
UPDATE public.businesses SET trust_score = 50 WHERE trust_score IS NULL;
UPDATE public.profiles SET trust_tier = public.get_trust_tier(trust_score);
UPDATE public.businesses SET trust_tier = public.get_trust_tier(trust_score);

-- ═══ PART 7: Verification ═══

SELECT 'users_tier' AS check_name, trust_tier AS tier, COUNT(*)::text AS n
FROM public.profiles GROUP BY trust_tier
UNION ALL
SELECT 'businesses_tier', trust_tier, COUNT(*)::text
FROM public.businesses GROUP BY trust_tier
UNION ALL
SELECT 'impact_removed',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='impact_score')
  THEN 'FAIL' ELSE 'PASS' END, ''
UNION ALL
SELECT 'legend_added',
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='legend_points')
  THEN 'PASS' ELSE 'FAIL' END, '';
