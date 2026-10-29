-- EAH — Require a registered Supabase identity for interactive mutations.
-- Supabase anonymous sign-ins still have auth.uid() and PostgreSQL role "authenticated".
-- These RESTRICTIVE mutation-only policies keep existing public read policies unchanged.
BEGIN;

DO $registered_interaction_auth$
DECLARE
  target record;
  policy_name text;
  guard_expression constant text :=
    'auth.uid() IS NOT NULL AND COALESCE((auth.jwt() ->> ''is_anonymous'')::boolean, false) = false';
BEGIN
  FOR target IN
    SELECT * FROM (VALUES
      ('business_activities', 'INSERT'),
      ('business_activities', 'DELETE'),
      ('business_comments', 'INSERT'),
      ('business_comments', 'UPDATE'),
      ('business_comments', 'DELETE'),
      ('comment_likes', 'INSERT'),
      ('comment_likes', 'DELETE'),
      ('business_follows', 'INSERT'),
      ('business_follows', 'DELETE'),
      ('comment_thread_follows', 'INSERT'),
      ('comment_thread_follows', 'UPDATE'),
      ('comment_thread_follows', 'DELETE'),
      ('business_reviews', 'INSERT'),
      ('business_reviews', 'UPDATE'),
      ('order_reactions', 'INSERT'),
      ('order_requests', 'INSERT'),
      ('order_requests', 'UPDATE'),
      ('chats', 'INSERT'),
      ('chats', 'UPDATE'),
      ('messages', 'INSERT'),
      ('messages', 'UPDATE'),
      ('offer_reactions', 'INSERT'),
      ('offer_reactions', 'UPDATE'),
      ('offer_reactions', 'DELETE'),
      ('favorites', 'INSERT'),
      ('favorites', 'UPDATE'),
      ('favorites', 'DELETE'),
      ('reports', 'INSERT'),
      ('push_subscriptions', 'INSERT'),
      ('push_subscriptions', 'UPDATE'),
      ('push_subscriptions', 'DELETE'),
      ('customer_locations', 'INSERT'),
      ('customer_locations', 'UPDATE'),
      ('customer_locations', 'DELETE'),
      ('coupons', 'INSERT'),
      ('coupons', 'UPDATE'),
      ('coupons', 'DELETE'),
      ('promo_posts', 'INSERT'),
      ('promo_posts', 'UPDATE'),
      ('promo_posts', 'DELETE'),
      ('business_partners', 'INSERT'),
      ('business_partners', 'UPDATE'),
      ('business_partners', 'DELETE'),
      ('merchant_applications', 'INSERT'),
      ('verification_requests', 'INSERT'),
      ('area_requests', 'INSERT'),
      ('business_branches', 'INSERT'),
      ('business_branches', 'UPDATE'),
      ('business_branches', 'DELETE'),
      ('merchant_order_settings', 'INSERT'),
      ('merchant_order_settings', 'UPDATE'),
      ('profiles', 'UPDATE'),
      ('notifications', 'UPDATE')
    ) AS policies(table_name, command_name)
  LOOP
    policy_name := 'registered_account_only_' || target.table_name || '_' || lower(target.command_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, target.table_name);

    IF target.command_name = 'INSERT' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR INSERT TO public WITH CHECK (%s)',
        policy_name, target.table_name, guard_expression
      );
    ELSIF target.command_name = 'UPDATE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR UPDATE TO public USING (%s) WITH CHECK (%s)',
        policy_name, target.table_name, guard_expression, guard_expression
      );
    ELSIF target.command_name = 'DELETE' THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR DELETE TO public USING (%s)',
        policy_name, target.table_name, guard_expression
      );
    END IF;
  END LOOP;
END
$registered_interaction_auth$;

COMMIT;
