-- EAH QA-only fixtures. Every public fixture is clearly labeled and expires within six days.
-- QA card art only. These local, unmistakably labeled illustrations are not real business photography.
UPDATE public.businesses
SET cover_image_url = CASE
  WHEN business_type = 'restaurant' THEN 'https://eah-sq.vercel.app/qa/eah-qa-restaurant.svg'
  WHEN business_type = 'pharmacy' THEN 'https://eah-sq.vercel.app/qa/eah-qa-pharmacy.svg'
  WHEN business_type = 'delivery_office' THEN 'https://eah-sq.vercel.app/qa/eah-qa-delivery.svg'
  ELSE 'https://eah-sq.vercel.app/qa/eah-qa-misc.svg'
END
WHERE slug LIKE 'eah-qa-test-%';

-- Safe to rerun: activities upsert by slug, contact rows by unique value, offers by business+title.
-- The multi-contact fixture deliberately enables WhatsApp detail choices only; cards show online-order status, not WhatsApp.

INSERT INTO public.businesses (
  id, name, slug, business_type, area, city, source, owner_profile_id,
  description, hook, is_published, is_open, is_featured, is_verified,
  is_new_project, is_opportunity, opportunity_until, opportunity_note,
  featured_order, featured_until, featured_pin, new_until,
  accepts_orders, accepts_whatsapp_orders, successful_orders, rating_avg, rating_count,
  important_notice, notice_expires_at, notice_severity, business_type_status
)
VALUES
  ('7f47ef2e-9f35-4e5c-bbc9-5e6201221a01','اختبار EAH — بطاقة مميزة مطعم (لا تتعامل)','eah-qa-test-featured-restaurant-20261030','restaurant','شبين القناطر','شبين القناطر','admin',NULL,'نشاط اصطناعي لاختبار كارد الأنشطة المميزة والفلاتر. لا يمثل مطعمًا حقيقيًا.','بطاقة اختبار للمميز — لا تتعامل',true,true,true,false,false,false,NULL,NULL,1,now()+interval '6 days',true,NULL,false,false,0,0,0,'نشاط اختبار معلن: لا يمثل نشاطًا حقيقيًا. لا تتواصل أو تطلب أي خدمة.',now()+interval '6 days','warning','approved'),
  ('42ab3b78-c286-451e-9f0a-62d7f5fa1202','اختبار EAH — بطاقة مميزة صيدلية (لا تتعامل)','eah-qa-test-featured-pharmacy-20261030','pharmacy','شبين القناطر','شبين القناطر','admin',NULL,'نشاط اصطناعي لاختبار ترتيب البطاقات المميزة والتنوع في الأنواع. لا يمثل صيدلية حقيقية.','بطاقة اختبار للمميز — لا تتعامل',true,true,true,false,false,false,NULL,NULL,2,now()+interval '6 days',false,NULL,false,false,0,0,0,'نشاط اختبار معلن: لا يمثل نشاطًا حقيقيًا. لا تتواصل أو تطلب أي خدمة.',now()+interval '6 days','warning','approved'),
  ('e04c39f4-8cc4-4e13-8b28-0ccf8a13b303','اختبار EAH — نشاط جديد توصيل (لا تتعامل)','eah-qa-test-new-delivery-20261030','delivery_office','شبين القناطر','شبين القناطر','admin',NULL,'نشاط اصطناعي لاختبار شريط الجديد وبطاقات التوصيل. لا يمثل مكتب توصيل حقيقيًا.','نشاط اختبار جديد — لا تتعامل',true,true,false,false,true,false,NULL,NULL,0,NULL,false,now()+interval '6 days',false,false,0,0,0,'نشاط اختبار معلن: لا يمثل نشاطًا حقيقيًا. لا تتواصل أو تطلب أي خدمة.',now()+interval '6 days','warning','approved'),
  ('d7e67323-8e4b-4b20-9f4f-ec9bc45f8404','اختبار EAH — صيدلية جديدة (لا تتعامل)','eah-qa-test-new-pharmacy-20261030','pharmacy','اختبار الفلاتر','اختبار EAH','admin',NULL,'نشاط اصطناعي لاختبار فلتر المنطقة والنوع وشريط الجديد. لا يمثل صيدلية حقيقية.','نشاط اختبار للفلاتر — لا تتعامل',true,false,false,false,true,false,NULL,NULL,0,NULL,false,now()+interval '6 days',false,false,0,0,0,'نشاط اختبار معلن: لا يمثل نشاطًا حقيقيًا. لا تتواصل أو تطلب أي خدمة.',now()+interval '6 days','warning','approved'),
  ('d0e13049-3ac9-4232-9f95-3f8d03a57505','اختبار EAH — نشاط متنوع للفلترة (لا تتعامل)','eah-qa-test-filter-misc-20261030','misc','اختبار الفلاتر','اختبار EAH','admin',NULL,'نشاط اصطناعي لاختبار فلتر الأنشطة المتنوعة وحالة الفرع المغلق. لا يمثل نشاطًا حقيقيًا.','بطاقة اختبار للفلترة — لا تتعامل',true,false,false,false,false,true,now()+interval '6 days','فرصة اختبار مرئية فقط — ليست فرصة تجارية',0,NULL,false,NULL,false,false,0,0,0,'نشاط اختبار معلن: لا يمثل نشاطًا حقيقيًا. لا تتواصل أو تطلب أي خدمة.',now()+interval '6 days','warning','approved'),
  ('6e44ebf5-3b5b-4d7f-91c5-2b80aa7aaf06','اختبار EAH — أرقام تواصل متعددة (لا تتعامل)','eah-qa-test-multi-contact-20261030','restaurant','اختبار الفلاتر','اختبار EAH','admin',NULL,'نشاط اصطناعي لاختبار اختيار رقم اتصال ورقم واتساب من عدة خيارات. كل الأرقام المستخدمة خيالية للاختبار فقط.','اختبار اختيار أرقام متعددة — لا تتعامل',true,true,false,false,false,false,NULL,NULL,0,NULL,false,NULL,false,false,0,0,0,'نشاط اختبار معلن: أرقام خيالية للاختبار فقط. لا ترسل رسائل فعلية أو بيانات شخصية ولا تطلب خدمة حقيقية.',now()+interval '6 days','warning','approved')
