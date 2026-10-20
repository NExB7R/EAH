# EAH — ERROR_REGISTER.md

> سجل الأخطاء الحي. آخر فحص: 2026-10-20 (يُحدّث يدوياً بعد التحقق الفعلي).
> **اقرأه بعد `AI_PLAYBOOK.md`.** أي خطأ جديد = ID جديد فوراً.

**الحالة:** ✅ متصلّح ومتحقق منه · 🟡 جزئي · 🔴 مفتوح · ⏳ ينتظر قرار المالك

---

## 1. قاعدة البيانات

| ID | الحالة | المشكلة | الإصلاح | التحقق |
|---|---|---|---|---|
| DB-01 | ✅ | GRANTs مفقودة (Supabase 2026). متصلّح: order_requests, business_comments, comment_likes, comment_thread_follows. **ناقص:** business_follows, business_subscriptions, business_activities, customer_locations, coupons, promo_posts | migrations/2026-10-20-restore-table-grants.sql (لم يُكتب) | استعلام role_table_grants |
| DB-02 | ✅ | award_points/award_trust_points/award_trust_badge/apply_trust_decay كانت مفتوحة | 3c8fc16 (REVOKE + GRANT service_role) | has_function_privilege = false |
| DB-03 | ✅ | check_rate_limit, track_ad_event, count_accounts_from_ip مفتوحة للزوار؛ generate_* للمسجلين | revoke internal functions | has_function_privilege |
| DB-04 | ✅ | دوال SECURITY DEFINER كانت متاحة لـ anon رغم حراس auth.uid؛ multi_account_ips كان مقفولًا بالفعل | migrations 96e8c2d + be1f199 + 2026-10-20-revoke-anon-sensitive-rpcs.sql | طُبقت migration `20261020203655`; تحقق مباشر: anon=false وauthenticated/service_role=true على الدوال الثماني |
| DB-05 | ✅ | صلاحيات referral/profile RPCs كانت تشمل anon افتراضياً، رغم فلاتر SQL | migrations 2026-10-20-db04-05-security.sql + 2026-10-20-revoke-anon-sensitive-rpcs.sql | طُبقت migration `20261020203655`; تحقق مباشر من grants لثلاث دوال referral/profile |
| DB-06 | ⏳ | business_branches.phone/whatsapp قابلة للقراءة من anon | قرار: عامة أو إخفاء | استعلام pg_policies |
| DB-07 | 🟡 | business_contact_methods: owner_select تسمح لأي مسجل بالقراءة | قصّرها على المالك + reveal_contact | pg_policies |
| DB-08 | ✅ | contact_reveals + audit_logs self insert | 3c8fc16 (حُذفت) | pg_policies |
| DB-09 | ✅ | دالتان بدون search_path | تصلّحت | pg_proc.proconfig |
| DB-10 | 🔴 | business-media storage policy مكسورة (foldername) | policy جديدة بـ objects.name | رفع صورة كتاجر |
| DB-11 | 🔴 | order-voice: رفع لأي مسار، تاجر ما بيسمعش | قيّد المسار + قراءة للمالك | اختبار الدورين |
| DB-12 | 🔴 | bucket order-images غير موجود | أنشئه أو شيل المسار | storage.buckets |
| DB-13 | 🔴 | أداء: 12 policy بدون (select auth.uid())، 10 FK بدون index | تقرير الأداء | get_advisors |
| DB-14 | 🔴 | migrations: 45 مسجّلة، وDB اتغيرت بعدها وخارج سجل migrations المعتاد | `supabase db pull` ثم مصالحة التاريخ بدون تعديل migrations مطبّقة | `supabase migration list` + مقارنة schema |
| DB-15 | 🔴 | apply_trust_decay بدون حارس أسبوعي | last_decay_at | اختبار SQL |
| DB-16 | 🔴 | admin_adjust_points تقرا trust_score كرصيد؛ check_and_award_badges مفاتيح عربية | مراجعة وتوحيد | اقرا الدالة |
| DB-17 | ⏳ | set_business_commission ضد مبدأ صفر عمولة | احذف أو وثّق | قرار |
| DB-18 | 🟡 | تفريق بين super_admin وadmin في policies + is_admin() | وحّد | اختبار بحساب admin |
| DB-19 | ⏳ | Leaked Password Protection مقفول | Pro | Dashboard |
| DB-20 | ✅ | `find_by_phone` و`is_phone_registered` كانتا قابلتين للاستدعاء مباشرة من anon/authenticated، ما يسهل تعداد الأرقام | migration `20261020203959`; routes moved to service client after server-side checks | تحقق حي: anon=false، authenticated=false، service_role=true للدالتين |

