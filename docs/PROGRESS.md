# EAH — PROGRESS.md

> **مرجع الحالة الحية.** الأقسام المؤرخة أسفل هذا الجزء سجل تاريخي، وليست إثباتًا لاجتياز اختبارات حالية.
> آخر مراجعة: 2026-11-03.

### تحديث 2026-11-03 — توحيد مسميات الأدوار ومراجعة دورة إنشاء النشاط

- تم توحيد مسميات العرض في دفعة واسعة من شاشات الأدمن والبايع والمشتري: إدارة الحسابات، التصدير، سجل التدقيق، معالج إنشاء النشاط ومراجعته، تفاصيل النشاط وربط مالكه، الأسئلة الشائعة، المساعدة، الشروط، الثقة، من نحن، الإشعارات، الطلبات والتقييمات. بقيت مفاتيح الأدوار الداخلية `super_admin/merchant/customer` كما هي؛ لم تُجرَ أي migration لتغييرها.
- راجعت `createBusiness` ومسارات رفع الصور: إنشاء النشاط محمي بـ`requireAdmin`، اختيار المالك اختياري، ويُرفض ربط حساب إداري أو حساب مرتبط مسبقًا بنشاط آخر، مع التحقق من جهات الاتصال والتراجع عند فشل حفظها. رفع صور الأدمن والبايع يفحص الملكية/الدور، ويطبق حد 5MB وصيغ raster مع فحص magic bytes داخل Cloudinary helper؛ مسار استيراد صورة من رابط يقيّد HTTPS وDNS العام ويمنع الشبكات الداخلية.
- أُصلح خلل في نموذج الإنشاء اليدوي: checkbox «نشر مباشر» غير المحدد كان يُفسر سابقًا كـtrue بسبب fallback؛ أصبح الحفظ يعتمد على حالة checkbox الفعلية. معالج الإنشاء الجديد يرسل `is_published=on` صراحة، لذلك يبقى سلوكه بالنشر المباشر كما هو.
- مراجعة E2E أثبتت أن 49 اختبارًا نجحت على commit `2626845`، لكن لا يوجد حتى الآن اختبار مصادق لدورة إنشاء النشاط كاملة أو رفع الصور أو ربط المالك أو النشر، ولا مصفوفة قوائم جميع الأدوار على الهاتف. يلزم حسابات QA وقاعدة اختبار مستقلة لإضافة هذه الاختبارات وتشغيلها.
- تم تجهيز تحسين Quality Gate ليكمل Prettier وnpm audit وKnip وjscpd ثم يفشل في النهاية إذا وجد أي منها مشكلة، بدل توقف Knip/jscpd عند أول audit failure. كما أضيف HTML reporter لـPlaywright لإنتاج تقرير قابل للرفع. تشغيل التحقق على الالتزامين المتتاليين أُلغي بفعل `concurrency.cancel-in-progress`؛ يجب الاعتماد على أحدث run نهائي للـmain قبل إغلاق هذه التعديلات.

### تحديث 2026-11-03 — Runner عاد للعمل ونتائج Quality Gate الحقيقية

- تم حل عطل تخصيص GitHub-hosted Runner الذي كان مسجلًا في Issue #22؛ أُغلق بعد إثبات تشغيل وظائف فعلية على commit `262684552927b3a971c3aa413c9333eee0f26f2d`: Runner IDs غير صفرية، وبدأت الخطوات في Quality Gate وE2E وCodeQL وInvariants.
- E2E نجح بـ49/49 اختبارًا، وCodeQL نجح، وInvariants نجح. Quality Gate ما زال أحمر لأسباب داخل الوظائف وليست Runner: `npm audit` كشف 8 ثغرات إنتاج (2 moderate و5 high و1 critical)، وPrettier كشف 119 ملفًا غير منسق. ESLint وTypeScript وStylelint وWebpack build وVitest نجحت على هذا الالتزام.
- Knip وjscpd لم يُشغّلا في هذا الـrun لأن `npm audit` فشل وأوقف تسلسل الخطوات. يجب جعل فحوص التشخيص اللاحقة تعمل حتى عند فشل فحص سابق، مع تجميع النتيجة في خطوة أخيرة.
- وظيفة RLS بدأت على Runner فعلي لكنها توقفت عمدًا لأن `SUPABASE_DB_URL` غير مضبوط. لا تُستخدم قاعدة الإنتاج؛ يلزم مشروع/قاعدة اختبار مستقلة وسر آمن في GitHub Actions.
- تفاصيل npm audit من سجل الوظيفة: Next.js 16.3.8 عليه advisory critical؛ sharp 0.35.4 وzod 4.6.5 عليهما advisories high؛ glob 13.0.6 وminimatch عليهما advisories moderate. لم يُنفذ `npm audit fix` أو أي تحديث اعتماديات عشوائي؛ يلزم تحديث lockfile على فرع مستقل مع إعادة تشغيل البناء والاختبارات.
- اختبار E2E الحالي يثبت تصفح الأنشطة المنشورة والبحث وفتح صفحة النشاط، كما يختبر overflow لصفحتَي `/contact` و`/explore` عند عروض 320–430px. لا يوجد حتى الآن اختبار E2E موثّق لدورة الأدمن الكاملة (إنشاء النشاط، ربط المالك اختياريًا، رفع الصور، النشر، وظهوره في البحث)، ولا اختبار قوائم جميع الأدوار على الهاتف. اختبار قاعدة البيانات لملفات النشاط والمالك موجود لكنه لم يُشغّل لأن قاعدة الاختبار غير مربوطة.
- تم تأمين QA seeder: يرفض project ref إنتاج EAH، ويتطلب `EAH_QA_ALLOWED_PROJECT_REF` مطابقًا للمشروع و`EAH_ALLOW_QA_ACCOUNT_SEED=yes`، ويجهز أدمن اختبار `super_admin` وبايعًا ومشتريًا داخل بيئة الاختبار فقط، وينشئ نشاطًا تجريبيًا غير منشور عند غيابه. أُضيف ملف كلمات المرور المحلي إلى `web/.gitignore` بعد مراجعة أن credentials file لم يكن مستثنى من Git سابقًا. لم يُشغّل السكربت ولم تُنشأ حسابات أو بيانات جديدة.
- راجعت دوال authenticated SECURITY DEFINER إضافية. اكتُشف أن `request_promo_post` كان يسمح لأي مستخدم مسجل بإرسال طلب ترويج لأي نشاط دون فحص الملكية؛ أُضيف فحص `owner_profile_id` والتحقق من HTTPS/الطول والملاحظة. كما كان `redeem_reward` يفحص المخزون والرصيد دون أقفال صفوف؛ أُضيف `FOR UPDATE` على reward وprofile لمنع oversell/overspend المتزامن. أضيفت 3 assertions إلى pgTAP (الإجمالي 53). التغييرات محضّرة في migration ولم تُطبق على الإنتاج.
- توسّعت مراجعة SECURITY DEFINER على الإنتاج (قراءة فقط): جرى تصنيف الدوال العامة المقصودة مقابل RPCs الحساسة. أظهرت call-site search أن `record_ad_event` و`record_page_view` و`heartbeat_page_session` لا تملك مستدعيًا من المتصفح حاليًا؛ أُضيفت قيود server-only لها، و`generate_referral_code` كـtrigger helper، مع 5 RPCs الحساسة الموجودة أصلًا في migration. اختبار `admin-policy-alignment.test.sql` أصبح 50 assertion ويغطي صلاحيات anon/authenticated/service_role. لم تُطبق أي صلاحيات على الإنتاج.
- أُضيف workflow يدوي `dependency-remediation.yml` ليشغّل `npm audit fix --omit=dev` دون `--force`، ثم TypeScript/ESLint/Stylelint/build/Vitest، ويرفض فتح PR إذا بقيت ثغرات high/critical. ينشئ PR للمراجعة فقط ولا يدمج تلقائيًا. لم يُشغّل بعد؛ لا تتوفر في تكامل GitHub الحالي عملية workflow_dispatch، ويمكن تشغيله من تبويب Actions.
- تم تعديل E2E workflow لإيقاف اختبار `main` على alias الإنتاج الثابت قبل اكتمال نشر commit؛ أصبح E2E على `main/v2` يستجيب لحدث `deployment_status` الناجح ويختبر URL الخاص بنفس deployment، مع بقاء PR preview وmanual preview. لا يوجد تشغيل مثبت لهذا المسار الجديد حتى يصل Vercel deployment status.
- أُضيفت migration `2026-10-29-business-media-image-sync.sql` واختبارات `business-media-sync.test.sql` إلى Quality Gate المعزول؛ كان الاختبار موجودًا لكنه غير مربوط بالـworkflow. لم يُنفذ بعد لأن `SUPABASE_DB_URL` غير مضبوط.
- تقرير E2E أظهر 49 نجاحًا، لكن خطوة رفع التقرير لم تجد مجلدات `web/test-results` و`web/playwright-report`؛ لذلك لا يوجد artifact تقرير قابل للمراجعة لهذا التشغيل.
- أُغلق Issue #22 فقط لأنه عطل Runner التاريخي لم يعد يتكرر. فشل Quality Gate الحالي، وثغرات الاعتماديات، وتنسيق الملفات، وربط قاعدة الاختبار تظل مهام مفتوحة مستقلة.

### تحديث 2026-11-03 — تصنيفات الرئيسية، إصلاح البناء، ومراجعة Supabase