ON CONFLICT (slug) DO UPDATE SET
  name=EXCLUDED.name,
  business_type=EXCLUDED.business_type,
  area=EXCLUDED.area,
  city=EXCLUDED.city,
  source='admin',
  owner_profile_id=NULL,
  description=EXCLUDED.description,
  hook=EXCLUDED.hook,
  is_published=true,
  is_open=EXCLUDED.is_open,
  is_featured=EXCLUDED.is_featured,
  is_verified=false,
  is_new_project=EXCLUDED.is_new_project,
  is_opportunity=EXCLUDED.is_opportunity,
  opportunity_until=EXCLUDED.opportunity_until,
  opportunity_note=EXCLUDED.opportunity_note,
  featured_order=EXCLUDED.featured_order,
  featured_until=EXCLUDED.featured_until,
  featured_pin=EXCLUDED.featured_pin,
  new_until=EXCLUDED.new_until,
  accepts_orders=false,
  accepts_whatsapp_orders=EXCLUDED.accepts_whatsapp_orders,
  successful_orders=0,
  rating_avg=0,
  rating_count=0,
  important_notice=EXCLUDED.important_notice,
  notice_expires_at=EXCLUDED.notice_expires_at,
  notice_severity='warning',
  business_type_status='approved';

INSERT INTO public.business_contact_methods (
  business_id, method_type, value, label, is_primary, is_public, sort_order
)
VALUES
  ('6e44ebf5-3b5b-4d7f-91c5-2b80aa7aaf06','phone','+12125550101','رقم اتصال اختباري 1',true,true,1),
  ('6e44ebf5-3b5b-4d7f-91c5-2b80aa7aaf06','phone','+12125550102','رقم اتصال اختباري 2',false,true,2),
  ('6e44ebf5-3b5b-4d7f-91c5-2b80aa7aaf06','whatsapp','+12125550111','واتساب اختباري 1',true,true,1),
  ('6e44ebf5-3b5b-4d7f-91c5-2b80aa7aaf06','whatsapp','+12125550112','واتساب اختباري 2',false,true,2)
