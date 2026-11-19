-- EAH — Scoped QA fixture cleanup.
-- Run only after connecting to a dedicated non-production QA Supabase project.
-- This file is intentionally not run by CI or by application code.
--
-- Explicit operator opt-in is required in the SAME SQL session:
--   SET eah.allow_qa_cleanup = 'yes';
-- Without that setting, this script raises an exception before deleting rows.
--
-- Scope: businesses whose slug starts with eah-qa-test- and rows linked to them.
-- It does not delete auth users, phone-search logs, generic audit rows, or production data.

BEGIN;

DO $guard$
BEGIN
  IF current_setting('eah.allow_qa_cleanup', true) IS DISTINCT FROM 'yes' THEN
    RAISE EXCEPTION
      'QA cleanup blocked. Confirm the isolated non-production project, then SET eah.allow_qa_cleanup = ''yes'' in this session.';
  END IF;
END
$guard$;

CREATE TEMP TABLE eah_qa_cleanup_business_ids
ON COMMIT DROP
AS
SELECT id
FROM public.businesses
WHERE slug LIKE 'eah-qa-test-%';

-- A no-op is safer than guessing at older QA/demo records with undocumented slugs.
-- Review the target list before running this file.
-- SELECT b.id, b.slug, b.name FROM public.businesses b
-- JOIN eah_qa_cleanup_business_ids qa ON qa.id = b.id ORDER BY b.slug;

DELETE FROM public.business_reviews
WHERE business_id IN (SELECT id FROM eah_qa_cleanup_business_ids);

DELETE FROM public.business_comments
WHERE business_id IN (SELECT id FROM eah_qa_cleanup_business_ids);

DELETE FROM public.offers
WHERE business_id IN (SELECT id FROM eah_qa_cleanup_business_ids);

DELETE FROM public.business_branches
WHERE business_id IN (SELECT id FROM eah_qa_cleanup_business_ids);

DELETE FROM public.merchant_order_settings
WHERE business_id IN (SELECT id FROM eah_qa_cleanup_business_ids);

DELETE FROM public.order_requests
WHERE business_id IN (SELECT id FROM eah_qa_cleanup_business_ids);

DELETE FROM public.business_follows
WHERE business_id IN (SELECT id FROM eah_qa_cleanup_business_ids);

DELETE FROM public.favorites
WHERE business_id IN (SELECT id FROM eah_qa_cleanup_business_ids);

DELETE FROM public.audit_logs
WHERE entity_type = 'business'
  AND entity_id::text IN (
    SELECT id::text FROM eah_qa_cleanup_business_ids
  );

DELETE FROM public.businesses
WHERE id IN (SELECT id FROM eah_qa_cleanup_business_ids);

COMMIT;

-- Verify after execution (expected zero QA fixtures in this isolated project):
-- SELECT count(*) FROM public.businesses WHERE slug LIKE 'eah-qa-test-%';
