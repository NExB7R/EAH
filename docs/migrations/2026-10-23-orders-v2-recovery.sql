-- ═══════════════════════════════════════════════════════════════════
-- EAH — Orders v2 Full Recovery (user_roles = user_id)
-- Date: 2026-10-23 · Idempotent
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Extend order_requests
ALTER TABLE order_requests
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS delivery_lat numeric(10, 7),
  ADD COLUMN IF NOT EXISTS delivery_lng numeric(10, 7),
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS secondary_phone text,
  ADD COLUMN IF NOT EXISTS deadline_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS expected_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_reminder_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_rating smallint,
  ADD COLUMN IF NOT EXISTS feedback_text text,
  ADD COLUMN IF NOT EXISTS feedback_issue_type text,
  ADD COLUMN IF NOT EXISTS snoozed_until timestamptz,
  ADD COLUMN IF NOT EXISTS expired_at timestamptz;

-- ── 2. Constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_payment_method') THEN
    ALTER TABLE order_requests ADD CONSTRAINT chk_orders_payment_method
      CHECK (payment_method IS NULL OR payment_method IN ('cash','instapay','wallet'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_feedback_rating') THEN
    ALTER TABLE order_requests ADD CONSTRAINT chk_orders_feedback_rating
      CHECK (feedback_rating IS NULL OR (feedback_rating BETWEEN 1 AND 5));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_feedback_issue') THEN
    ALTER TABLE order_requests ADD CONSTRAINT chk_orders_feedback_issue
      CHECK (feedback_issue_type IS NULL OR feedback_issue_type IN ('late','missing','quality','payment','other'));
  END IF;
END $$;

-- ── 3. Indexes
CREATE INDEX IF NOT EXISTS idx_orders_deadline
  ON order_requests(deadline_at)
  WHERE status IN ('sent','seen') AND deadline_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_feedback_due
  ON order_requests(feedback_due_at)
  WHERE feedback_sent_at IS NULL AND feedback_due_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_expected_delivery
  ON order_requests(expected_delivery_at)
  WHERE status IN ('accepted','preparing','on_way') AND expected_delivery_at IS NOT NULL;

-- ── 4. auth_is_admin (uses user_roles.user_id)
CREATE OR REPLACE FUNCTION auth_is_admin() RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text IN ('admin', 'super_admin')
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- ── 5. order_reactions
CREATE TABLE IF NOT EXISTS order_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES order_requests(id) ON DELETE CASCADE,
  actor_type text NOT NULL CHECK (actor_type IN ('customer','merchant','system','admin')),
  actor_id uuid,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_reactions_order
  ON order_reactions(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_reactions_actor
  ON order_reactions(actor_id, created_at DESC);

ALTER TABLE order_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reactions_select_related ON order_reactions;
CREATE POLICY reactions_select_related ON order_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM order_requests o
    WHERE o.id = order_reactions.order_id
      AND (o.customer_profile_id = auth.uid()
        OR o.business_id IN (SELECT id FROM businesses WHERE owner_profile_id = auth.uid())
        OR auth_is_admin())
  )
);

DROP POLICY IF EXISTS reactions_insert_related ON order_reactions;
CREATE POLICY reactions_insert_related ON order_reactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM order_requests o
    WHERE o.id = order_reactions.order_id
      AND (o.customer_profile_id = auth.uid()
        OR o.business_id IN (SELECT id FROM businesses WHERE owner_profile_id = auth.uid()))
  )
);

-- ── 6. merchant_order_settings
CREATE TABLE IF NOT EXISTS merchant_order_settings (
  business_id uuid PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  orders_enabled boolean NOT NULL DEFAULT false,
  deadline_minutes smallint NOT NULL DEFAULT 10 CHECK (deadline_minutes BETWEEN 5 AND 60),
  delivery_eta_minutes smallint CHECK (delivery_eta_minutes IS NULL OR (delivery_eta_minutes BETWEEN 15 AND 240)),
  offline_mode boolean NOT NULL DEFAULT false,
  offline_until timestamptz,
  auto_accept boolean NOT NULL DEFAULT false,
  missed_count_today smallint NOT NULL DEFAULT 0,
  missed_count_week smallint NOT NULL DEFAULT 0,
  last_missed_at timestamptz,
  last_miss_reset date NOT NULL DEFAULT CURRENT_DATE,
  suspended_until timestamptz,
  suspension_reason text,
  orders_enabled_at timestamptz,
  orders_disabled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE merchant_order_settings
  ADD COLUMN IF NOT EXISTS delivery_eta_minutes smallint,
  ADD COLUMN IF NOT EXISTS orders_enabled_at timestamptz,
  ADD COLUMN IF NOT EXISTS orders_disabled_at timestamptz;

ALTER TABLE merchant_order_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mos_select_own ON merchant_order_settings;
CREATE POLICY mos_select_own ON merchant_order_settings FOR SELECT
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_profile_id = auth.uid())
  OR auth_is_admin()
);

