# EAH — ERROR_REGISTER.md

## الحالة الحالية — فحص 2026-10-28

> أُضيفت هذه الحالة فوق السجل التاريخي. لا تغيّر حالات البنود التاريخية إلا بعد إعادة الاختبار.

| ID | الحالة | الملاحظة المثبتة | الإجراء المطلوب / دليل الإغلاق |
|---|---|---|---|
| LIVE-READ-01 | DEPLOYED — VERIFY | القراءة العامة للأنشطة كانت تضم join على `merchant_order_settings`، وهو جدول خاص لا ينبغي منح العامة صلاحية قراءته. | اعتماد `businesses.accepts_orders` فقط في استعلامات العرض العامة؛ أغلق بعد نجاح نشر Vercel واختفاء أخطاء الصلاحيات من سجل التشغيل. |
| LIVE-ADS-01 | DEPLOYED — VERIFY | جلب الإعلانات العامة من `ads` مباشرة كان يصطدم بصلاحيات الجدول. | القراءة عبر service client داخل الخادم فقط، مع الحقول العامة المحددة وفحص أن النشاط المرتبط منشور؛ لا يُسمح بإرجاع مفاتيح أو بيانات داخلية. |
| LIVE-CONTACT-01 | DEPLOYED — VERIFY | أرقام الهاتف وواتساب لا ينبغي تضمينها في بيانات الصفحة العامة أو JSON-LD. | إرجاع بيانات التواصل العامة غير الحساسة فقط؛ كشف الهاتف/واتساب عبر endpoint من الخادم بعد المصادقة وتحديد المعدل. اختبر مستخدمًا مسجلًا وغير مسجل. |
| LIVE-HOURS-01 | DEPLOYED — VERIFY | الحساب باستخدام توقيت الخادم قد يعطي حالة فتح غير صحيحة في مصر، خاصة عبر منتصف الليل. | مصدر مشترك باستخدام `Africa/Cairo`، يدعم ساعات اليوم السابق والتجاوز اليدوي وحالة النشاط الذي لم يحدد جدولًا بعد؛ أغلِق بعد اختبارات Vitest وE2E. |
| LIVE-CARD-01 | DEPLOYED — VERIFY | الكارد القديم يكدس المعلومات فوق الصورة، يختصر الاسم أكثر من اللازم، ويستخدم CTA قد يوحي بطلب لا يحدث. | اعتماد تخطيط أوضح: غلاف، اسم من سطرين، نوع/منطقة، حالة فتح، تقييم صادق، قناة طلب فعالة، فروع/عروض عند وجودها، ورابط تفاصيل واحد. |
| LIVE-ROLE-LABEL-01 | DEPLOYED — VERIFY | الوثائق ونموذج إنشاء النشاط استخدما مصطلحات قديمة للأدوار. | توحيد التسميات الظاهرة إلى الأدمن/البايع/المشتري، مع إبقاء قيم `admin/merchant/customer` الداخلية كما هي. لا تُعتبر مراجعة النصوص شاملة حتى تنفذ مراجعة بحثية لباقي المكونات. |
| SCREEN-CARD-01 | DEPLOYED — VERIFY | مكوّن الصورة كان يفضّل `logo_url` على `cover_image_url`، فظهر اللوجو وحده في كارد الهوم رغم وجود غلاف للنشاط المعروض. | الغلاف أصبح الصورة الأساسية واللوجو علامة صغيرة، مع fallback عند تعذر تحميل الغلاف. تأكد بصريًا من النتيجة على الموبايل والكمبيوتر، ومن سلوك الصورة البديلة عند فشل الرابط. |
| SCREEN-HOME-SINGLE-01 | DEPLOYED — VERIFY | الكارد الوحيد في قسم «قريب منك» كان أضيق من مساحة القسم وترك فراغًا كبيرًا. | أصبح عرضه `min(100%, 560px)` وعلى الموبايل يستخدم المساحة المتاحة. تحقق من المقاسات 360/390/420/768/1024px. |
| SCREEN-DESCRIPTION-01 | DEPLOYED — VERIFY | الوصف الحي للنشاط `tapooosh` قيمته `: )`؛ الفلتر القديم لم يستبعد القوس فظهر قسم «عن النشاط» بمحتوى غير مفيد. | الفلتر يستبعد Unicode punctuation/symbols/whitespace فقط، فيستخدم `hook` كبديل. تأكد من عرض العبارة التعريفية وعدم عرض كتلة عند عدم وجود أي محتوى حقيقي. |
| SCREEN-TIER-01 | DEPLOYED — VERIFY | أسماء مستويات المصداقية في صفحة التفاصيل لم تطابق قيم قاعدة البيانات الحالية، ومنها `fel`. | تمت مواءمة أسماء المستويات وألوانها مع `bade2/mashey/fel/harif/ostora`. تحقق من ظهور «زي الفل» على النشاط المعروض. |
| SCREEN-HOURS-01 | DEPLOYED — VERIFY | ساعات `09:00–04:00` تعبر منتصف الليل لكن العرض لم يوضح أن الإغلاق في اليوم التالي. | يضيف العرض «لليوم التالي» عند كون وقت الإغلاق أصغر من الفتح؛ لا يغير البيانات المخزنة. تحقق من وضوحها في RTL ومن حالات الدوام العادي واليوم المغلق. |