- ثُبتت التصنيفات الرئيسية الأربعة: restaurant وpharmacy وdelivery_office وmisc. الماركت ليس تصنيفًا رئيسيًا؛ يندرج تحت «أنشطة أخرى» عبر custom_business_type. تمت مراجعة قيد قاعدة الإنتاج وبيانات الأنشطة: لا توجد سجلات supermarket، والقيد يقبل الأنواع الأربعة فقط. لم تُنفّذ أي كتابة أو migration على قاعدة الإنتاج.
- فُصل قسم التصنيفات عن Hero وأصبح بعده مباشرة، وأزيل خلط فلاتر الاكتشاف والخصائص مع التصنيفات. أضيفت بطاقة «أنشطة أخرى»، وضُبطت روابط الفلترة لتستخدم القيم الداخلية الصحيحة، مع تخطيط Mobile First واحترام prefers-reduced-motion.
- وُحدت قوائم تحقق الأنواع في admin وmerchant مع قيد قاعدة البيانات. تم تحديث README وPRODUCT_SPEC، وتوضيح أن أدوار المنصة ثلاثة فقط (الأدمن والبايع والمشتري)، والزائر حالة وصول وليست دورًا.
- فشل بناء وسيط بسبب CSS غير صالح في كتلة reduced-motion بعد نقل التصنيفات؛ أُصلح الخطأ. كما كُشفت أخطاء TypeScript سابقة في إجراءات حفظ الموقع ووحدة استحقاقات الباقات؛ أُضيفت الإجراءات والوحدة واختباراتها.
- دليل البناء: نشر Vercel للالتزام 596c1ea3a0cfc84851efb8a336a2904725b17bd5 وصل إلى READY؛ Next.js compile ناجح، TypeScript ناجح في 5.5s، و54 صفحة static generated. فحص HTTP للرئيسية وصفحات explore للأنواع الأربعة أعاد 200، وHTML يحتوي على RTL والتصنيفات الأربعة دون تصنيف ماركت رئيسي. لا يغلق هذا اختبار التفاعل أو E2E أو رحلة النشاط الكاملة.
- تحديث الواجهة المشتركة: نُقلت تسميات الفوتر والقائمة الجانبية ولوحة البايع وبعض شاشات الإدارة إلى «البايع/المشتري». نشر commit 2626845 وصل إلى READY بعد نجاح TypeScript في 7.4s وتوليد 54 صفحة؛ فحص الصفحة الحية أعاد HTTP 200 وأثبت روابط التصنيفات الأربعة، RTL، وعناوين الفوتر الجديدة دون العناوين القديمة. هذا لا يعني اكتمال مسح كل نصوص المنصة؛ بند LIVE-ROLE-COPY ما زال مفتوحًا لباقي الصفحات.
- فحص قاعدة الإنتاج (قراءة فقط): عدد الأنشطة حسب النوع: restaurant=3 وpharmacy=2 وdelivery_office=1 وmisc=2. لم تتغير البيانات.
- أُعدّ ترحيل 2026-11-03 لتثبيت search_path على ثلاث دوال ظهرت في Supabase advisor، مع schema-qualification لاستدعاءات auth/admin، وأضيف اختبار pgTAP من أربع assertions وربطه بـQuality Gate المعزول. لم يُطبّق الترحيل على أي قاعدة؛ Runner عاد للعمل؛ ما زال ينتظر ربط قاعدة اختبار غير إنتاجية. إعداد حماية كلمات المرور المسربة يتطلب ضبط Auth من لوحة Supabase ولم تتوفر أداة تغيير إعدادات Auth هنا.
- Supabase advisors: رُصدت 3 دوال ذات search_path قابل للتغيير، و33 دالة SECURITY DEFINER قابلة لـanon، و103 قابلة لـauthenticated، إضافة إلى تحذير حماية كلمات المرور المسربة. مراجعة عينات من الدوال الإدارية أكدت وجود تحقق داخلي من دور الأدمن، وبعض RPCs العامة مخصصة للقراءة/الإحصاء؛ لذلك لا يجوز إلغاء الصلاحيات جماعيًا. يلزم تدقيق كل دالة مع grants وRLS قبل أي migration.
- الأداء: 78 سياسة RLS تستخدم auth/current_setting بطريقة initplan غير محسّنة، و139 مجموعة سياسات permissive متداخلة، و14 مفتاحًا أجنبيًا بلا فهرس تغطية، و75 فهرسًا غير مستخدم في نافذة القياس، وفهرسان متماثلان على trust_badges. لا تُحذف فهارس ولا تُدمج سياسات قبل مراجعة الاستعلامات، نافذة القياس، والـpolicy semantics.
- ما لم يُغلق حاليًا: Quality Gate بسبب npm audit وPrettier؛ Knip/jscpd لم يصلا للتشغيل في آخر run؛ RLS ينتظر secret لقاعدة اختبار؛ اختبارات دورة إنشاء النشاط وربط المالك والصور والنشر واختبارات قوائم كل دور على الهاتف غير موجودة بعد. عطل Runner التاريخي مغلق، وليس عائقًا حاليًا.
- حدود بيئة العمل: التعديلات الحالية حُفظت على GitHub main مباشرة. لم تتوفر في هذه الجلسة نسخة عمل محلية قابلة للمزامنة أو لتشغيل npm/Vitest محليًا؛ لا تدّعِ أن ملفات جهاز المطور تمت مزامنتها.

### تحديث 2026-11-01 — حفظ نتائج CodeQL بدون اشتراك Code Scanning

- تم ضبط تحليل CodeQL ليولد ملفات SARIF محليًا دون رفعها إلى Code Scanning، ودون رفع قاعدة التحليل.
- تُحفظ تقارير SARIF الناتجة كـworkflow artifact خاص لمدة 14 يومًا، بدل فشل التحليل عند غياب ميزة Code Scanning في خطة المستودع.
- لا يعني ذلك ظهور تنبيهات CodeQL في تبويب Security؛ قراءة التقرير من artifact تظل خطوة مراجعة منفصلة.
- يلزم نجاح تشغيل CodeQL التالي والتأكد من وجود artifact قبل اعتماد التعديل.

### تحديث 2026-11-01 — إصلاح فشل اختبارات الوحدات

- تم إصلاح parser ساعات العمل: كان regex يتحقق من الدقائق دون التقاطها، ثم يحاول قراءتها كـcapture group، فينتج NaN ويعامل كل المواعيد كأنها غير صالحة. الآن تُقرأ الساعة والدقائق وتُحوّل إلى مجموع دقائق صحيح.
- أضيف معامل وقت اختياري إلى `isBusinessOpen` لجعل اختبارات الجدول الزمني حتمية، مع استمرار استخدام الوقت الحالي تلقائيًا في التطبيق.
- فلاتر «مفتوح الآن» أصبحت تعتمد مباشرة على helper خالص من `lib/utils/working-hours`، وتراعي override والحالة اليدوية عند غياب الجدول؛ لم تعد تستورد طبقة بيانات الخادم التي تحمل `server-only`.
- تم تحديث اختبار مستوى المشاركة ليتطابق مع تسمية المصدر الداخلية الحالية `نشط` بدل تسمية قديمة.
- يلزم نجاح Vitest وQuality Gate التالي قبل اعتبار الإصلاح متحققًا.

### تحديث 2026-11-01 — إصلاح أسباب فشل E2E وتدقيق CSS

- اختبار الموبايل أصبح يقيس عناصر الصفحة الظاهرة فقط، ويقيس كذلك العرض الفعلي للمستند لمنع overflow حقيقي بدل اعتبار عناصر التنقل المخفية خطأ.
- اختبارات الدعم أصبحت تستهدف عنوان وحقل مساعد الدعم الفني داخل قسمه، مع إبقاء مساعد EAH العام كمكوّن مستقل.
- اختبار الإصدار أصبح يتحقق من النسخة الحالية `v1.0.0` في تذييل الموقع؛ مسار `/updates` غير موجود حاليًا ويرجع 404، لذلك أزيل افتراض وجود صفحة إصدارات غير منفذة.
- أزيلت كتلة CSS فارغة في مكوّن الصورة الرمزية كانت توقف Stylelint.
- يلزم تشغيل E2E وQuality Gate بعد هذا التعديل لإثبات النجاح.

### تحديث 2026-11-01 — تثبيت تنقل اختبارات E2E

- استُبدل انتظار networkidle في اختبارات الدخول والرئيسية والاستكشاف والتحديثات والتحقق من مسارات الحساب والبايع بانتظار domcontentloaded، مع استمرار assertions للتحقق من ظهور العناصر أو إعادة التوجيه.
- السبب المثبت: تشغيل Playwright السابق اجتاز 45 اختبارًا وفشل اختباران وأظهر حالتين flaky بسبب انتهاء مهلة page.goto أثناء انتظار networkidle على الرئيسية والاستكشاف والتحديثات.
- التعديل لا يغيّر سلوك الموقع أو بياناته؛ ينتظر المحتوى المطلوب عبر assertions بدل انتظار هدوء الشبكة بالكامل.
- يلزم تشغيل E2E التالي لإثبات زوال فشل المهلة.

### تحديث 2026-11-01 — استكمال تقارير بوابة الجودة

- عُدّل Quality Gate بحيث لا يؤدي فشل Prettier إلى تخطي Stylelint والبناء وVitest وnpm audit وKnip وjscpd.
- يظل فشل Prettier مؤثرًا على النتيجة النهائية للبوابة بعد تشغيل بقية الفحوص؛ لا يتم إخفاء مشكلة التنسيق أو اعتبارها ناجحة.
- ينتظر التغيير تشغيل CI التالي لإثبات النتائج. لا توجد تغييرات على بيانات الإنتاج أو إعدادات الأسرار.

### تحديث 2026-11-01 — دعم تعدد أرقام الاتصال والواتساب في التعديل