## 2. الدخول والحسابات

| ID | الحالة | المشكلة | الإصلاح |
|---|---|---|---|
| AU-01 | 🔴 | Turnstile في Server Action فقط. /auth/v1/signup مفتوح بالـ anon key | فعّل CAPTCHA في Supabase Auth |
| AU-02 | 🔴 | phone_e164/signup_ip_hash من user_metadata | احسبها في السيرفر/trigger |
| AU-03 | ✅ | @auth.eah.app → @auth.eah.invalid | 2a0b135 |
| AU-04 | 🔴 | حد IP فقط، 3 محاولات، بلا CAPTCHA، recoverAction وهمي | OTP + حد لكل رقم |
| AU-05 | 🔴 | limiters fail-open (AI chat كمان) | fail-closed + تنبيه |
| AU-06 | 🔴 | 11 مفتاح مكشوف + Turnstile Secret + Desktop/X.txt | rotate + Bitwarden + gitleaks |

## 3. الـ API والـ Server Actions

| ID | الحالة | المشكلة | الإصلاح |
|---|---|---|---|
| AP-01 | ✅ | 4 cron routes تفتح لو CRON_SECRET ناقص | 2a0b135 (verifyCron fail-closed) |
| AP-02 | ✅ | /api/track-action: IP خام + rate limit مفقود | 2a0b135 (hashIp + rate limit) |
| AP-03 | ✅ | /api/log-error و csp-report بلا حد | 2a0b135 (rate limit) |
| AP-04 | 🟡 | /api/find-by-phone: البحث قابل للتعداد، وAPI كان يعيد user_id وبيانات RPC كاملة | strictLimiter fail-closed + Turnstile server verification + response allowlist بلا user_id + service-only RPC | كود الخادم ضمن commit `da965d4` اجتاز Vercel؛ المنطق والـ grants اتفحصوا، لكن اختبار CAPTCHA/429 على production ما زال مطلوبًا |
| AP-05 | ✅ | requestSubscription: إشعار الأدمن ما بيوصلش | service client (f690db4+) |
| AP-06 | 🔴 | .maybeSingle() على owner_profile_id في 12 موضع | .order + .limit(1) |
| AP-07 | ✅ | حالة الطلب بدون state machine | 2a0b135 (VALID_TRANSITIONS) |
| AP-08 | 🟡 | rate limit مفقود في 6 مسارات كتابة | إضافة |
| AP-09 | 🔴 | getBusinessDetail يقرا phone/whatsapp بـ anon | DB-06 قرار ثم عدّل |
| AP-10 | 🟡 | proxy.ts auth.getUser() على كل request | قصّره للمحمية |
| AP-11 | 🟡 | logAudit بيبلع الأخطاء | سجّل في system_errors |
| AP-12 | 🟡 | تذكير التقييم بعد ساعتين (فعلياً 3 مرات) | اضبط الوعد |
| AP-13 | 🟡 | رفع صور التاجر كان يكتب في `businesses.logo_url` غير الموجود ويتجاهل أخطاء الحفظ | استخدام `business_media`، تحديث `cover_image_url` مع التحقق، تحميل الشعار من `business_media`، rate limit fail-closed | كود التاجر ضمن commit `da965d4` ذي Vercel success؛ اختبار upload/refresh على production ما زال مطلوبًا |
| AP-14 | 🟡 | حذف صورة الإدارة يمسح المعاينة حتى لو فشل API، وغلاف النشاط قد يظل في `cover_image_url` بعد حذف سجل الوسائط | DELETE يتحقق من كتابة DB ويزامن الغلاف؛ UI يحتفظ بالصورة ويعرض الخطأ عند فشل الطلب | Vercel build/TypeScript نجح على main commit `450400a` (يتضمن مسار الإدارة المعدّل)؛ اختبار DELETE على deployment والتحقق من تزامن `cover_image_url` عند النجاح والفشل ما زال مطلوبًا |
| AP-15 | 🟡 | حقل لصق رابط الصورة كان يحفظ رابطًا خارجيًا قد تمنعه CSP، مع مخاطر روابط داخلية/تحويلات/ملفات ضخمة | الخادم يقبل HTTPS فقط، يتحقق من DNS العام ويثبّت عنوان الاتصال، يعيد التحقق من كل redirect، يحد الحجم إلى 5MB ويتحقق من بصمة JPEG/PNG/WebP/AVIF ثم يرفع الملف إلى Cloudinary ويحفظ رابط Cloudinary. أُضيف rate limit fail-closed لمسارات الرفع والحذف | Vercel build/TypeScript نجح على main commit `450400a`. اختبار رفع حقيقي ما زال مطلوبًا: صورة صالحة، رابط غير HTTPS، host داخلي/خاص، redirect غير آمن، محتوى غير صورة، تجاوز 5MB، ثم refresh والتحقق أن المحفوظ `res.cloudinary.com` |
| AP-16 | 🟡 | معالج إنشاء النشاط كان يفرض النشر حتى لو لم يوجد مالك، وأخطاء حفظ جهات الاتصال كانت تُتجاهل؛ لذلك قد يظهر نشاط يتيم أو ناقص البيانات | الخادم يمنع النشر المباشر دون مالك؛ الويزارد يحفظ النشاط غير المرتبط كمسودة غير منشورة ويصرّح بذلك في المراجعة؛ source يصبح `admin` للمسودة؛ فشل حفظ جهات الاتصال يحاول إلغاء الإنشاء، ويسجّل audit لو فشل التراجع | الكود في `d541ea2`؛ ينتظر Vercel status واختبار إنشاء مسودة/النشر بالمالك. قاعدة الإنتاج الآن: profile واحد (admin)، صفر merchant roles، نشاط منشور واحد بلا مالك، صفر سجلات `business_media` و`business_contact_methods`؛ لم يتم تعديل البيانات الحية |