| BUILD-TS-01 | RESOLVED — BUILD | فشل فحص TypeScript في commit `597fd092` بسبب عدم توافق النوع `supermarket` مع قيد قاعدة البيانات، واستخدام `Branch.phone` بعد إخراج هاتف الفرع من بيانات العرض العامة. عولج الأمر في commit `22b67c72`، ووصل بناء Vercel إلى `READY` واجتاز TypeScript. تبقى الاختبارات الوظيفية ورحلات المستخدم بحاجة إلى تحقق مستقل. |
| CI-INFRA-01 | BLOCKED — INFRA | أحدث وظائف GitHub Actions على `main` تنتهي قبل تخصيص أي runner (`runner_id=0`, `steps=0`)؛ أُعيد تشغيل Quality Gate مرة، وبقي الفشل نفسه قبل أي خطوة. | راجع توفر hosted runners/حدود الحساب وإعدادات Actions؛ لا تعتبر الفشل نتيجة اختبار كود، ولا تعلن نجاح الاختبارات حتى تظهر خطوات فعلية. |
| DB-MIGRATION-01 | IMPLEMENTED — VERIFY | ترحيل الحماية الجديد طُبّق على قاعدة البيانات المتصلة، بعد التحقق من أسماء الأعمدة والـ triggers الفعلية. | تم التحقق من schema والـ triggers المرتبطة بالطلبات والتقييمات والبلاغات. يظل ترحيل PR #33 القديم موضوعًا منفصلًا؛ لا تخلط بينه وبين ترحيل REP-05. |

| REP-01 | IMPLEMENTED — VERIFY | نقاط المشاركة القديمة كانت تظهر للجمهور باسم المصداقية وتؤثر في ترتيب الأنشطة؛ الدرجة الافتراضية 50 لم تكن دليل سمعة. | إزالة الدرجة/المستوى من كارد وصفحة النشاط، وفصلها عن فرز البحث. تحقق باختبارات أن تغيير trust_score وحده لا يغير الترتيب. |
| REP-02 | IMPLEMENTED — VERIFY | البحث برقم الهاتف كان يعرض درجة المستخدم ومستوى نقاطه. | حذف هذه الحقول من API والواجهة؛ تحقق باختبار استجابة API وعدم وجود حقول النقاط في payload العام. |
| REP-03 | IMPLEMENTED — VERIFY | لم يكن لدى البايع سياق محايد لموثوقية المشتري داخل طلبه. | عرض ارتباط الحساب وتوثيق الهاتف وعدد الطلبات المكتملة فقط في الطلب المملوك للبايع، دون درجة أو عقوبة تلقائية. اختبر ضيفًا وحسابًا جديدًا وحسابًا لديه سجل. |
| REP-04 | OPEN — POLICY | لا يوجد عمود موثوق يحدد الطرف المسؤول عن كل إلغاء/رفض، ولا مسار كامل مثبت لاعتماد نتيجة البلاغ والاعتراض. | لا تطبق أي خصم أو درجة مخاطر للمشتري قبل تسجيل الطرف المسؤول وقرار أدمن موثق واختبارات مع اعتراض. |

| REP-05 | IMPLEMENTED — VERIFY | RLS كانت تسمح بتعديل حقول الإشراف ذاتيًا، وكانت الطلبات الجديدة تقبل حالة `delivered` من العميل. | Trigger الحماية مطبق على قاعدة البيانات؛ اختبار rollback أثبت أن الطلب المزوّر يعود إلى `sent` والتقييم دون طلب مكتمل يُرفض. يلزم اختبار مسار تقييم كامل بعد طلب حقيقي، وفحص محاولة تغيير حالة المراجعة بحساب غير أدمن. |

| REP-06 | IMPLEMENTED — VERIFY | كان بالإمكان إرسال تقييم بحالة `approved` مباشرة بدل المرور بمراجعة الأدمن. | trigger الإدخال يفرض `pending` لغير الأدمن ويزيل بيانات الإشراف/الرد القادمة من العميل؛ اختبر إدخالًا مباشرًا بقيمة `approved` داخل rollback. |
| REP-07 | IMPLEMENTED — VERIFY | حارس حماية التقييم كان يمنع البايع من حفظ الرد، ولا توجد سياسة UPDATE خاصة برد البايع. | يسمح RLS بالرد لنشاط البايع فقط، ويمنع trigger تعديل الإشراف/المحتوى، ويقبل ردًا واحدًا على تقييم معتمد. اختبر المالك وغير المالك وردًا مكررًا. |
| ORDER-IDENTITY-01 | IMPLEMENTED — VERIFY | سياسة تحديث الطلب كانت بلا `WITH CHECK`؛ كان ممكنًا نقل الطلب بعد التحديث أو تبديل المشتري. | السياسة الآن تتحقق من ملكية النشاط قبل وبعد التعديل، وtrigger يثبت `business_id/customer_profile_id` ويفرض انتقالات الحالة. اختبر نقل الطلب ومحاولة تسليم مباشرة من `sent`. |
| REVIEW-DIM-01 | RESOLVED — VERIFY | fallback الأبعاد كان يسقط إلى مجموعة grocery لأي نشاط بلا subcategory واضحة. | `misc` صار يستخدم أبعاد misc الافتراضية؛ أضيفت اختبارات لوظائف الأبعاد قبل الاعتماد. |

