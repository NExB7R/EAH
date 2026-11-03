# EAH — CODE REVIEW LOG

> **قاعدة المالك (2026-10-05):** أثناء أي تطوير — سجّل أي مشكلة/ملاحظة + أفكار للتحسين.
> **التصنيفات:** 🔒 أمان | ⚡ سرعة | 🧠 وجيك | ✨ سلاسة | 🎨 تصميم

**آخر تحديث:** 2026-10-06

---

## ✅ تم حلها (Session 12 — 2026-10-05/06)

| # | المشكلة | الحل |
|---|---------|------|
| 1 | بحث الأنواع يتجاهل الاسم | Search v2: filter بالـ type ثم rank بالاسم |
| 2 | مفيش word-level search | tokenize + score لكل كلمة |
| 3 | مفيش Fuzzy matching | Levenshtein ≤ 2 |
| 4 | مفيش ترتيب ثانوي | is_open + trust + rating + distance |
| 5 | أرقام عربية غير مدعومة | ٠-٩ → 0-9 في normalize |
| 6 | مفيش limit parameter | Math.min(limit, 200) |
| 7 | normalizeArabic يتكرر | cachedNormalize |
| 8 | مفيش ترتيب حسب النية | detectIntent (quality/nearby/open_now) |
| 9 | تعارض body.overflow | OrderModal وحده يتحكم |
| 10 | cooldown logic خطير | regex دقيق (\\b429\\b + \\b5xx\\b + AbortError) |
| 11 | onClose غير مستقر | useCallback |
| 12 | limit في smartSearch | Math.min/max |
| 13 | overscroll في MenuSlider | overscroll-behavior: contain |
| 14 | admin/businesses زر موافقة ميت | Server Action + useTransition |
| 15 | مفيش رفض | rejectBusiness + reason + إشعار |
| 16 | مفيش إدارة المنشورين | Tabs (pending/published/rejected/all) |
| 17 | مفيش bulk actions | — (مؤجل — لا ضرورة حالياً) |
| 18 | description مقطوع | تفاصيل كاملة في الصفحة |
| 19 | مفيش بحث/فلترة | Tabs + بحث |
| 20 | <img> بدون optimization | (مؤجل — غير حرج) |

---

## 🔴 ملاحظات مفتوحة (مرتبة حسب الخطورة)

_(يُحدَّث باستمرار أثناء التطوير)_

---

## ⚠️ قواعد المراجعة

- أي مشكلة → تسجيل فوري هنا
- كل ملاحظة → 3 حاجات: المشكلة + الأثر + الحل المقترح
- المراجعة بتحصل أثناء التطوير، مش بعده

---

آخر تحديث: 2026-10-06


---

## ✅ Session 22 (2026-10-08) — CSP + Fonts + A11y

| # | المشكلة | الحل |
|---|---------|------|
| 1 | Turnstile widget مش بيظهر (CSP) | شيل `'strict-dynamic'` |
| 2 | Script بدون nonce | تمرير nonce عبر props |
| 3 | Site Key مش وصل للـ bundle | hardcode fallback |
| 4 | 5 CSS fonts blocking | `next/font/local` + preload |
| 5 | Contrast — footer version | `--text-secondary` |
| 6 | Heading order — h4 بدون h2 | h4 → h2 |
| 7 | Link بدون اسم — loginBtn | `aria-label` |
| 8 | Touch targets < 44px | تكبير + test guard |

**الأرقام:** Mobile A11y 87→100 · Desktop A11y 95→100 · Agent 1/2→2/2 · Desktop TBT 30ms→0ms


---

## 2026-11-03 — Home Discovery / Fair Exposure Review

### تم إصلاحه في الفرع `feat/home-local-discovery-2026`