DROP POLICY IF EXISTS mos_update_own ON merchant_order_settings;
CREATE POLICY mos_update_own ON merchant_order_settings FOR UPDATE
USING (
  business_id IN (SELECT id FROM businesses WHERE owner_profile_id = auth.uid())
  OR auth_is_admin()
)
WITH CHECK (
  business_id IN (SELECT id FROM businesses WHERE owner_profile_id = auth.uid())
  OR auth_is_admin()
);

DROP POLICY IF EXISTS mos_insert_admin ON merchant_order_settings;
CREATE POLICY mos_insert_admin ON merchant_order_settings FOR INSERT
WITH CHECK (auth_is_admin());

CREATE OR REPLACE FUNCTION prevent_merchant_toggle_orders_enabled() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT auth_is_admin()
     AND NEW.orders_enabled IS DISTINCT FROM OLD.orders_enabled THEN
    RAISE EXCEPTION 'orders_enabled can only be changed by admin';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_prevent_toggle_orders_enabled ON merchant_order_settings;
CREATE TRIGGER trg_prevent_toggle_orders_enabled
BEFORE UPDATE ON merchant_order_settings
FOR EACH ROW EXECUTE FUNCTION prevent_merchant_toggle_orders_enabled();

-- ── 7. customer_order_stats
CREATE TABLE IF NOT EXISTS customer_order_stats (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_orders integer NOT NULL DEFAULT 0,
  successful_orders integer NOT NULL DEFAULT 0,
  cancelled_orders integer NOT NULL DEFAULT 0,
  no_show_count integer NOT NULL DEFAULT 0,
  total_spent_egp numeric(10, 2) NOT NULL DEFAULT 0,
  is_vip boolean NOT NULL DEFAULT false,
  last_order_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customer_order_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cos_select_own ON customer_order_stats;
CREATE POLICY cos_select_own ON customer_order_stats FOR SELECT
USING (profile_id = auth.uid() OR auth_is_admin());

CREATE OR REPLACE FUNCTION update_customer_stats_on_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.customer_profile_id IS NOT NULL THEN
    INSERT INTO customer_order_stats (profile_id, total_orders, last_order_at)
    VALUES (NEW.customer_profile_id, 1, now())
    ON CONFLICT (profile_id) DO UPDATE SET
      total_orders = customer_order_stats.total_orders + 1,
      last_order_at = now(),
      updated_at = now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_customer_stats_insert ON order_requests;
CREATE TRIGGER trg_customer_stats_insert
AFTER INSERT ON order_requests
FOR EACH ROW EXECUTE FUNCTION update_customer_stats_on_insert();

CREATE OR REPLACE FUNCTION update_customer_stats_on_delivered() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status <> 'delivered' AND NEW.customer_profile_id IS NOT NULL THEN
    INSERT INTO customer_order_stats (profile_id, successful_orders, is_vip)
    VALUES (NEW.customer_profile_id, 1, false)
    ON CONFLICT (profile_id) DO UPDATE SET
      successful_orders = customer_order_stats.successful_orders + 1,
      is_vip = (customer_order_stats.successful_orders + 1) >= 5,
      updated_at = now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_customer_stats_delivered ON order_requests;
CREATE TRIGGER trg_customer_stats_delivered
AFTER UPDATE ON order_requests
FOR EACH ROW EXECUTE FUNCTION update_customer_stats_on_delivered();

-- ── 8. Seed settings for existing businesses
INSERT INTO merchant_order_settings (business_id, orders_enabled)
SELECT id, false FROM businesses
ON CONFLICT (business_id) DO NOTHING;

COMMIT;

-- Verification:
-- SELECT table_name FROM information_schema.tables WHERE table_schema='public'
--   AND table_name IN ('merchant_order_settings','order_reactions','customer_order_stats');
-- Expected: 3 rows
-- SELECT auth_is_admin();  -- true if you are admin