| ORDER-MESSAGE-LOCK-01 | IMPLEMENTED — VERIFY | Trigger قفل رسالة واتساب كان يشير إلى العمود المحذوف `whatsapp_url`، ما كان يجعل أي UPDATE للطلب يفشل. | استبدال المرجع بـ `whatsapp_message` وتثبيت الرسالة وتوقيتها بعد القفل؛ اختبر انتقال الطلبات وتعديل الرسالة بعد القفل داخل rollback. |

| ORDER-STATUS-CONSTRAINT-01 | FIXED — VERIFY | قيد `order_requests_status_check` كان يرفض الحالتين `preparing` و`on_way` المستخدمتين في لوحة البايع، فيتوقف سير الطلب بعد القبول. | توحيد قيد قاعدة البيانات مع الـ state machine في الكود وإعادة اختبار انتقالات الحالات من sent إلى delivered. |
| REPORT-PENDING-01 | FIXED — VERIFY | بلاغ غير محقق كان يرفع wanted_level بمجرد الإدخال، ثم يعاد حسابه من عدد البلاغات المعلقة؛ كده اتهام غير مثبت يتحول إلى إشارة خطر. | فصل مستوى الحسابات المتعددة عن مستوى البلاغات، وعدم تغيير مستوى البلاغ حتى يقرر الأدمن `resolved` مع سبب مكتوب. اختبار pending/reviewing/dismissed = لا تغيير، وresolved فقط يحتسب. |
| REPORT-DUPLICATE-01 | FIXED — VERIFY | التطبيق كان يمنع تكرار البلاغ المعلق فقط؛ يمكن إعادة البلاغ نفسه بعد حله/رفضه لرفع المؤشر. | فحص البلاغ السابق في الخادم وفهرس unique على reporter/entity؛ اختبر إدخالين متزامنين وبلاغًا مكررًا بعد الإغلاق. |
| MULTI-ACCOUNT-EVENT-01 | FIXED — VERIFY | كشف الحسابات المتعددة كان يكتب entity_type=`user` في trust_events بينما القيد يقبل `customer` و`business` فقط. | تحديث الدالة إلى `customer` وفصل multi_account_level عن إشارات البلاغات؛ اختبر التسجيل المتكرر داخل بيئة اختبار. |
| REPORT-DECISION-01 | IMPLEMENTED — VERIFY | إغلاق البلاغات لم يكن يتطلب سببًا موثقًا، ولم يتم تسجيل `reviewed_by/reviewed_at` في إجراء الأدمن. | يشترط سببًا عند `resolved/dismissed` ويسجل القرار والمشرف والوقت؛ يلزم اختبار واجهة الأدمن وحالات التزامن. |

| BUILD-JSX-01 | RESOLVED — BUILD | تعديل عرض مؤشرات الحسابات المتعددة في شاشة مكافحة التلاعب نسي إغلاق شرط JSX؛ أوقف تجميع Webpack. | أُغلق شرط JSX في commit `8c591399`; إعادة نشر `9985bba` وصلت إلى `READY` واجتازت TypeScript. |
### قاعدة التحقق
`FIXED — VERIFY` تعني أن الكود تغيّر، وليست إثباتًا أن المشكلة انتهت على النشر. لا تنتقل إلى `VERIFIED` إلا مع رابط Build/Preview ونتيجة اختبار قابلة لإعادة التنفيذ.

---


> سجل الأخطاء الحي. آخر تحديث للسجل: 2026-10-27 (يُحدّث يدوياً بعد التحقق الفعلي).
> **اقرأه بعد `AI_PLAYBOOK.md`.** أي خطأ جديد = ID جديد فوراً.

**الحالة:** ✅ متصلّح ومتحقق منه · 🟡 جزئي · 🔴 مفتوح · ⏳ ينتظر قرار المالك

---

## 1. قاعدة البيانات