| # | التصنيف | المشكلة / الأثر | المعالجة |
|---|---|---|---|
| 1 | 🎨 | التصنيفات كانت داخل الهيرو ومختلطة مع العروض والترند والفلاتر | فصلها كوحدة مستقلة بعد الهيرو، وحصرها في أنواع الأنشطة الحقيقية |
| 2 | ⚡ | الهيرو يحتل ارتفاع الشاشة ويترك رحلة الاكتشاف منخفضة | جعل ارتفاع الهيرو تابعًا لمحتواه (الشعار/الهوك/البحث) |
| 3 | 🧠 | الصفحة كانت تشتق الأقسام من أول 100 نشاط مرتبة بالسمعة؛ قد تستبعد الجديد والمميز قبل عرضه | استعلام مستقل لكل مجموعة، وتوسيع مجموعة المؤهلين قبل ترتيب القسم |
| 4 | 🧠 | تدوير المميزين كان يلف الجزء الأخير إلى بداية القائمة عند عدم اكتمال حجم الصفحة، فيكرر عناصر ويتجاوز ذيل القائمة | إظهار الجزء الأخير أولًا ثم إعادة الخلط؛ حفظ موضع الدورة والعناصر المرئية خلال الجلسة وتغيّر breakpoint |
| 5 | ⚖️ | المميزون كان لديهم pin/order يفضّل نشاطًا على بقية المدفوعين | إزالة pin/manual order من واجهة ولوحة وإجراءات المميزين؛ كروت متساوية ودورة عادلة |
| 6 | 📍 | قريب منك كان مربوطًا بشبين القناطر ثابتًا، لا بإحداثيات الملف | قراءة موقع الحساب المحفوظ، فرز جغرافي حتى 5 كم، طلب موافقة للموقع عند نقصه، وإتاحة المنطقة يدويًا؛ لا مسافة رقمية بلا إحداثيات |
| 7 | 🧠 | «المرشح لك» كان رسالة ثابتة توحي بتوصيات لا وجود لها | بناء اقتراحات من مفضلة/متابعة/طلبات مكتملة حديثة؛ إخفاء القسم عند عدم كفاية الدليل |
| 8 | 🧠 | الترند كان يعتمد على أعمدة velocity/engagement/diversity غير محدثة بوضوح، مع إمكانية تسلل featured/reputation ordering | حساب إشارات آخر 30 يومًا من مصادر فعلية، استبعاد المدفوع ونقاط المشاركة، وإخفاء القسم عند عدم وجود إشارات |
| 9 | 📦 | استعلام العروض لم يكن يطبّق تاريخ البداية | إضافة شرط أن يبدأ العرض قبل ظهوره، وربط مزج العروض بنشاط النشاط التجاري المتاح |
| 10 | 📊 | Insights كان يطلب `page_view_events.created_at` بينما العمود الفعلي `occurred_at` | إصلاح استعلامات وحسابات الفترة في `web/lib/data/insights.ts` |
| 11 | 🔗 | مشاركة المنصة مكررة في القوائم الجانبية، مع عرض بطاقة بريد دعم غير مضبوط | إبقاء مشاركة المنصة في القائمة الرئيسية والفوتر فقط، والإبقاء على مشاركة النشاط داخل صفحة النشاط، وحذف البريد غير المعتمد |
| 12 | 🧩 | نوع `supermarket` موجود في تحقق الأدمن لكنه ناقص في بعض الأنواع/التصنيفات | توحيد union وlabels وcategory entry |
| 13 | ⚡ | Carousel يعمل تلقائيًا في كل صفوف المحتوى | جعل الحركة التلقائية اختيارية/مغلقة افتراضيًا للصفوف العادية |

### أدلة الإنتاج — قراءة فقط (2026-11-03)

