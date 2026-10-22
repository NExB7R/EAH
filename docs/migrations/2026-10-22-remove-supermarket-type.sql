-- EAH — Remove 'supermarket' type — keep 4 core types
-- 2026-10-22
--
-- New core types: restaurant · pharmacy · delivery_office · misc
-- supermarket merged into misc (custom_business_type describes it).

UPDATE businesses SET business_type = 'misc' WHERE business_type = 'supermarket';

ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_business_type_check;
ALTER TABLE businesses ADD CONSTRAINT businesses_business_type_check
  CHECK (business_type IN ('restaurant', 'pharmacy', 'delivery_office', 'misc'));