| ID    | الحالة | المشكلة                                                                                                                                                                                                                            | الإصلاح                                                                                | التحقق                                                                                                       |
| ----- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| DB-01 | ✅     | GRANTs مفقودة (Supabase 2026). متصلّح: order_requests, business_comments, comment_likes, comment_thread_follows. **ناقص:** business_follows, business_subscriptions, business_activities, customer_locations, coupons, promo_posts | migrations/2026-10-20-restore-table-grants.sql (لم يُكتب)                              | استعلام role_table_grants                                                                                    |
| DB-02 | ✅     | award_points/award_trust_points/award_trust_badge/apply_trust_decay كانت مفتوحة                                                                                                                                                    | 3c8fc16 (REVOKE + GRANT service_role)                                                  | has_function_privilege = false                                                                               |
| DB-03 | ✅     | check_rate_limit, track_ad_event, count_accounts_from_ip مفتوحة للزوار؛ generate_* للمسجلين                                                                                                                                        | revoke internal functions                                                              | has_function_privilege                                                                                       |
| DB-04 | ✅     | دوال SECURITY DEFINER كانت متاحة لـ anon رغم حراس auth.uid؛ multi_account_ips كان مقفولًا بالفعل                                                                                                                                   | migrations 96e8c2d + be1f199 + 2026-10-20-revoke-anon-sensitive-rpcs.sql               | طُبقت migration `20261020203655`; تحقق مباشر: anon=false وauthenticated/service_role=true على الدوال الثماني |
| DB-05 | ✅     | صلاحيات referral/profile RPCs كانت تشمل anon افتراضياً، رغم فلاتر SQL                                                                                                                                                              | migrations 2026-10-20-db04-05-security.sql + 2026-10-20-revoke-anon-sensitive-rpcs.sql | طُبقت migration `20261020203655`; تحقق مباشر من grants لثلاث دوال referral/profile                           |
| DB-06 | ⏳     | business_branches.phone/whatsapp قابلة للقراءة من anon                                                                                                                                                                             | قرار: عامة أو إخفاء                                                                    | استعلام pg_policies                                                                                          |
| DB-07 | 🟡     | business_contact_methods: owner_select تسمح لأي مسجل بالقراءة                                                                                                                                                                      | قصّرها على المالك + reveal_contact                                                     | pg_policies                                                                                                  |
| DB-08 | ✅     | contact_reveals + audit_logs self insert                                                                                                                                                                                           | 3c8fc16 (حُذفت)                                                                        | pg_policies                                                                                                  |
| DB-09 | ✅     | دالتان بدون search_path                                                                                                                                                                                                            | تصلّحت                                                                                 | pg_proc.proconfig                                                                                            |
| DB-10 | 🔴     | business-media storage policy مكسورة (foldername)                                                                                                                                                                                  | policy جديدة بـ objects.name                                                           | رفع صورة كتاجر                                                                                               |
| DB-11 | 🔴     | order-voice: رفع لأي مسار، تاجر ما بيسمعش                                                                                                                                                                                          | قيّد المسار + قراءة للمالك                                                             | اختبار الدورين                                                                                               |
| DB-12 | 🔴     | bucket order-images غير موجود                                                                                                                                                                                                      | أنشئه أو شيل المسار                                                                    | storage.buckets                                                                                              |
| DB-13 | 🔴     | أداء: 12 policy بدون (select auth.uid())، 10 FK بدون index                                                                                                                                                                         | تقرير الأداء                                                                           | get_advisors                                                                                                 |
| DB-14 | 🔴     | migrations: 45 مسجّلة، وDB اتغيرت بعدها وخارج سجل migrations المعتاد                                                                                                                                                               | `supabase db pull` ثم مصالحة التاريخ بدون تعديل migrations مطبّقة                      | `supabase migration list` + مقارنة schema                                                                    |
| DB-15 | 🔴     | apply_trust_decay بدون حارس أسبوعي                                                                                                                                                                                                 | last_decay_at                                                                          | اختبار SQL                                                                                                   |
| DB-16 | 🔴     | admin_adjust_points تقرا trust_score كرصيد؛ check_and_award_badges مفاتيح عربية                                                                                                                                                    | مراجعة وتوحيد                                                                          | اقرا الدالة                                                                                                  |
| DB-17 | ⏳     | set_business_commission ضد مبدأ صفر عمولة                                                                                                                                                                                          | احذف أو وثّق                                                                           | قرار                                                                                                         |
| DB-18 | 🟡     | تفريق بين super_admin وadmin في policies + is_admin()                                                                                                                                                                              | وحّد                                                                                   | اختبار بحساب admin                                                                                           |
| DB-19 | ⏳     | Leaked Password Protection مقفول                                                                                                                                                                                                   | Pro                                                                                    | Dashboard                                                                                                    |
| DB-20 | ✅     | `find_by_phone` و`is_phone_registered` كانتا قابلتين للاستدعاء مباشرة من anon/authenticated، ما يسهل تعداد الأرقام                                                                                                                 | migration `20261020203959`; routes moved to service client after server-side checks    | تحقق حي: anon=false، authenticated=false، service_role=true للدالتين                                         |

## 2. الدخول والحسابات