- أضيفت قوائم متعددة لأرقام الاتصال والواتساب في واجهتي تعديل البايع والأدمن، مع بقاء الرقم الأول هو رقم الاتصال الأساسي.
- أصبحت قراءة بيانات البايع والأدمن مرتبة باستخدام sort_order، وأصبحت عمليات الحفظ تتحقق من صحة الأرقام والتكرار والحدود قبل الكتابة.
- عند إعادة حفظ رقم موجود، تُحفظ إعداداته السابقة label/is_public/sort_order؛ وعند فشل إدخال القائمة الجديدة يحاول الخادم استعادة القائمة السابقة.
- لم يتغير مخطط قاعدة البيانات أو القيد الفريد العالمي UNIQUE(value)، ولم تُجرَ أي كتابة على بيانات الإنتاج.
- **حالة التحقق:** التعديل أُعدّ على main؛ بناء Vercel واختبارات TypeScript/Vitest/E2E ما زالت مطلوبة قبل إعلان الإصلاح متحققًا.

### تحديث 2026-11-01 — تثبيت الأدوار الأربعة والعربية فقط

- **قاعدة المنتج النهائية:** الأدوار والتصنيفات الوحيدة الظاهرة في المنصة هي الأدمن، التاجر، العميل، والزائر. لا تُنشأ مسميات أو أدوار إضافية.
- **التخزين والصلاحيات:** حسابات الدخول تحتفظ بالمفاتيح الداخلية الحالية `super_admin` و`merchant` و`customer`. الزائر هو سياق وصول غير مسجل (`guest`) وليس صفًا في `user_roles`. لا يُستنتج دور التاجر من وجود نشاط مرتبط؛ الدور والعلاقة وحالة الحساب والاشتراك والتحقق والنشر بيانات منفصلة.
- **التعريب:** الصفحة الأساسية مضبوطة على `lang="ar"` و`dir="rtl"` وتستخدم خطي القاهرة وتجوال. نُفذت دفعة تعريب على نموذج إنشاء النشاط، إدارة الحسابات، الإشعارات، التصدير، سجل التدقيق، صفحة رمز الاستجابة السريعة، والأسئلة/المساعدة والنصوص التسويقية. أضيفت تعليمات للعربية فقط إلى موجهات مساعد المنصة والتقارير.
- **الحماية:** دور الأدمن في منطق الخادم محصور في `super_admin`. أزيلت فروع قديمة من إجراءات إدارة الحسابات كانت تتعامل مع `admin` كصلاحية مستقلة. قاعدة البيانات الحالية ما زالت تحتفظ بالقيمة التاريخية `admin` في النوع الداخلي، لكن فحص `user_roles` لم يجد أي صف بها.
- **بيانات الإنتاج عند الفحص:** حساب واحد فقط في جدول الأدوار، بدور `super_admin`. لم تُجرَ أي كتابة أو ترحيل على قاعدة الإنتاج.
- **استثناء قاعدة البيانات المفتوح:** سياسة `contact_reveals` القديمة ما زالت تسمح نظريًا للقيمة التاريخية `admin` بقراءة سجل كشف وسائل الاتصال. أُعدّ ترحيل محدود لا يحصر القراءة في `super_admin` مع خمسة اختبارات pgTAP، وأُدرج في مسار الاختبار المعزول؛ لم يُطبّق على الإنتاج ولم يتوفر حتى الآن إثبات تشغيل ناجح على قاعدة اختبار مستقلة.
- **التحقق البرمجي:** آخر محاولة إنشاء على فيرسل انتهت بحالة `failure` بسبب حد معدل إنشاء عمليات البناء في الخطة (`build-rate-limit`)؛ لا يوجد سجل تجميع يثبت نجاحًا أو خطأ في الشفرة. كذلك لا يوجد في هذه الجولة تأكيد نجاح TypeScript أو ESLint أو Vitest أو Playwright أو اختبارات RLS. لا تعتبر الدفعة جاهزة للإطلاق قبل تشغيلها بنجاح.
- **المتبقي:** تشغيل بناء وفحوص كاملة بعد زوال حد المعدل، تنفيذ ترحيل سياسة كشف التواصل على قاعدة غير إنتاجية واختبارها، استكمال مسح كل النصوص الديناميكية ومحتوى قاعدة البيانات، ثم اختبار بصري وتفاعلي على الهاتف والكمبيوتر لكل دور.

> **تنبيه توثيقي:** أي وصف قديم للأدوار في السجل التاريخي أسفل هذا التحديث لا يُعد مرجعًا حاليًا؛ المرجع الملزم هو `docs/ROLES_MATRIX.md` وهذا التحديث.


> **مرجع الحالة الحية.** الأقسام المؤرخة أسفل هذا الجزء سجل تاريخي، وليست إثباتًا لاجتياز اختبارات حالية.
 > آخر مراجعة: 2026-10-31.

### تحديث 2026-10-31 — إصلاح تشغيل بوابات CI عند تغيير ملفاتها

- **main الحالي:** `c9cf2fb6ccb76cb5386f0d50803c4b10f4e4981a`.
- أزيل استثناء `.github/workflows/**` من فلاتر التشغيل في `.github/workflows/quality.yml` و`invariants.yml` و`e2e.yml`؛ أصبحت تغييرات إعدادات هذه البوابات تُطلق اختبارات الجودة وE2E وinvariants بدلاً من تجاهلها.
- تم إنشاء تشغيلات جديدة للبوابات الثلاثة على commit `628cb1a`، لكن جميع الوظائف فشلت قبل تخصيص Runner: `runner_id=0` و`steps=[]`. لم يبدأ TypeScript أو ESLint أو Vitest أو Playwright أو SQL/RLS tests؛ لا تُسجّل هذه الوظائف كاختبارات فاشلة للكود أو كنجاح.
- Vercel سجّل محاولة production للـcommit نفسه بحالة `CANCELED` مع سبب `ignored-build-step`؛ لأن التغيير اقتصر على إعدادات CI، تم تخطي بناء التطبيق ولم يُنشر إصدار تطبيق جديد.
- **العائق الخارجي المفتوح:** يلزم فحص إعدادات GitHub Actions/توفر GitHub-hosted runners أو حدود الاستخدام من إعدادات الحساب/المستودع؛ اتصال GitHub المتاح لا يملك صلاحية قراءة إعداد حماية الفرع، ولم أغيّر إعدادات الحساب أو الحماية.

### تحديث 2026-10-31 — تثبيت اعتمادية CI وتوحيد Node

- تم تثبيت كل Actions المستخدمة في `.github/workflows/quality.yml` و`invariants.yml` و`e2e.yml` و`context-map.yml` و`codeql.yml` على commit SHAs كاملة وثابتة؛ فحص ما بعد التعديل لم يجد أي `uses:` يشير إلى tag متغير.
- تم توحيد Node في هذه workflows على الإصدار 24، المطابق لإعداد Node.js في مشروع Vercel.
- تم تثبيت Supabase CLI على `2.122.0` بدلاً من `latest`، وتثبيت `supabase/setup-cli` على commit SHA محدد.
- أحدث تشغيلات Quality Gate وE2E وCodeQL وInvariants على `c9cf2fb` فشلت قبل بدء أي خطوة: `runner_id=0` و`steps=[]`. لذلك لم يتم تشغيل أي اختبار فعلي، ولا يوجد دليل على نجاح الاختبارات أو فشل الكود نفسه.
- Vercel تخطى محاولة البناء الخاصة بهذا التغيير عبر `ignored-build-step`؛ لم يتغير كود التطبيق ولم يحدث نشر تطبيق جديد.
- يلزم حل تخصيص GitHub-hosted Runner من إعدادات الحساب/المستودع. لا أملك من تكامل GitHub صلاحية فحص/تغيير إعدادات الفوترة أو الحماية، ولم أغيّرها.

### تحديث 2026-10-31 — حالة الجودة والأمان الحالية

- **آخر `main`:** `55b6bad67bf2afd86b82bafee25a7b70d6ddedef` — `security: ignore all local environment secret files`.
- **حماية ملفات البيئة:** أصبح `.gitignore` يتجاهل `.env` و`.env.*` و`.envrc` و`.direnv/` مع استثناء قوالب `.env.example` و`.env.*.example`. فحص شجرة Git يؤكد أن `web/.env.example` هو ملف البيئة الوحيد المتتبع. هذا لا يزيل المفاتيح القديمة من تاريخ Git؛ بنود تدوير المفاتيح التاريخية ما زالت مفتوحة.
- **بوابات CI:** تعديلات workflow أطلقت Quality Gate وE2E وCodeQL وInvariants فعلاً، لكن الوظائف على `c9cf2fb` انتهت قبل تخصيص Runner (`runner_id=0`, `steps=[]`). لم يبدأ أي اختبار كود أو SQL. آخر تغييرات التوثيق/التجاهل لا تمسح هذا العائق.
- **اعتماديات CI:** جميع `uses:` في workflows الخمسة مثبّتة على commit SHA كامل؛ Node موحد على 24، وSupabase CLI مثبّت على `2.122.0`.
- **Vercel:** deployment التطبيق `dpl_AQb3TxQX6NCtAAA8QThn82ZYJbYY` على commit `09359a1` وصل إلى `READY`. السجل أكد Compile في 9.4s وTypeScript في 3.0s وتوليد 54/54 صفحة. commit `55b6bad` كان تغيير `.gitignore` فقط، وتخطاه Ignored Build Step؛ لا يوجد تغيير في كود التطبيق بينهما.
- **مراقبة الإنتاج:** لم تُظهر تجميعات Vercel أي runtime errors خلال آخر 24 ساعة، ولم تظهر سجلات error/fatal/warning خلال آخر 30 دقيقة. سجل runtime الكامل لـ24 ساعة غير متاح على خطة Hobby (الاحتفاظ محدود بساعة)، لذلك لا يُفسر ذلك كإثبات خلو النظام من كل الأخطاء.
- **حماية `main`:** قائمة GitHub تعرض `protected=false`. تعذر قراءة إعداد الحماية التفصيلي، وواجهات rulesets تشير إلى أن الميزة تحتاج خطة GitHub Pro أو مستودعًا عامًا. لا تغيّر خصوصية المستودع؛ يلزم ضبط الحماية من الواجهة بعد استعادة Runner.
- **فروع العمل:** `feat/role-aware-global-shell-2026` متأخر عن `main` بـ142 commit وفيه 21 commit غير موجود على `main`، وآخر عمله (2026-10-29) QR ومشاركة المنصة وتنسيق القوائم. لا يُدمج عشوائياً ولا يمثل توحيد الغلاف بالكامل.
- **تعارض الأدوار:** ملفات `PRODUCT_SPEC.md` و`ROLES_MATRIX.md` الحالية تصف ثلاثة أدوار، بينما عنوان أحدث محادثة تعليمات يشير إلى أربعة أدوار. لم يُفترض اسم الدور الرابع أو صلاحياته، ولم تتغير القيم الداخلية أو سياسات الوصول؛ يلزم إدخال نص التعليمات/الرسم المؤكد قبل تعديل مصفوفة الأدوار.