- 8 أنشطة منشورة.
- آخر 30 يومًا: `business_activities = 0`، `engagement_events = 0`، `page_view_events = 0`.
- قيد `engagement_events.action` الحالي يسمح: `phone_reveal`, `whatsapp`, `review`, `comment`؛ أحداث الاتصال المضافة تستخدم قيمًا مسموحة.
- قيد `page_view_events.event_scope` الحالي يسمح فقط `site` و`business`. بعض دوال SQL القديمة تبحث عن `business_view` و`business_reveal` و`order_start` و`order_confirm`، وهي قيم لا يسمح بها القيد الحالي.
- `page_view_events` لا يملك عمود `created_at`; العمود الحقيقي `occurred_at`. تم إصلاح Insights، لكن إجراء funnel يحتاج migration مستقلة ومراجعة قبل التطبيق.
- جدول `engagement_events` لا يحمل `offer_id`، لذا ترتيب العروض الحالي proxy على نشاط النشاط التجاري، وليس قياسًا مباشرًا لتفاعل كل عرض.

### مفتوح — لا تعتبره مغلقًا

1. إضافة/إصلاح recorder لزيارات النشاط داخل `page_view_events` مع session/visitor deduplication وحماية rate limits، ومراجعة سياسة الخصوصية.
2. ترحيل DB يوفّق قيد `event_scope` مع `get_business_funnel`؛ لم يتم تنفيذ أي DDL أو كتابة على الإنتاج.
3. قياس نقرات/مشاهدات العرض نفسه (offer-level) عبر تصميم schema/action موثق؛ لا تدّعِ دقته قبل ذلك.
4. تشغيل TypeScript وESLint وPrettier وStylelint وVitest وBuild وE2E على الفرع؛ لم تتوفر نتيجة تشغيل بعد.
5. التأكد من أن تفعيل ميزات Featured/New من لوحة الأدمن يعكس الأهلية الفعلية/الاشتراك المطلوب حسب قواعد الباقات قبل الاعتماد النهائي.



---

## 2026-11-03 — Follow-up: paid eligibility, session views and test coverage

### تم استكماله على `feat/home-local-discovery-2026`
- **Featured paid entitlement:** فصل `featured_badge` عن `featured_home`. الظهور العام لا يتم إلا مع `business_subscriptions.status=active` و`is_trial=false` وخطة مدفوعة فعالة تشمل الميزة؛ وتظل `businesses.is_featured` اختيار الأدمن الإضافي. فحص الإنتاج أظهر عدم وجود اشتراكات حاليًا، لذا القسم يظل فارغًا حتى وجود استحقاق فعلي.
- **Nearby:** استعادة اختيار المنطقة اليدوي داخل البطاقة نفسها باستخدام `AreaDropdown` مع حفظ المنطقة ومسح GPS قديم؛ لا يظهر رقم مسافة من منطقة تقريبية.
- **Page view signal:** توصيل tracker آمن نسبيًا للزيارة إلى صفحة النشاط، session-scoped، rate-limited، بلا IP أو account ID محفوظ في سجل الزيارة. الإحالة تحفظ hostname فقط.
- **Trending:** وزن الزيارة 0.35، ولا تكفي وحدها؛ الحد الأدنى للعرض وزن حديث >=1 أو طلب مكتمل أو تقييم معتمد. إلغاء احتساب الإشارة غير المعروفة، وإرجاع حالة قبول من `addSignal` لمنع تكرار الطلب/التقييم عبر المصادر.
- **Offers:** الصفحة الرئيسية وصفحة `/offers` تستخدمان نفس ranking بحسب نشاط النشاط التجاري المرفق؛ لا يزال ذلك proxy وليس offer-level analytics.
- **Supermarket:** union/labels/synonyms/filters/merchant/admin forms محدثة. تمت إضافة migration وقاعدة pgTAP واختبارها إلى Quality workflow. لم تُطبّق migration على الإنتاج.
- **Unit tests:** اختبارات fair rotation، subscription entitlements، minimum trend signal، supermarket filter/label.