| ID    | الحالة | المشكلة                                                             | الإصلاح                       |
| ----- | ------ | ------------------------------------------------------------------- | ----------------------------- |
| AU-01 | 🔴     | Turnstile في Server Action فقط. /auth/v1/signup مفتوح بالـ anon key | فعّل CAPTCHA في Supabase Auth |
| AU-02 | 🔴     | phone_e164/signup_ip_hash من user_metadata                          | احسبها في السيرفر/trigger     |
| AU-03 | ✅     | @auth.eah.app → @auth.eah.invalid                                   | 2a0b135                       |
| AU-04 | 🔴     | حد IP فقط، 3 محاولات، بلا CAPTCHA، recoverAction وهمي               | OTP + حد لكل رقم              |
| AU-05 | 🔴     | limiters fail-open (AI chat كمان)                                   | fail-closed + تنبيه           |
| AU-06 | 🔴     | 11 مفتاح مكشوف + Turnstile Secret + Desktop/X.txt                   | rotate + Bitwarden + gitleaks |

## 3. الـ API والـ Server Actions

| ID    | الحالة | المشكلة                                                                                                                              | الإصلاح                                                                                                                                                                                                                                               |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AP-01 | ✅     | 4 cron routes تفتح لو CRON_SECRET ناقص                                                                                               | 2a0b135 (verifyCron fail-closed)                                                                                                                                                                                                                      |
| AP-02 | ✅     | /api/track-action: IP خام + rate limit مفقود                                                                                         | 2a0b135 (hashIp + rate limit)                                                                                                                                                                                                                         |
| AP-03 | ✅     | /api/log-error و csp-report بلا حد                                                                                                   | 2a0b135 (rate limit)                                                                                                                                                                                                                                  |
| AP-04 | 🟡     | /api/find-by-phone: البحث قابل للتعداد، وAPI كان يعيد user_id وبيانات RPC كاملة                                                      | strictLimiter fail-closed + Turnstile server verification + response allowlist بلا user_id + service-only RPC                                                                                                                                         | كود الخادم ضمن commit `da965d4` اجتاز Vercel؛ المنطق والـ grants اتفحصوا، لكن اختبار CAPTCHA/429 على production ما زال مطلوبًا                                                                                                                                                                                    |
| AP-05 | ✅     | requestSubscription: إشعار الأدمن ما بيوصلش                                                                                          | service client (f690db4+)                                                                                                                                                                                                                             |
| AP-06 | 🔴     | .maybeSingle() على owner_profile_id في 12 موضع                                                                                       | .order + .limit(1)                                                                                                                                                                                                                                    |
| AP-07 | ✅     | حالة الطلب بدون state machine                                                                                                        | 2a0b135 (VALID_TRANSITIONS)                                                                                                                                                                                                                           |
| AP-08 | 🟡     | rate limit مفقود في 6 مسارات كتابة                                                                                                   | إضافة                                                                                                                                                                                                                                                 |
| AP-09 | 🔴     | getBusinessDetail يقرا phone/whatsapp بـ anon                                                                                        | DB-06 قرار ثم عدّل                                                                                                                                                                                                                                    |
| AP-10 | 🟡     | proxy.ts auth.getUser() على كل request                                                                                               | قصّره للمحمية                                                                                                                                                                                                                                         |
| AP-11 | 🟡     | logAudit بيبلع الأخطاء                                                                                                               | سجّل في system_errors                                                                                                                                                                                                                                 |
| AP-12 | 🟡     | تذكير التقييم بعد ساعتين (فعلياً 3 مرات)                                                                                             | اضبط الوعد                                                                                                                                                                                                                                            |
| AP-13 | 🟡     | رفع صور التاجر كان يكتب في `businesses.logo_url` غير الموجود ويتجاهل أخطاء الحفظ                                                     | استخدام `business_media`، تحديث `cover_image_url` مع التحقق، تحميل الشعار من `business_media`، rate limit fail-closed                                                                                                                                 | كود التاجر ضمن commit `da965d4` ذي Vercel success؛ اختبار upload/refresh على production ما زال مطلوبًا                                                                                                                                                                                                            |
| AP-14 | 🟡     | حذف صورة الإدارة يمسح المعاينة حتى لو فشل API، وغلاف النشاط قد يظل في `cover_image_url` بعد حذف سجل الوسائط                          | DELETE يتحقق من كتابة DB ويزامن الغلاف؛ UI يحتفظ بالصورة ويعرض الخطأ عند فشل الطلب                                                                                                                                                                    | Vercel build/TypeScript نجح على main commit `450400a` (يتضمن مسار الإدارة المعدّل)؛ اختبار DELETE على deployment والتحقق من تزامن `cover_image_url` عند النجاح والفشل ما زال مطلوبًا                                                                                                                              |
| AP-15 | 🟡     | حقل لصق رابط الصورة كان يحفظ رابطًا خارجيًا قد تمنعه CSP، مع مخاطر روابط داخلية/تحويلات/ملفات ضخمة                                   | الخادم يقبل HTTPS فقط، يتحقق من DNS العام ويثبّت عنوان الاتصال، يعيد التحقق من كل redirect، يحد الحجم إلى 5MB ويتحقق من بصمة JPEG/PNG/WebP/AVIF ثم يرفع الملف إلى Cloudinary ويحفظ رابط Cloudinary. أُضيف rate limit fail-closed لمسارات الرفع والحذف | Vercel build/TypeScript نجح على main commit `450400a`. اختبار رفع حقيقي ما زال مطلوبًا: صورة صالحة، رابط غير HTTPS، host داخلي/خاص، redirect غير آمن، محتوى غير صورة، تجاوز 5MB، ثم refresh والتحقق أن المحفوظ `res.cloudinary.com`                                                                               |
| AP-16 | 🟡     | معالج إنشاء النشاط كان يفرض النشر حتى لو لم يوجد مالك، وأخطاء حفظ جهات الاتصال كانت تُتجاهل؛ لذلك قد يظهر نشاط يتيم أو ناقص البيانات | الخادم يمنع النشر المباشر دون مالك؛ الويزارد يحفظ النشاط غير المرتبط كمسودة غير منشورة ويصرّح بذلك في المراجعة؛ source يصبح `admin` للمسودة؛ فشل حفظ جهات الاتصال يحاول إلغاء الإنشاء، ويسجّل audit لو فشل التراجع                                    | Vercel build/TypeScript نجح على `d541ea2`، وتحقق Vercel نجح أيضًا على commit الاختبار `57fd91b`. اختبار إنشاء النشاط وربط المالك فعليًا ما زال متوقفًا لعدم وجود حساب تاجر حقيقي؛ GitHub Actions لا يبدأ خطوات الوظائف (الفشل خلال 2-3 ثوانٍ، و`steps/logs_url` فارغان)، انظر CI-09. لا تغييرات في بيانات الإنتاج |