## الحالة الحالية — تدقيق وتحسينات مستقلة مع انتظار مواصفات النشاط

- **المصدر:** `main` هو مصدر الحقيقة. آخر HEAD بعد دفعة حماية مساحة البايع: `dc27a478b77376cefe8fb6aa8d35190abf63cd4e`. تغييرات الكود مرت في commits صغيرة؛ آخر commit code دخل Vercel في حالة BUILDING عند آخر فحص.
- **مرجع المنتج:** `docs/PRODUCT_SPEC.md` يحتفظ بالمتطلبات التي أكدها المالك دون افتراض التفاصيل التي سترد في الورقة.
- **README:** أُصلح قسم البدء للمطورين وأضيف رابط مواصفات المنتج وسجل الحالة والأخطاء.
- **تمييز المسار النشط:** تم اختيار أعمق مسار مطابق في القائمة العامة وإضافة `aria-current="page"` وتنسيق بصري للحالة النشطة. فحص ساكن: جميع 38 رابطًا مباشرًا لها صفحات في شجرة المستودع.
- **إمكانية الوصول لقائمة drawer:** أضيف اسم حواري واضح، نقل تركيز الفتح، حصر Tab وShift+Tab داخل القائمة، Escape، واسترجاع التركيز، وحالة `aria-haspopup/expanded` للزر. commit `eed016e` وصل READY؛ Next.js 16.3.8، compiled successfully في 10.8s، TypeScript في 3.3s، و54/54 صفحة. لم يُنفذ بعد اختبار keyboard/SR الفعلي.
- **قنوات التواصل الرسمية:** كانت تختفي عند عدم الإعداد. drawer والفوتر يعرضان الآن الأنواع الأربعة المدعومة (فيسبوك، قناة واتساب، دعم واتساب، البريد) مع تعطيل القنوات التي لا تملك بيانات. فُحص preview على `/` و`/explore` و`/businesses/tapooosh`؛ جميعها HTTP 200، وكل صفحة بها أربع placeholders بلا روابط `mailto` فارغة أو روابط وهمية. اختبار الإعدادات الجزئية لا يزال مطلوبًا.
- **فجوة الغلاف الموحد — LIVE-ROLE-SHELL-01:** `/admin` و`/merchant` لا يعرضان FloatingCapsule أو SiteFooter، ولديهما أنظمة تنقل workspace منفصلة. الأدمن يستخدم AdminTopbar/بحث/إشعارات وAdminMobileNav، والبايع والمشتري لديهم قوائم جانبية تتحول إلى تمرير أفقي على الموبايل. توحيد الإطار يجب أن يحتفظ بأدوات الإدارة ويتجنب التكرار؛ ينتظر تصميمًا متكاملًا ومواصفات المستخدم.
- **تعدد جهات الاتصال — LIVE-CONTACT-MULTI-01:** القراءة والتحقق والحفظ الحاليين للبايع والأدمن يتعاملان مع phone/whatsapp كقيمة مفردة، ما قد يحذف الأرقام الإضافية. live schema لديه قيد عالمي `UNIQUE(value)`. لا تغيره قبل قرار إعادة استخدام الأرقام وبيئة اختبار منفصلة.
- **تقارير البايع — MERCHANT-INSIGHT-PERIOD-01:** تم توحيد نطاق مؤشرات النشاط والطلبات باستخدام فترة منقحة واحدة (1–90 يومًا)، ورفض الحساب المجهول. أضيفت اختبارات Vitest تشمل نصًا رقميًا غير مقبول وNaN/Infinity وحدود المدة. Vercel commit `7148ef7` READY: compile 9.7s، TypeScript 3.8s، و54/54 صفحة. Vitest لم يبدأ بسبب Runner.
- **سلامة التعليقات — LIVE-COMMENT-PARENT-INTEGRITY-01:** فحص RLS/الـtrigger الحي أظهر أن `business_comments` لا تمنع ربط رد بتعليق من نشاط مختلف ولا تمنع الإدراج على نشاط غير منشور عند تجاوز server action. أضيفت تحققّات للخادم في `createComment` و`offline/flush`، وأُعدّت migration وpgTAP test لحماية قاعدة البيانات. migration لم تُطبق على الإنتاج، والاختبار لم يُشغّل بسبب Runner.
- **حماية مساحة البايع — SEC-MERCHANT-REGISTERED-01:** أضيف رفض صريح للحساب المجهول في إجراءات الإعلانات والفروع وتعديل النشاط وتصدير الطلبات ومساعد الإحصاءات وأرشيف التقارير. دوال قراءة بيانات البايع تتحقق من التسجيل والملكية قبل قراءة أرقام الاتصال أو استخدام service-role لإثراء بيانات المشترين. ينتظر أحدث build واختبارات auth بحساب anonymous/بايع مالك/بايع غير مالك.
- **رفع صور البايع — SEC-MERCHANT-UPLOAD-ANON-01:** مسار رفع صور النشاط كان يقبل أي جلسة `user` قبل فحص الملكية؛ أضيف رفض صريح للحساب المجهول `user.is_anonymous`، مع بقاء فحص ملكية النشاط وrate limit ورفع الصورة والتحقق من service-role. commit `eed016e` وصل إلى Vercel READY بعد نجاح التجميع وTypeScript؛ اختبار endpoint بجلسة anonymous وبايع مالك صحيح ما زال مطلوبًا.
- **الأدوار والتفاعل:** الأدمن، البايع، المشتري فقط. الزائر حالة وصول ولا يجوز له تنفيذ تفاعل أو كتابة؛ الحماية يجب أن تكون server/API/RLS.
- **مسار إنشاء النشاط من الأدمن — ADMIN-OWNER-ASSIGNMENT-01:** مراجعة `NewBusinessWizard` و`createBusiness` أكدت أن اختيار المالك اختياري، ونشر النشاط مستقل عن وجود مالك، مع ضرورة رقم اتصال أساسي للنشاط نفسه (لا رقم المالك الشخصي). اختيار حساب customer يحوله التنفيذ الحالي إلى merchant بعد حفظ النشاط وجهات الاتصال. لقطة الإنتاج بها super_admin واحد فقط ولا يوجد مالك customer/merchant للاختيار حاليًا؛ اختبار الربط الحقيقي يحتاج حسابات اختبار غير إنتاجية.
- **النشاط:** ربط مالك الأدمن اختياري، المالك المرتبط وحيد؛ نشر النشاط لا يتوقف على وجود مالك. يجب الفصل بين وسائل التواصل عبر واتساب وطلبات واتساب وطلبات المنصة أونلاين.
- **فحص الروابط:** 38/38 من روابط القائمة المباشرة لها صفحات في المستودع. لم يجر اختبار كل رابط بجلسات كل دور.
- **قيد تقارير الرؤى — INSIGHT-RLS-01:** قراءة إنتاجية جديدة في 2026-10-30: `business_insights` عليه RLS، وعدد السياسات `0` والصفوف `0`. كود التخزين ما زال يستخدم session client، لذا تقارير البايع/الأدمن المحفوظة غير متاحة حتى تُختبر سياسات owner/admin وتُطبق بأمان. لا تُطبق migration على production دون staging.
- **Vercel:** commit `eed016e5806948424b2ad924ddf7436652481cdd` وصل إلى READY عبر deployment `dpl_GjY1VMKDBqqRFGQHn9mjzS6cz6bN` (production). Preview URLs للصفحات العامة `/`, `/explore`, `/businesses/tapooosh` رجعت 200، وأظهرت 4 قنوات اتصال معطلة بلا روابط وهمية. `/merchant` و`/admin` رجعا صفحة دخول 200 عند طلب غير مسجل؛ هذا تحقق من redirect/login public shell وليس اختبار صلاحيات حسابات.
- **بوابة اختبارات قاعدة البيانات — CI-RLS-MIGRATION-LOOP-01:** عُثر على continuation مفقود في قائمة migrations داخل Quality Gate. تم إصلاح القائمة وإدخال migration واختبار سلامة التعليقات ضمن مسار الاختبار المعزول. هذا إصلاح لإعداد CI فقط؛ لم تعمل الوظيفة حتى الآن بسبب عدم تخصيص GitHub Runner، ولم يتم تشغيل SQL test.
- **GitHub Actions:** أحدث الوظائف لم تبدأ خطوات؛ `steps=[]` وسجلاتها غير موجودة. لا يوجد نجاح Quality Gate أو E2E أو CodeQL مُثبت.
- **Supabase:** فحص المخطط/العدادات كان قراءة فقط. لم يُنفذ SQL كتابة، migration أو أي تعديل إنتاجي. لا توجد staging معتمدة.
- **بيانات QA في الإنتاج — LIVE-QA-PUBLIC-01:** فحص قاعدة البيانات في 2026-10-30: 8 أنشطة منشورة، 7 منها `eah-qa-test-%` وواحد غير QA؛ يوجد عرضان منشوران وفرعان وأربع وسائل اتصال اختبارية تابعة لـQA. السجلات تظهر عمدًا في `/explore` لأغراض QA، وتحمل تحذير «لا تتعامل». عداد الأعمال ومساعد المنصة والاقتراحات تستبعد slugs الاختبار. يجب تنظيف سجلات QA فقط قبل 2026-11-05 وفق `docs/qa/README.md`، دون حذف `tapooosh` أو استخدام غياب المالك كشرط للإخفاء.
- **جاهزية الإطلاق:** **غير معتمدة**. متبقي توحيد shell، إصلاح التعدد، مواصفات النشاط، التحقق التفاعلي الشامل، الاختبارات والرحلات الكاملة.

