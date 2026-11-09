-- EAH — Enforce Contact Privacy (2026-11-09)
-- المشكلة: phone/whatsapp كان ممكن يتخزنوا بـ is_public = true (يخالف سياسة الخصوصية).
-- الحل: تنظيف البيانات الحالية + CHECK constraint + trigger يمنع التسريب مستقبلًا.

BEGIN;

-- ─── 1. تنظيف البيانات الحالية ───
UPDATE public.business_contact_methods
SET is_public = false
WHERE is_public = true
  AND method_type IN ('phone', 'whatsapp');

-- ─── 2. CHECK constraint: phone/whatsapp لازم is_public = false ───
ALTER TABLE public.business_contact_methods
  DROP CONSTRAINT IF EXISTS phone_whatsapp_not_public;
ALTER TABLE public.business_contact_methods
  ADD CONSTRAINT phone_whatsapp_not_public
  CHECK (
    method_type NOT IN ('phone', 'whatsapp') OR is_public = false
  );

-- ─── 3. Trigger: لو حد حاول يخزن phone/whatsapp بـ is_public = true (bypass CHECK) ───
CREATE OR REPLACE FUNCTION public.force_phone_whatsapp_private()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.method_type IN ('phone', 'whatsapp') THEN
    NEW.is_public := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_phone_whatsapp_privacy ON public.business_contact_methods;
CREATE TRIGGER enforce_phone_whatsapp_privacy
BEFORE INSERT OR UPDATE ON public.business_contact_methods
FOR EACH ROW EXECUTE FUNCTION public.force_phone_whatsapp_private();

-- ─── 4. التحقق ───
DO $$
DECLARE
  v_leaked int;
BEGIN
  SELECT count(*) INTO v_leaked
  FROM public.business_contact_methods
  WHERE is_public = true AND method_type IN ('phone', 'whatsapp');
  
  IF v_leaked > 0 THEN
    RAISE EXCEPTION 'فيه % أرقام مكشوفة لسه بعد التنظيف!', v_leaked;
  END IF;
  
  RAISE NOTICE '✅ Privacy enforced: 0 phone/whatsapp public';
END $$;

COMMIT;
