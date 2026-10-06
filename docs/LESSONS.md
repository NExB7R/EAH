# EAH — LESSONS.md

> كل تجربة فاشلة + السبب + الحل.
> اقرأه قبل أي شغل عشان متكررش الأخطاء.
> آخر تحديث: 2026-09-25

---

## 1. v1 — ليه اتمسح؟

**القرار:** مسح كامل للكود القديم → بدء v2 نظيف.

**الأسباب المحتملة (من السياق):**
- تصميم متراكم بأخطاء شكل/تنسيق.
- كود مش منظم (features متداخلة).
- صعوبة التعديل بدون كسر حاجة.
- مشاكل أداء (animations مستمرة، إلخ).

**الدرس:** نبدأ نظيف من الأول أسهل من إصلاح تراكمي.

**القاعدة:** أي feature جديدة → commit صغير → typecheck → اختبار.

---

## 2. طرق جرّبناها وفشلت (تقني)

### 2.1 heredoc بيفشل مع العربي + الملفات الكبيرة

**المحاولة:** `cat > file << 'EOF'` بمحتوى 100+ سطر فيه عربي.

**النتيجة:** الـ terminal بيعمل truncate — الملف يتكتب ناقص.

**السبب:** terminal buffer بيفصل الـ paste الطويل.

**الحل:**
- chunks صغيرة (30-50 سطر) بأوامر `cat >>`.
- أو `nano` + لصق صغير (10-15 سطر).
- دايماً تحقق بـ `wc -l` + `tail -3`.

**المرات:** 10+ مرات في جلسة 2026-09-25.

---

### 2.2 nano بيتقطع + بيفضل شغّال في الخلفية

**المحاولة:** `nano file.md` + لصق محتوى كبير.

**النتيجة:** الـ paste بيتقطع + nano بيفضل مفتوح + "being edited by..." في المحاولة التانية.

**الحل:**
- اقفل nano دايماً بـ `Ctrl+X`.
- لصق صغير (10-15 سطر).
- احفظ بعد كل 30 سطر (`Ctrl+O` → Enter).

---

### 2.3 CSP script-src 'self' بيكسر Next.js 16

**المحاولة:** `script-src 'self'` (صارم).

