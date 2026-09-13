-- =====================================================
-- EAH Demo Data Seed
-- 30 businesses + offers + reviews
-- =====================================================

-- نتأكد إن الجداول فاضية
truncate table public.offer_reactions cascade;
truncate table public.business_reviews cascade;
truncate table public.offers cascade;
truncate table public.business_contact_methods cascade;
truncate table public.business_media cascade;
truncate table public.favorites cascade;
truncate table public.exclusions cascade;
truncate table public.businesses cascade;

-- =====================================================
-- 1. Businesses (30 places)
-- =====================================================
insert into public.businesses (business_type, name, slug, description, area, city, is_open, is_featured, is_published) values
-- مطاعم (10)
('restaurant', 'مطبخ البلد', 'matbakh-elbalad', 'مناسب لميزانية الغدا وناس كتير حفظته', 'شبين القناطر', 'شبين القناطر', true, true, true),
('restaurant', 'برجر هاوس', 'burger-house', 'أشهى البرجر في المنطقة', 'المنايل', 'شبين القناطر', true, false, true),
('restaurant', 'كشري التحرير', 'koshary-tahrir', 'كشري على أصوله', 'شبين القناطر', 'شبين القناطر', true, true, true),
('restaurant', 'مشويات الشرق', 'mashawi-alsharq', 'مشويات طازة على الفحم', 'شبين القناطر', 'شبين القناطر', true, false, true),
('restaurant', 'بيتزا الطليان', 'pizza-italiano', 'بيتزا إيطالي أصلي', 'شبين القناطر', 'شبين القناطر', true, false, true),
('restaurant', 'شاورما الشام', 'shawerma-sham', 'شاورما سورية أصيلة', 'المنايل', 'شبين القناطر', true, true, true),
('restaurant', 'فول وطعمية الزعيم', 'foul-tameya', 'فطار مصري أصيل', 'شبين القناطر', 'شبين القناطر', true, false, true),
('restaurant', 'كافيه النجوم', 'cafe-nejoum', 'قهوة مختصة وحلويات', 'المنايل', 'شبين القناطر', true, false, true),
('restaurant', 'مخبز الفجر', 'makhbaz-fajr', 'خبز طازة كل صباح', 'شبين القناطر', 'شبين القناطر', true, false, true),
('restaurant', 'كريب ستريت', 'crepe-street', 'كريب حلو ومالح', 'شبين القناطر', 'شبين القناطر', true, false, true),

-- صيدليات (8)
('pharmacy', 'صيدلية الأمان', 'sadalyet-alaman', 'قريبة منك ومفتوحة دلوقتي', 'شبين القناطر', 'شبين القناطر', true, true, true),
('pharmacy', 'صيدلية النور', 'sadalyet-nour', 'خدمة 24 ساعة', 'المنايل', 'شبين القناطر', true, false, true),
('pharmacy', 'صيدلية الشفاء', 'sadalyet-shifa', 'أدوية ومستلزمات طبية', 'شبين القناطر', 'شبين القناطر', true, false, true),
('pharmacy', 'صيدلية الحياة', 'sadalyet-hayat', 'أسعار مناسبة وخدمة سريعة', 'شبين القناطر', 'شبين القناطر', false, false, true),
('pharmacy', 'صيدلية الرحمة', 'sadalyet-rahma', 'منتجات طبية موثوقة', 'المنايل', 'شبين القناطر', true, false, true),
('pharmacy', 'صيدلية الصفا', 'sadalyet-safa', 'مستحضرات تجميل وعناية', 'شبين القناطر', 'شبين القناطر', true, false, true),
('pharmacy', 'صيدلية العروبة', 'sadalyet-oroba', 'عروض أسبوعية', 'شبين القناطر', 'شبين القناطر', true, false, true),
('pharmacy', 'صيدلية المستقبل', 'sadalyet-mustaqbal', 'أجهزة قياس حديثة', 'المنايل', 'شبين القناطر', true, false, true),

