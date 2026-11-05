# EAH — NEXT_SESSION.md

## متابعة 2026-11-05 — أحدث حالة بعد e0fa9f5

- آخر `main`: `e0fa9f5`; Vercel READY، TypeScript/build/54 pages passed. Helper كشف تعارض ملكية النشاط أُضيف مع 5 Vitest tests لكن لم تُشغّل.
- آخر Playwright على النسخة المنشورة لم يبدأ: `runner_id=0`, `steps=[]`. آخر Playwright pass سابق يبقى 50/50 على commit `39f260f` فقط؛ لا تعمم النتيجة على `e0fa9f5`.
- قاعدة الإنتاج: منع التفاعل المجهول مثبت بـ60 restrictive RLS policies/28 جدولًا. لا تطبق مسودة RPC/RLS/unique-owner migrations على production حتى تشغيل pgTAP في Supabase DB غير إنتاجية.
- الأولويات: (1) حل GitHub Actions runner allocation من Billing/Actions settings أو إعداد self-hosted runner، (2) موافقة منفصلة على تكلفة Supabase QA branch `$0.01344/hour` إن رغبت، (3) تشغيل 56 pgTAP assertions ومigrations المراجعة على DB معزولة، (4) دورة نشاط أدمن كاملة بحسابي أدمن/بايع QA وصور وظهور عام، (5) متابعة RPC/SECURITY DEFINER وnpm vulnerabilities وPrettier/Knip/jscpd debt.

## الحالة الحالية — تحديث 2026-11-04 (بعد فلتر الطلبات)

- آخر نشر تطبيق على `main`: `39f260f` — Vercel READY.
- فلتر «طلبات أونلاين» في الرئيسية والاستكشاف أصبح يعتمد `accepts_orders`، وقناة واتساب مستقلة. Regression test نجح.
- Playwright على نفس نسخة الإنتاج: 50/50 passed في 53.8 ثانية؛ تقرير `e2e-report-41896276780`.
- على `39f260f` نجحت TypeScript وESLint وPrettier وStylelint وBuild وUnit Tests وnpm audit وKnip وjscpd كخطوات. Quality aggregator ما زال failure بسبب findings المعروفة على مستوى المشروع. RLS ينتظر قاعدة اختبار مستقلة.
- مراجعة إنشاء النشاط البرمجية مطمئنة: الهاتف الأساسي للنشاط مطلوب؛ المالك اختياري؛ تغيير customer إلى merchant يتم بعد الحفظ؛ النشر مستقل. لكن لا يوجد authenticated E2E لدورة حقيقية تشمل الصور والبحث والظهور العام، فلا تغلق هذه المهمة بعد.

### الأولويات التالية
1. إعداد مشروع/قاعدة Supabase غير إنتاجية وسر `SUPABASE_DB_URL` مخصص لـCI، ثم تشغيل pgTAP/RLS قبل أي migration إنتاجية.
2. تنفيذ دورة نشاط QA كاملة بحساب أدمن وبايع تجريبيين داخل بيئة اختبار: بدون مالك، بمالك مشتري، وسائط متعددة، نشر، البحث وصفحة عامة.
3. معالجة ثغرات npm audit تدريجيًا مع مصفوفة توافق Next/Serwist، دون `npm audit fix --force`.
4. تنظيف 131 ملف Prettier على دفعات، ثم إزالة حزم الخطوط غير المستخدمة عبر npm uninstall وإعادة CI، ومراجعة 66 clone في jscpd قبل refactor.
5. اختبارات تفاعلية مرئية فعلية للهيدر/الفوتر/الكروت عند 320/360/390/430/496px والتابلت والديسكتوب.
6. إضافة Trusted Source محدود لبيئة Preview فقط إذا احتاج اختبار PR ذلك؛ Production لا يحتاج تجاوز SSO.

## الحالة الحالية — تحديث 2026-11-04

- آخر HEAD: 1d8af057 على main (تعديل E2E concurrency فقط). آخر نشر تطبيق: 12bab8dc على Vercel، الحالة READY.
- إصلاحات الواجهة المنشورة: المميزون/الأسهم/المسافات والكروت، «قريب منك» بنطاق 5 كم وإذن اختياري، SVG الطقس، شبكة التصنيفات الأربعة، واختصار الطقس في الهيدر بين 381–420px.
- E2E: إصدار GitHub OIDC token نجح، لكن Playwright لم يصدر ملخصًا نهائيًا في آخر تحقق. تحقق من تشغيلتي deployment SHA في Actions. لو ظهر 401/403، أضف GitHub Actions إلى Vercel Trusted Sources باستخدام claims المسجلة؛ لا تستخدم bypass دائمًا ولا تعطل SSO.
- Quality Gate على f32e989: TypeScript وESLint وPrettier وStylelint وWebpack build وUnit Tests نجحت؛ aggregator بقي أحمر بسبب 131 ملف Prettier قديمًا، و8 ثغرات npm audit إنتاجية، و3 حزم خطوط غير مستخدمة. حل audit الكامل المقترح يتطلب ترقية كاسرة لـSerwist؛ لا تستخدم --force.
- RLS لا يزال ينتظر SUPABASE_DB_URL لقاعدة اختبار منفصلة. لا تستخدم الإنتاج.