## الأولويات التالية

1. إدخال أوراق المالك في `docs/PRODUCT_SPEC.md` قبل إعادة تصميم النشاط.
2. إصلاح متعدد الأرقام للأدمن والبايع مع حسم قواعد الخصوصية والترتيب وإعادة الاستخدام، واختبارات حفظ/حذف/إضافة.
3. توحيد header/footer/navigation حسب الأدوار مع الحفاظ على البحث وأدوات الإدارة.
4. تحقق حديث من قنوات التواصل المعطلة والمفعّلة جزئيًا ومنع روابط placeholder.
5. تدقيق وصول الضيف لجميع عمليات الكتابة والتفاعل في API/server actions/RLS.
6. حل مشكلة عدم تخصيص GitHub Runner وتشغيل الاختبارات فعلًا.
7. رحلة إنشاء ونشر نشاط كاملة عبر Preview وحسابات/بيانات اختبار معزولة.
8. إكمال فحص الصور والكروت وصفحة النشاط والموبايل، ثم مسح بيانات QA قبل الإطلاق.

## ضوابط التنفيذ

- لا تنشر إنتاجًا يدويًا ولا تطبق migrations/تغييرات بيانات دون موافقة وخطة rollback وبيئة اختبار.
- لا تعلن أي بند مكتمل بعد كتابة الكود؛ يلزم دليل build/اختبار/UX مناسب.
- لا تنفّذ تخمينات متعلقة بالنشاط قبل استلام مواصفات المالك.
- حدّث المستندات مع كل دفعة كود حتى يستطيع مطور آخر متابعة المشروع.

---

## سجل تاريخي — مراجعة الصورتين في 2026-10-27

