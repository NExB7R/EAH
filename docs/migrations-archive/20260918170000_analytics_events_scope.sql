-- ═══════════════════════════════════════════════════════════════
-- Analytics Events — Scope Expansion
-- تاريخ: 2026-09-18
-- ═══════════════════════════════════════════════════════════════

-- تأكد من وجود event_scope
ALTER TABLE public.page_view_events
  ADD COLUMN IF NOT EXISTS event_scope text DEFAULT 'business_view';

-- Index للأداء
CREATE INDEX IF NOT EXISTS pve_scope_idx
  ON public.page_view_events (event_scope, occurred_at DESC);

CREATE INDEX IF NOT EXISTS pve_biz_scope_idx
  ON public.page_view_events (business_id, event_scope, occurred_at DESC)
  WHERE business_id IS NOT NULL;

-- RPC: business funnel stats
CREATE OR REPLACE FUNCTION public.get_business_funnel(
  p_business_id uuid,
  p_days integer DEFAULT 30
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_since timestamptz := now() - (p_days || ' days')::interval;
  v_views int;
  v_reveals int;
  v_order_start int;
  v_order_confirm int;
  v_peak_hours jsonb;
BEGIN
  SELECT COUNT(*) INTO v_views FROM public.page_view_events
    WHERE business_id = p_business_id AND occurred_at >= v_since AND event_scope = 'business_view';

  SELECT COUNT(*) INTO v_reveals FROM public.page_view_events
    WHERE business_id = p_business_id AND occurred_at >= v_since AND event_scope = 'business_reveal';

  SELECT COUNT(*) INTO v_order_start FROM public.page_view_events
    WHERE business_id = p_business_id AND occurred_at >= v_since AND event_scope = 'order_start';

  SELECT COUNT(*) INTO v_order_confirm FROM public.page_view_events
    WHERE business_id = p_business_id AND occurred_at >= v_since AND event_scope = 'order_confirm';

  SELECT COALESCE(jsonb_agg(row_to_json(h)), '[]'::jsonb) INTO v_peak_hours
  FROM (
    SELECT
      EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'Africa/Cairo')::int AS hour,
      COUNT(*)::int AS count
    FROM public.page_view_events
    WHERE business_id = p_business_id
      AND occurred_at >= v_since
      AND event_scope = 'business_view'
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT 5
  ) h;

  RETURN jsonb_build_object(
    'views', v_views,
    'reveals', v_reveals,
    'order_start', v_order_start,
    'order_confirm', v_order_confirm,
    'conversion_rate', CASE WHEN v_views > 0
      THEN ROUND((v_order_confirm::numeric / v_views) * 100, 2) ELSE 0 END,
    'peak_hours', v_peak_hours
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_business_funnel TO authenticated;

COMMENT ON FUNCTION public.get_business_funnel IS 'قمع تحويل نشاط: مشاهدات → كشوف → طلبات + ساعات الذروة';