## 4. الـ CI والاختبارات

| ID    | الحالة | المشكلة                                                                                                                                                 | الإصلاح                                                                                                                                                      |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CI-01 | 🔴     | e2e.yml على v2 فقط                                                                                                                                      | انقله main + Preview + DB اختبار                                                                                                                             |
| CI-02 | 🔴     | business-order.spec يعدّي فاضي                                                                                                                          | seed + تدفق كامل                                                                                                                                             |
| CI-03 | 🔴     | rls-tests تتخطى بصمت                                                                                                                                    | فاشلة عند الغياب + DB اختبار                                                                                                                                 |
| CI-04 | 🔴     | 6 اختبارات فقط                                                                                                                                          | اختبار لكل action                                                                                                                                            |
| CI-05 | 🟡     | .gitignore يستثني .env.local فقط                                                                                                                        | .env* + !.env.example                                                                                                                                        |
| CI-06 | 🟡     | package.json بدون engines                                                                                                                               | إضافة                                                                                                                                                        |
| CI-07 | 🔴     | مفيش verify-invariants في CI                                                                                                                            | كتابة السكربت أولاً                                                                                                                                          |
| CI-08 | ⏳     | Vercel Hobby + Supabase Free                                                                                                                            | Pro قبل الإطلاق                                                                                                                                              |
| CI-09 | 🔴     | GitHub Actions jobs تفشل خلال 2-3 ثوانٍ قبل بدء أي خطوة؛ بيانات الوظيفة لا تعرض `steps` أو `logs_url`، ويتكرر ذلك على commits قديمة وحديثة بما فيها E2E | افحص إعدادات Actions وصلاحيات/توفر الـ runners من GitHub UI؛ أعد تشغيل workflow بعد إصلاح السبب. لا تعتبر E2E/quality/RLS ناجحة حتى تظهر خطوات ونتائج حقيقية | Reproduced: runs on `da965d4`, `15138a0`, `d541ea2`, and `57fd91b`; rerun E2E on run `39498076017` failed the same way; logs unavailable |

## 5. المبادئ والوثائق (قرارات مطلوبة)

| ID     | التناقض                                   | القرار                   |
| ------ | ----------------------------------------- | ------------------------ |
| DOC-01 | Verified != مدفوع مقابل توثيق بـ100 ج/سنة | ⏳                       |
| DOC-02 | الموبايل ما يظهرش مقابل DB-06/07          | ⏳                       |
| DOC-03 | بدون تتبع مقابل page_view_events          | ⏳                       |
| DOC-04 | صفر عمولة مقابل set_business_commission   | ⏳                       |
| DOC-05 | ARCHITECTURE cron ساعة؛ فعلياً 3 مرات/يوم | ✅ مُصلح (B-7)           |
| DOC-06 | SECURITY.md قديم                          | 🟡                       |
| DOC-07 | 4 ترتيبات قراءة                           | ✅ (AI_PLAYBOOK + BRAIN) |
| DOC-08 | Turnstile Test vs Production              | ⏳                       |
| DOC-09 | 9 روابط مكسورة                            | 🔴                       |

## 6. ديون فنية (invariants-baseline)

| الفحص                             | العدد الحالي | المطلوب                                             |
| --------------------------------- | ------------ | --------------------------------------------------- |
| B1 owner_profile_id + maybeSingle | 0            | ✅ مُصلح (fix-b1.mjs v2)                            |
| B2 select('*')                    | 1            | admin-business — 32+ columns (documented exception) |
| B3 <img> خام                      | 10           | WmImage — admin previews + share modal مقبولة       |
| B4 animation: infinite            | 16           | SACRED يمنعها                                       |
| B5 ألوان محظورة                   | 47           | متغيرات الهوية                                      |
| B6 backdrop-filter                | 34           | SACRED يمنعها على كروت فقط (modals مسموحة)          |
| B7 الدومين يدوي                   | 8            | NEXT_PUBLIC_SITE_URL                                |
| B8 eslint-disable                 | 21           | سبب أو إزالة — +1 global-error (false positive)     |
| B9 إيموجي                         | 146          | SVG                                                 |