### الأولويات التالية
1. إنهاء E2E لنسخة 12bab8d وإضافة اعتماد GitHub OIDC كـTrusted Source في Vercel إذا أظهر التشغيل رفض حماية.
2. مراجعة مرئية للرئيسية والبطاقات والفوتر عند 320/360/390/430/496px ثم التابلت والديسكتوب.
3. إغلاق Quality Gate على دفعات: تنسيق 131 ملفًا بشكل منظم، معالجة npm audit دون قفزات كاسرة، ومراجعة حزم الخطوط الثلاث.
4. ربط قاعدة اختبار مستقلة لـRLS، ثم تشغيل pgTAP والمراجعات قبل أي migration إنتاجية.
5. إكمال رحلة النشاط الحقيقية: إنشاء الأدمن، ربط مالك اختياري، الوسائط، النشر، الظهور في البحث والصفحة العامة.
6. متابعة الأمان: تدوير المفاتيح المسجلة في الوثائق، سر Vercel في تاريخ Git، وإعداد Turnstile/كلمات المرور المسربة قبل الإطلاق.

## الحالة الحالية — 2026-11-04

- الفرع: `main`.
- آخر تعديل تطبيق منشور ومتحقق من Build: `4df179d` — قسم «قريب منك» يستخدم إذن الموقع، نطاق 5 كم، والترتيب حسب المسافة مع fallback لشبين القناطر.
- تحسينات الموبايل على المميزين والكاروسيل والبطاقات والمسافات نُشرت على main؛ التحقق البصري الفعلي على أجهزة متعددة ما زال مطلوبًا.
- Invariants وCodeQL وTypeScript وESLint وStylelint وWebpack build وVitest نجحت على الالتزام 4df179d. Quality Gate النهائي ما زال أحمر بسبب 131 ملف Prettier، و8 ثغرات npm audit إنتاجية، و3 dependencies للخطوط غير مستخدمة حسب Knip.
- اختبارات RLS متوقفة لغياب قاعدة اختبار منفصلة؛ لا تستخدم قاعدة الإنتاج.
- إصلاح شرط E2E سُجل في `2eb672c`، لكن إثبات تشغيله ينتظر حدث نشر تطبيق ناجح؛ Vercel تخطى ذلك الالتزام لأنه تعديل CI فقط.

### الأولويات التالية
1. تأكيد تشغيل E2E بعد أول نشر تطبيق لاحق، وإضافة اختبار مسار الموقع الممنوح/المرفوض/النتيجة الفارغة.
2. مراجعة مرئية للرئيسية والبطاقات والفوتر عند 320/360/390/430/496px ثم التابلت والديسكتوب.
3. إغلاق Quality Gate على دفعات: Prettier في الملفات المتأثرة ثم معالجة الـ131 ملفًا، معالجة npm audit دون قفزات كاسرة، ومراجعة حزم الخطوط الثلاث.
4. ربط قاعدة اختبار مستقلة لـRLS، ثم تشغيل pgTAP والمراجعات قبل أي migration إنتاجية.
5. إكمال رحلة النشاط الحقيقية: إنشاء الأدمن، ربط مالك اختياري، الوسائط، النشر، الظهور في البحث والصفحة العامة.
6. متابعة الأمان: تدوير المفاتيح المسجلة في الوثائق، سر Vercel في تاريخ Git، وإعداد Turnstile/كلمات المرور المسربة قبل الإطلاق.

> اقرأ AI_PLAYBOOK.md + BRAIN.md + ERROR_REGISTER.md قبل أي عمل.
> آخر تحديث: 2026-10-20

## State

- Last commit: `20b7725a`
- Branch: main (clean)
- Invariants: all OK

**النهاردة 2026-10-23 — مكتمل:**

- Orders v2 (DB + Admin + Merchant + Customer + Auto + Rating trigger)
- Reports + SendToMerchant + Print
- Notifications (bell + sidebar + Push infra)
- Dashboards (order flow)
- Merchant settings (logout + links)
- 20+ bug fixes (accepted_at, phone, race conditions, expiry drift, suspension, feedback gate, etc.)
- 404 page + Loading skeletons + Error boundaries + requireAdmin hardening
- Docs: NEXT_SESSION + BRAIN + ERROR_REGISTER + orders-system-v2

**Pending:**

- Push E2E verification (browser re-subscribe)
- 20 نشاط (آخر خطوة — تحت إيد المالك)

## Working

- Business wizard fullscreen + 10 contact types
- Notice + open-override + location picker (📍 + OSM)
- Images: file upload + URL paste (logo/cover/menu/gallery) — 200 on all
- Menu + Gallery sections (admin) + ImageGrid resource-based DELETE
- Offers CRUD (admin) + public offers tab
- Share modal (WhatsApp/Twitter/FB/Telegram/copy/QR)
- Admin mobile drawer + profile + bell routing
- WhatsApp orders gate (server-side)
- God Components all split (≤300 lines each)
- 3 layouts unified (admin/merchant/account) with SecondaryHero + 1240px + footer
- All dates/numbers: Western (en-US)
- `/updates` removed
- Invariants CI gate (B1=0, B2=1, B3=10, B4=16, B5=47, B6=31, B7=8, B8=21, X1-X4=0)

## Known Issues

- SEC-01: 11 keys rotate (DEFERRED)
- SEC-02b: ***REMOVED*** in git history (pre-launch)
- B2: 1 select('*') — admin-business (documented exception)
- Testing: end-to-end with real business data pending

## Next Priorities (in order)

1. **Add first real business** (primary goal)
2. Test end-to-end: images + offers + share + mobile drawer
3. SEC-01 rotate (when owner ready)
4. SEC-02b: git history (pre-launch)
5. UI polish based on real-world feedback

## Forbidden

- No Puck/designtools/Surface (failed experiments)
- No new branches before launch
- No DB changes without migration in docs/migrations/
- Never commit .env.local

## Key Files

- AI_PLAYBOOK.md — read first
- BRAIN.md — quick understanding
- ERROR_REGISTER.md — error states
- migrations/ — all DB changes