## 4. الـ CI والاختبارات

| ID | الحالة | المشكلة | الإصلاح |
|---|---|---|---|
| CI-01 | 🔴 | e2e.yml على v2 فقط | انقله main + Preview + DB اختبار |
| CI-02 | 🔴 | business-order.spec يعدّي فاضي | seed + تدفق كامل |
| CI-03 | 🔴 | rls-tests تتخطى بصمت | فاشلة عند الغياب + DB اختبار |
| CI-04 | 🔴 | 6 اختبارات فقط | اختبار لكل action |
| CI-05 | 🟡 | .gitignore يستثني .env.local فقط | .env* + !.env.example |
| CI-06 | 🟡 | package.json بدون engines | إضافة |
| CI-07 | 🔴 | مفيش verify-invariants في CI | كتابة السكربت أولاً |
| CI-08 | ⏳ | Vercel Hobby + Supabase Free | Pro قبل الإطلاق |

## 5. المبادئ والوثائق (قرارات مطلوبة)

| ID | التناقض | القرار |
|---|---|---|
| DOC-01 | Verified != مدفوع مقابل توثيق بـ100 ج/سنة | ⏳ |
| DOC-02 | الموبايل ما يظهرش مقابل DB-06/07 | ⏳ |
| DOC-03 | بدون تتبع مقابل page_view_events | ⏳ |
| DOC-04 | صفر عمولة مقابل set_business_commission | ⏳ |
| DOC-05 | ARCHITECTURE cron ساعة؛ فعلياً 3 مرات/يوم | ✅ مُصلح (B-7) |
| DOC-06 | SECURITY.md قديم | 🟡 |
| DOC-07 | 4 ترتيبات قراءة | ✅ (AI_PLAYBOOK + BRAIN) |
| DOC-08 | Turnstile Test vs Production | ⏳ |
| DOC-09 | 9 روابط مكسورة | 🔴 |

## 6. ديون فنية (invariants-baseline)

| الفحص | العدد الحالي | المطلوب |
|---|---|---|
| B1 owner_profile_id + maybeSingle | 0 | ✅ مُصلح (fix-b1.mjs v2) |
| B2 select('*') | 1 | admin-business — 32+ columns (documented exception) |
| B3 <img> خام | 10 | WmImage — admin previews + share modal مقبولة |
| B4 animation: infinite | 16 | SACRED يمنعها |
| B5 ألوان محظورة | 47 | متغيرات الهوية |
| B6 backdrop-filter | 34 | SACRED يمنعها على كروت فقط (modals مسموحة) |
| B7 الدومين يدوي | 8 | NEXT_PUBLIC_SITE_URL |
| B8 eslint-disable | 20 | سبب أو إزالة |
| B9 إيموجي | 146 | SVG |

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

| ID | الحالة | المشكلة | الإصلاح |
|---|---|---|---|
| UI-01 | 🔴 | Business detail page: form sidebar مضغوط (260px)، card فاضي، horizontal scroll | YouTube Studio pattern: تفاصيل منفصلة عن تعديل |
| UI-02 | 🔴 | Wizard مضغوط في sidebar بدل full-width | نقل الـ wizard لصفحة كاملة 800px |