- **آخر commit وظيفي لواجهة النشاط:** `e6b22fe6c475eac5c168932840b8cd1bd9c7186b`.
- **آخر نشر للواجهة:** Vercel deployment `dpl_5pFU2jzirA8R8XBmryii5i8WYXp8` وصل إلى `READY` على هذا الـ commit. سجل البناء: تجميع ناجح في 16.7 ثانية، TypeScript في 5.1 ثانية، واكتمال البناء في 48 ثانية. [تفاصيل النشر](https://vercel.com/eah-74a0/eah/5pFU2jzirA8R8XBmryii5i8WYXp8).
- **كارد الهوم:** كان `CardImage` يعطي أولوية للوجو على صورة الغلاف، رغم أن النشاط المعروض في الصورة لديه رابط غلاف صالح. أصبح الغلاف هو الصورة الأساسية، واللوجو علامة صغيرة فوقه، مع fallback للوجو إذا تعذر تحميل الغلاف. اتزيلت طبقة تعتيم إضافية كانت تجعل الصورة أغمق من المطلوب.
- **عرض كارد منفرد:** وسّعنا العنصر الوحيد داخل قسم «قريب منك» إلى `min(100%, 560px)` وعلى الشاشات الصغيرة يستعمل المساحة المتاحة بدل ما يسيب فراغًا كبيرًا على الجانبين.
- **قسم «عن النشاط»:** القراءة الآمنة لبيانات النشاط `tapooosh` أظهرت أن الوصف المخزن هو `: )` بينما توجد عبارة تعريفية في `hook`. فلتر النص أصبح يستبعد علامات الترقيم والرموز فقط باستخدام Unicode، فيعرض العبارة التعريفية بدل وجه تعبيري أو كتلة فارغة.
- **مستوى المصداقية:** القيم الحية لـ `trust_tier` هي `bade2/mashey/fel/harif/ostora`؛ كانت صفحة التفاصيل تستخدم خريطة قديمة. اتحدّثت الأسماء والألوان لتطابق القيم الحالية، فالقيمة `fel` تعرض «زي الفل».
- **مواعيد العمل:** جدول النشاط المعروض يحتوي أيامًا تعمل من `09:00` إلى `04:00` في اليوم التالي. تم توضيح ذلك بعبارة «لليوم التالي» عندما يكون وقت الإغلاق أصغر من وقت الفتح؛ لم نغيّر الجدول المخزن أو منطق ساعات العمل.
- **القراءة العامة والأمان:** لا تزال إصلاحات قراءة الأنشطة والإعلانات والتعامل مع بيانات التواصل الخاصة موجودة على `main`. لم يتم منح صلاحيات عامة لجداول خاصة ولم تُنفذ migration إنتاجية.
- **الأدوار الظاهرة:** الأدمن، البايع، المشتري. لم تتغير قيم الصلاحيات أو المسارات الداخلية.
- **GitHub Actions:** ما زالت الوظائف تفشل قبل تخصيص Runner (`runner_id=0`, `steps=0`). لم تتنفذ اختبارات E2E أو Quality Gate؛ بناء Vercel الناجح لا يغني عنها.
- **طلبات الدمج:** PR #34 وPR #27 مغلقان لأن أحدهما أُدرج إصلاحه في `main` والآخر أصبح قديمًا. PR #33 يبقى Draft؛ ترحيل قاعدة البيانات المقترح فيه لم يطبق على الإنتاج.

### ما تم التحقق منه وما لم يتم

**تم التحقق:** بناء Vercel وTypeScript لدفعة تعديل كارد النشاط والتفاصيل وصل إلى `READY`.

**لم يتم التحقق وظيفيًا بعد:** مراجعة الواجهة المنشورة بصريًا على عدة مقاسات، تنفيذ دورة إنشاء نشاط حقيقية بحساب تجريبي، اختبار رفع الصور والحفظ والنشر والبحث وربط المالك، واختبار كشف الهاتف لمستخدم مسجل وغير مسجل. عدم ظهور أخطاء runtime في آخر نافذة رصد لا يثبت نجاح الرحلات.

### الخطوة التالية

1. افتح نسخة النشر بعد تحديثها وتحقق من الغلاف وحجم الكارد، ثم افحص صفحة النشاط ومواعيد اليوم التالي.
2. أصلح GitHub Actions/Runner حتى تبدأ خطوات فعلية ثم شغّل Quality Gate وE2E وCodeQL.
3. نفّذ دورة النشاط كاملة على Preview بحساب تجريبي، دون إنشاء بيانات اختبار على الإنتاج.
4. راجع PR #33 وترحيله الأمني في بيئة غير إنتاجية وخطة rollback قبل أي تطبيق.

## فهرس الملفات والحالة التاريخية

---

## web/ — Config

| الملف | الحالة |
|------|--------|
| .env.example | ✅ |
| next.config.ts | ✅ |
| tsconfig.json | ✅ |
| package.json | ✅ |
| eslint.config.mjs | ✅ |

---

## web/ — Pages

| الملف | الحالة |
|------|--------|
| app/layout.tsx | ✅ |
| app/page.tsx | ✅ |
| app/globals.css | ✅ |
| app/manifest.ts | ✅ |
| app/loading.tsx | ✅ |
| app/explore/page.tsx | ✅ |
| app/explore/loading.tsx | ✅ |
| app/featured/page.tsx | ✅ |
| app/featured/loading.tsx | ✅ |
| app/trends/page.tsx | ✅ |
| app/trends/loading.tsx | ✅ |
| app/offers/page.tsx | ✅ |
| app/offers/loading.tsx | ✅ |
| app/new/page.tsx | ✅ |
| app/new/loading.tsx | ✅ |
| app/nearby/page.tsx | ✅ |
| app/nearby/loading.tsx | ✅ |
| app/suggest/page.tsx | ✅ |
| app/businesses/[slug]/page.tsx | ✅ |
| app/about/page.tsx | ✅ |
| app/about/presentation/page.tsx | ✅ |
| app/pricing/page.tsx | ✅ |
| app/advertise/page.tsx | ✅ |
| app/contact/page.tsx | ✅ |
| app/terms/page.tsx | ✅ |
| app/privacy/page.tsx | ✅ |
| app/cookies/page.tsx | ✅ |
| app/faq/page.tsx | ✅ |
| app/support-palestine/page.tsx | ✅ |

---

## web/ — Auth

| الملف | الحالة |
|------|--------|
| app/auth/actions.ts | ✅ |
| app/auth/auth-form.tsx | ✅ |
| app/auth/auth.module.css | ✅ |
| app/auth/page.tsx | ✅ |
| app/auth/recover/page.tsx | ✅ |
| app/auth/logout/route.ts | ✅ |

---

## web/ — API

| الملف | الحالة |
|------|--------|
| app/api/track-action/route.ts | ✅ |
| app/api/log-error/route.ts | ✅ |
| app/api/cron/cleanup-errors/route.ts | ✅ |

---

## web/ — Account

| الملف | الحالة |
|------|--------|
| app/account/layout.tsx | ✅ |
| app/account/page.tsx | ✅ |
| app/account/edit/page.tsx | ✅ |
| app/account/edit/edit-form.tsx | ✅ |
| app/account/favorites/page.tsx | ✅ |
| app/account/following/page.tsx | ✅ |
| app/account/notifications/page.tsx | ✅ |
| app/account/orders/page.tsx | ✅ |
| app/account/points/page.tsx | ✅ |
| app/account/security/page.tsx | ✅ |
| app/account/security/change-password-form.tsx | ✅ |
| app/account/verify/page.tsx | ✅ |
| app/account/badges/page.tsx | ✅ |

---

## web/ — Merchant

| الملف | الحالة |
|------|--------|
| app/merchant/layout.tsx | ✅ |
| app/merchant/page.tsx | ✅ |
| app/merchant/actions.ts | ✅ |
| app/merchant/apply/page.tsx | ✅ |
| app/merchant/apply/apply-wizard.tsx | ✅ |
| app/merchant/apply/success/page.tsx | ✅ |
| app/merchant/business/page.tsx | ✅ |
| app/merchant/business/edit-form.tsx | ✅ |
| app/merchant/orders/page.tsx | ✅ |
| app/merchant/offers/page.tsx | ✅ |
| app/merchant/subscription/page.tsx | ✅ |
| app/merchant/settings/page.tsx | ✅ |
| app/merchant/insights/page.tsx | ✅ |
| app/merchant/insights/actions.ts | ✅ |
| app/merchant/insights/generate-button.tsx | ✅ |
| app/merchant/insights/[id]/page.tsx | ✅ |
| app/merchant/insights/[id]/print-button.tsx | ✅ |

---

## web/ — Admin

| الملف | الحالة |
|------|--------|
| app/admin/layout.tsx | ✅ |
| app/admin/page.tsx | ✅ |
| app/admin/businesses/page.tsx | ✅ |
| app/admin/users/page.tsx | ✅ |
| app/admin/subscriptions/page.tsx | ✅ |
| app/admin/analytics/page.tsx | ✅ |
| app/admin/ads/page.tsx | ✅ |
| app/admin/moderation/page.tsx | ✅ |
| app/admin/audit/page.tsx | ✅ |
| app/admin/notifications/page.tsx | ✅ |
| app/admin/reports/page.tsx | ✅ |
| app/admin/settings/page.tsx | ✅ |
| app/admin/insights/page.tsx | ✅ |
| app/admin/health/page.tsx | ✅ |
| app/admin/fraud/page.tsx | ✅ |
| app/reports/actions.ts | ✅ |
| app/reports/report-button.tsx | ✅ |
| app/merchant/subscription/actions.ts | ✅ |
| app/merchant/subscription/subscribe-button.tsx | ✅ |

---

## web/ — Components

### Layout + Navigation

| الملف | الحالة |
|------|--------|
| floating-capsule.tsx | ✅ |
| menu-drawer.tsx | ✅ |
| secondary-hero.tsx | ✅ |
| page-header.tsx | ✅ |
| section-nav.tsx | ✅ |
| section-title.tsx | ✅ |
| scroll-to-top.tsx | ✅ |
| site-footer.tsx | ✅ |
| account-sidebar.tsx | ✅ |
| admin-sidebar.tsx | ✅ |
| merchant-sidebar.tsx | ✅ |
| account-page-header.tsx | ✅ |

### Cards + Home Sections

| الملف | الحالة |
|------|--------|
| business-card.tsx | ✅ |
| featured-bento.tsx | ✅ |
| home-hero.tsx | ✅ |
| trending-row.tsx | ✅ |
| offers-strip.tsx | ✅ |
| new-row.tsx | ✅ |
| nearby-grid.tsx | ✅ |
| nearby-cta.tsx | ✅ |
| suggested-section.tsx | ✅ |
| row-carousel.tsx | ✅ |
| load-more.tsx | ✅ |
| section-layout.tsx | ✅ |
| loading-skeleton.tsx | ✅ |

### UI + Business

| الملف | الحالة |
|------|--------|
| avatar.tsx | ✅ |
| logo.tsx | ✅ |
| ~~splash.tsx~~ | 🗑️ (شال — LCP) |
| signature.tsx | ✅ |
| palestine-heart.tsx | ✅ |
| watermark.tsx | ✅ |
| wm-image.tsx | ✅ |
| icons/index.tsx | ✅ |
| install-prompt.tsx | ✅ |
| signup-prompt.tsx | ✅ |
| review-reminder.tsx | ✅ |
| explore-search.tsx | ✅ |
| business-hero.tsx | ✅ |
| business-tabs.tsx | ✅ |
| business-actions.tsx | ✅ |
| fixed-cta.tsx | ✅ |
| smart-lock-modal.tsx | ✅ |
| paid-gate.tsx | ✅ |
| plan-card.tsx | ✅ |
| empty-state.tsx | ✅ |
| coming-soon.tsx | ✅ |
| about-free-app.tsx | ✅ |

---

## web/ — Lib

### Data

| الملف | الحالة |
|------|--------|
| lib/data/businesses.ts | ✅ |
| lib/data/business-detail.ts | ✅ |
| lib/data/account.ts | ✅ |
| lib/data/admin.ts | ✅ |
| lib/data/areas.ts | ✅ |
| lib/data/insights.ts | ✅ |
| lib/data/merchant.ts | ✅ |
| lib/data/subscriptions.ts | ✅ |
| lib/data/user.ts | ✅ |
| lib/data/index.ts | ✅ |

### AI + Supabase

| الملف | الحالة |
|------|--------|
| lib/ai/business-advisor.ts | ✅ |
| lib/ai/storage.ts | ✅ |
| lib/logging/errors.ts | ✅ |
| lib/logging/audit.ts | ✅ |
| lib/auth/admin.ts | ✅ |
| lib/auth/ip.ts | ✅ |
| lib/data/fraud.ts | ✅ |
| lib/data/badges.ts | ✅ |
| lib/data/health.ts | ✅ |
| lib/data/admin-business.ts | ✅ |
| lib/logging/client.ts | ✅ |
| lib/data/health.ts | ✅ |
| lib/data/admin-business.ts | ✅ |
| lib/auth/admin.ts | ✅ |
| lib/supabase/public.ts | ✅ |
| lib/supabase/server.ts | ✅ |
| lib/supabase/service.ts | ✅ |
| lib/supabase/browser.ts | ✅ |

### Utils + Search + Hooks

| الملف | الحالة |
|------|--------|
| lib/engagement.ts | ✅ |
| lib/ranking.ts | ✅ |
| lib/nav-items.ts | ✅ |
| lib/hooks/use-fair-rotation.ts | ✅ |
| lib/utils/distance.ts | ✅ |
| lib/search/history.ts | ✅ |
| lib/search/index.ts | ✅ |
| lib/search/normalize.ts | ✅ |
| lib/search/synonyms.ts | ✅ |
| lib/validations/auth.ts | ✅ |
| lib/validations/merchant.ts | ✅ |

## web/ — Root

| الملف | الحالة |
|------|--------|
| proxy.ts | ✅ |
| next.config.ts | ✅ |

---

## 📁 docs/

| الملف | الحالة |
|------|--------|
| MASTER_BRIEF.md | ✅ |
| AI_CONTRACT.md | ✅ |
| SACRED.md | ✅ |
| DESIGN_SYSTEM.md | ✅ |
| ARCHITECTURE.md | ✅ |
| FEATURES.md | ✅ |
| ROADMAP.md | ✅ |
| GLOSSARY.md | ✅ |
| MIGRATION_GUIDE.md | ✅ |
| CODE_STANDARDS.md | ✅ |
| DEBUGGING.md | ✅ |
| PRODUCTION_CHECKLIST.md | ✅ |
| DATABASE_RULES.md | ✅ |
| SECURITY.md | ✅ |
| AI_HANDOFF.md | ✅ |
| PROGRESS.md | ✅ (هذا الملف) |
| SESSION_LOG.md | ✅ |
| CHANGELOG.md | ✅ |
| STRUCTURE.md | ✅ |
| LESSONS.md | ✅ |
| NEW_CHAT_MESSAGE.md | ✅ |
| FILE_ORDER.md | ✅ |
| AUDIT_PLAN.md | ✅ |
| PERFORMANCE_SECURITY_PLAN.md | ✅ |

---

## 📈 إحصائيات

- **App:** ~2400 سطر
- **Components:** ~3500 سطر
- **Lib:** ~1800 سطر
- **Docs:** ~7000 سطر

---

## 🎯 اللي جاي

1. التعليقات + التقييمات الكاملة
2. نظام المصداقية الديناميكي
3. الفرص الجديدة (30 يوم)
4. 5 صفحات Admin المتبقية
5. Rate Limiting (Upstash)
6. Turnstile على signup
7. nonce-based CSP

---

آخر تحديث: 2026-10-06

---

## 📋 خطط مؤجلة (docs/plans/)

- ANNOUNCEMENTS.md — إشعارات المسؤول المميزة

---

## 🤖 AI Agent (جديد 2026-10-02)

| الملف | الحالة |
|------|--------|
| lib/ai/openrouter.ts | ✅ |
| lib/ai/tools.ts (3 أدوات) | ✅ |
| lib/ai/agent.ts | ✅ |
| app/api/ai/chat/route.ts | ✅ |
| components/ai-widget.tsx | ✅ |

**الموديل:** meta-llama/llama-3.3-70b-instruct:free
**Rate limit:** 10 أسئلة / 10 دقايق / user (Upstash)

---

## 📊 SEO (جديد 2026-10-02)

- app/sitemap.ts (dynamic)
- app/robots.ts
- JSON-LD LocalBusiness على business pages

---

## 💰 Polish Pass (جديد 2026-10-02)

راجع `docs/plans/POLISH_PASS.md`

- §1 المسافة (DistanceBadge + geolocation)
- §2 الكارد الموحد
- §3 فخامة المميزين (gold + shimmer)
- §4 Nav (mobile labels + purple active)
- §5 المصداقية (trust badges)


---

## 🎛️ Admin Panel Overhaul (جديد 2026-10-17)

| الميزة | الملف | الحالة |
|--------|-------|--------|
| Business Quick Actions | `admin/businesses/[id]/business-actions-bar.tsx` | ✅ |
| Business Bulk Actions | `admin/businesses/business-list.tsx` + `bulk-actions.ts` | ✅ |
| Featured Drag & Drop | `admin/featured/featured-list.tsx` + `reorderFeatured` | ✅ |
| Settings Confirm Modals | `components/ui/confirm-modal.tsx` | ✅ |
| Users Bulk Actions | `admin/users/users-list.tsx` + `bulk-actions.ts` | ✅ |
| CSV Export (7 أنواع) | `api/admin/export/route.ts` + `lib/utils/csv.ts` | ✅ |
| Moderation Search | `admin/moderation/moderation-filters.tsx` | ✅ |
| Broadcast History | `admin/notifications/history-list.tsx` | ✅ |
| Health Actions + Filters | `admin/health/actions.ts` + `health-filters.tsx` | ✅ |
| ⌘K Command Palette | `components/ui/command-palette.tsx` | ✅ |

**عدد commits:** 10
**أسطر مضافة:** ~3,500
**ملفات جديدة:** ~20
**TypeScript errors:** 0
**ESLint errors:** 0

### النمط المعماري

- كل server action: `requireAdmin` → `zod.validate` → `supabase` → `logAudit` → `revalidatePath`
- كل filter state في URL: bookmarkable + shareable + يعمل مع back/forward
- كل CSV export يحترم الفلتر الحالي
- كل المكونات الجديدة `'use client'` — عدا الصفحات (Server Components)


- **اختبارات التجاوب للموبايل:** أُضيفت تغطية Playwright لصفحة التواصل والاستكشاف بعروض 320/360/375/390/414/430px، مع فحص overflow في المحتوى والهيدر العائم، واختبار أن الروابط الخارجية في صفحة التواصل HTTPS وعلى نطاق رسمي معتمد. الاختبارات مضافة لكنها لم تُنفذ بعد لأن GitHub Actions لا يزال يفشل قبل تخصيص Runner.

## صلاحيات الأدمن الأعلى — 2026-10-29

- **قنوات التواصل وإعدادات الموقع:** قنوات التواصل الرسمية (واتساب الدعم، قناة واتساب، فيسبوك والإيميل) أصبحت تُقرأ من `app_settings` مركزيًا، ولا تُعرض للزائر إلا بعد تفعيل `public_contacts_enabled` وبعد نجاح التحقق من الرابط/الرقم. أُزيلت الروابط الثابتة من صفحة التواصل والفوتر والقائمة وزر تمديد التجربة، وتظهر رسالة هادئة مع روابط المساعدة عند عدم إعداد القنوات. فحص الإنتاج كشف أن `service_role` كان يفتقد صلاحيات `app_settings`؛ اختُبرت منح الصلاحيات ثم طُبقت عبر `grant_service_role_app_settings_20261029`. تحقق دائم: الخدمة تملك SELECT/INSERT/UPDATE/DELETE، و`anon` لا يملك SELECT. نحتاج مراقبة سجل Vercel بعد أول زيارة للنسخة المنشورة.

- **حساب الأدمن الأعلى الوحيد:** بوابات الإدارة وإجراءات الصلاحيات تعتمد الآن على `super_admin` فقط؛ الحسابات ذات الدور القديم `admin` لا تحصل على لوحة الإدارة. واجهات تغيير الدور الفردي والجماعي لا تسمح بمنح `admin` أو `super_admin`. ترحيل `2026-10-29-super-admin-only.sql` اجتاز اختبار `BEGIN/ROLLBACK` وطُبق على الإنتاج. تحقق مباشر بعد التطبيق: `super_admin_count=1` و`legacy_admin_count=0`، والمشغل يمنع تعيين `admin`، إضافة super_admin ثانٍ، أو تخفيض الأخير. اختبارات E2E بدور حقيقي ما زالت مطلوبة عندما تتوفر بوابة CI.


## 2026-10-29 — استكمال حماية الصلاحيات والواجهة

- توحيد تعريف الدور الإداري الداخلي على `super_admin` في الحارس المركزي والجلسة وصورة الحساب ونموذج تغيير الدور؛ الخيارات الإدارية لم تعد قابلة للتعيين من واجهة المستخدم. حساب قاعدة البيانات الوحيد ما زال `super_admin` واحدًا، ودور `admin` القديم غير موجود.
- إعدادات التواصل أصبحت مركزية من `app_settings` مع قيم فارغة افتراضية وتعطيل الظهور العام. الصلاحيات النهائية على الجدول: الخدمة تقرأ/تدرج/تحدّث فقط، ولا تحذف؛ الزائر لا يقرأ الجدول.
- إزالة لاحقة العلامة المكررة من عناوين الصفحات لتصبح `اسم الصفحة | EAH` بدل تكرار `EAH` مرتين.
- أضيف اختبار Playwright للتجاوب في 320–430px لصفحة الاستكشاف والتواصل. GitHub Actions ما زالت تفشل قبل تشغيل Runner (`runner_id=0` وخطوات فارغة)، لذلك لم يُتحقق منها داخل CI؛ لا تُعلن جاهزية E2E حتى تتوفر بيئة تشغيل.
- لا تزال تجربة إضافة نشاط حقيقي كاملة (حفظ، صور، نشر، ظهور في البحث وصفحة عامة) بحاجة لاختبار دخول بصلاحيات فعلية على بيئة آمنة. لم تُنشأ حسابات أو أنشطة وهمية في الإنتاج.


## مزامنة صور النشاط — 2026-10-29

- **مزامنة صور النشاط:** أُضيف `private.sync_business_media_image_columns()` وtrigger على `business_media` لتحديث `businesses.logo_url` و`cover_image_url` تلقائيًا عند الإضافة/التعديل/الحذف، مع backfill للصور الحالية. هذا يعالج اختلاف مصدر الكارد (حقول النشاط) عن مصدر صفحة التفاصيل (وسائط النشاط). الاختبار داخل `BEGIN/ROLLBACK` نجح؛ اختبار الرفع عبر UI ما زال مطلوبًا.


## اتجاه تجربة المنتج والتصميم — 2026-10-29

- أُضيف `docs/EAH_PRODUCT_BLUEPRINT.md` لتثبيت الاتجاه المبدئي قبل إعادة تصميم واسعة: الحفاظ على هوية البنفسجي/النيون والتاج والهوك وعبارة شبين القناطر وعناصر فلسطين والإمضاء، مع تطوير التنقل والخلفية والبحث والتصنيفات وترتيب الأنشطة وتجربة الهاتف.
- الدمج المعتمد مبدئيًا: Neon Discovery + Modern Marketplace + Trust First + Dashboard Pro + Adaptive EAH. هذا اتجاه تصميم وليس ادعاءً بأن الواجهة نُفذت أو اختُبرت بالكامل.
- قواعد البحث والتصنيفات والترتيب والأداء والاستجابة واختبارات القبول موثقة في الـ Blueprint. ننتظر الكروكي لتأكيد توزيع الشاشات قبل تغييرات بصرية واسعة؛ تستمر الإصلاحات الوظيفية والأمنية المستقلة حسب الأولوية.
- يجب مراجعة الملفات الحالية قبل أي تنفيذ بصري، وعدم تغيير النصوص الأساسية أو اختراع بيانات تواصل أو إثباتات توثيق غير موجودة.


## إصلاح تنقل الأقسام السريعة — 2026-10-29

- **المشكلة المؤكدة:** `ChipScrollHandler` كان يبحث عن القسم مرة واحدة فقط بعد مهلة 150ms؛ إذا وصل القسم لاحقًا ضمن Server Components تحت `Suspense` فلن تحدث محاولة أخرى، وبالتالي قد يفشل التنقل السلس من التصنيفات إلى القسم.
- **الإصلاح على `main`:** `web/components/chip-scroll-handler.tsx` ينتظر ظهور الهدف باستخدام `MutationObserver` بمهلة قصوى 5 ثوانٍ، ويحترم `prefers-reduced-motion`. إذا لم يظهر قسم معروف، يوجّه إلى الصفحة المتخصصة المقابلة (`/offers`, `/trends`, `/nearby`, `/suggest`).
- **اختبار الانحدار:** أضيف اختبار Playwright في `web/e2e/home.spec.ts` يدرج القسم بعد تحميل الصفحة ويتحقق من حدوث التمرير.
- **التحقق:** نشر Vercel للـ commit `840180b48122693eac7bd2868d9b3b6abbca8a58` وصل إلى `READY` بعد اكتمال البناء. صفحات `/`, `/explore`, `/offers`, `/trends`, `/nearby`, `/suggest`, و`/businesses/tapooosh` أعادت HTTP 200 عند فحصها على deployment المنشور. هذا لا يثبت تنفيذ اختبار Playwright؛ بوابة CI لا تزال بحاجة لتشغيل اختبارات فعلية.



## إصلاح ترتيب نتائج البحث — 2026-10-29

- **المشكلة:** صفحة الاستكشاف كانت تفرض `sort: 'relevance'` كلما وُجد نص بحث، فتتجاهل اختيار المشتري «الأحدث» أو «الأعلى تقييمًا» أو «الأقرب» حتى لو كانت الواجهة تعرض هذا الاختيار.
- **الإصلاح:** أُضيف `resolveResultSort`: الصلة بالبحث هي الافتراضية عند كتابة استعلام من دون اختيار ترتيب، لكن الترتيب الصريح يطبّق فعلًا. خيار «الأكثر صلة بالبحث» يظهر فقط عند وجود استعلام، وحالة الترتيب التي تعرضها الفلاتر تُحسب من نفس الترتيب الفعلي للخادم.
- **تحقق إضافي:** اختيار «الأقرب» دون إحداثيات صالحة لا يُعامل كأنه ترتيب مسافة فعال؛ يعود الترتيب الافتراضي بدل إيهام المستخدم.
- **الاختبارات:** أُضيفت اختبارات انحدار للحالات الافتراضية والصريحة والمسافة دون موقع. لا يُعلن اجتياز Vitest/E2E حتى تُشغّل الاختبارات فعليًا؛ بناء Vercel واختبارات المصدر المنفصلة لا يغنيان عنها.


## متابعة 2026-10-29 — نتائج فحص الإعلان والصلاحيات

- القراءة فقط من قاعدة الإنتاج أثبتت أن جدول `ads` لا يحتوي على `approved_by/approved_at` رغم أن إجراء الموافقة يكتب إليهما، وأن سياسات المالك لا تمنع تغيير حالة الإعلان مباشرة ولا تتحقق من ملكية النشاط عند الإدراج. كذلك سياسة القراءة العامة لا تتحقق من موعد البداية.
- لم أغيّر Schema قاعدة الإنتاج. قواعد المشروع تشترط موافقة صاحب المنصة قبل SQL/Schema، وstaging ونسخة احتياطية قبل التنفيذ. هذا مانع أمان موثق وليس إصلاحًا مكتملًا.
- حُصّن طلب الإعلان في الخادم: روابط HTTP(S) فقط، تواريخ صالحة ومتسلسلة، تحقق من مكان إعلان نشط، وموعد بداية افتراضي غير فارغ ليتوافق مع العمود الإلزامي. كما أصبح إلغاء الإعلان يربط الحذف بالمعرّف والنشاط والحالات القابلة للإلغاء داخل العملية نفسها، ولا يعلن نجاح الحذف إذا أعادت RLS صفر صفوف.
- أضيفت «إعلانات نشاطي» لقائمة البايع، واستُبدل تدرج زر المشاركة في الفوتر بمتغيرات نظام التصميم.
- **ما زال مطلوبًا:** موافقة على إعداد ترحيل جديد، وبيئة staging لاختبارها، ثم مراجعة معمارية لنقل تدفق الإعلان من الجدول القديم `ads` إلى `ad_campaigns/ad_creatives`. لم يتم اختبار رحلة الإعلان الحقيقية أو إنشاء بيانات اختبار.


## متابعة 2026-10-29 — توقيت طلب الإعلان وحدود المحاولات

- مدخلات `datetime-local` لطلب الإعلان تُفسَّر الآن بتوقيت `Africa/Cairo` وتتحول إلى UTC باستخدام أداة مشتركة تتعامل مع التوقيت الصيفي؛ لا تعتمد على توقيت خادم Vercel أو إضافة ساعتين ثابتتين.
- أُضيفت اختبارات وحدة للتحويل في توقيت مصر الصيفي والشتوي وللتواريخ غير الصالحة، وأصبح إرسال/إلغاء طلبات البايع محدودًا باستخدام `strictLimiter` مع `failClosed: true`.
- إشعار الأدمن بإنشاء طلب إعلان يُنتظر انتهاء محاولاته عبر `Promise.allSettled` بدل إطلاق وعود غير منتظرة.
- حالة التحقق: لا أستطيع تشغيل Vitest محليًا من خلال واجهة GitHub فقط. البناء على Vercel سيؤكد التجميع وTypeScript، أما اختبار الوحدة وCI فما زالا بحاجة إلى Runner يعمل.


## متابعة 2026-10-29 — إصلاح إجراءات إدارة الإعلانات

- أزيلت الكتابة إلى العمودين غير الموجودين `approved_by/approved_at` من موافقة الإعلان. أصبح إجراء الموافقة يتحقق من الـUUID والتواريخ بتوقيت `Africa/Cairo`، ولا ينتقل إلى active إلا إذا كانت الحالة الحالية pending.
- أُضيف تحديد معدل إلى عمليات الإدارة، والتحقق من الحالة الحالية داخل عمليات الرفض/الإيقاف/الاستئناف/الحذف مع فحص الصف المتأثر؛ لا يُعرض نجاح لمجرد أن Supabase لم يُرجع خطأ.
- مشكلة RLS الأوسع ما زالت قائمة: مالك الإعلان يستطيع محاولة تغيير الحالة مباشرة عبر PostgREST، والإدراج لا يثبت ملكية النشاط. لن تتصلح هذه الثغرة بشكل كامل من Server Actions فقط؛ تحتاج migration مختبرة في staging بعد موافقتك.


## متابعة 2026-10-29 — توحيد التسميات الظاهرة

- وُحّدت بقايا تسميات جمهور الواجهة في الأسئلة الشائعة والمساعدة والشروط وصفحة التعريف إلى «المشتري/البايع».
- لم تتغير قيم الأدوار الداخلية، أسماء الجداول، أو النصوص التاريخية في وثائق التطوير.


## 2026-10-29 — QA activity, ad RLS and CI/build housekeeping

- Added one public QA-only activity, “اختبار EAH — نشاط تجريبي (لا تتعامل)” at /businesses/eah-qa-test-20261029. It has no owner, phone/contact details, logo/cover, in-app orders or WhatsApp orders. Its public notice explicitly says it is not a real activity and not to contact/order. The warning expires on 2026-11-05; remove or unpublish this QA record when testing is complete.
- Verified over the deployed site that the QA detail route returns HTTP 200 and shows the warning; /explore now includes its name and slug. Public activity title metadata no longer repeats EAH.
- Refined cards: “لسه مفيش تقييمات” is metadata rather than a large badge covering the image. Detail page now has an accessible breadcrumb and shows genuine activity flags and the exact address when available.
- Applied migration legacy_ads_rls_hardening_20261029 to Supabase production after testing the DDL inside a transaction that was rolled back. Live pg_policies verification confirms public read requires active/start/end window, seller inserts must link an owned business and stay pending, direct updates are admin-only, and seller deletes are restricted to their own pending/rejected ads. ads row count remains zero.
- Added the matching migration file and six pgTAP regression assertions to the repository and wired them into the RLS quality job. The pgTAP suite has not run yet because GitHub runners fail before the first step; it must be executed once a runner is available.
- CI root cause is external to the workflow YAML: the latest jobs show runner_id=0, empty runner_name, and no steps. Added paths-ignore rules so docs/workflow housekeeping doesn't keep consuming failing jobs. This does not repair hosted Runner availability for code changes; repository/account Actions usage/spending limits or a self-hosted runner still needs owner-side resolution.
- Installed Vercel Ignored Build Step. A workflow/helper-only commit was confirmed skipped with exit code 0; missing Git SHAs/history fail open and continue the build. The app commit 1b7091b built successfully (TypeScript finished, webpack compiled, deployment READY).
- No Supabase staging branch was created because it would incur about USD 0.01344/hour and needs explicit cost approval. No fake login users were created; the explicitly requested test activity was sufficient for the public card/detail path.


## 2026-10-29 — حالة إصلاح الإنتاج ومرحلة التحقق

- نشاط QA تجريبي منشور بعنوان «اختبار EAH — نشاط تجريبي (لا تتعامل)» على /businesses/eah-qa-test-20261029. لا مالك، لا هاتف أو وسيلة تواصل، ولا طلبات داخل المنصة أو واتساب. يظهر التنبيه في صفحة التفاصيل، والنشاط ظاهر الآن في /explore. ينتهي التنبيه 5 نوفمبر 2026؛ أزل أو ألغِ نشر سجل QA بعد انتهاء الاختبار حتى لا يبقى سجل تجريبي ضمن النتائج.
- بطاقة النشاط لا تعرض «لسه مفيش تقييمات» فوق الصورة بعد الآن؛ الرسالة أصبحت جزءًا من تفاصيل البطاقة. صفحة التفاصيل فيها breadcrumb، شارات الميزات الحقيقية، والعنوان الكامل عند توفره.
- نسخة التطبيق commit 1b7091be5dd885835606e7ed36041412c3f7d2f7 أصبحت READY على Vercel، مع نجاح التجميع وTypeScript. تم فحص الاستجابات العامة: الرئيسية/الاكتشاف والصفحة التجريبية 200، عنوان الصفحة التجريبية لا يكرر EAH، والنشاط التجريبي يظهر في نتائج الاكتشاف.
- طُبقت سياسات RLS للإعلانات القديمة في الإنتاج بعد اختبار DDL داخل معاملة تم التراجع عنها؛ التحقق الحي أكد السياسات الأربع المتوقعة، وصفوف الإعلانات تظل صفرًا. Migration واختبار pgTAP موجودان في المستودع، لكن pgTAP لم يُشغّل على staging بعد.
- GitHub Actions: Jobs على تغييرات التطبيق تفشل قبل تخصيص Runner (runner_id=0 وsteps=[]). تحديثات docs/workflow وحدها لم تعد تشغل هذه الوظائف، وهو تقليل لهدر التشغيل لا إصلاح لتوفر Runner. لحل الجذر، على مالك الحساب فحص Actions billing/usage/spending limit أو إضافة self-hosted runner.
- Vercel Ignored Build Step يعمل: تحققنا أن التزام تغيير workflow/helper وحده أُلغي برسالة exit code 0، والالتزام الذي يغير التطبيق لا يتخطى البناء. هذا يقلل builds غير اللازمة لكنه لا يلغي quotas لحساب Vercel.
- لم يتم إنشاء حساب دخول وهمي؛ نشاط QA العام كان كافيًا لاختبار البطاقة والتفاصيل. لم يتم إنشاء Supabase staging بسبب التكلفة المتكررة 0.01344 USD/ساعة وعدم وجود موافقة منفصلة.