### ما بقي مفتوحًا قبل الدمج/الإطلاق
1. تشغيل Quality Gate كاملًا على آخر HEAD: TypeScript، ESLint، Prettier، Stylelint، Vitest، Build، npm audit، Knip، jscpd.
2. تشغيل E2E على Vercel Preview صالح؛ التشغيل السابق فشل في انتظار preview ولم يصل إلى Playwright.
3. تشغيل DB/pgTAP على قاعدة staging غير إنتاجية مخصصة. لم تُكتب أي تغييرات على قاعدة الإنتاج.
4. ترحيل `get_business_funnel` لتوحيد قيم `event_scope` مع القيد الحالي؛ لا يُستخدم هذا الجزء حاليًا لترتيب الترند.
5. بناء offer-level tracking عند الحاجة إلى ترتيب حسب أداء العرض نفسه.
6. مراقبة الأحداث الحقيقية قبل تعديل أوزان الترند؛ لا توجد عينة إنتاجية حديثة وقت الفحص.

**الحالة:** التغييرات على Draft PR #39 فقط؛ لم يتم الدمج أو النشر، ولا يجوز وصفها بأنها اجتازت الاختبارات قبل تشغيلها على الـHEAD الحالي.



### 2026-11-03 — Final entitlement duration correction
- Featured homepage placement now follows the qualifying paid `featured_home` subscription's real `expires_at` (monthly/quarterly/yearly), rather than a fixed 30-day `featured_until`.
- `featured_badge` is independent from `featured_home`: a badge-only paid plan shows the badge but does not enter the homepage Featured section; a homepage entitlement + admin selection drives the section.
- Admin Featured dashboard displays the actual subscription expiry, allows pause, and no longer offers arbitrary +90-day extensions beyond the plan.
- New Activities remains the only one-month placement window, with an explicit admin off-save-on-save renewal flow after expiry.
- Production DB remains read-only; no subscription or promotion records were changed.


### Quality / Preview evidence — 2026-11-03 (latest review)

- **Current branch/PR head at review start:** `045737222b8a49399805f7002b9ebf6c26ce628b`; Draft PR #39 remains open and is not merged.
- **Earlier Vercel Preview:** deployment `dpl_63Hn2jSpTyEcnxuL6tUtbg5wyLJf` for commit `faceb47de01b96c34cc6531eb0566f8e925b258f` reached `READY`. Its build log reports `Compiled successfully`, `Finished TypeScript`, and static page generation `55/55`. This is an older commit than the current head; it does not certify the latest route/CI changes.
- **Latest-head deployment attempt:** Vercel API rejected a new preview with `402 payment_required` because the project/team reached the free daily API deployment limit (>100; retry after 86400 seconds). No billing or plan settings were changed.
- **GitHub Actions:** Invariants and CodeQL passed on an earlier feature-branch SHA. The last complete Quality Gate run before the latest fixes failed TypeScript on duplicate `StoreIcon`, missing renewal context properties, and nullable Nearby area type; those have been corrected in later commits. That run stopped before ESLint/Prettier/Stylelint/Build/Vitest/audit/Knip/jscpd. No completed Quality Gate result exists for the current head.
- **E2E:** the prior run failed in the Vercel Preview wait step before Playwright. The cause was the action's hard-coded `vercel[bot]` creator filter, while this project's deployment records are created under the connected owner account. `.github/workflows/e2e.yml` now polls GitHub deployments for the PR-head and merge SHAs, accepts any creator, and validates the URL as a non-production Vercel Preview. This workflow revision has not yet been executed.
- **Dependency risk:** CI `npm ci` reported 25 vulnerabilities (19 moderate, 5 high, 1 critical). `npm audit --omit=dev --audit-level=high` has not completed on this branch because TypeScript stopped the earlier quality job. Treat audit status as unresolved, not passed.
- **No production DB writes/DDL or production deployment were performed.** The supermarket migration and pgTAP test still require an isolated staging DB run.


### 2026-11-03 — E2E Preview discovery correction
- Replaced the Vercel preview wait action that filtered exclusively for `vercel[bot]`.
- The E2E workflow now queries GitHub deployment records for both the PR head SHA and merge SHA, accepts any creator, polls pending status repeatedly, and only accepts a successful HTTPS `.vercel.app` non-production URL.
- Requires `deployments: read` permission.
- **Not executed yet** after this workflow change; validate it on a newly triggered PR run.