## 10. أسرار مكشوفة (SEC)

| ID | الحالة | المشكلة | الإصلاح |
|---|---|---|---|
| SEC-01 | 🔴 | 11 مفتاح اتكشفوا في محادثة AI (Supabase, Cloudinary, Upstash, Turnstile, AI, VAPID, CRON, salt) | rotate كل واحد من Dashboard + Vercel |
| SEC-02 | ✅ | VAPID keys في `.env.example` (git history) | commit 9bed439 (sanitized) — rotate VAPID |

## 11. Tech Debt — Pre-Launch Blockers

| ID | Status | Issue | Priority | Time |
|---|---|---|---|---|
| GOD-01 | RED | business-form.tsx = 1179 lines | Pre-Launch | 2h |
| GOD-02 | YEL | new-business-wizard.tsx = 260 lines | Post-Launch | 30m |
| SPRAWL-01 | RED | 20+ admin pages, 3 monitoring | Pre-Launch | 1h |
| SPRAWL-02 | YEL | 3 moderation pages | Post-Launch | 1h |
| EMPTY-01 | RED | 9 empty tables (0 rows) | Pre-Launch | 30m |
| CONFLICT-01 | RED | business_commissions vs zero-commission | Pre-Launch | 15m |
| CONSISTENCY-01 | RED | SACRED says 5 types, actual 4 | Pre-Launch | 5m |
| CONSISTENCY-02 | YEL | PROGRESS.md duplicate rows | Post-Launch | 30m |
| CONSISTENCY-03 | YEL | ARCHITECTURE.md cron hourly vs 3/day | Post-Launch | 5m |
| CI-01 | RED | e2e.yml on v2 only, not main | Pre-Launch | 2h |
| CI-02 | RED | business-order.spec passes empty | Pre-Launch | 1h |
| DESIGN-01 | YEL | Design System not applied | Post-Launch | 3h |

## 12. Pre-Launch Checklist (8h work)

### Security (35 min)
- [ ] SEC-01: rotate 11 keys (DEFERRED — owner call)
- [ ] gitleaks clean (blocked by SEC-02b: ***REMOVED*** in a322552)

### Code Quality (6h)
- [ ] GOD-01: split business-form.tsx
- [ ] SPRAWL-01: merge monitoring pages
- [ ] CI-01 + CI-02: E2E on main
- [x] CI-07: invariants verifier in CI (ab55bce)

### Data (45 min)
- [ ] EMPTY-01: delete 9 empty tables
- [ ] CONFLICT-01: delete business_commissions

### Docs (10 min)
- [ ] CONSISTENCY-01: SACRED to 4 types
- [ ] NEXT_SESSION.md updated
- [x] BRAIN.md §16 + ERROR_REGISTER §6 synced (b43e770)

### Post-Launch Week 1
- [x] UI-01: business detail tabs (ee4abe7)
- [x] UI-02: wizard fullscreen overlay (567496d)
- [ ] CONSISTENCY-02/03: docs sync
- [ ] DESIGN-01: unified design system

### Post-Launch Month 1
- [ ] DB-04/05, AP-05
- [ ] SPRAWL-02: merge moderation
- [ ] GOD-02: split wizard

## 13. God Components Inventory

| File | Lines | Limit | Status |
|---|---|---|---|
| business-form.tsx | 19 | 300 | ✅ (split → 14 files) |
| business-form-state.ts | 257 | 300 | ✅ |
| business-form-handlers.ts | 219 | 300 | ✅ |
| new-business-wizard.tsx | 260 | 300 | YEL |
| edit-form.tsx | 313 | 300 | YEL |
| lib/data/merchant.ts | 288 | n/a | OK |

Rule: component > 300 lines must split before adding features.

## 14. Empty Tables Inventory

| Table | Decision |
|---|---|
| site_designs | DELETE |
| business_commissions | DELETE (CONFLICT-01) |
| live_page_sessions | REVIEW |
| ads | DELETE (superseded) |
| ad_campaigns | KEEP |
| ad_creatives | KEEP |
| ad_events | KEEP |
| ad_stats_daily | KEEP |
| rate_limits | DELETE (Upstash) |

Action: delete 5 tables.

## 15. Before Any Feature Work

Read in order:
1. NEXT_SESSION.md
2. BRAIN.md
3. AI_PLAYBOOK.md
4. ERROR_REGISTER.md (this file)

If any Pre-Launch blocker is open, fix it before adding features.