> **CI gate:** `.github/workflows/invariants.yml` — يفشل على أي زيادة فوق baseline أو أي X1-X4. راجع `scripts/verify-invariants.mjs` للتحديث.

## 7. ما تم إنجازه مؤخراً (للتوثيق)

**جلسة 2026-10-17/19/20 (Admin Overhaul + Security):**

- 22 commit: Admin panel (Quick/Bulk/Drag/CSV/⌘K) + Real-time + User Detail + Merchant Panel
- Security: cron guard + state machine + rate limits + GRANTs (order_requests et al) + revoke RPCs
- Wizard: 4-step new business (basics/location/options/review)
- Custom business types + pending approval (`/admin/business-types`)
- Contacts repeater (multiple phone numbers with labels)
- BRAIN.md + AI_PLAYBOOK + ERROR_REGISTER

## 8. ما هو سليم (حافظ عليه)

صفر console.log/any/@ts-ignore في الكود الجديد · كل Server Actions بها requireAdmin + Zod · لا أسرار في الكود · CSP بـ nonce · JSON-LD مأمّن · أدوات AI للقراءة فقط · 76 جدول بـ RLS · أعمدة profiles محمية · bucket size/type limits · Dependabot أسبوعي

---

## 9. واجهة المستخدم (UI Issues)

| ID    | الحالة | المشكلة                                                                        | الإصلاح                                        |
| ----- | ------ | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| UI-01 | 🔴     | Business detail page: form sidebar مضغوط (260px)، card فاضي، horizontal scroll | YouTube Studio pattern: تفاصيل منفصلة عن تعديل |
| UI-02 | 🔴     | Wizard مضغوط في sidebar بدل full-width                                         | نقل الـ wizard لصفحة كاملة 800px               |

