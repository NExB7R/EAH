# EAH — NEXT_SESSION.md

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