-- سوبر ماركت (7)
('supermarket', 'سوبر ماركت البركة', 'supermarket-elbaraka', 'اختيار قريب للمقاضي السريعة', 'المنايل', 'شبين القناطر', true, true, true),
('supermarket', 'سوبر ماركت النور', 'supermarket-nour', 'كل حاجة تحتاجها في مكان واحد', 'شبين القناطر', 'شبين القناطر', true, false, true),
('supermarket', 'ماركت الخير', 'market-khair', 'أسعار اقتصادية', 'شبين القناطر', 'شبين القناطر', true, false, true),
('supermarket', 'بقالة الأصيل', 'baqala-aseel', 'منتجات بلدي طازة', 'المنايل', 'شبين القناطر', true, false, true),
('supermarket', 'مخازن الفتح', 'makhazen-fath', 'بيع بالجملة', 'شبين القناطر', 'شبين القناطر', true, false, true),
('supermarket', 'ماركت الوفاء', 'market-wafa', 'توصيل مجاني', 'شبين القناطر', 'شبين القناطر', true, false, true),
('supermarket', 'سوبر ماركت المدينة', 'supermarket-madina', 'كل احتياجات البيت', 'المنايل', 'شبين القناطر', true, false, true),

-- توصيل (5)
('delivery_office', 'مكتب توصيل سريع', 'tasree-delivery', 'منطقة التغطية متوافقة مع منطقتك', 'يغطي منطقتك', 'شبين القناطر', true, true, true),
('delivery_office', 'أرامكس شبين', 'aramex-shibin', 'توصيل داخل وخارج المحافظة', 'شبين القناطر', 'شبين القناطر', true, false, true),
('delivery_office', 'توصيل الطلبات', 'delivery-talabat', 'توصيل في نفس اليوم', 'شبين القناطر', 'شبين القناطر', true, false, true),
('delivery_office', 'مكتب السرعة', 'maktab-soraa', 'توصيل فوري', 'المنايل', 'شبين القناطر', true, false, true),
('delivery_office', 'بوسطة مصر', 'bosta-masr', 'شحن الطرود للمحافظات', 'شبين القناطر', 'شبين القناطر', true, false, true);

-- =====================================================
-- 2. Contact Methods
-- =====================================================
insert into public.business_contact_methods (business_id, method_type, value, is_primary, is_public)
select id, 'phone', '0101289280' || lpad((row_number() over (order by created_at))::text, 2, '0'), true, true
from public.businesses;

-- =====================================================
-- 3. Offers (12 active offers)
-- =====================================================
insert into public.offers (business_id, title, description, price, is_published, starts_at, ends_at)
select id, 
  case 
    when business_type = 'restaurant' then 'خصم 20% على الوجبات'
    when business_type = 'pharmacy' then 'خصم 15% على المنتجات'
    when business_type = 'supermarket' then 'توصيل مجاني للطلبات'
    else 'خصم 30% على الشحن'
  end,
  'عرض محدود لفترة',
  50 + (random() * 150)::numeric(10,2),
  true,
  now() - interval '2 days',
  now() + interval '30 days'
from public.businesses
where is_featured = true or random() < 0.4
limit 12;

-- =====================================================
-- 4. Fake reviews — نولّد 150 تقييم لكل مكان
-- =====================================================
insert into public.business_reviews (business_id, user_id, taste, value_for_money, speed, experience, comment, status)
select 
  b.id,
  null,
  (3 + floor(random() * 3))::smallint,
  (3 + floor(random() * 3))::smallint,
  (3 + floor(random() * 3))::smallint,
  (3 + floor(random() * 3))::smallint,
  'تجربة ' || case when random() < 0.7 then 'ممتازة' when random() < 0.9 then 'جيدة' else 'مقبولة' end,
  'approved'
from public.businesses b
cross join generate_series(1, 5);

-- =====================================================
-- Done!
-- =====================================================
select 
  'businesses: ' || count(*)::text as summary
from public.businesses
union all
select 'offers: ' || count(*)::text from public.offers
union all
select 'reviews: ' || count(*)::text from public.business_reviews
union all
select 'contacts: ' || count(*)::text from public.business_contact_methods;