| UI-03 | 🟡 | كارت واحد في الترند/قريب منك على اليمين + 900px فاضي | يُوسّط لو عدد الكروت ≤ 3 أو يتحول grid | بصر |
| UI-04 | 🟡 | كارت 280px صغير — صورة تأكل 60%، بيانات مضغوطة | 320px desktop / 280px tablet / 260px mobile + 16:10 صورة | بصر |
| UI-05 | 🔴 | "قريب منك" مفيش مسافة على الكارت — بيهدم الغرض | DistanceBadge إجباري (يحتاج تفعيل الموقع) | وظيفي |
| UI-06 | 🟡 | "ارشحلك" فاضي لما مفيش recs — صندوق كبير بزر "اكتشف" | يختفي لما `recommended.length === 0` | منطق |
| UI-07 | 🟡 | نفس النشاط في 3 أقسام (ترند/قريب/ارشحلك) | exclude IDs المكررة بين الأقسام في `HomeSections` | منطق |
| UI-08 | 🟡 | مفيش تمييز بصري بين الأقسام — نفس الكارت في كل مكان | badge مختلف لكل قسم: ترند (#1) / قريب (المسافة) / جديد (جديد) | بصر |
| UI-09 | 🟡 | Carousel auto-scroll 10s لما فيه كارت واحد بس | تعطيل auto-scroll لو `children.length <= 3` | منطق |
| UI-10 | 🟢 | مفيش معلومات عن tier/عرض/واتساب على كارت الترند | إظهار tier + offers + whatsapp على الكارت | بصر |

## 10. أسرار مكشوفة (SEC)

| ID     | الحالة | المشكلة                                                                                         | الإصلاح                                   |
| ------ | ------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| SEC-01 | 🔴     | 11 مفتاح اتكشفوا في محادثة AI (Supabase, Cloudinary, Upstash, Turnstile, AI, VAPID, CRON, salt) | rotate كل واحد من Dashboard + Vercel      |
| SEC-02 | ✅     | VAPID keys في `.env.example` (git history)                                                      | commit 9bed439 (sanitized) — rotate VAPID |

## 11. Tech Debt — Pre-Launch Blockers

| ID             | Status | Issue                                   | Priority    | Time |
| -------------- | ------ | --------------------------------------- | ----------- | ---- |
| GOD-01         | RED    | business-form.tsx = 1179 lines          | Pre-Launch  | 2h   |
| GOD-02         | YEL    | new-business-wizard.tsx = 260 lines     | Post-Launch | 30m  |
| SPRAWL-01      | RED    | 20+ admin pages, 3 monitoring           | Pre-Launch  | 1h   |
| SPRAWL-02      | YEL    | 3 moderation pages                      | Post-Launch | 1h   |
| EMPTY-01       | RED    | 9 empty tables (0 rows)                 | Pre-Launch  | 30m  |
| CONFLICT-01    | RED    | business_commissions vs zero-commission | Pre-Launch  | 15m  |
| CONSISTENCY-01 | RED    | SACRED says 5 types, actual 4           | Pre-Launch  | 5m   |
| CONSISTENCY-02 | YEL    | PROGRESS.md duplicate rows              | Post-Launch | 30m  |
| CONSISTENCY-03 | YEL    | ARCHITECTURE.md cron hourly vs 3/day    | Post-Launch | 5m   |
| CI-01          | RED    | e2e.yml on v2 only, not main            | Pre-Launch  | 2h   |
| CI-02          | RED    | business-order.spec passes empty        | Pre-Launch  | 1h   |
| DESIGN-01      | YEL    | Design System not applied               | Post-Launch | 3h   |

## 12. Pre-Launch Checklist (8h work)

### Security (35 min)

- [ ] SEC-01: rotate 11 keys (DEFERRED — owner call)
- [ ] gitleaks clean (blocked by SEC-02b: ***REMOVED*** in a322552)

### Code Quality (6h)

- [ ] GOD-01: split business-form.tsx
- [ ] SPRAWL-01: merge monitoring pages
- [x] Admin sidebar restructured to 6 sections
- [x] Merchant dashboard 2026 — Hero + alerts + KPI + quick actions (2026-10-23)
- [x] Admin business detail Hero + underline tabs (2026-10-23)
- [x] Reports hub live (generate/section-toggle/print/delete/filter)
- [x] Admin dashboard rebuilt (StatCard + Panel + alerts)
- [x] CI-01: E2E on push:main + pull_request (2026-10-23)
- [x] CI-02: PR → Vercel preview URL (auto via wait-for-vercel-preview)
- [x] Merchant newOrders count fix (sent/seen not pending) — 2026-10-23
- [x] Orders v2 — trigger rating sync (2026-10-23)
- [x] Orders v2 — full DB + Admin + Merchant + Customer + Auto (2026-10-23)
- [x] Business rating trigger (2026-10-23)
- [x] Admin bell + merchant notifications (2026-10-23)
- [x] Dashboards order flow sections (2026-10-23)
- [x] Reports order metrics integration (2026-10-23)
- [x] Merchant pages audit — 0 issues (2026-10-23)
- [x] Merchant layout newOrders fix (sent/seen) (2026-10-23)
- [x] Auto-deliver/expire service client (2026-10-23)
- [x] Expiry: no drift counters + suspension + notifications (2026-10-23)
- [x] Feedback: gate + audit + rating trigger (2026-10-23)
- [x] Orders System v2 (2026-10-23) — DB + admin/merchant/customer flow + auto-deliver + feedback
- [x] CI-07: invariants verifier in CI (ab55bce)

### Data (45 min)

- [ ] EMPTY-01: delete 9 empty tables
- [ ] CONFLICT-01: delete business_commissions

### Docs (10 min)

- [ ] CONSISTENCY-01: SACRED to 4 types
- [ ] NEXT_SESSION.md updated
- [x] BRAIN.md §16 + ERROR_REGISTER §6 synced (b43e770)

### Post-Launch Week 1

- [x] UI-01: business detail tabs + 3 layouts unified (d8af94be)
- [x] UI-02: wizard fullscreen overlay (567496d)
- [ ] CONSISTENCY-02/03: docs sync
- [ ] DESIGN-01: unified design system

### Post-Launch Month 1

- [ ] DB-04/05, AP-05
- [ ] SPRAWL-02: merge moderation
- [ ] GOD-02: split wizard

## 13. God Components Inventory

| File                      | Lines | Limit | Status                |
| ------------------------- | ----- | ----- | --------------------- |
| business-form.tsx         | 19    | 300   | ✅ (split → 14 files) |
| business-form-state.ts    | 257   | 300   | ✅                    |
| business-form-handlers.ts | 219   | 300   | ✅                    |
| new-business-wizard.tsx   | 260   | 300   | YEL                   |
| edit-form.tsx             | 313   | 300   | YEL                   |
| lib/data/merchant.ts      | 288   | n/a   | OK                    |

Rule: component > 300 lines must split before adding features.

## 14. Empty Tables Inventory

| Table                | Decision             |
| -------------------- | -------------------- |
| site_designs         | DELETE               |
| business_commissions | DELETE (CONFLICT-01) |
| live_page_sessions   | REVIEW               |
| ads                  | DELETE (superseded)  |
| ad_campaigns         | KEEP                 |
| ad_creatives         | KEEP                 |
| ad_events            | KEEP                 |
| ad_stats_daily       | KEEP                 |
| rate_limits          | DELETE (Upstash)     |

Action: delete 5 tables.

## 15. Before Any Feature Work

Read in order:

1. NEXT_SESSION.md
2. BRAIN.md
3. AI_PLAYBOOK.md
4. ERROR_REGISTER.md (this file)

If any Pre-Launch blocker is open, fix it before adding features.


## E-021: CSS Modules purity

Build break fix. See scripts/check-css-modules-purity.mjs.