ON CONFLICT (value) DO UPDATE SET
  business_id=EXCLUDED.business_id,
  method_type=EXCLUDED.method_type,
  label=EXCLUDED.label,
  is_primary=EXCLUDED.is_primary,
  is_public=true,
  sort_order=EXCLUDED.sort_order;

INSERT INTO public.offers (
  business_id, title, description, price, starts_at, ends_at, is_published, image_url, teaser_image_url
)
SELECT
  '7f47ef2e-9f35-4e5c-bbc9-5e6201221a01',
  '⚠️ اختبار EAH — عرض اختبار 20261030 (لا تستخدم)',
  'عرض اصطناعي لاختبار شريط العروض فقط. لا يوجد خصم أو منتج حقيقي.',
  NULL, now(), now()+interval '6 days', true, NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.offers
  WHERE business_id='7f47ef2e-9f35-4e5c-bbc9-5e6201221a01'
    AND title='⚠️ اختبار EAH — عرض اختبار 20261030 (لا تستخدم)'
);

INSERT INTO public.offers (
  business_id, title, description, price, starts_at, ends_at, is_published, image_url, teaser_image_url
)
SELECT
  'e04c39f4-8cc4-4e13-8b28-0ccf8a13b303',
  '⚠️ اختبار EAH — عرض توصيل اختباري 20261030 (لا تستخدم)',
  'عرض اصطناعي لاختبار تنوع بطاقات العروض. لا يوجد خصم أو طلب حقيقي.',
  NULL, now(), now()+interval '6 days', true, NULL, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.offers
  WHERE business_id='e04c39f4-8cc4-4e13-8b28-0ccf8a13b303'
    AND title='⚠️ اختبار EAH — عرض توصيل اختباري 20261030 (لا تستخدم)'
);


-- Two explicitly labeled QA branches. All 555-01xx destinations are fictional test numbers.
INSERT INTO public.business_branches (
  id, business_id, name, area, address_text, phone, whatsapp,
  is_primary, is_active, sort_order
)
VALUES
  ('4a3a2c1d-0111-4111-8111-100000000001','6e44ebf5-3b5b-4d7f-91c5-2b80aa7aaf06','فرع اختبار EAH الرئيسي','اختبار الفلاتر','عنوان تجريبي — لا تتعامل','+12125550121','+12125550131',true,true,1),
  ('4a3a2c1d-0111-4111-8111-100000000002','6e44ebf5-3b5b-4d7f-91c5-2b80aa7aaf06','فرع اختبار EAH الثاني','اختبار الفلاتر','عنوان تجريبي — لا تتعامل','+12125550122','+12125550132',false,true,2)
ON CONFLICT (id) DO UPDATE SET
  business_id=EXCLUDED.business_id,
  name=EXCLUDED.name,
  area=EXCLUDED.area,
  address_text=EXCLUDED.address_text,
  phone=EXCLUDED.phone,
  whatsapp=EXCLUDED.whatsapp,
  is_primary=EXCLUDED.is_primary,
  is_active=EXCLUDED.is_active,
  sort_order=EXCLUDED.sort_order,
  updated_at=now();

UPDATE public.businesses
SET description='نشاط اختبار اصطناعي لواجهة اختيار عدة أرقام اتصال وواتساب، واختبار استقبال الطلبات داخل EAH. كل الأرقام خيالية؛ لا ترسل رسائل فعلية أو بيانات شخصية.',
    hook='اختبار تعدد الأرقام والطلبات الأونلاين — لا تتعامل فعليًا',
    important_notice='نشاط اختبار معلن: الأرقام خيالية ومخصصة للاختبار فقط. لا ترسل رسائل فعلية أو بيانات شخصية ولا تطلب خدمة حقيقية.',
    notice_expires_at=now()+interval '6 days',
    notice_severity='warning'
WHERE slug='eah-qa-test-multi-contact-20261030';