**النتيجة:** Server Actions + hydration بيفشلوا (React error #412).

**السبب:** Next.js 16 App Router بيحقن inline scripts.

**الحل:** `script-src 'self' 'unsafe-inline'` (مؤقت لحد ما نعمل nonce).

---

## 3. قرارات معمارية (chose X over Y)

### 3.1 CSS Modules بدل Tailwind

**القرار:** CSS Modules.

**السبب:**
- متوافق مع SACRED §16 (ممنوع Tailwind).
- صفر runtime overhead.
- scoped by default.

---

### 3.2 Supabase بدل Firebase

**القرار:** Supabase.

**السبب:**
- Postgres (SQL كامل + RLS).
- مفتوح المصدر.
- مجاني بسخاء.

---

### 3.3 4 clients لـ Supabase (مش 1)

**القرار:** public / server / service / browser.

**السبب:**
- public → للقراءات العامة (بدون cookies → caching).
- server → مع cookies (auth-aware).
- service → bypass RLS (admin only).
- browser → client components.

**الفايدة:** كل واحد ليه استخدام واضح.

---

### 3.4 Server Components أولاً

**القرار:** RSC افتراضي، `use client` عند الحاجة.

**السبب:**
- صفر JS للعميل (أسرع).
- أقل bundle size.
- AI_CONTRACT §8.2.

---

### 3.5 مفيش i18n دلوقتي

**القرار:** عربي (لهجة مصرية) بس.

**السبب:** الجمهور المستهدف مصري محلي.

**مستقبلاً:** نضيف إنجليزي لو توسّعنا.

---

## 4. الـ gotchas (Next.js / Supabase / Vercel)

### 4.1 build محلي = SIGILL

**المحاولة:** `npm run build` على جهاز Nour.

**النتيجة:** SIGILL error.

**السبب:** معالج قديم مش بيدعم بعض التعليمات.

**الحل:** Vercel Preview فقط للـ build.

---

### 4.2 `'unsafe-inline'` في CSP — مؤقت

**السبب:** Next.js 16 محتاج (زي 2.3).

**الحل الدائم:** nonce-based CSP (مؤجل).

---

### 4.3 Unsplash مش Cloudinary

**المحاولة:** استخدام Unsplash في البيانات التجريبية.

**النتيجة:** مخالف لـ SACRED §10 (img بدون Cloudinary).

**الحل المؤقت:** إضافة `images.unsplash.com` في `next.config.ts` + علامة مائية CSS overlay.

**الحل الدائم:** نقل Cloudinary (Phase 2).

---

### 4.4 Cloudinary يتلغى دلوقتي

**القرار:** مش هنستخدم Cloudinary في البداية.

**السبب:** Free tier محدود (25 credit/شهر) + مش ضروري.

**البديل:** `next/image` + Supabase Storage.

**لما نكبر:** ImageKit أو Cloudinary.

---

### 4.5 Vercel Hobby = ممنوع تجاري

**المشكلة:** EAH منصة تجارية (إعلانات + باقات).

**الخطر:** Vercel يقفل الحساب لو اكتشف.

**الحل:** Vercel Pro ($20/شهر) أول ما تبدأ تربح.

---

### 4.6 الدومين — `eah.app`

**القرار:** `eah.app` (مش `.com`).

**السبب:**
- `.app` = Web App (متوافق مع الهوية).
- مجاني أول سنة مع Vercel Pro.
- HTTPS إجباري (أمان).
- رخيص (~$13-15/سنة بعد السنة).

---

## 5. قواعد ذهبية

### 5.1 للـ terminal

1. **متستخدمش heredoc > 50 سطر.**
2. **اقفل nano دايماً** (`Ctrl+X` → `Y`/`N`).
3. **تحقق بعد كل كتابة:** `wc -l` + `tail -3`.
4. **chunks صغيرة** (30-50 سطر).

### 5.2 للـ Git

1. **typecheck قبل كل commit.**
2. **commits صغيرة** (feature واحد).
3. **رسالة واضحة:** `type(scope): desc`.

### 5.3 للكود

1. **مفيش `any`** بدون تعليق.
2. **مفيش `console.log`** في الإنتاج.
3. **مفيش inline styles** (إلا dynamic).
4. **مفيش animations مستمرة.**
5. **استخدم `WmImage`** لكل صورة.

### 5.4 للقرارات

1. **اسأل قبل التعديل** على SACRED files.
2. **مفيش تخمين** — اتأكد.
3. **commits صغيرة** أفضل من الكبيرة.
4. **لو حصل خطأ → قف + بلّغ.**

---

## 6. الأخطاء اللي لسه محتاجة حل

- **nonce-based CSP** (مؤجل).
- **Sentry** (مش مستخدم).
- **Testing** (Vitest/Playwright) — مؤجل.
- **`SCHEMA.sql`** — قديم (ينقص columns).
- **`lib/supabase/types.ts`** — generated (مؤجل).

---

## 7. الخلاصة

**لو لقيت حاجة فشلت → ضيفها هنا.**
**لو لقيت حل جديد → ضيفه هنا.**
**لو لقيت gotcha → ضيفه هنا.**

**الهدف:** أي شات/AI جديد يقرأه → **ميعيدش الأخطاء**.

---

آخر تحديث: 2026-09-25

---

## 8. غلطات AI (2026-09-25)

### 8.1 NextResponse.next signature

الغلطة: NextResponse.next({ request })
الصح: NextResponse.next()
السبب: init.request بياخد { headers } مش NextRequest.

### 8.2 CSP script-src 'self'

الغلطة: script-src 'self' في production
الصح: script-src 'self' 'unsafe-inline'
السبب: Next.js 16 محتاج للـ hydration + Server Actions.

### 8.3 lib/data.ts + lib/data/ تعارض

الغلطة: وجود data.ts + data/index.ts
الصح: data/businesses.ts + data/user.ts + data/index.ts
السبب: Next.js بيفضّل .ts على /index.ts.

### 8.4 BadgeCheckIcon missing

الغلطة: import لدالة مش موجودة
الصح: grep قبل أي import
السبب: كتبت استيراد قبل ما الأيقونة تتعمل.

### 8.5 useState في SSR components

الغلطة: useState(false) + useEffect في component SSR
الصح: mounted state + early return null
السبب: hydration mismatch (React #418).

### 8.6 lib/data.ts + lib/data/ تعارض

الغلطة: data.ts + data/index.ts مع بعض.
الصح: data/businesses.ts + data/user.ts + data/index.ts.
السبب: Next.js بيفضّل .ts على /index.ts.

### 8.7 BadgeCheckIcon مش موجود

الغلطة: import لأيقونة قبل ما تتعمل.
الصح: grep -c "IconName" components/icons/index.tsx قبل أي import.

### 8.8 useState في SSR

الغلطة: useState(false) + useEffect في SSR.
الصح: mounted state + if (!mounted) return null.
السبب: hydration mismatch (React #418).

### 8.9 NextResponse.next signature

الغلطة: NextResponse.next({ request }).
الصح: NextResponse.next().

### 8.10 CSP script-src 'self'

الغلطة: script-src 'self' في production.
الصح: script-src 'self' 'unsafe-inline'.

---

## 9. قواعد قبل أي تعديل

### 9.1 دوّر الأول
find web -name "filename"
grep -rn "ComponentName" web/

### 9.2 اقرأ كامل
cat file.tsx

### 9.3 افهم
- إيه وظيفته؟
- فين بيتستخدم؟

### 9.4 بعدها فقط
عدّل أو أنشئ.

ممنوع: ملف جديد بدون فحص.
ممنوع: تعديل بدون قراءة.

---

## 10. الخلاصة

أي AI جديد:
1. اقرأ AI_CONTRACT §19 + §20.
2. اقرأ LESSONS.md.
3. دوّر قبل ما تعمل.
4. اقرأ قبل ما تعدّل.
5. اسأل قبل ما تخمّن.

الهدف: صفر أخطاء متكررة.

---

آخر تحديث: 2026-09-25

---

## 11. أخطاء 2026-09-25 → 27

### 11.1 React #418 (Hydration Mismatch) — للمرة الثانية

الغلطة: useState + useEffect + shuffleArray في Featured Bento (Client).
الصح: shuffle في الـ server (dailyShuffle) + تمرير النتيجة جاهزة.
السبب: random مختلف بين server/client.

### 11.2 Drawer auto-close على كل render

الغلطة: useEffect(() => onClose(), [pathname, onClose]) — onClose new function كل render.
الصح: onCloseRef + useEffect يعتمد على pathname بس.
السبب: onClose مش memoized.

### 11.3 Console.log مش بيظهر في Firefox

الأعراض: console.log('test') → undefined بس.
السبب: Firefox Console عنده مشكلة في عرض output.
الحل: جرب Chrome / Edge. متعتمدش على Firefox Console.

### 11.4 الأزرار مش شغّالة — CSS

الغلطة: pointer-events: none على .right و .left قبل mounted.
الصح: mounted guard + pointer-events: auto دايماً.
السبب: CSS كان بيخفي الأيقونات في حالة data-scrolled=false.

### 11.5 Facebook CDN 502

الغلطة: صور من scontent-iad3-2.xx.fbcdn.net.
النتيجة: 502 Bad Gateway على Vercel.
الحل: نتجاهل Facebook CDN — fallback gradient في BusinessCard.
السبب: Facebook CDN مش مستقر.

### 11.6 نسيان git add لملفات جديدة

الغلطة: إنشاء featured-bento.tsx + .module.css بدون git add.
النتيجة: build فشل على Vercel (Module not found).
الحل: بعد كل ملف جديد → git status --short للتحقق.

### 11.7 مسح ملفات احتياطية بدون تفكير

الغلطة: محاولة حذف .env.local.bak + .env.original.
الصح: نسيبهم (احتياطي — في .gitignore).
السبب: ممكن نحتاجهم لو .env.local حصلت مشكلة.

### 11.8 تعديلات على ملفات SACRED بدون مراجعة

الغلطة: تعديل next.config.ts مرات كتير.
الصح: SACRED files → موافقة صريحة + مراجعة قبل كل تعديل.

### 11.9 502 صور متكررة بدون rate limit

الغلطة: next/image بيحاول يحمّل صور Facebook CDN كل مرة.
النتيجة: بطء + سجلات مليانة 502.
الحل: fallback سريع (placeholder gradient) + تجاهل الدومين.

### 11.10 ملفات CSS broken (orphan selectors)

الغلطة: Python patch بيسيب orphan selectors (.micBtn بدون @keyframes).
النتيجة: Vercel build فشل (Invalid empty selector).
الحل: بعد كل patch → فحص { = } + grep على الملف.

---

## 12. قواعد جديدة (من الأخطاء دي)

### 12.1 قبل commit
- typecheck.
- git status --short.
- فحص CSS ({ = }).

### 12.2 قبل deploy
- git push بنجاح.
- Vercel deploy Ready.
- اختبار على Chrome.

### 12.3 عند المشاكل
- جرب متصفح تاني (مش Firefox بس).
- اجمع أدلة (Console + Network).
- متحذفش بدون backup.

### 12.4 عند الحذف
- backup أولاً.
- تحقق من git.
- موافقة صريحة.

---

آخر تحديث: 2026-09-27

---

## 13. Featured Redesign — مشكلة dailyShuffle (2026-09-27)

**الغلطة:** `app/page.tsx` كان بيعمل `dailyShuffle()` على المميزين المدفوعين.

**النتيجة:** ترتيب `featured_order` (اللي بيحدده الأدمن) بيتضيع — مش عادل.

**السبب:** خلط بين "عشوائية يومية" و"ترتيب مدفوع".

**الحل:** شيلنا `dailyShuffle` من المميزين. الآن `FeaturedBento` بيعمل Round-Robin عادل (كل مميز ياخد Hero بنفس عدد المرات).

**الملفات:** `app/page.tsx` (SACRED) + `lib/featured-rotation.ts` (جديد).

**القاعدة الجديدة:** المميزين مش بيتعشوكلوا — بيتدوروا بالدور.

---

## 14. Grid Bento مش شغّال في RTL (2026-09-27)

**الغلطة:** استخدام `grid-column: 1` + `grid-row: 1 / span 2` لـ Hero.

**النتيجة:** الـ Hero بيبان بنفس حجم الصغيرة في RTL — الامتداد مش شغّال.

**السبب:** CSS Grid في RTL — ترتيب الخطوط بيختلف، والـ `grid-column: 1` مبيمتدش زي المتوقع.

**الحل:** استخدام `grid-template-areas` — صريح ومستقل عن الـ direction.

---

## 15. Splash متأخر + Install Prompt مزعج (2026-09-27)

**المشكلة 1:** `hidden = true` مبدئياً في Splash → الصفحة تظهر أول، بعدين السبلاش.

**الحل:** `hidden = false` + `useLayoutEffect` (يشتغل قبل paint → يخفي فوراً لو session موجود).

**المشكلة 2:** `beforeinstallprompt` بيتكرر + localStorage مش بيتفحص جواه → الإشعار المزعج.

**الحل:** شيلنا auto-show تماماً. الإشعار يظهر بس لما المستخدم يدوس زر التثبيت في الهيدر.

---

## 16. Supabase SQL Editor — Not a Terminal (2026-09-27)

**الغلطة:** لصق أوامر bash (`cd ~/EAH && ...`) في Supabase SQL Editor.

**النتيجة:** `ERROR: syntax error at or near "cd"`.

**القاعدة:** SQL Editor بياخد **SQL بس**. صفر `cd`, `&&`, heredoc markers.

**حل تاني:** `is_admin()` مش موجودة في DB الحالي → استخدمنا `user_roles` مباشرة.

---

## 13. جلسة 2026-09-27 — دروس جديدة

### 13.1 heredoc بيفشل مع ``` في المحتوى

الغلطة: كتابة ملف docs فيه ```bash جوّه heredoc — الـ shell بيفسّره كأمر.

الصح: شيل الـ ``` من المحتوى أو استخدم base64.

### 13.2 sed متعدد السطور بيفشل

الغلطة: sed 's|Line1\nLine2|...|' — sed مش بيفهم \n جوه pattern.

الصح: استخدم cat > file لإعادة الكتابة الكاملة.

### 13.3 Server Component مع 'use client' بيكسر

الغلطة: SectionLayout كان 'use client' + بيستورد SecondaryHero (Server).

الصح: افصل الـ wrapper (Server) عن الـ interactive part (Client) — LoadMoreGrid.

### 13.4 Section Badges مش مريحة بصرياً

الدرس: شارات كثيرة لكل قسم بتلخبط العين.

الصح: الألوان (Tone) كفيلة بالتمييز — شيل الشارات.

### 13.5 كل قسم لون مختلف = منصة ملخبطة

الدرس: 6 ألوان (وردي + teal + أزرق + بنفسجي + ذهبي + برتقالي) = فوضى.

الصح: 3 ألوان (SACRED):
- بنفسجي = أساسي
- ذهبي = المميزين
- برتقالي = الترند
الباقي تدرجات بنفسجية.

### 13.6 force-dynamic على كل الصفحات

المشكلة: كل زيارة = build من الأول.

الحل: unstable_cache + TTL 300s + loading.tsx skeletons.

### 13.7 6 queries في Home = بطيء

الحل: query واحدة (getPublishedBusinesses) + فلترة في الكود + getActiveOffers منفصلة.

النتيجة: 6 → 2 queries.

### 13.8 queries بدون فهرسة = بطيء

الدرس: EXPLAIN ANALYZE على كل query.

---

آخر تحديث: 2026-09-27

---

## 17. Migration بدون مراجعة ذاتية (2026-09-30)

**الغلطة:** كتبت migration أول مرة بـ 5 أخطاء:
- `last_activity_at DEFAULT now()` — نشاط وهمي لأي مستخدم جديد
- `wanted_level` بدون CHECK — ممكن يبقى 100 أو -5
- `streak_days` بدون `streak_last_date` — مستحيل نحسب streak
- `business_activities.weight` — weight ثابت مش المفروض يتخزن
- `helpful_count` + `is_featured` — counters بتتعارض مع الحساب المباشر

**السبب:** كتبت بسرعة وعرضت على المستخدم يقرأ.

**الدرس:** 
- **مراجعة ذاتية إجبارية** قبل أي migration.
- **ممنوع** أعرض ملف للمستخدم عشان هو يراجع.
- الـ AI هو المسؤول عن الجودة، مش المستخدم.

**القاعدة الجديدة:**
> أي SQL / migration → الـ AI يراجع سطر بسطر قبل العرض.
> المستخدم يقرر "أنفذ" أو "لأ" — مش يراجع الأخطاء.

**المراجع:** AI_CONTRACT §27 (جديد)

---

## 18. الجودة مش "بعدين" — الجودة "من الأول" (2026-09-30)

**الغلطة الكبيرة:** بنينا features لمدة أسابيع بدون أي نظام جودة.
- 55 خطأ ESLint تراكموا
- 204 ملف بدون تنسيق
- 3 ملفات ميتة
- 6 دوال ميتة

**السبب:** 
- الأولوية كانت "ضيف feature"
- محدش وقف يقول "لازم نظام يمنع الأخطاء"

**الحل اللي اتعمل:**
- lefthook (7 طبقات: secrets + tests + prettier + eslint + typecheck + npm-audit)
- Vitest (58 اختبار)
- GitHub Actions
- knip + jscpd + gitleaks

**الدرس:**
> أي مشروع جديد → نظام الجودة **أول حاجة**، قبل أي feature.
> تكلفة النظام في البداية = ساعة
> تكلفة النظام بعد سنة = أسبوع + ديون تقنية

**القاعدة الجديدة (AI_CONTRACT §28):**
> أي دالة logic جديدة → معاها اختبار.
> أي commit → lefthook يفحص.
> أي push → GitHub Actions يفحص.

---

## 19. Splash + animation على LCP Element = NO_LCP (2026-10-02)

**الغلطة:** 
1. Splash component بيظهر 1.5s + animation fade على logoWrap (600ms)
2. صورة الهيرو (LCP element) بتأخر لحد 1.5s + 600ms قبل ما تستقر
3. Lighthouse مبيقدرش يحدد LCP element ثابت → NO_LCP
4. Speed Index اتراجع (1.3s → 5.3s) لما شلنا Splash بس سيبنا الـ animation

**السبب:**
- Splash = anti-pattern على الويب (مفيد في native apps فقط)
- Animation على LCP element بيعمل layout shift أو تأخير في الـ paint
- Lighthouse بيقيس LCP بعد ما العنصر يستقر

**الحل:**
1. شيل Splash بالكامل (v1.0.0)
2. شيل animation من أي element فيه LCP candidate
3. ضيف `fetchPriority="high"` للصور الأساسية
4. LCP element = صورة بدون animation + first paint مباشر

**الدرس:**
- ممنوع animation على الـ hero/LCP element
- ممنوع Splash على الويب
- `priority` في Next.js مش كفاية — محتاج `fetchPriority="high"` صريح

**المراجع:** PERFORMANCE_BASELINE.md

---

## 20. Facebook CDN + Next.js Image = 502 (2026-10-02)

**الغلطة:** 
- صور من scontent-*.xx.fbcdn.net في DB (53 نشاط)
- next/image بيمررها على /_next/image → Vercel يطلب FB → 502
- Lighthouse بيفشل في قياس LCP بسببها

**الحل:** 
- WmImage: `unoptimized` لو الدومين مش في TRUSTED_HOSTS
- Trusted: supabase.co + res.cloudinary.com فقط
- الباقي: المتصفح يجيب الصورة مباشرة

**الدرس:**
- Next.js image optimizer = للدومينات الموثوقة فقط
- صور المستخدمين من CDNs خارجية = `unoptimized` دايماً

---

## 21. React 19.3.0 + Next.js 16.3.8 = React #418 (2026-10-02)

**الغلطة:** رقّينا React من 19.2.8 → 19.3.0. بعدها ظهر React #418 (hydration) على كل صفحة.

**الأعراض:**
- React #418 مع `args[]=HTML`
- traceback من `MessagePort.O` (RSC streaming channel)
- بيحصل في incognito كمان (مش extension)
- attributes على <html> سليمة (`lang`, `dir` بس)

**السبب:** عدم توافق React 19.3.0 مع Next.js 16.3.8 في RSC streaming.

**الحل:** رجعنا React/react-dom لـ 19.2.8.

**الدرس:**
- Next.js 16.3.8 = مُختبَر على React 19.2.x
- ممنوع upgrade React بدون التأكد من توافق Next
- `npm outdated` بيقول "Latest" مش "متوافق"
- القاعدة: `next` يقول أي React يدعم، هو المصدر

---

## 23. `<a>` جوّه `<a>` = React #418 (2026-10-02)

**الغلطة:** `Logo` عنده default `href='/'` — لما نمرر `href={undefined}`، JS بيعمل fallback للـ default مش بيلغيه. النتيجة: `<Link><Logo/></Link>` = `<a><a/></a>`.

**الحل:** نمرر `href={null}` بدل `undefined`.

**الدرس:**
- `undefined` في default params = fallback للـ default
- `null` = بيلغي الـ default
- `<a>` جوّه `<a>` = HTML غير صالح → hydration mismatch

**الملفات المتأثرة:** page-header, menu-drawer, floating-capsule

---

## 25. طريقة الكتابة للملفات — قاعدة (2026-10-02)

**القاعدة:** أي كتابة لملف (docs / code / أي حاجة) → Python (مش heredoc).

**ليه:**
- heredoc بيتقطع مع العربي + الأسطر الطويلة
- terminal buffer بيفصل الـ paste
- Python مضمون 100%

**الطريقة:**
- اكتب المحتوى في ملف مؤقت بـ cat > /tmp/x.txt << 'ENDCONTENT'
- بعدها: python3 -c "open('target','a',encoding='utf-8').write(open('/tmp/x.txt',encoding='utf-8').read())"
- أو: cat /tmp/x.txt >> target

**استثناءات:**
- ملفات قصيرة (أقل من 10 أسطر) → heredoc عادي مقبول
- كود كبير → نكتبه كامل بالـ Python

**المراجع:** AI_CONTRACT §32، LESSONS §2.1

---

## 26. اسم المنصة الرسمي — قاعدة (2026-10-02)

**الاسم الرسمي:** `EAH اللى نفسك فيه ؟`

**ممنوع:**
- EAH — اللى نفسك فيه ؟ (بشرطة)
- EAH - اللى نفسك فيه ؟
- EAH | اللى نفسك فيه ؟

**الأماكن:** metadata title, social, manifest, OG images

**الحالة:** TODO قبل الإطلاق

---

## 27. توحيد مجلد المشروع — EAH (2026-10-02)

**الوضع قبل:** مجلدين
- `~/EAH` — النسخة القديمة (46 migration + schema v0.1.0)
- `~/EAH-V2` — النسخة الحالية

**الوضع بعد:** مجلد واحد
- `~/EAH` — الرسمي (بعد ما أخذنا نسخة من القديم في `docs/migrations-archive/`)

**اللي اتحفظ من القديم:**
- 46 migration → `docs/migrations-archive/`
- `SCHEMA_V0_1_0.md` + `RLS_MATRIX_V0_1_0.md` + `DATABASE_PLAN.md`
- `eah-docs-ready.txt`
- `.vercel` project link → `.vercel.eah-old.bak`

**اللي اتمسح:**
- `~/EAH-V2` (rename لـ `~/EAH`)
- `~/EAH` القديم

**مشكلة اتحلت:**
- lefthook مش موجود في PATH بعد الـ rename
- الحل: symlink في `~/.local/bin/lefthook`

**المراجع:**
- `docs/migrations-archive/README.md`
- `~/.local/bin/lefthook` (symlink)

---

## 28. REVOKE على business_locations خلّى الأقسام تختفي (2026-10-04)

**الأعراض:**
- الرئيسية بتعرض Hero + العروض + رشحلى بس
- المميز + الترند + الجديد + قريب منك مش بيظهروا خالص
- Vercel logs: getPublishedBusinesses error: permission denied
- curl: صفر business-card-module في HTML

**السبب الحقيقي:**
- migration قديمة عملت REVOKE SELECT على business_locations من anon
- الكود بيستخدم join: business_locations(latitude, longitude, is_primary)
- Postgres بيرفض الاستعلام كله لما عمود/جدول واحد ممنوع
- getPublishedBusinesses بترجع فاضية -> الأقسام تختفي بصمت

**الحل:**
GRANT SELECT (id, business_id, address_text, latitude, longitude, is_primary, created_at)
ON public.business_locations
TO anon, authenticated;

**الدرس:**
- أي REVOKE على جدول مستخدم في join -> يخلي الاستعلام كله يفشل
- مفيش error واضح في UI — بس sections تختفي
- دائماً افحص Vercel logs عند مشاكل كهذه
- التصحيح: REVOKE على أعمدة معينة، مش الجدول كله

**المراجع:**
- migration 2026-09-25-normalize-profiles.sql (المصدر)
- Vercel logs: getPublishedBusinesses error: permission denied


---

## 20. أخطاء AI الشائعة بالأرقام (2026) — من AI_LESSONS.md

## 1. أخطاء AI الشائعة (بالأرقام)

| الخطأ | النسبة | المصدر |
|-------|--------|--------|
| RLS معطّل أو misconfigured | **88%** من تطبيقات Supabase | بحث 2026 على 1,645 تطبيق |
| ثغرة أمنية واحدة على الأقل | **44%** من الكود المولَّد | Veracode 2026 |
| IDOR / Broken Access Control | **45%** من الكود المولَّد | بحث أمني 2026 |
| نقص CSRF protection | **100%** من 15 تطبيق مختبر | Tenzai 2026 |
| SSRF vulnerabilities | **100%** من أدوات AI الخمسة | Tenzai 2026 |
| Hardcoded Secrets | **12%** من الإعدادات | GitGuardian 2026 |
| مكتبات وهمية (Slopsquatting) | **1.1-1.9%** من أسماء الحزم | GPT-5 |
| يحتاج debugging في production | **43%** من أكواد AI | Lightrun 2026 |
| حادثة إنتاج واحدة على الأقل | **82%** من الشركات | بحث 2026 |
| Bugs per developer زادت | **+54%** | بحث 2026 |

---

## 2. الأخطاء العشرة (بالتفصيل)

### 1. RLS معطّل
- **المشكلة:** الـ AI بينسى يفعّل RLS أو بيكتب policies ضعيفة
- **النتيجة:** أي حد بالـ anon key يقدر يقرا كل الداتا
- **الفحص:** `select tablename, rowsecurity from pg_tables where schemaname = 'public'`
- **الحل:** RLS على كل جدول + policy فيها `auth.uid()`

### 2. USING (true) في RLS
- **المشكلة:** بتبان "آمنة" وهي **بتفتح كل حاجة**
- **الفحص:** `select tablename, policyname, qual from pg_policies where qual = 'true'`
- **الحل:** بدلها بـ `(select auth.uid()) = user_id`

### 3. مفيش WITH CHECK
- **المشكلة:** INSERT policies بدون `WITH CHECK` = المستخدم يكتب أي حاجة
- **الفحص:** `select tablename, policyname from pg_policies where with_check is null`
- **الحل:** كل INSERT policy لازم يكون فيها `WITH CHECK`

### 4. IDOR — مفيش ownership check
- **المشكلة:** المستخدم يقدر يعدّل بيانات حد تاني
- **الفحص:** `grep -rn ".from(" app/ lib/ | grep -v ".eq('user_id" | grep -v "auth.uid"`
- **الحل:** كل query فيها `.eq('user_id', user.id)`

### 5. Service Role Key في client
- **المشكلة:** المفتاح الحساس يوصل للعميل = اختراق كامل
- **الفحص:** `grep -r "SERVICE_ROLE" app/ components/`
- **الحل:** Service Role في `.env.local` بس + server-only

### 6. CSRF protection ناقص
- **المشكلة:** API routes بدون حماية
- **الفحص:** `grep allowedOrigins next.config.ts`
- **الحل:** `serverActions.allowedOrigins` في next.config.ts

### 7. SSRF — fetch لـ URL من المستخدم
- **المشكلة:** المهاجم يخلي السيرفر يجيب URLs داخلية
- **الفحص:** `grep -rn "fetch(" app/ lib/`
- **الحل:** allowlist للـ domains + التحقق من URL

### 8. Hardcoded Secrets
- **المشكلة:** مفاتيح في الكود = تسريب
- **الفحص:** `gitleaks detect --source .`
- **الحل:** .env.local + gitleaks في pre-commit

### 9. Slopsquatting — مكتبات وهمية
- **المشكلة:** AI يشاور على حزم مش موجودة، والمهاجم يسجلها باسم خبيث
- **الفحص:** `for pkg in $(jq -r '.dependencies | keys[]' package.json); do npm view $pkg version; done`
- **الحل:** التحقق من كل حزمة في npm registry

### 10. Error handling بيسرّب معلومات
- **المشكلة:** error messages بترجع للـ client بتفاصيل داخلية
- **الفحص:** مراجعة كل `catch` block
- **الحل:** رسائل عامة + logging server-side بس

---

## 3. أخطاء الأدوات نفسها

| الأداة | CVE | CVSS |
|--------|-----|------|
| Claude Code | 28 CVE في سنة | 10.0 |
| Cursor | CVE-2026-50548, CVE-2026-50549 | 9.8 |
| GitHub Copilot | CVE-2025-53773 | 9.6 |
| Gemini CLI | CVE-2025-xxxxx | 10.0 |

**الدرس:** حدّث أدواتك **دايماً**. حتى الأدوات الرسمية فيها ثغرات.

---

## 4. حالات حقيقية

| الشركة | الحادثة | الخسارة |
|--------|---------|---------|
| Amazon | 2 outages في مارس 2026 | 7.9M طلب + 1.6M error |
| Supabase App | تسريب 1.5M token | 35,000 email |
| Vibe-coded apps | 2,000+ ثغرة | 400+ secret |

---

## 5. الحمايات المطبقة في EAH

| # | الحماية | الحالة |
|---|---------|--------|
| 1 | RLS على 70 جدول | ✅ |
| 2 | 4 DB Triggers | ✅ |
| 3 | Column-level REVOKE | ✅ |
| 4 | RPC functions | ✅ |
| 5 | Turnstile | ✅ |
| 6 | Upstash Rate Limiting | ✅ |
| 7 | gitleaks | ✅ |
| 8 | Zod validation | ✅ |
| 9 | CSP + Security headers | ✅ |
| 10 | CSRF allowedOrigins | ✅ |
| 11 | Vitest 58 اختبار | ✅ |
| 12 | GitHub Actions | ✅ |

---

## 6. الفحوصات الدورية

**قبل كل commit** (lefthook):
- gitleaks (secrets)
- prettier
- eslint
- typecheck

**قبل كل push** (lefthook):
- typecheck كامل

**كل أسبوع:**
- `npm run knip` (كود ميت)
- `npm run dup` (تكرار)
- `npm audit`

**بعد كل feature جديدة:**
- فحص AI Code (AI_CONTRACT §30)

---

آخر تحديث: 2026-10-01
